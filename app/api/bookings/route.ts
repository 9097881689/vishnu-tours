import { env } from "cloudflare:workers";

const perKmRate = 16;
const headOffice = "Mumbai Head Office";

type BookingPayload = {
  tripType?: string;
  vehicle?: string;
  destination?: string;
  distanceKm?: number;
  date?: string;
  name?: string;
  mobile?: string;
  paymentMode?: string;
};

async function ensureBookingsTable() {
  const db = env.DB;
  if (!db) {
    throw new Error("D1 database binding DB is not configured.");
  }

  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL,
        status TEXT NOT NULL,
        trip_type TEXT NOT NULL,
        vehicle TEXT NOT NULL,
        start_point TEXT NOT NULL,
        destination TEXT NOT NULL,
        one_side_km REAL NOT NULL,
        billable_km REAL NOT NULL,
        rate_per_km INTEGER NOT NULL,
        estimated_fare INTEGER NOT NULL,
        pickup_datetime TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        customer_mobile TEXT NOT NULL,
        payment_mode TEXT NOT NULL
      )`,
    )
    .run();

  await db
    .prepare(
      "CREATE INDEX IF NOT EXISTS bookings_created_at_idx ON bookings (created_at)",
    )
    .run();
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as BookingPayload;
    const tripType = clean(payload.tripType);
    const vehicle = clean(payload.vehicle);
    const destination = clean(payload.destination);
    const date = clean(payload.date);
    const name = clean(payload.name);
    const mobile = clean(payload.mobile);
    const paymentMode = clean(payload.paymentMode) || "Pay advance after booking";
    const oneSideKm = Number(payload.distanceKm);

    if (!tripType || !vehicle || !destination || !date || !name || !mobile) {
      return Response.json(
        { error: "Please fill all booking fields." },
        { status: 400 },
      );
    }

    if (!Number.isFinite(oneSideKm) || oneSideKm <= 0) {
      return Response.json(
        { error: "Please enter valid distance in KM." },
        { status: 400 },
      );
    }

    const billableKm = tripType === "Round Trip" ? oneSideKm * 2 : oneSideKm;
    const estimatedFare = Math.round(billableKm * perKmRate);
    const bookingId = `VT${Date.now().toString(36).toUpperCase()}`;
    const createdAt = new Date().toISOString();

    await ensureBookingsTable();
    await env.DB.prepare(
      `INSERT INTO bookings (
        booking_id,
        created_at,
        status,
        trip_type,
        vehicle,
        start_point,
        destination,
        one_side_km,
        billable_km,
        rate_per_km,
        estimated_fare,
        pickup_datetime,
        customer_name,
        customer_mobile,
        payment_mode
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        bookingId,
        createdAt,
        "pending",
        tripType,
        vehicle,
        headOffice,
        destination,
        oneSideKm,
        billableKm,
        perKmRate,
        estimatedFare,
        date,
        name,
        mobile,
        paymentMode,
      )
      .run();

    return Response.json(
      {
        booking: {
          bookingId,
          status: "pending",
          startPoint: headOffice,
          destination,
          oneSideKm,
          billableKm,
          ratePerKm: perKmRate,
          estimatedFare,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Booking could not be saved.";
    return Response.json({ error: message }, { status: 500 });
  }
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}
