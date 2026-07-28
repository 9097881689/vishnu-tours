import { env } from "cloudflare:workers";

const headOffice = "Mumbai Head Office";

const rateTable: Record<
  string,
  { perKm: number; fullDay: number; halfDay: number; vip: number }
> = {
  "Toyota Etios": { perKm: 16, fullDay: 3200, halfDay: 1900, vip: 5200 },
  "Maruti Ertiga": { perKm: 18, fullDay: 4200, halfDay: 2600, vip: 6200 },
  "Maruti Rumion": { perKm: 18, fullDay: 4300, halfDay: 2700, vip: 6500 },
  "Toyota Innova Crysta": { perKm: 22, fullDay: 5800, halfDay: 3600, vip: 8500 },
  "Toyota Hycross": { perKm: 26, fullDay: 7200, halfDay: 4600, vip: 11000 },
};

type PackageType = "perKm" | "fullDay" | "halfDay" | "vip";

type BookingPayload = {
  tripType?: string;
  vehicle?: string;
  startPoint?: string;
  destination?: string;
  distanceKm?: number;
  date?: string;
  name?: string;
  mobile?: string;
  packageType?: string;
  paymentMode?: string;
};

const adminPin = "710529";

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
        package_type TEXT NOT NULL DEFAULT 'perKm',
        payment_mode TEXT NOT NULL
      )`,
    )
    .run();

  await db
    .prepare("ALTER TABLE bookings ADD COLUMN package_type TEXT NOT NULL DEFAULT 'perKm'")
    .run()
    .catch(() => undefined);

  await db
    .prepare(
      "CREATE INDEX IF NOT EXISTS bookings_created_at_idx ON bookings (created_at)",
    )
    .run();
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const pin = url.searchParams.get("pin") || "";

    if (pin !== adminPin) {
      return Response.json({ error: "Invalid login PIN." }, { status: 401 });
    }

    await ensureBookingsTable();

    const summary = await env.DB.prepare(
      "SELECT COUNT(*) AS total_bookings, COALESCE(SUM(estimated_fare), 0) AS total_fare FROM bookings WHERE booking_id NOT LIKE 'PENDING-%'",
    ).first<{ total_bookings: number; total_fare: number }>();
    const recent = await env.DB.prepare(
      `SELECT booking_id, created_at, trip_type, vehicle, start_point, destination,
        estimated_fare, customer_name, customer_mobile, status
       FROM bookings
       WHERE booking_id NOT LIKE 'PENDING-%'
       ORDER BY id DESC
       LIMIT 8`,
    ).all<{
      booking_id: string;
      created_at: string;
      trip_type: string;
      vehicle: string;
      start_point: string;
      destination: string;
      estimated_fare: number;
      customer_name: string;
      customer_mobile: string;
      status: string;
    }>();

    return Response.json({
      totalBookings: Number(summary?.total_bookings || 0),
      totalFare: Number(summary?.total_fare || 0),
      recentBookings: recent.results || [],
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Booking dashboard could not load.";

    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as BookingPayload;
    const tripType = clean(payload.tripType);
    const vehicle = clean(payload.vehicle);
    const startPoint = clean(payload.startPoint) || headOffice;
    const destination = clean(payload.destination);
    const date = clean(payload.date);
    const name = clean(payload.name);
    const mobile = clean(payload.mobile);
    const packageType = normalizePackage(payload.packageType);
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

    const selectedRate = rateTable[vehicle] || rateTable["Toyota Etios"];
    const billableKm =
      packageType === "perKm"
        ? tripType === "Round Trip"
          ? oneSideKm * 2
          : oneSideKm
        : packageType === "halfDay"
          ? 40
          : 80;
    const estimatedFare =
      packageType === "perKm"
        ? Math.round(billableKm * selectedRate.perKm)
        : selectedRate[packageType];
    const createdAt = new Date().toISOString();

    await ensureBookingsTable();
    const temporaryBookingId =
      typeof crypto.randomUUID === "function"
        ? `PENDING-${crypto.randomUUID()}`
        : `PENDING-${Date.now()}`;
    const insertResult = await env.DB.prepare(
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
        package_type,
        payment_mode
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        temporaryBookingId,
        createdAt,
        "pending",
        tripType,
        vehicle,
        startPoint,
        destination,
        oneSideKm,
        billableKm,
        selectedRate.perKm,
        estimatedFare,
        date,
        name,
        mobile,
        packageType,
        paymentMode,
      )
      .run();
    const rowId = Number(insertResult.meta.last_row_id);
    const bookingId = formatBookingId(rowId);

    await env.DB.prepare("UPDATE bookings SET booking_id = ? WHERE id = ?")
      .bind(bookingId, rowId)
      .run();

    return Response.json(
      {
        booking: {
          bookingId,
          status: "pending",
          startPoint,
          destination,
          oneSideKm,
          billableKm,
          ratePerKm: selectedRate.perKm,
          packageType,
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

function formatBookingId(rowId: number) {
  const serial = Number.isFinite(rowId) && rowId > 0 ? rowId : Date.now();

  return `VTT${String(serial).padStart(3, "0")}`;
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizePackage(value: unknown): PackageType {
  if (value === "fullDay" || value === "halfDay" || value === "vip") {
    return value;
  }

  return "perKm";
}
