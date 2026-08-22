import { env, waitUntil } from "cloudflare:workers";
import {
  sendBookingStatusEmail,
  type BookingEmailRecord,
} from "../../lib/booking-email";

const adminMobile = "7004291529";

type RefundPayload = {
  bookingId?: string;
  amount?: number;
};

type RazorpayRefundResponse = {
  id?: string;
  payment_id?: string;
  amount?: number;
  status?: string;
  speed_processed?: string;
  error?: { description?: string; reason?: string };
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getCookie(request: Request, name: string) {
  const cookies = request.headers.get("Cookie") || "";
  return cookies
    .split(";")
    .map((entry) => entry.trim().split("="))
    .find(([key]) => key === name)?.[1] || "";
}

async function isAdminRequest(request: Request) {
  const token = getCookie(request, "vt_portal_session");
  if (!token) {
    return false;
  }

  const session = await env.DB.prepare(
    `SELECT role, mobile
     FROM portal_sessions
     WHERE token = ? AND expires_at > ?
     LIMIT 1`,
  )
    .bind(token, new Date().toISOString())
    .first<{ role: string; mobile: string }>();

  return session?.role === "admin" && session.mobile === adminMobile;
}

export async function POST(request: Request) {
  try {
    const requestOrigin = request.headers.get("Origin");
    if (requestOrigin && requestOrigin !== new URL(request.url).origin) {
      return Response.json({ error: "Invalid refund request origin." }, { status: 403 });
    }

    if (!(await isAdminRequest(request))) {
      return Response.json({ error: "Only Admin Can Initiate Refund." }, { status: 401 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || "";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
    if (!keyId || !keySecret) {
      return Response.json(
        { error: "Razorpay Refund Credentials Are Not Configured." },
        { status: 503 },
      );
    }

    const payload = (await request.json()) as RefundPayload;
    const bookingId = clean(payload.bookingId);
    const requestedAmount = Math.round(Number(payload.amount || 0));

    if (!bookingId || !Number.isFinite(requestedAmount) || requestedAmount < 1) {
      return Response.json(
        { error: "Valid Booking And Refund Amount Are Required." },
        { status: 400 },
      );
    }

    const booking = await env.DB.prepare(
      `SELECT booking_id, customer_mobile, customer_email, payment_amount,
        refund_amount, ride_status
       FROM bookings
       WHERE booking_id = ?
       LIMIT 1`,
    )
      .bind(bookingId)
      .first<{
        booking_id: string;
        customer_mobile: string;
        customer_email: string;
        payment_amount: number;
        refund_amount: number;
        ride_status: string;
      }>();

    if (!booking) {
      return Response.json({ error: "Booking Was Not Found." }, { status: 404 });
    }

    const refundableAmount = Math.max(
      0,
      Number(booking.payment_amount || 0) - Number(booking.refund_amount || 0),
    );
    if (requestedAmount > refundableAmount) {
      return Response.json(
        { error: `Maximum Refundable Amount Is Rs. ${refundableAmount}.` },
        { status: 409 },
      );
    }

    await env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS payment_gateway_refunds (
        refund_id TEXT PRIMARY KEY,
        booking_id TEXT NOT NULL,
        payment_id TEXT NOT NULL,
        amount_paise INTEGER NOT NULL,
        status TEXT NOT NULL,
        speed TEXT NOT NULL DEFAULT 'normal',
        idempotency_key TEXT NOT NULL UNIQUE,
        created_by_mobile TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`,
    ).run();

    const paymentResult = await env.DB.prepare(
      `SELECT reference_number AS payment_id, SUM(amount) AS paid_amount,
        MAX(id) AS latest_id
       FROM payment_transactions
       WHERE booking_id = ?
         AND payment_mode = 'Razorpay'
         AND reference_number LIKE 'pay_%'
       GROUP BY reference_number
       ORDER BY latest_id DESC`,
    )
      .bind(bookingId)
      .all<{ payment_id: string; paid_amount: number; latest_id: number }>();

    if (!paymentResult.results.length) {
      return Response.json(
        { error: "No Razorpay Payment Was Found For This Booking." },
        { status: 409 },
      );
    }

    let amountLeftPaise = requestedAmount * 100;
    const acceptedRefunds: Array<{
      refundId: string;
      paymentId: string;
      amountPaise: number;
      status: string;
    }> = [];
    let gatewayError = "";

    for (const payment of paymentResult.results) {
      if (amountLeftPaise < 1) {
        break;
      }

      const refunded = await env.DB.prepare(
        `SELECT COALESCE(SUM(amount_paise), 0) AS refunded_paise
         FROM payment_gateway_refunds
         WHERE payment_id = ? AND status != 'failed'`,
      )
        .bind(payment.payment_id)
        .first<{ refunded_paise: number }>();
      const availablePaise = Math.max(
        0,
        Math.round(Number(payment.paid_amount || 0) * 100) -
          Number(refunded?.refunded_paise || 0),
      );
      const refundPaise = Math.min(amountLeftPaise, availablePaise);

      if (refundPaise < 100) {
        continue;
      }

      const idempotencyKey = `vtt_${bookingId}_${booking.refund_amount}_${requestedAmount}_${payment.payment_id}`
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .slice(0, 80);
      const duplicateRequest = await env.DB.prepare(
        `SELECT refund_id
         FROM payment_gateway_refunds
         WHERE idempotency_key = ?
         LIMIT 1`,
      )
        .bind(idempotencyKey)
        .first<{ refund_id: string }>();
      if (duplicateRequest) {
        return Response.json(
          { error: "This Refund Has Already Been Initiated. Refresh The Dashboard." },
          { status: 409 },
        );
      }
      const response = await fetch(
        `https://api.razorpay.com/v1/payments/${encodeURIComponent(payment.payment_id)}/refund`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
            "Content-Type": "application/json",
            "X-Refund-Idempotency": idempotencyKey,
          },
          body: JSON.stringify({
            amount: refundPaise,
            speed: "normal",
            receipt: idempotencyKey.slice(0, 40),
            notes: { bookingId, initiatedBy: "admin" },
          }),
        },
      );
      const result = (await response.json()) as RazorpayRefundResponse;

      if (!response.ok || !result.id) {
        gatewayError =
          result.error?.description || result.error?.reason || "Razorpay Rejected The Refund.";
        break;
      }

      const gatewayStatus = clean(result.status).toLowerCase() || "pending";
      await env.DB.prepare(
        `INSERT INTO payment_gateway_refunds (
          refund_id, booking_id, payment_id, amount_paise, status, speed,
          idempotency_key, created_by_mobile, created_at
        ) VALUES (?, ?, ?, ?, ?, 'normal', ?, ?, ?)`,
      )
        .bind(
          result.id,
          bookingId,
          payment.payment_id,
          refundPaise,
          gatewayStatus,
          idempotencyKey,
          adminMobile,
          new Date().toISOString(),
        )
        .run();

      acceptedRefunds.push({
        refundId: result.id,
        paymentId: payment.payment_id,
        amountPaise: refundPaise,
        status: gatewayStatus,
      });
      amountLeftPaise -= refundPaise;
    }

    const acceptedAmount = Math.round(
      acceptedRefunds.reduce((sum, refund) => sum + refund.amountPaise, 0) / 100,
    );
    if (acceptedAmount < 1) {
      return Response.json(
        { error: gatewayError || "Refund Could Not Be Initiated." },
        { status: 502 },
      );
    }

    const totalRefunded = Number(booking.refund_amount || 0) + acceptedAmount;
    const isFullRefund = totalRefunded >= Number(booking.payment_amount || 0);
    const refundStatus = isFullRefund
      ? "Refund Initiated"
      : "Partial Refund Initiated";
    const rideWasComplete = clean(booking.ride_status).toLowerCase().includes("complete");
    const nextRideStatus = rideWasComplete ? "Ride Complete With Refund" : "Ride Cancelled";
    const now = new Date().toISOString();
    const refundReferences = acceptedRefunds.map((refund) => refund.refundId).join(", ");

    await env.DB.batch([
      env.DB.prepare(
        `UPDATE bookings
         SET refund_status = ?, refund_amount = refund_amount + ?,
           refund_collection_mode = 'refund_razorpay_normal',
           ride_status = ?,
           cancel_reason = CASE
             WHEN ? = 'Ride Cancelled' THEN 'Cancelled After Razorpay Refund'
             ELSE cancel_reason
           END
         WHERE booking_id = ?`,
      ).bind(refundStatus, acceptedAmount, nextRideStatus, nextRideStatus, bookingId),
      env.DB.prepare(
        `INSERT INTO payment_transactions (
          booking_id, customer_mobile, driver_mobile, amount,
          transaction_type, payment_mode, reference_number, status,
          settlement_status, created_by_role, created_by_mobile, created_at
        ) VALUES (?, ?, '', ?, 'Customer Refund', 'Razorpay Normal Refund', ?, ?,
          'Refund Initiated', 'admin', ?, ?)`,
      ).bind(
        bookingId,
        booking.customer_mobile,
        acceptedAmount,
        refundReferences,
        refundStatus,
        adminMobile,
        now,
      ),
      env.DB.prepare(
        `INSERT INTO booking_status_history (
          booking_id, old_status, new_status, actor_role, actor_mobile,
          reason, remarks, created_at
        ) VALUES (?, ?, ?, 'admin', ?, 'Razorpay Normal Refund Initiated', ?, ?)`,
      ).bind(
        bookingId,
        booking.ride_status,
        nextRideStatus,
        adminMobile,
        `${refundStatus}: Rs. ${acceptedAmount} | ${refundReferences}`,
        now,
      ),
      env.DB.prepare(
        `INSERT INTO audit_logs (
          action, entity_type, entity_id, actor_role, actor_mobile,
          details_json, created_at
        ) VALUES ('razorpay_refund_initiated', 'booking', ?, 'admin', ?, ?, ?)`,
      ).bind(
        bookingId,
        adminMobile,
        JSON.stringify({ acceptedAmount, refundStatus, acceptedRefunds, gatewayError }),
        now,
      ),
    ]);

    const updatedBooking = await env.DB.prepare(
      "SELECT * FROM bookings WHERE booking_id = ? LIMIT 1",
    )
      .bind(bookingId)
      .first<BookingEmailRecord>();
    waitUntil(sendBookingStatusEmail(updatedBooking, "refund_updated"));

    return Response.json({
      success: true,
      bookingId,
      amount: acceptedAmount,
      refundStatus,
      refundIds: acceptedRefunds.map((refund) => refund.refundId),
      speed: "normal",
      estimatedSettlement: "5-7 Working Days",
      warning: amountLeftPaise > 0 ? gatewayError || "Part Of The Refund Is Still Pending." : "",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Refund Could Not Be Initiated.";
    return Response.json({ error: message }, { status: 500 });
  }
}
