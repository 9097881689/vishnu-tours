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
  action?: string;
  tripType?: string;
  vehicle?: string;
  vehicleNumber?: string;
  startPoint?: string;
  destination?: string;
  distanceKm?: number;
  date?: string;
  name?: string;
  mobile?: string;
  packageType?: string;
  paymentMode?: string;
};

type BookingOperationPayload = {
  action?: string;
  pin?: string;
  mobile?: string;
  customerMobile?: string;
  bookingId?: string;
  rideStatus?: string;
  refundStatus?: string;
  paymentStatus?: string;
  paymentAmount?: number;
  vehicle?: string;
  vehicleNumber?: string;
  cancelReason?: string;
  driverName?: string;
  driverMobile?: string;
};
type DeleteBookingPayload = {
  mobile?: string;
  pin?: string;
  bookingId?: string;
};

const adminPin = "710529";
const adminMobile = "7004291529";
const adminWhatsappMobile = "917004291529";

type BookingRow = {
  booking_id: string;
  created_at: string;
  trip_type: string;
  vehicle: string;
  start_point: string;
  destination: string;
  one_side_km: number;
  billable_km: number;
  rate_per_km: number;
  estimated_fare: number;
  pickup_datetime: string;
  customer_name: string;
  customer_mobile: string;
  status: string;
  ride_status: string;
  refund_status: string;
  driver_name: string;
  driver_mobile: string;
  vehicle_number: string;
  payment_status: string;
  payment_amount: number;
  cancel_reason: string;
  ride_started_at: string;
  ride_completed_at: string;
};

type DriverRow = {
  driver_name: string;
  driver_mobile: string;
  vehicle_type: string;
  vehicle_number: string;
  updated_at: string;
};

const bookingSelectSql = `SELECT booking_id, created_at, trip_type, vehicle,
  start_point, destination, one_side_km, billable_km, rate_per_km,
  estimated_fare, pickup_datetime, customer_name, customer_mobile, status,
  ride_status, refund_status, driver_name, driver_mobile, vehicle_number,
  payment_status, payment_amount, cancel_reason, ride_started_at,
  ride_completed_at
  FROM bookings`;

async function getRecentBookings(limit = 8) {
  const recent = await env.DB.prepare(
    `${bookingSelectSql}
     WHERE booking_id NOT LIKE 'PENDING-%'
     ORDER BY id DESC
     LIMIT ?`,
  )
    .bind(limit)
    .all<BookingRow>();

  return recent.results || [];
}

async function getDrivers() {
  const drivers = await env.DB.prepare(
    `SELECT driver_name, driver_mobile, vehicle_type, vehicle_number, updated_at
     FROM drivers
     ORDER BY updated_at DESC`,
  ).all<DriverRow>();

  return drivers.results || [];
}

async function getDriverEarning(driverMobile: string) {
  const summary = await env.DB.prepare(
    `SELECT COUNT(*) AS completed_rides,
      COALESCE(SUM(ROUND(estimated_fare * 1.05)), 0) AS total_earning
     FROM bookings
     WHERE driver_mobile = ?
       AND ride_status = 'Ride Complete'
       AND booking_id NOT LIKE 'PENDING-%'`,
  )
    .bind(driverMobile)
    .first<{ completed_rides: number; total_earning: number }>();

  return {
    completedRides: Number(summary?.completed_rides || 0),
    totalEarning: Number(summary?.total_earning || 0),
  };
}

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
        payment_mode TEXT NOT NULL,
        ride_status TEXT NOT NULL DEFAULT 'Booked',
        refund_status TEXT NOT NULL DEFAULT 'None',
        driver_name TEXT NOT NULL DEFAULT '',
        driver_mobile TEXT NOT NULL DEFAULT '',
        vehicle_number TEXT NOT NULL DEFAULT '',
        payment_status TEXT NOT NULL DEFAULT 'Pending',
        payment_amount INTEGER NOT NULL DEFAULT 0,
        cancel_reason TEXT NOT NULL DEFAULT '',
        ride_started_at TEXT NOT NULL DEFAULT '',
        ride_completed_at TEXT NOT NULL DEFAULT ''
      )`,
    )
    .run();

  await db
    .prepare("ALTER TABLE bookings ADD COLUMN package_type TEXT NOT NULL DEFAULT 'perKm'")
    .run()
    .catch(() => undefined);

  await db
    .prepare("ALTER TABLE bookings ADD COLUMN ride_status TEXT NOT NULL DEFAULT 'Booked'")
    .run()
    .catch(() => undefined);

  await db
    .prepare("ALTER TABLE bookings ADD COLUMN refund_status TEXT NOT NULL DEFAULT 'None'")
    .run()
    .catch(() => undefined);

  await db
    .prepare("ALTER TABLE bookings ADD COLUMN driver_name TEXT NOT NULL DEFAULT ''")
    .run()
    .catch(() => undefined);

  await db
    .prepare("ALTER TABLE bookings ADD COLUMN driver_mobile TEXT NOT NULL DEFAULT ''")
    .run()
    .catch(() => undefined);

  await db
    .prepare("ALTER TABLE bookings ADD COLUMN vehicle_number TEXT NOT NULL DEFAULT ''")
    .run()
    .catch(() => undefined);

  await db
    .prepare("ALTER TABLE bookings ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'Pending'")
    .run()
    .catch(() => undefined);

  await db
    .prepare("ALTER TABLE bookings ADD COLUMN payment_amount INTEGER NOT NULL DEFAULT 0")
    .run()
    .catch(() => undefined);

  await db
    .prepare("ALTER TABLE bookings ADD COLUMN cancel_reason TEXT NOT NULL DEFAULT ''")
    .run()
    .catch(() => undefined);

  await db
    .prepare("ALTER TABLE bookings ADD COLUMN ride_started_at TEXT NOT NULL DEFAULT ''")
    .run()
    .catch(() => undefined);

  await db
    .prepare("ALTER TABLE bookings ADD COLUMN ride_completed_at TEXT NOT NULL DEFAULT ''")
    .run()
    .catch(() => undefined);

  await db
    .prepare(
      "CREATE INDEX IF NOT EXISTS bookings_created_at_idx ON bookings (created_at)",
    )
    .run();

  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS drivers (
        driver_mobile TEXT PRIMARY KEY,
        driver_name TEXT NOT NULL,
        vehicle_type TEXT NOT NULL,
        vehicle_number TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
    )
    .run();
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const pin = url.searchParams.get("pin") || "";
    const loginMobile = clean(url.searchParams.get("loginMobile"));
    const bookingId = clean(url.searchParams.get("bookingId"));
    const mobile = clean(url.searchParams.get("mobile"));

    await ensureBookingsTable();

    if (loginMobile) {
      if (loginMobile === adminMobile) {
        const summary = await env.DB.prepare(
          "SELECT COUNT(*) AS total_bookings, COALESCE(SUM(estimated_fare), 0) AS total_fare FROM bookings WHERE booking_id NOT LIKE 'PENDING-%'",
        ).first<{ total_bookings: number; total_fare: number }>();
        const recent = await getRecentBookings();
        const drivers = await getDrivers();

        return Response.json({
          role: "admin",
          totalBookings: Number(summary?.total_bookings || 0),
          totalFare: Number(summary?.total_fare || 0),
          recentBookings: recent,
          drivers,
        });
      }

      const driverProfile = await env.DB.prepare(
        `SELECT driver_name, driver_mobile, vehicle_type, vehicle_number, updated_at
         FROM drivers
         WHERE driver_mobile = ?
         LIMIT 1`,
      )
        .bind(loginMobile)
        .first<DriverRow>();
      const driverBookings = await env.DB.prepare(
        `${bookingSelectSql}
         WHERE booking_id NOT LIKE 'PENDING-%' AND driver_mobile = ?
         ORDER BY id DESC
         LIMIT 20`,
      )
        .bind(loginMobile)
        .all<BookingRow>();

      const openBookings = driverProfile
        ? await env.DB.prepare(
            `${bookingSelectSql}
             WHERE booking_id NOT LIKE 'PENDING-%'
               AND COALESCE(driver_mobile, '') = ''
               AND vehicle = ?
               AND ride_status NOT IN ('Ride Cancelled', 'Ride Complete')
               AND (
                 payment_status = 'Complete'
                 OR payment_amount > 0
                 OR ride_status IN ('Payment Received', 'Booking Confirmed')
               )
             ORDER BY id DESC
             LIMIT 20`,
          )
            .bind(driverProfile.vehicle_type)
            .all<BookingRow>()
        : { results: [] as BookingRow[] };

      if (driverProfile || driverBookings.results?.length) {
        return Response.json({
          role: "driver",
          driverProfile,
          recentBookings: [
            ...(driverBookings.results || []),
            ...(openBookings.results || []),
          ],
          driverEarning: await getDriverEarning(loginMobile),
        });
      }

      const customerBookings = await env.DB.prepare(
        `${bookingSelectSql}
         WHERE booking_id NOT LIKE 'PENDING-%' AND customer_mobile = ?
         ORDER BY id DESC
         LIMIT 20`,
      )
        .bind(loginMobile)
        .all<BookingRow>();

      if (customerBookings.results?.length) {
        return Response.json({
          role: "customer",
          recentBookings: customerBookings.results,
        });
      }

      return Response.json({
        role: "driver",
        driverProfile: null,
        recentBookings: openBookings.results || [],
        driverEarning: { completedRides: 0, totalEarning: 0 },
      });
    }

    if (bookingId && mobile) {
      const booking = await env.DB.prepare(
        `SELECT booking_id, created_at, trip_type, vehicle, start_point, destination,
          one_side_km, billable_km, rate_per_km, estimated_fare, pickup_datetime,
          customer_name, customer_mobile, status, ride_status, refund_status,
          driver_name, driver_mobile, vehicle_number, payment_status,
          payment_amount, cancel_reason, ride_started_at, ride_completed_at
         FROM bookings
         WHERE booking_id = ? AND customer_mobile = ?
         LIMIT 1`,
      )
        .bind(bookingId, mobile)
        .first();

      if (!booking) {
        return Response.json(
          { error: "Booking not found for this mobile number." },
          { status: 404 },
        );
      }

      return Response.json({ booking });
    }

    if (pin !== adminPin) {
      return Response.json({ error: "Invalid login PIN." }, { status: 401 });
    }

    const summary = await env.DB.prepare(
      "SELECT COUNT(*) AS total_bookings, COALESCE(SUM(estimated_fare), 0) AS total_fare FROM bookings WHERE booking_id NOT LIKE 'PENDING-%'",
    ).first<{ total_bookings: number; total_fare: number }>();
    const recent = await getRecentBookings();

    return Response.json({
      totalBookings: Number(summary?.total_bookings || 0),
      totalFare: Number(summary?.total_fare || 0),
      recentBookings: recent,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Booking dashboard could not load.";

    return Response.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = (await request.json()) as BookingOperationPayload;
    const bookingId = clean(payload.bookingId);

    if (!bookingId) {
      return Response.json({ error: "Booking ID is required." }, { status: 400 });
    }

    await ensureBookingsTable();

    const isAdmin =
      clean(payload.pin) === adminPin || clean(payload.mobile) === adminMobile;

    if (!isAdmin) {
      const customerMobile = clean(payload.customerMobile);
      const paymentStatus = clean(payload.paymentStatus);
      const paymentAmount = Number(payload.paymentAmount);
      const driverMobile = clean(payload.mobile);

      if (customerMobile && paymentStatus === "Complete" && paymentAmount > 0) {
        await env.DB.prepare(
          `UPDATE bookings
           SET payment_status = ?,
               payment_amount = ?,
               ride_status = CASE
                 WHEN ride_status = 'Booked' THEN 'Payment Received'
                 ELSE ride_status
               END
           WHERE booking_id = ? AND customer_mobile = ?`,
        )
          .bind(paymentStatus, paymentAmount, bookingId, customerMobile)
          .run();

        return Response.json({ success: true });
      }

      if (payload.action === "acceptRide" && driverMobile) {
        const driver = await env.DB.prepare(
          `SELECT driver_name, driver_mobile, vehicle_type, vehicle_number
           FROM drivers
           WHERE driver_mobile = ?
           LIMIT 1`,
        )
          .bind(driverMobile)
          .first<DriverRow>();

        if (!driver) {
          return Response.json(
            { error: "Please Add Driver Profile Before Accepting Ride." },
            { status: 400 },
          );
        }

        const booking = await env.DB.prepare(
          `SELECT booking_id, pickup_datetime, driver_mobile, vehicle
           FROM bookings
           WHERE booking_id = ?
           LIMIT 1`,
        )
          .bind(bookingId)
          .first<{
            booking_id: string;
            pickup_datetime: string;
            driver_mobile: string;
            vehicle: string;
          }>();

        if (!booking) {
          return Response.json({ error: "Booking not found." }, { status: 404 });
        }

        if (booking.driver_mobile) {
          return Response.json(
            { error: "This Ride Is Already Assigned." },
            { status: 409 },
          );
        }

        if (booking.vehicle !== driver.vehicle_type) {
          return Response.json(
            {
              error: `This Ride Requires ${booking.vehicle}. Your Saved Vehicle Is ${driver.vehicle_type}.`,
            },
            { status: 409 },
          );
        }

        const conflict = await env.DB.prepare(
          `SELECT booking_id, pickup_datetime
           FROM bookings
           WHERE booking_id != ?
             AND driver_mobile = ?
             AND pickup_datetime = ?
             AND ride_status NOT IN ('Ride Cancelled', 'Ride Complete')
             AND booking_id NOT LIKE 'PENDING-%'
           LIMIT 1`,
        )
          .bind(bookingId, driverMobile, booking.pickup_datetime)
          .first<{ booking_id: string; pickup_datetime: string }>();

        if (conflict) {
          return Response.json(
            {
              error: `Driver Already Assigned For Booking ${conflict.booking_id} On Date/Time ${conflict.pickup_datetime}.`,
            },
            { status: 409 },
          );
        }

        await env.DB.prepare(
          `UPDATE bookings
           SET ride_status = 'Driver Assigned',
               driver_name = ?,
               driver_mobile = ?,
               vehicle_number = ?
           WHERE booking_id = ? AND COALESCE(driver_mobile, '') = ''`,
        )
          .bind(
            driver.driver_name,
            driver.driver_mobile,
            driver.vehicle_number,
            bookingId,
          )
          .run();

        return Response.json({ success: true });
      }

      if (
        payload.action === "driverRideStatus" &&
        driverMobile &&
        (payload.rideStatus === "Ride Started" ||
          payload.rideStatus === "Ride Complete")
      ) {
        const rideStatus = clean(payload.rideStatus);
        const timestampColumn =
          rideStatus === "Ride Started" ? "ride_started_at" : "ride_completed_at";
        const now = new Date().toISOString();

        const assignedBooking = await env.DB.prepare(
          `SELECT booking_id, driver_mobile, ride_started_at, ride_completed_at
           FROM bookings
           WHERE booking_id = ? AND driver_mobile = ?
           LIMIT 1`,
        )
          .bind(bookingId, driverMobile)
          .first<{
            booking_id: string;
            driver_mobile: string;
            ride_started_at: string;
            ride_completed_at: string;
          }>();

        if (!assignedBooking) {
          return Response.json(
            { error: "This Ride Is Not Assigned To This Driver." },
            { status: 403 },
          );
        }

        if (rideStatus === "Ride Complete" && !assignedBooking.ride_started_at) {
          return Response.json(
            { error: "Start The Ride Before Marking It Complete." },
            { status: 400 },
          );
        }

        if (assignedBooking.ride_completed_at) {
          return Response.json(
            { error: "This Ride Is Already Complete." },
            { status: 409 },
          );
        }

        await env.DB.prepare(
          `UPDATE bookings
           SET ride_status = ?,
               ${timestampColumn} = CASE
                 WHEN ${timestampColumn} = '' THEN ?
                 ELSE ${timestampColumn}
               END
           WHERE booking_id = ? AND driver_mobile = ?`,
        )
          .bind(rideStatus, now, bookingId, driverMobile)
          .run();

        return Response.json({ success: true });
      }

      return Response.json({ error: "Invalid login mobile." }, { status: 401 });
    }

    const existingBooking = await env.DB.prepare(
      `SELECT booking_id, pickup_datetime, driver_mobile, driver_name,
        vehicle_number, ride_status
       FROM bookings
       WHERE booking_id = ?
       LIMIT 1`,
    )
      .bind(bookingId)
      .first<{
        booking_id: string;
        pickup_datetime: string;
        driver_mobile: string;
        driver_name: string;
        vehicle_number: string;
        ride_status: string;
      }>();

    if (!existingBooking) {
      return Response.json({ error: "Booking not found." }, { status: 404 });
    }

    const requestedRideStatus = clean(payload.rideStatus);
    const requestedDriverMobile = clean(payload.driverMobile);
    const requestedDriverName = clean(payload.driverName);
    const requestedVehicleNumber = clean(payload.vehicleNumber);

    if (
      requestedRideStatus === "Ride Started" &&
      !existingBooking.driver_mobile &&
      !requestedDriverMobile
    ) {
      return Response.json(
        { error: "Assign Driver And Vehicle Before Starting The Ride." },
        { status: 400 },
      );
    }

    if (requestedDriverMobile) {
      const conflict = await env.DB.prepare(
        `SELECT booking_id, pickup_datetime, destination
         FROM bookings
         WHERE booking_id != ?
           AND driver_mobile = ?
           AND pickup_datetime = ?
           AND ride_status NOT IN ('Ride Cancelled', 'Ride Complete')
           AND booking_id NOT LIKE 'PENDING-%'
         LIMIT 1`,
      )
        .bind(bookingId, requestedDriverMobile, existingBooking.pickup_datetime)
        .first<{
          booking_id: string;
          pickup_datetime: string;
          destination: string;
        }>();

      if (conflict) {
        return Response.json(
          {
            error: `Driver Already Assigned For Booking ${conflict.booking_id} On Date/Time ${conflict.pickup_datetime}.`,
          },
          { status: 409 },
        );
      }
    }

    const now = new Date().toISOString();
    const rideStartedAt = requestedRideStatus === "Ride Started" ? now : "";
    const rideCompletedAt = requestedRideStatus === "Ride Complete" ? now : "";

    await env.DB.prepare(
      `UPDATE bookings
       SET ride_status = COALESCE(NULLIF(?, ''), ride_status),
           refund_status = COALESCE(NULLIF(?, ''), refund_status),
           payment_status = COALESCE(NULLIF(?, ''), payment_status),
           payment_amount = COALESCE(?, payment_amount),
           vehicle = COALESCE(NULLIF(?, ''), vehicle),
           driver_name = COALESCE(NULLIF(?, ''), driver_name),
           driver_mobile = COALESCE(NULLIF(?, ''), driver_mobile),
           vehicle_number = COALESCE(NULLIF(?, ''), vehicle_number),
           cancel_reason = COALESCE(NULLIF(?, ''), cancel_reason),
           ride_started_at = CASE
             WHEN NULLIF(?, '') IS NOT NULL AND ride_started_at = '' THEN ?
             ELSE ride_started_at
           END,
           ride_completed_at = CASE
             WHEN NULLIF(?, '') IS NOT NULL AND ride_completed_at = '' THEN ?
             ELSE ride_completed_at
           END
       WHERE booking_id = ?`,
      )
      .bind(
        requestedRideStatus,
        clean(payload.refundStatus),
        clean(payload.paymentStatus),
        Number.isFinite(Number(payload.paymentAmount))
          ? Number(payload.paymentAmount)
          : null,
        clean(payload.vehicle),
        requestedDriverName,
        requestedDriverMobile,
        requestedVehicleNumber,
        clean(payload.cancelReason),
        rideStartedAt,
        rideStartedAt,
        rideCompletedAt,
        rideCompletedAt,
        bookingId,
      )
      .run();

    return Response.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Booking operation failed.";

    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const payload = (await request.json()) as DeleteBookingPayload;
    const isAdmin =
      clean(payload.pin) === adminPin || clean(payload.mobile) === adminMobile;
    const bookingId = clean(payload.bookingId);

    if (!isAdmin) {
      return Response.json({ error: "Invalid login mobile." }, { status: 401 });
    }

    if (!bookingId) {
      return Response.json({ error: "Booking ID is required." }, { status: 400 });
    }

    await ensureBookingsTable();
    await env.DB.prepare("DELETE FROM bookings WHERE booking_id = ?")
      .bind(bookingId)
      .run();

    return Response.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Booking delete failed.";

    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as BookingPayload;
    const action = clean(payload.action);

    await ensureBookingsTable();

    if (action === "saveDriver") {
      const driverName = clean(payload.name);
      const driverMobile = clean(payload.mobile);
      const vehicleType = clean(payload.vehicle);
      const vehicleNumber = clean(payload.vehicleNumber);

      if (!driverName || !driverMobile || !vehicleType || !vehicleNumber) {
        return Response.json(
          { error: "Driver Name, Mobile, Vehicle Type And Vehicle Number Are Required." },
          { status: 400 },
        );
      }

      await env.DB.prepare(
        `INSERT INTO drivers (
          driver_mobile, driver_name, vehicle_type, vehicle_number, updated_at
        ) VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(driver_mobile) DO UPDATE SET
          driver_name = excluded.driver_name,
          vehicle_type = excluded.vehicle_type,
          vehicle_number = excluded.vehicle_number,
          updated_at = excluded.updated_at`,
      )
        .bind(
          driverMobile,
          driverName,
          vehicleType,
          vehicleNumber,
          new Date().toISOString(),
        )
        .run();

      return Response.json({ success: true });
    }

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
        payment_mode,
        ride_status,
        refund_status,
        driver_name,
        driver_mobile,
        vehicle_number,
        payment_status,
        payment_amount,
        cancel_reason,
        ride_started_at,
        ride_completed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        "Booked",
        "None",
        "",
        "",
        "",
        "Pending",
        0,
        "",
        "",
        "",
      )
      .run();
    const rowId = Number(insertResult.meta.last_row_id);
    const bookingId = formatBookingId(rowId);

    await env.DB.prepare("UPDATE bookings SET booking_id = ? WHERE id = ?")
      .bind(bookingId, rowId)
      .run();

    const booking = {
      bookingId,
      status: "pending",
      startPoint,
      destination,
      oneSideKm,
      billableKm,
      ratePerKm: selectedRate.perKm,
      packageType,
      estimatedFare,
    };

    await sendAdminWhatsAppNotification({
      bookingId,
      tripType,
      vehicle,
      startPoint,
      destination,
      oneSideKm,
      billableKm,
      ratePerKm: selectedRate.perKm,
      estimatedFare,
      pickupDatetime: date,
      customerName: name,
      customerMobile: mobile,
      paymentMode,
    });

    return Response.json(
      {
        booking,
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

async function sendAdminWhatsAppNotification(booking: {
  bookingId: string;
  tripType: string;
  vehicle: string;
  startPoint: string;
  destination: string;
  oneSideKm: number;
  billableKm: number;
  ratePerKm: number;
  estimatedFare: number;
  pickupDatetime: string;
  customerName: string;
  customerMobile: string;
  paymentMode: string;
}) {
  const token = process.env.WHATSAPP_TOKEN || "";
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
  const graphVersion = process.env.WHATSAPP_GRAPH_VERSION || "v20.0";
  const recipient = process.env.WHATSAPP_ADMIN_MOBILE || adminWhatsappMobile;

  if (!token || !phoneNumberId) {
    return;
  }

  const totalWithGst = Math.round(booking.estimatedFare * 1.05);
  const message = [
    "New Booking Received - Vishnu Tours",
    `Booking ID: ${booking.bookingId}`,
    `Customer: ${booking.customerName}`,
    `Mobile: ${booking.customerMobile}`,
    `Trip: ${booking.tripType}`,
    `Cab: ${booking.vehicle}`,
    `Pickup: ${booking.startPoint}`,
    `Drop: ${booking.destination}`,
    `Pickup Time: ${booking.pickupDatetime}`,
    `One Side KM: ${booking.oneSideKm}`,
    `Billable KM: ${booking.billableKm}`,
    `Rate: Rs ${booking.ratePerKm}/KM`,
    `Fare With GST 5%: Rs ${totalWithGst}`,
    `Payment: ${booking.paymentMode}`,
  ].join("\n");

  await fetch(
    `https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: recipient,
        type: "text",
        text: {
          preview_url: false,
          body: message,
        },
      }),
    },
  ).catch((error) => {
    console.warn("Admin WhatsApp notification failed.", error);
  });
}

function normalizePackage(value: unknown): PackageType {
  if (value === "fullDay" || value === "halfDay" || value === "vip") {
    return value;
  }

  return "perKm";
}
