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
  requesterMobile?: string;
  tripType?: string;
  vehicle?: string;
  vehicleNumber?: string;
  startPoint?: string;
  destination?: string;
  distanceKm?: number;
  date?: string;
  name?: string;
  mobile?: string;
  email?: string;
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
  collectionMode?: string;
  cashCollected?: number;
  vehicle?: string;
  vehicleNumber?: string;
  cancelReason?: string;
  driverName?: string;
  driverMobile?: string;
  amount?: number;
  bankName?: string;
  bankAccount?: string;
  bankIfsc?: string;
  withdrawalId?: number;
  withdrawalStatus?: string;
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
  customer_email: string;
  status: string;
  ride_status: string;
  refund_status: string;
  driver_name: string;
  driver_mobile: string;
  vehicle_number: string;
  payment_status: string;
  payment_amount: number;
  payment_collection_mode: string;
  driver_cash_collected: number;
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

type DriverVehicleRow = DriverRow;

type WithdrawalRow = {
  id: number;
  created_at: string;
  updated_at: string;
  driver_name: string;
  driver_mobile: string;
  amount: number;
  bank_name: string;
  bank_account: string;
  bank_ifsc: string;
  status: string;
  admin_note: string;
};

const bookingSelectSql = `SELECT booking_id, created_at, trip_type, vehicle,
  start_point, destination, one_side_km, billable_km, rate_per_km,
  estimated_fare, pickup_datetime, customer_name, customer_mobile, customer_email, status,
  ride_status, refund_status, driver_name, driver_mobile, vehicle_number,
  payment_status, payment_amount, payment_collection_mode, driver_cash_collected,
  cancel_reason, ride_started_at,
  ride_completed_at
  FROM bookings`;

async function getRecentBookings(limit = 80) {
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

async function getAdminFinanceSummary() {
  const summary = await env.DB.prepare(
    `SELECT
       COUNT(*) AS total_bookings,
       COALESCE(SUM(ROUND(estimated_fare * 1.05)), 0) AS total_booking_amount,
       COALESCE(SUM(payment_amount), 0) AS total_collected,
       COALESCE(SUM(driver_cash_collected), 0) AS driver_cash_collected
     FROM bookings
     WHERE booking_id NOT LIKE 'PENDING-%'`,
  ).first<{
    total_bookings: number;
    total_booking_amount: number;
    total_collected: number;
    driver_cash_collected: number;
  }>();
  const deposited = await env.DB.prepare(
    `SELECT COALESCE(SUM(amount), 0) AS deposited_amount
     FROM driver_cash_deposits`,
  ).first<{ deposited_amount: number }>();
  const totalCollected = Number(summary?.total_collected || 0);
  const driverCashCollected = Number(summary?.driver_cash_collected || 0);
  const driverCashInHand = Math.max(
    0,
    driverCashCollected - Number(deposited?.deposited_amount || 0),
  );

  return {
    totalBookings: Number(summary?.total_bookings || 0),
    totalBookingAmount: Number(summary?.total_booking_amount || 0),
    totalCollected,
    onlineCollected: Math.max(0, totalCollected - driverCashCollected),
    driverCashInHand,
  };
}

async function getBookingById(bookingId: string) {
  return env.DB.prepare(
    `${bookingSelectSql}
     WHERE booking_id = ?
     LIMIT 1`,
  )
    .bind(bookingId)
    .first<BookingRow>();
}

async function getDrivers() {
  const drivers = await env.DB.prepare(
    `SELECT d.driver_name, d.driver_mobile,
      COALESCE(v.vehicle_type, d.vehicle_type) AS vehicle_type,
      COALESCE(v.vehicle_number, d.vehicle_number) AS vehicle_number,
      COALESCE(v.updated_at, d.updated_at) AS updated_at
     FROM drivers d
     LEFT JOIN driver_vehicles v ON v.driver_mobile = d.driver_mobile
     ORDER BY COALESCE(v.updated_at, d.updated_at) DESC`,
  ).all<DriverRow>();

  return drivers.results || [];
}

async function getDriverVehicles(driverMobile: string) {
  const vehicles = await env.DB.prepare(
    `SELECT driver_name, driver_mobile, vehicle_type, vehicle_number, updated_at
     FROM driver_vehicles
     WHERE driver_mobile = ?
     ORDER BY updated_at DESC`,
  )
    .bind(driverMobile)
    .all<DriverVehicleRow>();

  return vehicles.results || [];
}

async function getDriverNextRide(driverMobile: string) {
  const ride = await env.DB.prepare(
    `${bookingSelectSql}
     WHERE booking_id NOT LIKE 'PENDING-%'
       AND driver_mobile = ?
       AND ride_status NOT IN ('Ride Cancelled', 'Ride Complete')
       AND pickup_datetime >= ?
     ORDER BY pickup_datetime ASC
     LIMIT 1`,
  )
    .bind(driverMobile, new Date().toISOString().slice(0, 16))
    .first<BookingRow>();

  return ride || null;
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

async function getDriverCashDeposited(driverMobile?: string) {
  const query = `SELECT COALESCE(SUM(amount), 0) AS deposited_amount
     FROM driver_cash_deposits
     ${driverMobile ? "WHERE driver_mobile = ?" : ""}`;
  const statement = env.DB.prepare(query);
  const deposited = driverMobile
    ? await statement.bind(driverMobile).first<{ deposited_amount: number }>()
    : await statement.first<{ deposited_amount: number }>();

  return Number(deposited?.deposited_amount || 0);
}

async function getDriverCashInHand(driverMobile: string) {
  const cash = await env.DB.prepare(
    `SELECT COALESCE(SUM(driver_cash_collected), 0) AS cash_amount
     FROM bookings
     WHERE driver_mobile = ?
       AND driver_cash_collected > 0
       AND booking_id NOT LIKE 'PENDING-%'`,
  )
    .bind(driverMobile)
    .first<{ cash_amount: number }>();
  const deposited = await getDriverCashDeposited(driverMobile);

  return Math.max(
    0,
    Number(cash?.cash_amount || 0) - deposited,
  );
}

async function getDriverWithdrawableBalance(driverMobile: string) {
  const earning = await getDriverEarning(driverMobile);
  const cashInHand = await getDriverCashInHand(driverMobile);
  const withdrawn = await env.DB.prepare(
    `SELECT COALESCE(SUM(amount), 0) AS withdrawn_amount
     FROM driver_withdrawals
     WHERE driver_mobile = ? AND status IN ('Pending', 'Completed')`,
  )
    .bind(driverMobile)
    .first<{ withdrawn_amount: number }>();

  return Math.max(
    0,
    earning.totalEarning - Number(withdrawn?.withdrawn_amount || 0) - cashInHand,
  );
}

async function getDriverCashSummary() {
  const summary = await env.DB.prepare(
    `SELECT driver_mobile, driver_name,
      COALESCE(SUM(driver_cash_collected), 0) AS cash_collected,
      COUNT(*) AS cash_rides
     FROM bookings
     WHERE driver_cash_collected > 0
       AND booking_id NOT LIKE 'PENDING-%'
     GROUP BY driver_mobile, driver_name
     ORDER BY cash_collected DESC`,
  ).all<{
    driver_mobile: string;
    driver_name: string;
    cash_collected: number;
    cash_rides: number;
  }>();

  const deposits = await env.DB.prepare(
    `SELECT driver_mobile, COALESCE(SUM(amount), 0) AS deposited_amount
     FROM driver_cash_deposits
     GROUP BY driver_mobile`,
  ).all<{ driver_mobile: string; deposited_amount: number }>();
  const depositMap = new Map(
    (deposits.results || []).map((row) => [
      row.driver_mobile,
      Number(row.deposited_amount || 0),
    ]),
  );

  return (summary.results || []).map((row) => ({
    driver_mobile: row.driver_mobile,
    driver_name: row.driver_name,
    cash_amount: Math.max(
      0,
      Number(row.cash_collected || 0) -
        Number(depositMap.get(row.driver_mobile) || 0),
    ),
    cash_collected: Number(row.cash_collected || 0),
    cash_deposited: Number(depositMap.get(row.driver_mobile) || 0),
    cash_rides: row.cash_rides,
  }));
}

async function getDriverLedger(driverMobile?: string) {
  const query = `${bookingSelectSql}
     WHERE booking_id NOT LIKE 'PENDING-%'
       AND ride_status = 'Ride Complete'
       ${driverMobile ? "AND driver_mobile = ?" : ""}
     ORDER BY COALESCE(ride_completed_at, pickup_datetime, created_at) DESC
     LIMIT 80`;

  const statement = env.DB.prepare(query);
  const ledger = driverMobile
    ? await statement.bind(driverMobile).all<BookingRow>()
    : await statement.all<BookingRow>();

  return ledger.results || [];
}

async function getWithdrawals(driverMobile?: string) {
  const query = `SELECT id, created_at, updated_at, driver_name, driver_mobile,
      amount, bank_name, bank_account, bank_ifsc, status, admin_note
     FROM driver_withdrawals
     ${driverMobile ? "WHERE driver_mobile = ?" : ""}
     ORDER BY id DESC
     LIMIT 80`;
  const statement = env.DB.prepare(query);
  const withdrawals = driverMobile
    ? await statement.bind(driverMobile).all<WithdrawalRow>()
    : await statement.all<WithdrawalRow>();

  return withdrawals.results || [];
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
        customer_email TEXT NOT NULL DEFAULT '',
        package_type TEXT NOT NULL DEFAULT 'perKm',
        payment_mode TEXT NOT NULL,
        ride_status TEXT NOT NULL DEFAULT 'Booked',
        refund_status TEXT NOT NULL DEFAULT 'None',
        driver_name TEXT NOT NULL DEFAULT '',
        driver_mobile TEXT NOT NULL DEFAULT '',
        vehicle_number TEXT NOT NULL DEFAULT '',
        payment_status TEXT NOT NULL DEFAULT 'Pending',
        payment_amount INTEGER NOT NULL DEFAULT 0,
        payment_collection_mode TEXT NOT NULL DEFAULT '',
        driver_cash_collected INTEGER NOT NULL DEFAULT 0,
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
    .prepare("ALTER TABLE bookings ADD COLUMN customer_email TEXT NOT NULL DEFAULT ''")
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
    .prepare("ALTER TABLE bookings ADD COLUMN payment_collection_mode TEXT NOT NULL DEFAULT ''")
    .run()
    .catch(() => undefined);

  await db
    .prepare("ALTER TABLE bookings ADD COLUMN driver_cash_collected INTEGER NOT NULL DEFAULT 0")
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

  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS driver_vehicles (
        vehicle_number TEXT PRIMARY KEY,
        driver_mobile TEXT NOT NULL,
        driver_name TEXT NOT NULL,
        vehicle_type TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
    )
    .run();

  await db
    .prepare(
      `INSERT OR IGNORE INTO driver_vehicles (
        vehicle_number, driver_mobile, driver_name, vehicle_type, updated_at
      )
      SELECT vehicle_number, driver_mobile, driver_name, vehicle_type, updated_at
      FROM drivers
      WHERE COALESCE(vehicle_number, '') != ''`,
    )
    .run()
    .catch(() => undefined);

  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS driver_withdrawals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        driver_name TEXT NOT NULL,
        driver_mobile TEXT NOT NULL,
        amount INTEGER NOT NULL,
        bank_name TEXT NOT NULL,
        bank_account TEXT NOT NULL,
        bank_ifsc TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Pending',
        admin_note TEXT NOT NULL DEFAULT ''
      )`,
    )
    .run();

  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS driver_cash_deposits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at TEXT NOT NULL,
        driver_name TEXT NOT NULL,
        driver_mobile TEXT NOT NULL,
        amount INTEGER NOT NULL,
        admin_mobile TEXT NOT NULL
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
        const financeSummary = await getAdminFinanceSummary();
        const recent = await getRecentBookings();
        const drivers = await getDrivers();
        const driverCashSummary = await getDriverCashSummary();
        const driverLedger = await getDriverLedger();
        const withdrawalRequests = await getWithdrawals();

        return Response.json({
          role: "admin",
          totalBookings: financeSummary.totalBookings,
          totalFare: financeSummary.totalBookingAmount,
          totalBookingAmount: financeSummary.totalBookingAmount,
          totalCollected: financeSummary.totalCollected,
          onlineCollected: financeSummary.onlineCollected,
          driverCashInHand: financeSummary.driverCashInHand,
          recentBookings: recent,
          drivers,
          driverCashSummary,
          driverLedger,
          withdrawalRequests,
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
      const driverVehicles = driverProfile
        ? await getDriverVehicles(loginMobile)
        : [];
      const driverVehicleTypes = new Set(
        (driverVehicles.length ? driverVehicles : driverProfile ? [driverProfile] : [])
          .map((vehicle) => vehicle.vehicle_type)
          .filter(Boolean),
      );
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
               AND ride_status NOT IN ('Ride Cancelled', 'Ride Complete')
             ORDER BY id DESC
             LIMIT 20`,
          )
            .all<BookingRow>()
        : { results: [] as BookingRow[] };
      const matchingOpenBookings = (openBookings.results || []).filter((booking) =>
        driverVehicleTypes.has(booking.vehicle),
      );

      if (driverProfile || driverBookings.results?.length) {
        return Response.json({
          role: "driver",
          driverProfile,
          driverVehicles,
          nextRide: await getDriverNextRide(loginMobile),
          recentBookings: [
            ...matchingOpenBookings,
            ...(driverBookings.results || []),
          ],
          driverEarning: await getDriverEarning(loginMobile),
          driverCashInHand: await getDriverCashInHand(loginMobile),
          driverLedger: await getDriverLedger(loginMobile),
          withdrawalRequests: await getWithdrawals(loginMobile),
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

      return Response.json(
        { error: "No User Found. Please Check Mobile Number." },
        { status: 404 },
      );
    }

    if (bookingId && mobile) {
      const booking = await env.DB.prepare(
        `SELECT booking_id, created_at, trip_type, vehicle, start_point, destination,
          one_side_km, billable_km, rate_per_km, estimated_fare, pickup_datetime,
          customer_name, customer_mobile, customer_email, status, ride_status, refund_status,
          driver_name, driver_mobile, vehicle_number, payment_status,
          payment_amount, payment_collection_mode, driver_cash_collected,
          cancel_reason, ride_started_at, ride_completed_at
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
    const action = clean(payload.action);
    const bookingId = clean(payload.bookingId);

    if (
      !bookingId &&
      action !== "requestWithdrawal" &&
      action !== "updateWithdrawal" &&
      action !== "recordCashDeposit"
    ) {
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

      if (action === "requestWithdrawal" && driverMobile) {
        const driver = await env.DB.prepare(
          `SELECT driver_name, driver_mobile
           FROM drivers
           WHERE driver_mobile = ?
           LIMIT 1`,
        )
          .bind(driverMobile)
          .first<{ driver_name: string; driver_mobile: string }>();
        const amount = Math.round(Number(payload.amount || 0));
        const bankName = clean(payload.bankName);
        const bankAccount = clean(payload.bankAccount);
        const bankIfsc = clean(payload.bankIfsc).toUpperCase();
        const withdrawableBalance = await getDriverWithdrawableBalance(driverMobile);

        if (!driver) {
          return Response.json(
            { error: "Driver Profile Not Found." },
            { status: 404 },
          );
        }

        if (!amount || amount < 1 || amount > withdrawableBalance) {
          return Response.json(
            {
              error: `Withdrawal Amount Must Be Within Driver Ledger Balance. Available Balance Is ₹${withdrawableBalance}.`,
            },
            { status: 400 },
          );
        }

        if (!bankName || !bankAccount || !bankIfsc) {
          return Response.json(
            { error: "Bank Name, Account Number And IFSC Are Required." },
            { status: 400 },
          );
        }

        const now = new Date().toISOString();
        await env.DB.prepare(
          `INSERT INTO driver_withdrawals (
            created_at, updated_at, driver_name, driver_mobile, amount,
            bank_name, bank_account, bank_ifsc, status, admin_note
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending', '')`,
        )
          .bind(
            now,
            now,
            driver.driver_name,
            driver.driver_mobile,
            amount,
            bankName,
            bankAccount,
            bankIfsc,
          )
          .run();

        return Response.json({ success: true });
      }

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

        const driverVehicles = await getDriverVehicles(driverMobile);
        const assignedVehicle =
          driverVehicles.find((vehicle) => vehicle.vehicle_type === booking.vehicle) ||
          (driver.vehicle_type === booking.vehicle ? driver : null);

        if (!assignedVehicle) {
          return Response.json(
            {
              error: `Driver Can Accept Only ${driverVehicles
                .map((vehicle) => vehicle.vehicle_type)
                .join(", ") || driver.vehicle_type} Booking.`,
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
               vehicle = ?,
               driver_name = ?,
               driver_mobile = ?,
               vehicle_number = ?
           WHERE booking_id = ? AND COALESCE(driver_mobile, '') = ''`,
        )
          .bind(
            assignedVehicle.vehicle_type,
            driver.driver_name,
            driver.driver_mobile,
            assignedVehicle.vehicle_number,
            bookingId,
          )
          .run();

        const updatedBooking = await getBookingById(bookingId);
        await sendCustomerBookingEmail(updatedBooking, "driver_assigned");

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
          `SELECT booking_id, driver_mobile, ride_started_at, ride_completed_at,
            estimated_fare, payment_amount
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
            estimated_fare: number;
            payment_amount: number;
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

        const totalWithGst = Math.round(Number(assignedBooking.estimated_fare || 0) * 1.05);
        const paidAmount = Number(assignedBooking.payment_amount || 0);
        const balanceDue = Math.max(0, totalWithGst - paidAmount);
        const collectionMode = clean(payload.collectionMode);
        const requestedPaymentAmount = Number(payload.paymentAmount);

        if (rideStatus === "Ride Complete" && balanceDue > 0) {
          const validCollectionMode =
            collectionMode === "cash" || collectionMode === "payment_gateway";
          const collectedFullAmount =
            Number.isFinite(requestedPaymentAmount) &&
            requestedPaymentAmount >= totalWithGst;

          if (!validCollectionMode || !collectedFullAmount) {
            return Response.json(
              {
                error: `Collect Rs ${balanceDue} Before Completing This Ride.`,
                balanceDue,
              },
              { status: 400 },
            );
          }
        }

        const completedWithCollection =
          rideStatus === "Ride Complete" && balanceDue > 0;
        const updatedPaymentAmount = completedWithCollection ? totalWithGst : 0;
        const driverCashCollected =
          completedWithCollection && collectionMode === "cash" ? balanceDue : 0;

        await env.DB.prepare(
          `UPDATE bookings
           SET ride_status = ?,
               payment_status = CASE
                 WHEN ? > 0 THEN 'Complete'
                 ELSE payment_status
               END,
               payment_amount = CASE
                 WHEN ? > 0 THEN ?
                 ELSE payment_amount
               END,
               payment_collection_mode = CASE
                 WHEN ? != '' THEN ?
                 ELSE payment_collection_mode
               END,
               driver_cash_collected = CASE
                 WHEN ? > 0 THEN driver_cash_collected + ?
                 ELSE driver_cash_collected
               END,
               ${timestampColumn} = CASE
                 WHEN ${timestampColumn} = '' THEN ?
                 ELSE ${timestampColumn}
               END
           WHERE booking_id = ? AND driver_mobile = ?`,
        )
          .bind(
            rideStatus,
            updatedPaymentAmount,
            updatedPaymentAmount,
            updatedPaymentAmount,
            collectionMode,
            collectionMode,
            driverCashCollected,
            driverCashCollected,
            now,
            bookingId,
            driverMobile,
          )
          .run();

        if (rideStatus === "Ride Complete") {
          const updatedBooking = await getBookingById(bookingId);
          await sendCustomerBookingEmail(updatedBooking, "ride_complete");
        }

        return Response.json({ success: true });
      }

      if (payload.action === "driverCancelRide" && driverMobile) {
        const assignedBooking = await env.DB.prepare(
          `SELECT booking_id, ride_completed_at
           FROM bookings
           WHERE booking_id = ? AND driver_mobile = ?
           LIMIT 1`,
        )
          .bind(bookingId, driverMobile)
          .first<{ booking_id: string; ride_completed_at: string }>();

        if (!assignedBooking) {
          return Response.json(
            { error: "This Ride Is Not Assigned To This Driver." },
            { status: 403 },
          );
        }

        if (assignedBooking.ride_completed_at) {
          return Response.json(
            { error: "Completed Ride Cannot Be Cancelled By Driver." },
            { status: 409 },
          );
        }

        await env.DB.prepare(
          `UPDATE bookings
           SET ride_status = 'Ride Cancelled',
               cancel_reason = 'Cancelled By Driver'
           WHERE booking_id = ? AND driver_mobile = ?`,
        )
          .bind(bookingId, driverMobile)
          .run();

        return Response.json({ success: true });
      }

      return Response.json({ error: "Invalid login mobile." }, { status: 401 });
    }

    if (action === "updateWithdrawal") {
      const withdrawalId = Number(payload.withdrawalId);
      const withdrawalStatus = clean(payload.withdrawalStatus);

      if (!withdrawalId || !["Pending", "Completed", "Rejected"].includes(withdrawalStatus)) {
        return Response.json(
          { error: "Valid Withdrawal ID And Status Are Required." },
          { status: 400 },
        );
      }

      await env.DB.prepare(
        `UPDATE driver_withdrawals
         SET status = ?, updated_at = ?
         WHERE id = ?`,
      )
        .bind(withdrawalStatus, new Date().toISOString(), withdrawalId)
        .run();

      return Response.json({ success: true });
    }

    if (action === "recordCashDeposit") {
      const driverMobile = clean(payload.driverMobile);
      const amount = Math.round(Number(payload.amount || 0));

      if (!driverMobile || !amount || amount < 1) {
        return Response.json(
          { error: "Driver Mobile And Valid Cash Deposit Amount Are Required." },
          { status: 400 },
        );
      }

      const driver = await env.DB.prepare(
        `SELECT driver_name, driver_mobile
         FROM drivers
         WHERE driver_mobile = ?
         LIMIT 1`,
      )
        .bind(driverMobile)
        .first<{ driver_name: string; driver_mobile: string }>();

      if (!driver) {
        return Response.json({ error: "Driver Profile Not Found." }, { status: 404 });
      }

      const cashInHand = await getDriverCashInHand(driverMobile);

      if (amount > cashInHand) {
        return Response.json(
          { error: `Cash Deposit Cannot Be More Than Driver Cash In Hand ₹${cashInHand}.` },
          { status: 400 },
        );
      }

      await env.DB.prepare(
        `INSERT INTO driver_cash_deposits (
          created_at, driver_name, driver_mobile, amount, admin_mobile
        ) VALUES (?, ?, ?, ?, ?)`,
      )
        .bind(new Date().toISOString(), driver.driver_name, driverMobile, amount, adminMobile)
        .run();

      return Response.json({ success: true });
    }

    const existingBooking = await env.DB.prepare(
      `SELECT booking_id, pickup_datetime, driver_mobile, driver_name,
        vehicle_number, ride_status, estimated_fare, payment_amount
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
        estimated_fare: number;
        payment_amount: number;
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
    const existingTotalWithGst = Math.round(
      Number(existingBooking.estimated_fare || 0) * 1.05,
    );
    const requestedPaymentAmount = Number(payload.paymentAmount);
    const adminPaymentAmount = Number.isFinite(requestedPaymentAmount)
      ? requestedPaymentAmount
      : Number(existingBooking.payment_amount || 0);

    if (
      requestedRideStatus === "Ride Complete" &&
      adminPaymentAmount < existingTotalWithGst
    ) {
      return Response.json(
        {
          error:
            "Collect Or Mark Full Payment With GST Before Completing The Ride.",
        },
        { status: 400 },
      );
    }

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

    if (requestedDriverMobile || requestedVehicleNumber) {
      const updatedBooking = await getBookingById(bookingId);
      await sendCustomerBookingEmail(updatedBooking, "driver_assigned");
    }

    if (requestedRideStatus === "Ride Complete") {
      const updatedBooking = await getBookingById(bookingId);
      await sendCustomerBookingEmail(updatedBooking, "ride_complete");
    }

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
      if (clean(payload.requesterMobile) !== adminMobile) {
        return Response.json(
          { error: "Only Admin Can Register Driver And Vehicle." },
          { status: 401 },
        );
      }

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

      await env.DB.prepare(
        `INSERT INTO driver_vehicles (
          vehicle_number, driver_mobile, driver_name, vehicle_type, updated_at
        ) VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(vehicle_number) DO UPDATE SET
          driver_mobile = excluded.driver_mobile,
          driver_name = excluded.driver_name,
          vehicle_type = excluded.vehicle_type,
          updated_at = excluded.updated_at`,
      )
        .bind(
          vehicleNumber,
          driverMobile,
          driverName,
          vehicleType,
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
    const email = clean(payload.email).toLowerCase();
    const packageType = normalizePackage(payload.packageType);
    const paymentMode = clean(payload.paymentMode) || "Pay advance after booking";
    const oneSideKm = Number(payload.distanceKm);

    if (!tripType || !vehicle || !destination || !date || !name || !mobile || !email) {
      return Response.json(
        { error: "Please fill all booking fields including email." },
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
    const initialRideStatus =
      paymentMode.toLowerCase().includes("zero") ||
      paymentMode.toLowerCase().includes("later")
        ? "Booking Confirmed"
        : "Booked";

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
        customer_email,
        package_type,
        payment_mode,
        ride_status,
        refund_status,
        driver_name,
        driver_mobile,
        vehicle_number,
        payment_status,
        payment_amount,
        payment_collection_mode,
        driver_cash_collected,
        cancel_reason,
        ride_started_at,
        ride_completed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        email,
        packageType,
        paymentMode,
        initialRideStatus,
        "None",
        "",
        "",
        "",
        "Pending",
        0,
        "",
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

    const savedBooking = await getBookingById(bookingId);
    await sendCustomerBookingEmail(savedBooking, "booking_confirmed");

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

async function sendCustomerBookingEmail(
  booking: BookingRow | null | undefined,
  event: "booking_confirmed" | "driver_assigned" | "ride_complete",
) {
  if (!booking?.customer_email) {
    return;
  }

  const resendApiKey = process.env.RESEND_API_KEY || "";
  const fromEmail = process.env.CUSTOMER_EMAIL_FROM || "";

  if (!resendApiKey || !fromEmail) {
    return;
  }

  const totalWithGst = Math.round(Number(booking.estimated_fare || 0) * 1.05);
  const balanceDue = Math.max(0, totalWithGst - Number(booking.payment_amount || 0));
  const emailCopy = {
    booking_confirmed: {
      subject: `Booking Confirmed - ${booking.booking_id} | Vishnu Tours`,
      title: "Your Booking Is Confirmed",
      intro:
        "Thank you for choosing Vishnu Tours. Your cab booking has been confirmed and saved successfully.",
    },
    driver_assigned: {
      subject: `Driver Assigned - ${booking.booking_id} | Vishnu Tours`,
      title: "Driver And Vehicle Assigned",
      intro:
        "Your driver and vehicle have been assigned for the journey. Please keep your phone available near pickup time.",
    },
    ride_complete: {
      subject: `Ride Completed - ${booking.booking_id} | Vishnu Tours`,
      title: "Your Ride Is Complete",
      intro:
        "Your ride has been marked complete. Thank you for travelling with Vishnu Tours.",
    },
  }[event];
  const driverLine = booking.driver_name
    ? `${booking.driver_name} | ${booking.driver_mobile || "Mobile Pending"} | ${
        booking.vehicle_number || "Vehicle Number Pending"
      }`
    : "Driver Assignment Pending";
  const rows = [
    ["Booking ID", booking.booking_id],
    ["Journey", `${booking.start_point} To ${booking.destination}`],
    ["Trip Type", booking.trip_type],
    ["Cab", booking.vehicle],
    ["Pickup Date And Time", booking.pickup_datetime],
    ["Customer", `${booking.customer_name} | ${booking.customer_mobile}`],
    ["Driver / Vehicle", driverLine],
    ["Total Fare Including GST 5%", `Rs ${totalWithGst}`],
    ["Paid Amount", `Rs ${Number(booking.payment_amount || 0)}`],
    ["Balance Due", `Rs ${balanceDue}`],
    ["Ride Status", booking.ride_status || "Booked"],
  ];
  const htmlRows = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#64748b;font-weight:700;">${escapeHtml(
            label,
          )}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#0f172a;font-weight:800;">${escapeHtml(
            value,
          )}</td>
        </tr>`,
    )
    .join("");
  const html = `
    <div style="margin:0;padding:24px;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
        <div style="padding:22px 24px;background:#f6bd16;color:#111827;">
          <h1 style="margin:0;font-size:24px;line-height:1.25;">${escapeHtml(
            emailCopy.title,
          )}</h1>
          <p style="margin:8px 0 0;font-size:14px;font-weight:700;">Vishnu Tours - Premium Cab Booking From Mumbai</p>
        </div>
        <div style="padding:22px 24px;">
          <p style="margin:0 0 18px;color:#334155;font-size:15px;line-height:1.6;">Dear ${escapeHtml(
            booking.customer_name,
          )}, ${escapeHtml(emailCopy.intro)}</p>
          <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
            ${htmlRows}
          </table>
          <p style="margin:18px 0 0;color:#334155;font-size:14px;line-height:1.6;">
            For any support, message Vishnu Tours on WhatsApp: +91 7004291529.
          </p>
          <p style="margin:16px 0 0;color:#0f172a;font-weight:800;">Regards,<br/>Vishnu Tours</p>
        </div>
      </div>
    </div>`;
  const text = [
    emailCopy.title,
    "",
    `Dear ${booking.customer_name}, ${emailCopy.intro}`,
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    "Support WhatsApp: +91 7004291529",
    "Regards, Vishnu Tours",
  ].join("\n");

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: booking.customer_email,
      subject: emailCopy.subject,
      html,
      text,
    }),
  }).catch((error) => {
    console.warn("Customer email notification failed.", error);
  });
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizePackage(value: unknown): PackageType {
  if (value === "fullDay" || value === "halfDay" || value === "vip") {
    return value;
  }

  return "perKm";
}
