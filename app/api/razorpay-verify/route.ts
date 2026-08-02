import { env } from "cloudflare:workers";

type VerifyPayload = {
  bookingId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function safeEqual(first: string, second: string) {
  if (first.length !== second.length) {
    return false;
  }

  let difference = 0;
  for (let index = 0; index < first.length; index += 1) {
    difference |= first.charCodeAt(index) ^ second.charCodeAt(index);
  }

  return difference === 0;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as VerifyPayload;
    const bookingId = clean(payload.bookingId);
    const orderId = clean(payload.razorpayOrderId);
    const paymentId = clean(payload.razorpayPaymentId);
    const signature = clean(payload.razorpaySignature).toLowerCase();
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

    if (!keySecret) {
      return Response.json(
        { error: "Razorpay verification secret is not configured." },
        { status: 503 },
      );
    }

    if (!bookingId || !orderId || !paymentId || !signature) {
      return Response.json(
        { error: "Complete Razorpay payment verification details are required." },
        { status: 400 },
      );
    }

    await env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS payment_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id TEXT NOT NULL DEFAULT '', customer_mobile TEXT NOT NULL DEFAULT '',
        driver_mobile TEXT NOT NULL DEFAULT '', amount INTEGER NOT NULL,
        transaction_type TEXT NOT NULL, payment_mode TEXT NOT NULL,
        reference_number TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'Complete',
        settlement_status TEXT NOT NULL DEFAULT 'Settled', created_by_role TEXT NOT NULL,
        created_by_mobile TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL
      )`,
    ).run();
    await env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT, action TEXT NOT NULL,
        entity_type TEXT NOT NULL, entity_id TEXT NOT NULL, actor_role TEXT NOT NULL,
        actor_mobile TEXT NOT NULL DEFAULT '', details_json TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL
      )`,
    ).run();

    const order = await env.DB.prepare(
      `SELECT order_id, booking_id, amount_paise, purpose, created_by_mobile,
        status, payment_id
       FROM payment_gateway_orders
       WHERE order_id = ? AND booking_id = ?
       LIMIT 1`,
    )
      .bind(orderId, bookingId)
      .first<{
        order_id: string;
        booking_id: string;
        amount_paise: number;
        purpose: string;
        created_by_mobile: string;
        status: string;
        payment_id: string;
      }>();

    if (!order) {
      return Response.json({ error: "Payment order was not found." }, { status: 404 });
    }

    if (order.status === "Verified") {
      if (order.payment_id === paymentId) {
        return Response.json({ success: true, alreadyVerified: true });
      }
      return Response.json({ error: "Payment order is already settled." }, { status: 409 });
    }

    const verificationKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(keySecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const expectedSignature = toHex(
      await crypto.subtle.sign(
        "HMAC",
        verificationKey,
        new TextEncoder().encode(`${orderId}|${paymentId}`),
      ),
    );

    if (!safeEqual(expectedSignature, signature)) {
      return Response.json({ error: "Payment signature verification failed." }, { status: 401 });
    }

    const booking = await env.DB.prepare(
      `SELECT customer_mobile, driver_mobile, estimated_fare, extra_amount,
        payment_amount, ride_status
       FROM bookings
       WHERE booking_id = ?
       LIMIT 1`,
    )
      .bind(bookingId)
      .first<{
        customer_mobile: string;
        driver_mobile: string;
        estimated_fare: number;
        extra_amount: number;
        payment_amount: number;
        ride_status: string;
      }>();

    if (!booking) {
      return Response.json({ error: "Booking was not found." }, { status: 404 });
    }

    const paidNow = Math.round(Number(order.amount_paise || 0) / 100);
    const totalPayable =
      Math.round(Number(booking.estimated_fare || 0) * 1.05) +
      Number(booking.extra_amount || 0);
    const currentPaid = Number(booking.payment_amount || 0);
    const updatedPaid =
      order.purpose === "driver_balance_collection"
        ? currentPaid + paidNow
        : Math.min(totalPayable, currentPaid + paidNow);
    const paymentStatus =
      order.purpose === "driver_balance_collection" || updatedPaid >= totalPayable
        ? "Complete"
        : "Partially Paid";
    const now = new Date().toISOString();

    await env.DB.batch([
      env.DB.prepare(
        `UPDATE payment_gateway_orders
         SET status = 'Verified', payment_id = ?, verified_at = ?
         WHERE order_id = ? AND status = 'Created'`,
      ).bind(paymentId, now, orderId),
      env.DB.prepare(
        `UPDATE bookings
         SET payment_amount = ?, payment_status = ?,
           payment_collection_mode = 'payment_gateway'
         WHERE booking_id = ?`,
      ).bind(updatedPaid, paymentStatus, bookingId),
      env.DB.prepare(
        `INSERT INTO payment_transactions (
          booking_id, customer_mobile, driver_mobile, amount,
          transaction_type, payment_mode, reference_number, status,
          settlement_status, created_by_role, created_by_mobile, created_at
        ) VALUES (?, ?, ?, ?, ?, 'Razorpay', ?, ?, 'Settled Online', ?, ?, ?)`,
      ).bind(
        bookingId,
        booking.customer_mobile,
        booking.driver_mobile || order.created_by_mobile,
        paidNow,
        order.purpose === "driver_balance_collection"
          ? "Customer Online Payment Collected During Ride"
          : "Customer Online Payment",
        paymentId,
        paymentStatus,
        order.purpose === "driver_balance_collection" ? "driver" : "customer",
        order.created_by_mobile || booking.customer_mobile,
        now,
      ),
      env.DB.prepare(
        `INSERT INTO audit_logs (
          action, entity_type, entity_id, actor_role, actor_mobile,
          details_json, created_at
        ) VALUES ('razorpay_payment_verified', 'booking', ?, ?, ?, ?, ?)`,
      ).bind(
        bookingId,
        order.purpose === "driver_balance_collection" ? "driver" : "customer",
        order.created_by_mobile || booking.customer_mobile,
        JSON.stringify({ orderId, paymentId, paidNow, updatedPaid, paymentStatus }),
        now,
      ),
    ]);

    return Response.json({ success: true, paymentStatus, paymentAmount: updatedPaid });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payment verification failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
