import { env } from "cloudflare:workers";

export async function POST(request: Request) {
  const keyId = process.env.RAZORPAY_KEY_ID || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

  if (!keyId) {
    return Response.json(
      { error: "Razorpay Key ID is not configured." },
      { status: 503 },
    );
  }

  const payload = (await request.json()) as {
    amount?: number;
    receipt?: string;
    notes?: Record<string, string>;
  };
  const amount = Number(payload.amount);
  const bookingId = String(payload.notes?.bookingId || "").trim();
  const createdByMobile = String(
    payload.notes?.customerMobile || payload.notes?.collectionBy || "",
  ).replace(/\D/g, "");
  const purpose = payload.notes?.collectionBy
    ? "driver_balance_collection"
    : "booking_payment";

  if (!Number.isFinite(amount) || amount < 100) {
    return Response.json(
      { error: "Minimum payment amount is Rs. 1." },
      { status: 400 },
    );
  }

  if (!keySecret) {
    return Response.json(
      { error: "Razorpay Key Secret is required for secure payment verification." },
      { status: 503 },
    );
  }

  if (!bookingId) {
    return Response.json(
      { error: "Booking ID is required for payment order." },
      { status: 400 },
    );
  }

  const booking = await env.DB.prepare(
    `SELECT customer_mobile, driver_mobile, ride_status, trip_type, estimated_fare,
      payment_amount, billable_km, rate_per_km, rate_per_hour, odometer_start,
      ride_started_at
     FROM bookings
     WHERE booking_id = ?
     LIMIT 1`,
  )
    .bind(bookingId)
    .first<{
      customer_mobile: string;
      driver_mobile: string;
      ride_status: string;
      trip_type: string;
      estimated_fare: number;
      payment_amount: number;
      billable_km: number;
      rate_per_km: number;
      rate_per_hour: number;
      odometer_start: number;
      ride_started_at: string;
    }>();

  if (!booking) {
    return Response.json({ error: "Booking was not found." }, { status: 404 });
  }

  const baseFareWithGst = Math.round(Number(booking.estimated_fare || 0) * 1.05);
  const alreadyPaid = Number(booking.payment_amount || 0);

  if (purpose === "driver_balance_collection") {
    if (!createdByMobile || booking.driver_mobile !== createdByMobile) {
      return Response.json(
        { error: "Only the assigned driver can create this payment request." },
        { status: 403 },
      );
    }

    if (
      (booking.ride_status || "").includes("Complete") ||
      (booking.ride_status || "").includes("Cancel")
    ) {
      return Response.json(
        { error: "Payment cannot be collected for this ride status." },
        { status: 409 },
      );
    }

    const odometerStart = Math.round(
      Number(payload.notes?.odometerStart || booking.odometer_start || 0),
    );
    const odometerEnd = Math.round(Number(payload.notes?.odometerEnd || 0));
    if (odometerEnd <= odometerStart) {
      return Response.json(
        { error: "Valid end odometer is required before final payment." },
        { status: 400 },
      );
    }

    const actualKm = odometerEnd - odometerStart;
    const extraKm = Math.max(0, actualKm - Number(booking.billable_km || 0));
    const extraKmAmount = Math.round(extraKm * Number(booking.rate_per_km || 0) * 1.05);
    const includedHours = booking.trip_type.includes("4 Hr")
      ? 4
      : booking.trip_type.includes("10 Hr")
        ? 10
        : booking.trip_type.includes("Local") || booking.trip_type.includes("8 Hr")
          ? 8
          : booking.trip_type.includes("Airport")
            ? 4
            : 0;
    const rideStartedAtMs = Date.parse(booking.ride_started_at || "");
    const rideDurationHours = Number.isFinite(rideStartedAtMs)
      ? Math.max(0, (Date.now() - rideStartedAtMs) / (60 * 60 * 1000))
      : 0;
    const extraHours =
      includedHours > 0 ? Math.max(0, Math.ceil(rideDurationHours - includedHours)) : 0;
    const extraHourAmount = Math.round(
      extraHours * Number(booking.rate_per_hour || 0) * 1.05,
    );
    const extraAmount = extraKmAmount + extraHourAmount;
    const expectedPaise = Math.max(0, baseFareWithGst + extraAmount - alreadyPaid) * 100;

    if (Math.round(amount) !== expectedPaise) {
      return Response.json(
        { error: "Payment amount does not match the server-calculated ride balance." },
        { status: 409 },
      );
    }
  } else {
    if (createdByMobile && booking.customer_mobile !== createdByMobile) {
      return Response.json(
        { error: "Payment mobile does not match this booking." },
        { status: 403 },
      );
    }

    const pendingPaise = Math.max(0, baseFareWithGst - alreadyPaid) * 100;
    if (Math.round(amount) > pendingPaise) {
      return Response.json(
        { error: "Payment amount cannot exceed the pending booking fare." },
        { status: 409 },
      );
    }
  }

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(amount),
      currency: "INR",
      receipt: payload.receipt || `vishnu-${Date.now()}`,
      notes: payload.notes || {},
    }),
  });

  const result = (await response.json()) as { id?: string; error?: unknown };

  if (!response.ok || !result.id) {
    return Response.json(
      { error: "Unable to create Razorpay order.", detail: result.error },
      { status: 502 },
    );
  }

  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS payment_gateway_orders (
      order_id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL,
      amount_paise INTEGER NOT NULL,
      purpose TEXT NOT NULL DEFAULT 'booking_payment',
      created_by_mobile TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'Created',
      payment_id TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      verified_at TEXT NOT NULL DEFAULT ''
    )`,
  ).run();

  await env.DB.prepare(
    `INSERT INTO payment_gateway_orders (
      order_id, booking_id, amount_paise, purpose, created_by_mobile,
      status, payment_id, created_at, verified_at
    ) VALUES (?, ?, ?, ?, ?, 'Created', '', ?, '')`,
  )
    .bind(
      result.id,
      bookingId,
      Math.round(amount),
      purpose,
      createdByMobile,
      new Date().toISOString(),
    )
    .run();

  return Response.json({
    keyId,
    orderId: result.id,
    mode: "order",
  });
}
