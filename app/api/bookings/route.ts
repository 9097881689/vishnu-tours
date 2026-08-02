import { env } from "cloudflare:workers";

const headOffice = "Mumbai Head Office";

type VehicleRates = {
  perKm: number;
  local4hr: number;
  local8hr: number;
  local10hr: number;
  perHour: number;
  fullDay: number;
  halfDay: number;
  vip: number;
};

type FleetVehicle = {
  name: string;
  type: string;
  seats: string;
  luggage: string;
  bestFor: string;
  photo: string;
  rates: VehicleRates;
  active: boolean;
};

type SiteBranding = {
  iconUrl: string;
  headerLogoSize: number;
  footerLogoSize: number;
  faviconSize: number;
};

const defaultFleetVehicles: FleetVehicle[] = [
  {
    name: "Toyota Innova Crysta",
    type: "Premium MUV",
    seats: "6-7 Seats",
    luggage: "2 Suitcases",
    bestFor: "VIP, Family, Airport And Highway Travel",
    photo: "/fleet/innova-crysta.png?v=52a12bf",
    active: true,
    rates: {
      perKm: 32,
      local4hr: 2324,
      local8hr: 4226,
      local10hr: 4696,
      perHour: 470,
      fullDay: 4226,
      halfDay: 2324,
      vip: 7650,
    },
  },
  {
    name: "Toyota Innova Hycross",
    type: "Luxury Hybrid",
    seats: "6-7 Seats",
    luggage: "2 Suitcases",
    bestFor: "Executive Guests, Weddings And Long Routes",
    photo: "/fleet/hycross.png?v=52a12bf",
    active: true,
    rates: {
      perKm: 39,
      local4hr: 2685,
      local8hr: 4881,
      local10hr: 5423,
      perHour: 542,
      fullDay: 4881,
      halfDay: 2685,
      vip: 9900,
    },
  },
  {
    name: "Maruti Ertiga",
    type: "Comfort MUV",
    seats: "6-7 Seats",
    luggage: "2 Suitcases",
    bestFor: "Round Trip, Family Tour And Station Pickup",
    photo: "/fleet/ertiga.png?v=52a12bf",
    active: true,
    rates: {
      perKm: 29,
      local4hr: 2324,
      local8hr: 4226,
      local10hr: 4696,
      perHour: 470,
      fullDay: 4226,
      halfDay: 2324,
      vip: 5580,
    },
  },
  {
    name: "Toyota Rumion",
    type: "Spacious MUV",
    seats: "6-7 Seats",
    luggage: "2 Suitcases",
    bestFor: "Local Booking, Outstation And Group Travel",
    photo: "/fleet/rumion.png?v=52a12bf",
    active: true,
    rates: {
      perKm: 29,
      local4hr: 2324,
      local8hr: 4226,
      local10hr: 4696,
      perHour: 470,
      fullDay: 4226,
      halfDay: 2324,
      vip: 5850,
    },
  },
  {
    name: "Toyota Etios",
    type: "Sedan",
    seats: "4 Seats",
    luggage: "2 Suitcases",
    bestFor: "City Rides, Business Visits And One Day Travel",
    photo: "/fleet/etios.png?v=52a12bf",
    active: true,
    rates: {
      perKm: 24,
      local4hr: 1921,
      local8hr: 3492,
      local10hr: 3880,
      perHour: 388,
      fullDay: 3492,
      halfDay: 1921,
      vip: 4680,
    },
  },
];

const rateTable: Record<string, VehicleRates> = Object.fromEntries(
  defaultFleetVehicles.map((vehicle) => [vehicle.name, vehicle.rates]),
);

rateTable["Toyota Hycross"] = rateTable["Toyota Innova Hycross"];

type PackageType = "perKm" | "fullDay" | "halfDay" | "vip";
type VehicleRateOverride = Partial<
  Record<PackageType | "local4hr" | "local8hr" | "local10hr" | "perHour", number>
>;
type VehicleRateOverrides = Record<string, VehicleRateOverride>;

type BookingPayload = {
  action?: string;
  requesterMobile?: string;
  originalVehicleNumber?: string;
  tripType?: string;
  vehicle?: string;
  vehicleNumber?: string;
  startPoint?: string;
  destination?: string;
  distanceKm?: number;
  date?: string;
  returnDate?: string;
  odometerStart?: number;
  odometerEnd?: number;
  name?: string;
  mobile?: string;
  email?: string;
  packageType?: string;
  paymentMode?: string;
  address?: string;
  emergencyContact?: string;
  drivingLicense?: string;
  licenseExpiry?: string;
  identityDocument?: string;
  addressProof?: string;
  policeVerification?: string;
  profilePhoto?: string;
  accountType?: string;
  approvalStatus?: string;
  activeStatus?: string;
  joiningDate?: string;
  ownerMobile?: string;
  seatingCapacity?: string;
  fuelType?: string;
  registrationCertificate?: string;
  insurance?: string;
  insuranceExpiry?: string;
  permit?: string;
  fitnessCertificate?: string;
  puc?: string;
  vehiclePhoto?: string;
};

type BookingOperationPayload = {
  action?: string;
  pin?: string;
  mobile?: string;
  customerMobile?: string;
  bookingId?: string;
  rideStatus?: string;
  refundStatus?: string;
  refundAmount?: number;
  paymentStatus?: string;
  paymentAmount?: number;
  collectionMode?: string;
  cashCollected?: number;
  vehicle?: string;
  vehicleNumber?: string;
  cancelReason?: string;
  driverName?: string;
  driverMobile?: string;
  refundDriverName?: string;
  refundDriverMobile?: string;
  odometerStart?: number;
  odometerEnd?: number;
  amount?: number;
  bankName?: string;
  bankAccount?: string;
  bankIfsc?: string;
  withdrawalId?: number;
  withdrawalStatus?: string;
  adminMobile?: string;
  priceAdjustmentPercent?: number;
  vehicleRateOverrides?: VehicleRateOverrides;
  fleetVehicles?: FleetVehicle[];
  siteFont?: string;
  siteBranding?: SiteBranding;
  remarks?: string;
  referenceNumber?: string;
  paymentReference?: string;
  bookingReference?: string;
  settlementMode?: string;
  settlementId?: number;
  settlementStatus?: string;
};
type DeleteBookingPayload = {
  mobile?: string;
  pin?: string;
  bookingId?: string;
};

const adminPin = "710529";
const adminMobile = "7004291529";
const adminWhatsappMobile = "917004291529";
const driverAssignmentConflictWindowMs = 6 * 60 * 60 * 1000;
const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
};
const portalSessionMaxAgeSeconds = 12 * 60 * 60;
const allowedSiteFonts = new Set([
  "Plus Jakarta Sans",
  "Inter",
  "Poppins",
  "Manrope",
  "Montserrat",
  "Nunito Sans",
  "Open Sans",
  "Roboto",
  "Lato",
  "System UI",
]);

const defaultSiteBranding: SiteBranding = {
  iconUrl: "/logo-mark-v2.png?v=20260801",
  headerLogoSize: 42,
  footerLogoSize: 62,
  faviconSize: 32,
};

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
  rate_per_hour: number;
  estimated_fare: number;
  pickup_datetime: string;
  return_date?: string;
  odometer_start?: number;
  odometer_end?: number;
  extra_km?: number;
  extra_hours?: number;
  extra_hour_amount?: number;
  extra_amount?: number;
  customer_name: string;
  customer_mobile: string;
  customer_email: string;
  status: string;
  ride_status: string;
  refund_status: string;
  refund_amount: number;
  driver_name: string;
  driver_mobile: string;
  vehicle_number: string;
  payment_status: string;
  payment_amount: number;
  payment_collection_mode: string;
  driver_cash_collected: number;
  refund_collection_mode: string;
  driver_cash_refunded: number;
  refund_driver_name: string;
  refund_driver_mobile: string;
  cancel_reason: string;
  ride_started_at: string;
  ride_completed_at: string;
};

type PortalSession = {
  token: string;
  role: AuditRole;
  mobile: string;
  expires_at: string;
};

function getCookieValue(request: Request, name: string) {
  const cookieHeader = request.headers.get("cookie") || "";
  const encodedName = `${name}=`;
  const part = cookieHeader
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(encodedName));

  return part ? decodeURIComponent(part.slice(encodedName.length)) : "";
}

async function getPortalSession(request: Request) {
  const token = getCookieValue(request, "vt_portal_session");
  if (!token) {
    return null;
  }

  const session = await env.DB.prepare(
    `SELECT token, role, mobile, expires_at
     FROM portal_sessions
     WHERE token = ? AND expires_at > ?
     LIMIT 1`,
  )
    .bind(token, new Date().toISOString())
    .first<PortalSession>();

  return session || null;
}

async function createPortalLoginResponse(
  request: Request,
  role: Exclude<AuditRole, "system">,
  mobile: string,
  data: Record<string, unknown>,
) {
  const token = crypto.randomUUID();
  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + portalSessionMaxAgeSeconds * 1000,
  ).toISOString();

  await env.DB.prepare(
    `INSERT INTO portal_sessions (token, role, mobile, created_at, expires_at)
     VALUES (?, ?, ?, ?, ?)`,
  )
    .bind(token, role, mobile, now.toISOString(), expiresAt)
    .run();

  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return Response.json(data, {
    headers: {
      ...noStoreHeaders,
      "Set-Cookie": `vt_portal_session=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${portalSessionMaxAgeSeconds}${secure}`,
    },
  });
}

function hasRole(session: PortalSession | null, role: AuditRole, mobile?: string) {
  return Boolean(
    session &&
      session.role === role &&
      (!mobile || session.mobile === mobile),
  );
}

async function findNearbyDriverAssignmentConflict(
  bookingId: string,
  driverMobile: string,
  pickupDatetime: string,
) {
  const requestedPickupTime = Date.parse(pickupDatetime || "");

  if (!driverMobile || Number.isNaN(requestedPickupTime)) {
    return null;
  }

  const conflictRows = await env.DB.prepare(
    `SELECT booking_id, pickup_datetime, destination
     FROM bookings
     WHERE booking_id != ?
       AND driver_mobile = ?
       AND ride_status NOT IN ('Ride Cancelled', 'Ride Complete')
       AND booking_id NOT LIKE 'PENDING-%'`,
  )
    .bind(bookingId, driverMobile)
    .all<{
      booking_id: string;
      pickup_datetime: string;
      destination: string;
    }>();

  return (
    (conflictRows.results || []).find((booking) => {
      const conflictPickupTime = Date.parse(booking.pickup_datetime || "");

      return (
        !Number.isNaN(conflictPickupTime) &&
        Math.abs(conflictPickupTime - requestedPickupTime) <=
          driverAssignmentConflictWindowMs
      );
    }) || null
  );
}

type DriverRow = {
  driver_name: string;
  driver_mobile: string;
  vehicle_type: string;
  vehicle_number: string;
  bank_name?: string;
  bank_account?: string;
  bank_ifsc?: string;
  email?: string;
  address?: string;
  emergency_contact?: string;
  driving_license?: string;
  license_expiry?: string;
  identity_document?: string;
  address_proof?: string;
  police_verification?: string;
  profile_photo?: string;
  account_type?: string;
  approval_status?: string;
  active_status?: string;
  joining_date?: string;
  owner_mobile?: string;
  seating_capacity?: string;
  fuel_type?: string;
  registration_certificate?: string;
  insurance?: string;
  insurance_expiry?: string;
  permit?: string;
  fitness_certificate?: string;
  puc?: string;
  vehicle_photo?: string;
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
  start_point, destination, one_side_km, billable_km, rate_per_km, rate_per_hour,
  estimated_fare, pickup_datetime, return_date, customer_name, customer_mobile, customer_email, status,
  ride_status, refund_status, refund_amount, driver_name, driver_mobile, vehicle_number,
  payment_status, payment_amount, payment_collection_mode, driver_cash_collected,
  refund_collection_mode, driver_cash_refunded,
  refund_driver_name, refund_driver_mobile,
  cancel_reason, ride_started_at, odometer_start, odometer_end, extra_km,
  extra_hours, extra_hour_amount, extra_amount,
  ride_completed_at
  FROM bookings`;

type AuditRole = "admin" | "driver" | "customer" | "system";

type StatusHistoryRow = {
  id: number;
  booking_id: string;
  old_status: string;
  new_status: string;
  actor_role: string;
  actor_mobile: string;
  reason: string;
  remarks: string;
  created_at: string;
};

type CashCollectionRow = {
  id: number;
  created_at: string;
  driver_name: string;
  driver_mobile: string;
  vehicle_number: string;
  booking_id: string;
  amount: number;
  payment_mode: string;
  remarks: string;
  receipt_reference: string;
  admin_mobile: string;
  collected_by: string;
  settlement_type: string;
  settlement_status: string;
};

type AssignmentHistoryRow = {
  id: number;
  booking_id: string;
  old_driver_mobile: string;
  new_driver_mobile: string;
  old_vehicle_number: string;
  new_vehicle_number: string;
  assigned_by_role: string;
  assigned_by_mobile: string;
  reason: string;
  created_at: string;
};

async function recordStatusHistory(input: {
  bookingId: string;
  oldStatus: string;
  newStatus: string;
  actorRole: AuditRole;
  actorMobile: string;
  reason?: string;
  remarks?: string;
}) {
  if (!input.bookingId || !input.newStatus || input.oldStatus === input.newStatus) {
    return;
  }

  await env.DB.prepare(
    `INSERT INTO booking_status_history (
      booking_id, old_status, new_status, actor_role, actor_mobile,
      reason, remarks, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      input.bookingId,
      input.oldStatus || "",
      input.newStatus,
      input.actorRole,
      input.actorMobile,
      input.reason || "",
      input.remarks || "",
      new Date().toISOString(),
    )
    .run()
    .catch(() => undefined);
}

async function recordAssignmentHistory(input: {
  bookingId: string;
  oldDriverMobile?: string;
  newDriverMobile?: string;
  oldVehicleNumber?: string;
  newVehicleNumber?: string;
  actorRole: AuditRole;
  actorMobile: string;
  reason?: string;
}) {
  const changed =
    (input.oldDriverMobile || "") !== (input.newDriverMobile || "") ||
    (input.oldVehicleNumber || "") !== (input.newVehicleNumber || "");

  if (!input.bookingId || !changed) {
    return;
  }

  await env.DB.prepare(
    `INSERT INTO assignment_history (
      booking_id, old_driver_mobile, new_driver_mobile,
      old_vehicle_number, new_vehicle_number, assigned_by_role,
      assigned_by_mobile, reason, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      input.bookingId,
      input.oldDriverMobile || "",
      input.newDriverMobile || "",
      input.oldVehicleNumber || "",
      input.newVehicleNumber || "",
      input.actorRole,
      input.actorMobile,
      input.reason || "",
      new Date().toISOString(),
    )
    .run()
    .catch(() => undefined);
}

async function recordPaymentTransaction(input: {
  bookingId?: string;
  customerMobile?: string;
  driverMobile?: string;
  amount: number;
  transactionType: string;
  paymentMode: string;
  referenceNumber?: string;
  status?: string;
  settlementStatus?: string;
  actorRole: AuditRole;
  actorMobile: string;
}) {
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return;
  }

  await env.DB.prepare(
    `INSERT INTO payment_transactions (
      booking_id, customer_mobile, driver_mobile, amount, transaction_type,
      payment_mode, reference_number, status, settlement_status,
      created_by_role, created_by_mobile, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      input.bookingId || "",
      input.customerMobile || "",
      input.driverMobile || "",
      Math.round(input.amount),
      input.transactionType,
      input.paymentMode,
      input.referenceNumber || "",
      input.status || "Complete",
      input.settlementStatus || "Settled",
      input.actorRole,
      input.actorMobile,
      new Date().toISOString(),
    )
    .run()
    .catch(() => undefined);
}

async function recordAuditLog(input: {
  action: string;
  entityType: string;
  entityId: string;
  actorRole: AuditRole;
  actorMobile: string;
  details?: Record<string, unknown>;
}) {
  await env.DB.prepare(
    `INSERT INTO audit_logs (
      action, entity_type, entity_id, actor_role, actor_mobile,
      details_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      input.action,
      input.entityType,
      input.entityId,
      input.actorRole,
      input.actorMobile,
      JSON.stringify(input.details || {}),
      new Date().toISOString(),
    )
    .run()
    .catch(() => undefined);
}

async function getStatusHistory(role: AuditRole = "admin", mobile = "") {
  let whereClause = "";
  const bindings: string[] = [];

  if (role === "driver") {
    whereClause = "WHERE b.driver_mobile = ?";
    bindings.push(mobile);
  } else if (role === "customer") {
    whereClause = "WHERE b.customer_mobile = ?";
    bindings.push(mobile);
  }

  const statement = env.DB.prepare(
    `SELECT h.id, h.booking_id, h.old_status, h.new_status,
      h.actor_role, h.actor_mobile, h.reason, h.remarks, h.created_at
     FROM booking_status_history h
     LEFT JOIN bookings b ON b.booking_id = h.booking_id
     ${whereClause}
     ORDER BY h.id DESC
     LIMIT 100`,
  );
  const history = bindings.length
    ? await statement.bind(...bindings).all<StatusHistoryRow>()
    : await statement.all<StatusHistoryRow>();

  return history.results || [];
}

async function getCashCollectionHistory(driverMobile = "") {
  const statement = env.DB.prepare(
    `SELECT id, created_at, driver_name, driver_mobile,
      COALESCE(vehicle_number, '') AS vehicle_number,
      COALESCE(booking_id, '') AS booking_id,
      amount, COALESCE(payment_mode, 'Cash') AS payment_mode,
      COALESCE(remarks, '') AS remarks,
      COALESCE(receipt_reference, '') AS receipt_reference,
      admin_mobile, COALESCE(collected_by, admin_mobile) AS collected_by,
      COALESCE(settlement_type, 'admin_deposit') AS settlement_type,
      COALESCE(settlement_status, 'Completed') AS settlement_status
     FROM driver_cash_deposits
     ${driverMobile ? "WHERE driver_mobile = ?" : ""}
     ORDER BY id DESC
     LIMIT 100`,
  );
  const rows = driverMobile
    ? await statement.bind(driverMobile).all<CashCollectionRow>()
    : await statement.all<CashCollectionRow>();

  return rows.results || [];
}

async function getAssignmentHistory(role: AuditRole = "admin", mobile = "") {
  let whereClause = "";
  const bindings: string[] = [];

  if (role === "driver") {
    whereClause = "WHERE b.driver_mobile = ?";
    bindings.push(mobile);
  } else if (role === "customer") {
    whereClause = "WHERE b.customer_mobile = ?";
    bindings.push(mobile);
  }

  const statement = env.DB.prepare(
    `SELECT h.id, h.booking_id, h.old_driver_mobile, h.new_driver_mobile,
      h.old_vehicle_number, h.new_vehicle_number, h.assigned_by_role,
      h.assigned_by_mobile, h.reason, h.created_at
     FROM assignment_history h
     LEFT JOIN bookings b ON b.booking_id = h.booking_id
     ${whereClause}
     ORDER BY h.id DESC
     LIMIT 100`,
  );
  const history = bindings.length
    ? await statement.bind(...bindings).all<AssignmentHistoryRow>()
    : await statement.all<AssignmentHistoryRow>();

  return history.results || [];
}

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
       COALESCE(SUM(
         CASE
           WHEN LOWER(COALESCE(ride_status, '')) LIKE '%cancel%'
             AND COALESCE(payment_amount, 0) <= 0
             THEN 0
           WHEN LOWER(COALESCE(ride_status, '')) LIKE '%cancel%'
             AND COALESCE(payment_amount, 0) > 0
             AND COALESCE(refund_amount, 0) >= COALESCE(payment_amount, 0)
             THEN 0
          ELSE ROUND(estimated_fare * 1.05) + COALESCE(extra_amount, 0)
         END
       ), 0) AS total_booking_amount,
       COALESCE(SUM(
         CASE
           WHEN COALESCE(payment_amount, 0) - COALESCE(refund_amount, 0) > 0
             THEN COALESCE(payment_amount, 0) - COALESCE(refund_amount, 0)
           ELSE 0
         END
       ), 0) AS total_collected,
       COALESCE(SUM(
         CASE
           WHEN COALESCE(driver_cash_collected, 0) - COALESCE(driver_cash_refunded, 0) > 0
             THEN COALESCE(driver_cash_collected, 0) - COALESCE(driver_cash_refunded, 0)
           ELSE 0
         END
       ), 0) AS driver_cash_collected
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
     FROM driver_cash_deposits
     WHERE settlement_status = 'Completed'`,
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
      d.email, d.address, d.emergency_contact, d.driving_license,
      d.license_expiry, d.identity_document, d.address_proof,
      d.police_verification, d.profile_photo, d.account_type,
      d.approval_status, d.active_status, d.joining_date,
      COALESCE(v.owner_mobile, d.driver_mobile) AS owner_mobile,
      v.seating_capacity, v.fuel_type, v.registration_certificate,
      v.insurance, v.insurance_expiry, v.permit, v.fitness_certificate,
      v.puc, v.vehicle_photo,
      COALESCE(v.updated_at, d.updated_at) AS updated_at
     FROM drivers d
     LEFT JOIN driver_vehicles v ON v.driver_mobile = d.driver_mobile
     ORDER BY COALESCE(v.updated_at, d.updated_at) DESC`,
  ).all<DriverRow>();

  return drivers.results || [];
}

async function getDriverVehicles(driverMobile: string) {
  const vehicles = await env.DB.prepare(
    `SELECT driver_name, driver_mobile, vehicle_type, vehicle_number,
      owner_mobile, seating_capacity, fuel_type, registration_certificate,
      insurance, insurance_expiry, permit, fitness_certificate, puc,
      vehicle_photo, approval_status, active_status, updated_at
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
      COALESCE(SUM(ROUND(estimated_fare * 1.05) + COALESCE(extra_amount, 0)), 0) AS total_earning
     FROM bookings
     WHERE driver_mobile = ?
       AND ride_status = 'Ride Complete'
       AND booking_id NOT LIKE 'PENDING-%'`,
  )
    .bind(driverMobile)
    .first<{ completed_rides: number; total_earning: number }>();

  const adjusted = await env.DB.prepare(
    `SELECT COALESCE(SUM(amount), 0) AS adjusted_amount
     FROM driver_cash_deposits
     WHERE driver_mobile = ?
       AND settlement_type = 'earning_adjustment'
       AND settlement_status = 'Completed'`,
  )
    .bind(driverMobile)
    .first<{ adjusted_amount: number }>();
  const withdrawn = await env.DB.prepare(
    `SELECT COALESCE(SUM(amount), 0) AS withdrawn_amount
     FROM driver_withdrawals
     WHERE driver_mobile = ? AND status IN ('Pending', 'Completed')`,
  )
    .bind(driverMobile)
    .first<{ withdrawn_amount: number }>();
  const totalEarning = Number(summary?.total_earning || 0);
  const cashAdjustedToEarning = Number(adjusted?.adjusted_amount || 0);
  const withdrawnAmount = Number(withdrawn?.withdrawn_amount || 0);

  return {
    completedRides: Number(summary?.completed_rides || 0),
    totalEarning,
    cashAdjustedToEarning,
    withdrawnAmount,
    availableEarning: Math.max(0, totalEarning - cashAdjustedToEarning - withdrawnAmount),
  };
}

async function getDriverCashDeposited(driverMobile?: string) {
  const query = `SELECT COALESCE(SUM(amount), 0) AS deposited_amount
     FROM driver_cash_deposits
     WHERE settlement_status = 'Completed'
     ${driverMobile ? "AND driver_mobile = ?" : ""}`;
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
  const refunded = await env.DB.prepare(
    `SELECT COALESCE(SUM(driver_cash_refunded), 0) AS refund_amount
     FROM bookings
     WHERE refund_driver_mobile = ?
       AND driver_cash_refunded > 0
       AND booking_id NOT LIKE 'PENDING-%'`,
  )
    .bind(driverMobile)
    .first<{ refund_amount: number }>();
  const deposited = await getDriverCashDeposited(driverMobile);

  return Math.max(
    0,
    Number(cash?.cash_amount || 0) - Number(refunded?.refund_amount || 0) - deposited,
  );
}

async function getPendingDriverCashTransfers(driverMobile: string) {
  const pending = await env.DB.prepare(
    `SELECT COALESCE(SUM(amount), 0) AS pending_amount
     FROM driver_cash_deposits
     WHERE driver_mobile = ?
       AND settlement_type = 'admin_transfer'
       AND settlement_status = 'Pending'`,
  )
    .bind(driverMobile)
    .first<{ pending_amount: number }>();

  return Number(pending?.pending_amount || 0);
}

async function getDriverWithdrawableBalance(driverMobile: string) {
  const earning = await getDriverEarning(driverMobile);
  return earning.availableEarning;
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

  const refunds = await env.DB.prepare(
    `SELECT refund_driver_mobile AS driver_mobile,
      COALESCE(SUM(driver_cash_refunded), 0) AS cash_refunded
     FROM bookings
     WHERE driver_cash_refunded > 0
       AND COALESCE(refund_driver_mobile, '') != ''
       AND booking_id NOT LIKE 'PENDING-%'
     GROUP BY refund_driver_mobile`,
  ).all<{ driver_mobile: string; cash_refunded: number }>();
  const refundMap = new Map(
    (refunds.results || []).map((row) => [
      row.driver_mobile,
      Number(row.cash_refunded || 0),
    ]),
  );

  const deposits = await env.DB.prepare(
    `SELECT driver_mobile,
      COALESCE(SUM(amount), 0) AS deposited_amount,
      COALESCE(SUM(CASE WHEN settlement_type = 'earning_adjustment' THEN amount ELSE 0 END), 0) AS earning_adjusted,
      COALESCE(SUM(CASE WHEN settlement_type != 'earning_adjustment' THEN amount ELSE 0 END), 0) AS admin_deposited
     FROM driver_cash_deposits
     WHERE settlement_status = 'Completed'
     GROUP BY driver_mobile`,
  ).all<{
    driver_mobile: string;
    deposited_amount: number;
    earning_adjusted: number;
    admin_deposited: number;
  }>();
  const depositMap = new Map(
    (deposits.results || []).map((row) => [
      row.driver_mobile,
      Number(row.deposited_amount || 0),
    ]),
  );
  const earningAdjustmentMap = new Map(
    (deposits.results || []).map((row) => [
      row.driver_mobile,
      Number(row.earning_adjusted || 0),
    ]),
  );
  const adminDepositMap = new Map(
    (deposits.results || []).map((row) => [
      row.driver_mobile,
      Number(row.admin_deposited || 0),
    ]),
  );

  return (summary.results || []).map((row) => ({
    driver_mobile: row.driver_mobile,
    driver_name: row.driver_name,
    cash_amount: Math.max(
      0,
      Number(row.cash_collected || 0) -
        Number(refundMap.get(row.driver_mobile) || 0) -
        Number(depositMap.get(row.driver_mobile) || 0),
    ),
    cash_collected: Number(row.cash_collected || 0),
    cash_refunded: Number(refundMap.get(row.driver_mobile) || 0),
    cash_deposited: Number(depositMap.get(row.driver_mobile) || 0),
    cash_adjusted_to_earning: Number(earningAdjustmentMap.get(row.driver_mobile) || 0),
    cash_sent_to_admin: Number(adminDepositMap.get(row.driver_mobile) || 0),
    cash_rides: row.cash_rides,
  }));
}

async function getDriverLedger(driverMobile?: string) {
  const query = `${bookingSelectSql}
     WHERE booking_id NOT LIKE 'PENDING-%'
       AND (ride_status = 'Ride Complete' OR driver_cash_collected > 0 OR driver_cash_refunded > 0)
       ${driverMobile ? "AND (driver_mobile = ? OR refund_driver_mobile = ?)" : ""}
     ORDER BY COALESCE(ride_completed_at, pickup_datetime, created_at) DESC
     LIMIT 80`;

  const statement = env.DB.prepare(query);
  const ledger = driverMobile
    ? await statement.bind(driverMobile, driverMobile).all<BookingRow>()
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

async function getDriverSavedBankDetails(driverMobile: string) {
  const latestWithdrawal = await env.DB.prepare(
    `SELECT bank_name, bank_account, bank_ifsc
     FROM driver_withdrawals
     WHERE driver_mobile = ?
       AND COALESCE(bank_account, '') != ''
     ORDER BY id DESC
     LIMIT 1`,
  )
    .bind(driverMobile)
    .first<{ bank_name: string; bank_account: string; bank_ifsc: string }>();

  return latestWithdrawal || { bank_name: "", bank_account: "", bank_ifsc: "" };
}

async function getPriceAdjustmentPercent() {
  const setting = await env.DB.prepare(
    "SELECT value FROM app_settings WHERE key = 'price_adjustment_percent' LIMIT 1",
  ).first<{ value: string }>();
  const percent = Number(setting?.value || 0);

  return Number.isFinite(percent) ? percent : 0;
}

function normalizeVehicleRateOverrides(value: unknown): VehicleRateOverrides {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const allowedRateKeys = new Set([
    "perKm",
    "local4hr",
    "local8hr",
    "local10hr",
    "perHour",
    "fullDay",
    "halfDay",
    "vip",
  ]);
  const overrides: VehicleRateOverrides = {};

  Object.entries(value as Record<string, unknown>).forEach(([vehicleName, rates]) => {
    if (!vehicleName || !rates || typeof rates !== "object" || Array.isArray(rates)) {
      return;
    }

    const normalizedRates: VehicleRateOverride = {};

    Object.entries(rates as Record<string, unknown>).forEach(([rateKey, rateValue]) => {
      if (!allowedRateKeys.has(rateKey)) {
        return;
      }

      const numericRate = Number(rateValue);
      if (Number.isFinite(numericRate) && numericRate >= 0 && numericRate <= 1000000) {
        normalizedRates[rateKey as keyof VehicleRateOverride] = Math.round(numericRate);
      }
    });

    if (Object.keys(normalizedRates).length > 0) {
      overrides[vehicleName] = normalizedRates;
    }
  });

  return overrides;
}

function normalizeRateAmount(value: unknown, fallback: number) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 && amount <= 1000000
    ? Math.round(amount)
    : fallback;
}

function normalizeFleetVehicles(value: unknown): FleetVehicle[] {
  if (!Array.isArray(value)) {
    return defaultFleetVehicles;
  }

  const normalizedVehicles = value
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }

      const vehicle = item as Partial<FleetVehicle>;
      const name = clean(vehicle.name);
      const matchingDefault =
        defaultFleetVehicles.find((defaultVehicle) => defaultVehicle.name === name) ||
        defaultFleetVehicles[0];
      const rates = vehicle.rates || {};

      if (!name) {
        return null;
      }

      return {
        name,
        type: clean(vehicle.type) || matchingDefault.type,
        seats: clean(vehicle.seats) || matchingDefault.seats,
        luggage: clean(vehicle.luggage) || matchingDefault.luggage,
        bestFor: clean(vehicle.bestFor) || matchingDefault.bestFor,
        photo: clean(vehicle.photo) || matchingDefault.photo,
        active: vehicle.active !== false,
        rates: {
          perKm: normalizeRateAmount(rates.perKm, matchingDefault.rates.perKm),
          local4hr: normalizeRateAmount(rates.local4hr, matchingDefault.rates.local4hr),
          local8hr: normalizeRateAmount(rates.local8hr, matchingDefault.rates.local8hr),
          local10hr: normalizeRateAmount(rates.local10hr, matchingDefault.rates.local10hr),
          perHour: normalizeRateAmount(
            rates.perHour,
            Math.max(1, Math.round(matchingDefault.rates.local10hr / 10)),
          ),
          fullDay: normalizeRateAmount(rates.fullDay, matchingDefault.rates.fullDay),
          halfDay: normalizeRateAmount(rates.halfDay, matchingDefault.rates.halfDay),
          vip: normalizeRateAmount(rates.vip, matchingDefault.rates.vip),
        },
      };
    })
    .filter((vehicle): vehicle is FleetVehicle => Boolean(vehicle));

  return normalizedVehicles.length ? normalizedVehicles : defaultFleetVehicles;
}

async function getFleetVehicles() {
  const setting = await env.DB.prepare(
    "SELECT value FROM app_settings WHERE key = 'fleet_vehicles' LIMIT 1",
  ).first<{ value: string }>();

  if (!setting?.value) {
    return defaultFleetVehicles;
  }

  try {
    return normalizeFleetVehicles(JSON.parse(setting.value));
  } catch {
    return defaultFleetVehicles;
  }
}

function getFleetRateTable(fleetVehicles: FleetVehicle[]) {
  const table = Object.fromEntries(
    fleetVehicles.map((vehicle) => [vehicle.name, vehicle.rates]),
  ) as Record<string, VehicleRates>;

  if (table["Toyota Innova Hycross"]) {
    table["Toyota Hycross"] = table["Toyota Innova Hycross"];
  }

  return table;
}

async function getVehicleRateOverrides() {
  const setting = await env.DB.prepare(
    "SELECT value FROM app_settings WHERE key = 'vehicle_rate_overrides' LIMIT 1",
  ).first<{ value: string }>();

  if (!setting?.value) {
    return {};
  }

  try {
    return normalizeVehicleRateOverrides(JSON.parse(setting.value));
  } catch {
    return {};
  }
}

function normalizeSiteFont(value: unknown) {
  const fontName = clean(String(value || ""));
  return allowedSiteFonts.has(fontName) ? fontName : "Plus Jakarta Sans";
}

async function getSiteFont() {
  const setting = await env.DB.prepare(
    "SELECT value FROM app_settings WHERE key = 'site_font' LIMIT 1",
  ).first<{ value: string }>();

  return normalizeSiteFont(setting?.value);
}

function clampLogoSize(value: unknown, fallback: number, min: number, max: number) {
  const parsed = Math.round(Number(value));

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, parsed));
}

function normalizeBrandingIconUrl(value: unknown) {
  const iconUrl = clean(value);

  if (!iconUrl) {
    return defaultSiteBranding.iconUrl;
  }

  if (iconUrl.startsWith("data:image/")) {
    return iconUrl.length <= 900000 ? iconUrl : defaultSiteBranding.iconUrl;
  }

  if (iconUrl.startsWith("/") || iconUrl.startsWith("https://")) {
    return iconUrl.slice(0, 2048);
  }

  return defaultSiteBranding.iconUrl;
}

function normalizeSiteBranding(value: unknown): SiteBranding {
  const raw =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Partial<SiteBranding>)
      : {};

  return {
    iconUrl: normalizeBrandingIconUrl(raw.iconUrl),
    headerLogoSize: clampLogoSize(
      raw.headerLogoSize,
      defaultSiteBranding.headerLogoSize,
      38,
      120,
    ),
    footerLogoSize: clampLogoSize(
      raw.footerLogoSize,
      defaultSiteBranding.footerLogoSize,
      48,
      180,
    ),
    faviconSize: clampLogoSize(
      raw.faviconSize,
      defaultSiteBranding.faviconSize,
      16,
      96,
    ),
  };
}

async function getSiteBranding() {
  const setting = await env.DB.prepare(
    "SELECT value FROM app_settings WHERE key = 'site_branding' LIMIT 1",
  ).first<{ value: string }>();

  if (!setting?.value) {
    return defaultSiteBranding;
  }

  try {
    return normalizeSiteBranding(JSON.parse(setting.value));
  } catch {
    return defaultSiteBranding;
  }
}

async function getPricingUpdatedAt() {
  const setting = await env.DB.prepare(
    `SELECT MAX(updated_at) AS updated_at
     FROM app_settings
     WHERE key IN ('price_adjustment_percent', 'vehicle_rate_overrides', 'fleet_vehicles')`,
  ).first<{ updated_at: string | null }>();

  return setting?.updated_at || "2026-07-31T00:00:00+05:30";
}

function applyPriceAdjustment(amount: number, percent: number) {
  return Math.max(0, Math.round(amount * (1 + percent / 100)));
}

async function getEffectiveBookingRate(vehicle: string) {
  const fleetVehicles = await getFleetVehicles();
  const fleetRateTable = getFleetRateTable(fleetVehicles);
  const selectedRate =
    fleetRateTable[vehicle] ||
    fleetRateTable["Toyota Etios"] ||
    fleetVehicles[0]?.rates ||
    rateTable["Toyota Etios"];
  const priceAdjustmentPercent = await getPriceAdjustmentPercent();
  const vehicleRateOverrides = await getVehicleRateOverrides();
  const selectedOverrides = vehicleRateOverrides[vehicle] || {};
  const manualRate = {
    perKm: selectedOverrides.perKm ?? selectedRate.perKm,
    local4hr: selectedOverrides.local4hr ?? selectedRate.local4hr,
    local8hr: selectedOverrides.local8hr ?? selectedRate.local8hr,
    local10hr: selectedOverrides.local10hr ?? selectedRate.local10hr,
    perHour: selectedOverrides.perHour ?? selectedRate.perHour,
    fullDay: selectedOverrides.fullDay ?? selectedRate.fullDay,
    halfDay: selectedOverrides.halfDay ?? selectedRate.halfDay,
    vip: selectedOverrides.vip ?? selectedRate.vip,
  };

  return {
    perKm: applyPriceAdjustment(manualRate.perKm, priceAdjustmentPercent),
    local4hr: applyPriceAdjustment(manualRate.local4hr, priceAdjustmentPercent),
    local8hr: applyPriceAdjustment(manualRate.local8hr, priceAdjustmentPercent),
    local10hr: applyPriceAdjustment(manualRate.local10hr, priceAdjustmentPercent),
    perHour: applyPriceAdjustment(manualRate.perHour, priceAdjustmentPercent),
    fullDay: applyPriceAdjustment(manualRate.fullDay, priceAdjustmentPercent),
    halfDay: applyPriceAdjustment(manualRate.halfDay, priceAdjustmentPercent),
    vip: applyPriceAdjustment(manualRate.vip, priceAdjustmentPercent),
  };
}

async function ensureBookingsTable() {
  const db = env.DB;
  if (!db) {
    throw new Error("D1 database binding DB is not configured.");
  }

  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
    )
    .run();

  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS portal_sessions (
        token TEXT PRIMARY KEY,
        role TEXT NOT NULL,
        mobile TEXT NOT NULL,
        created_at TEXT NOT NULL,
        expires_at TEXT NOT NULL
      )`,
    )
    .run();

  await db
    .prepare("DELETE FROM portal_sessions WHERE expires_at <= ?")
    .bind(new Date().toISOString())
    .run()
    .catch(() => undefined);

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
        rate_per_hour INTEGER NOT NULL DEFAULT 0,
        estimated_fare INTEGER NOT NULL,
        pickup_datetime TEXT NOT NULL,
        return_date TEXT NOT NULL DEFAULT '',
        customer_name TEXT NOT NULL,
        customer_mobile TEXT NOT NULL,
        customer_email TEXT NOT NULL DEFAULT '',
        package_type TEXT NOT NULL DEFAULT 'perKm',
        payment_mode TEXT NOT NULL,
        ride_status TEXT NOT NULL DEFAULT 'Booked',
        refund_status TEXT NOT NULL DEFAULT 'None',
        refund_amount INTEGER NOT NULL DEFAULT 0,
        driver_name TEXT NOT NULL DEFAULT '',
        driver_mobile TEXT NOT NULL DEFAULT '',
        vehicle_number TEXT NOT NULL DEFAULT '',
        payment_status TEXT NOT NULL DEFAULT 'Pending',
        payment_amount INTEGER NOT NULL DEFAULT 0,
        payment_collection_mode TEXT NOT NULL DEFAULT '',
        driver_cash_collected INTEGER NOT NULL DEFAULT 0,
        refund_collection_mode TEXT NOT NULL DEFAULT '',
        driver_cash_refunded INTEGER NOT NULL DEFAULT 0,
        refund_driver_name TEXT NOT NULL DEFAULT '',
        refund_driver_mobile TEXT NOT NULL DEFAULT '',
        cancel_reason TEXT NOT NULL DEFAULT '',
        ride_started_at TEXT NOT NULL DEFAULT '',
        odometer_start INTEGER NOT NULL DEFAULT 0,
        odometer_end INTEGER NOT NULL DEFAULT 0,
        extra_km INTEGER NOT NULL DEFAULT 0,
        extra_hours INTEGER NOT NULL DEFAULT 0,
        extra_hour_amount INTEGER NOT NULL DEFAULT 0,
        extra_amount INTEGER NOT NULL DEFAULT 0,
        ride_completed_at TEXT NOT NULL DEFAULT ''
      )`,
    )
    .run();

  await db
    .prepare("ALTER TABLE bookings ADD COLUMN return_date TEXT NOT NULL DEFAULT ''")
    .run()
    .catch(() => undefined);

  await db
    .prepare("ALTER TABLE bookings ADD COLUMN odometer_start INTEGER NOT NULL DEFAULT 0")
    .run()
    .catch(() => undefined);

  await db
    .prepare("ALTER TABLE bookings ADD COLUMN odometer_end INTEGER NOT NULL DEFAULT 0")
    .run()
    .catch(() => undefined);

  await db
    .prepare("ALTER TABLE bookings ADD COLUMN extra_km INTEGER NOT NULL DEFAULT 0")
    .run()
    .catch(() => undefined);

  await db
    .prepare("ALTER TABLE bookings ADD COLUMN rate_per_hour INTEGER NOT NULL DEFAULT 0")
    .run()
    .catch(() => undefined);

  await db
    .prepare("ALTER TABLE bookings ADD COLUMN extra_hours INTEGER NOT NULL DEFAULT 0")
    .run()
    .catch(() => undefined);

  await db
    .prepare("ALTER TABLE bookings ADD COLUMN extra_hour_amount INTEGER NOT NULL DEFAULT 0")
    .run()
    .catch(() => undefined);

  await db
    .prepare("ALTER TABLE bookings ADD COLUMN extra_amount INTEGER NOT NULL DEFAULT 0")
    .run()
    .catch(() => undefined);

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
    .prepare("ALTER TABLE bookings ADD COLUMN refund_amount INTEGER NOT NULL DEFAULT 0")
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
    .prepare("ALTER TABLE bookings ADD COLUMN refund_collection_mode TEXT NOT NULL DEFAULT ''")
    .run()
    .catch(() => undefined);
  await db
    .prepare("ALTER TABLE bookings ADD COLUMN driver_cash_refunded INTEGER NOT NULL DEFAULT 0")
    .run()
    .catch(() => undefined);
  await db
    .prepare("ALTER TABLE bookings ADD COLUMN refund_driver_name TEXT NOT NULL DEFAULT ''")
    .run()
    .catch(() => undefined);
  await db
    .prepare("ALTER TABLE bookings ADD COLUMN refund_driver_mobile TEXT NOT NULL DEFAULT ''")
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
        bank_name TEXT NOT NULL DEFAULT '',
        bank_account TEXT NOT NULL DEFAULT '',
        bank_ifsc TEXT NOT NULL DEFAULT '',
        updated_at TEXT NOT NULL
      )`,
    )
    .run();

  await db
    .prepare("ALTER TABLE drivers ADD COLUMN bank_name TEXT NOT NULL DEFAULT ''")
    .run()
    .catch(() => undefined);
  await db
    .prepare("ALTER TABLE drivers ADD COLUMN bank_account TEXT NOT NULL DEFAULT ''")
    .run()
    .catch(() => undefined);
  await db
    .prepare("ALTER TABLE drivers ADD COLUMN bank_ifsc TEXT NOT NULL DEFAULT ''")
    .run()
    .catch(() => undefined);

  const driverProfileColumns = [
    "email TEXT NOT NULL DEFAULT ''",
    "address TEXT NOT NULL DEFAULT ''",
    "emergency_contact TEXT NOT NULL DEFAULT ''",
    "driving_license TEXT NOT NULL DEFAULT ''",
    "license_expiry TEXT NOT NULL DEFAULT ''",
    "identity_document TEXT NOT NULL DEFAULT ''",
    "address_proof TEXT NOT NULL DEFAULT ''",
    "police_verification TEXT NOT NULL DEFAULT ''",
    "profile_photo TEXT NOT NULL DEFAULT ''",
    "account_type TEXT NOT NULL DEFAULT 'Driver-Cum-Owner'",
    "approval_status TEXT NOT NULL DEFAULT 'Approved'",
    "active_status TEXT NOT NULL DEFAULT 'Active'",
    "joining_date TEXT NOT NULL DEFAULT ''",
  ];

  for (const columnDefinition of driverProfileColumns) {
    await db
      .prepare(`ALTER TABLE drivers ADD COLUMN ${columnDefinition}`)
      .run()
      .catch(() => undefined);
  }

  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS driver_vehicles (
        vehicle_number TEXT PRIMARY KEY,
        driver_mobile TEXT NOT NULL,
        driver_name TEXT NOT NULL,
        vehicle_type TEXT NOT NULL,
        owner_mobile TEXT NOT NULL DEFAULT '',
        seating_capacity TEXT NOT NULL DEFAULT '',
        fuel_type TEXT NOT NULL DEFAULT '',
        registration_certificate TEXT NOT NULL DEFAULT '',
        insurance TEXT NOT NULL DEFAULT '',
        insurance_expiry TEXT NOT NULL DEFAULT '',
        permit TEXT NOT NULL DEFAULT '',
        fitness_certificate TEXT NOT NULL DEFAULT '',
        puc TEXT NOT NULL DEFAULT '',
        vehicle_photo TEXT NOT NULL DEFAULT '',
        approval_status TEXT NOT NULL DEFAULT 'Approved',
        active_status TEXT NOT NULL DEFAULT 'Active',
        updated_at TEXT NOT NULL
      )`,
    )
    .run();

  const driverVehicleColumns = [
    "owner_mobile TEXT NOT NULL DEFAULT ''",
    "seating_capacity TEXT NOT NULL DEFAULT ''",
    "fuel_type TEXT NOT NULL DEFAULT ''",
    "registration_certificate TEXT NOT NULL DEFAULT ''",
    "insurance TEXT NOT NULL DEFAULT ''",
    "insurance_expiry TEXT NOT NULL DEFAULT ''",
    "permit TEXT NOT NULL DEFAULT ''",
    "fitness_certificate TEXT NOT NULL DEFAULT ''",
    "puc TEXT NOT NULL DEFAULT ''",
    "vehicle_photo TEXT NOT NULL DEFAULT ''",
    "approval_status TEXT NOT NULL DEFAULT 'Approved'",
    "active_status TEXT NOT NULL DEFAULT 'Active'",
  ];

  for (const columnDefinition of driverVehicleColumns) {
    await db
      .prepare(`ALTER TABLE driver_vehicles ADD COLUMN ${columnDefinition}`)
      .run()
      .catch(() => undefined);
  }

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
        vehicle_number TEXT NOT NULL DEFAULT '',
        booking_id TEXT NOT NULL DEFAULT '',
        amount INTEGER NOT NULL,
        payment_mode TEXT NOT NULL DEFAULT 'Cash',
        remarks TEXT NOT NULL DEFAULT '',
        receipt_reference TEXT NOT NULL DEFAULT '',
        admin_mobile TEXT NOT NULL,
        collected_by TEXT NOT NULL DEFAULT '',
        settlement_type TEXT NOT NULL DEFAULT 'admin_deposit',
        settlement_status TEXT NOT NULL DEFAULT 'Completed'
      )`,
    )
    .run();

  const cashDepositColumns = [
    "vehicle_number TEXT NOT NULL DEFAULT ''",
    "booking_id TEXT NOT NULL DEFAULT ''",
    "payment_mode TEXT NOT NULL DEFAULT 'Cash'",
    "remarks TEXT NOT NULL DEFAULT ''",
    "receipt_reference TEXT NOT NULL DEFAULT ''",
    "collected_by TEXT NOT NULL DEFAULT ''",
    "settlement_type TEXT NOT NULL DEFAULT 'admin_deposit'",
    "settlement_status TEXT NOT NULL DEFAULT 'Completed'",
  ];

  for (const columnDefinition of cashDepositColumns) {
    await db
      .prepare(`ALTER TABLE driver_cash_deposits ADD COLUMN ${columnDefinition}`)
      .run()
      .catch(() => undefined);
  }

  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS booking_status_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id TEXT NOT NULL,
        old_status TEXT NOT NULL DEFAULT '',
        new_status TEXT NOT NULL,
        actor_role TEXT NOT NULL,
        actor_mobile TEXT NOT NULL DEFAULT '',
        reason TEXT NOT NULL DEFAULT '',
        remarks TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL
      )`,
    )
    .run();

  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS assignment_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id TEXT NOT NULL,
        old_driver_mobile TEXT NOT NULL DEFAULT '',
        new_driver_mobile TEXT NOT NULL DEFAULT '',
        old_vehicle_number TEXT NOT NULL DEFAULT '',
        new_vehicle_number TEXT NOT NULL DEFAULT '',
        assigned_by_role TEXT NOT NULL,
        assigned_by_mobile TEXT NOT NULL DEFAULT '',
        reason TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL
      )`,
    )
    .run();

  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS payment_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id TEXT NOT NULL DEFAULT '',
        customer_mobile TEXT NOT NULL DEFAULT '',
        driver_mobile TEXT NOT NULL DEFAULT '',
        amount INTEGER NOT NULL,
        transaction_type TEXT NOT NULL,
        payment_mode TEXT NOT NULL,
        reference_number TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'Complete',
        settlement_status TEXT NOT NULL DEFAULT 'Settled',
        created_by_role TEXT NOT NULL,
        created_by_mobile TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL
      )`,
    )
    .run();

  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        actor_role TEXT NOT NULL,
        actor_mobile TEXT NOT NULL DEFAULT '',
        details_json TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL
      )`,
    )
    .run();

  await db
    .prepare(
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
    )
    .run();

  const operationalIndexes = [
    "CREATE INDEX IF NOT EXISTS idx_bookings_customer_mobile ON bookings (customer_mobile)",
    "CREATE INDEX IF NOT EXISTS idx_bookings_driver_mobile ON bookings (driver_mobile)",
    "CREATE INDEX IF NOT EXISTS idx_bookings_ride_status ON bookings (ride_status)",
    "CREATE INDEX IF NOT EXISTS idx_status_history_booking_id ON booking_status_history (booking_id)",
    "CREATE INDEX IF NOT EXISTS idx_assignment_history_booking_id ON assignment_history (booking_id)",
    "CREATE INDEX IF NOT EXISTS idx_payment_transactions_booking_id ON payment_transactions (booking_id)",
    "CREATE INDEX IF NOT EXISTS idx_cash_deposits_driver_mobile ON driver_cash_deposits (driver_mobile)",
    "CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs (entity_type, entity_id)",
    "CREATE INDEX IF NOT EXISTS idx_gateway_orders_booking_id ON payment_gateway_orders (booking_id)",
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_gateway_orders_payment_id ON payment_gateway_orders (payment_id) WHERE payment_id != ''",
    "CREATE INDEX IF NOT EXISTS idx_portal_sessions_mobile_role ON portal_sessions (mobile, role)",
  ];

  for (const indexSql of operationalIndexes) {
    await db.prepare(indexSql).run();
  }

  await db.prepare("PRAGMA optimize").run().catch(() => undefined);
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const pin = url.searchParams.get("pin") || "";
    const loginMobile = clean(url.searchParams.get("loginMobile"));
    const bookingId = clean(url.searchParams.get("bookingId"));
    const mobile = clean(url.searchParams.get("mobile"));

    await ensureBookingsTable();
    const activePortalSession = await getPortalSession(request);

    if (url.searchParams.get("settings") === "pricing") {
      const fleetVehicles = await getFleetVehicles();

      return Response.json(
        {
          priceAdjustmentPercent: await getPriceAdjustmentPercent(),
          vehicleRateOverrides: await getVehicleRateOverrides(),
          fleetVehicles,
          siteFont: await getSiteFont(),
          siteBranding: await getSiteBranding(),
        },
        { headers: noStoreHeaders },
      );
    }

    if (url.searchParams.get("settings") === "publicRates") {
      const publicVehicles = (await getFleetVehicles()).filter(
        (vehicle) => vehicle.active !== false,
      );
      const rates = await Promise.all(
        publicVehicles.map(async (vehicle) => ({
          vehicleName: vehicle.name,
          type: vehicle.type,
          seats: vehicle.seats,
          luggage: vehicle.luggage,
          bestFor: vehicle.bestFor,
          photo: vehicle.photo,
          rates: await getEffectiveBookingRate(vehicle.name),
        })),
      );

      return Response.json(
        {
          updatedAt: await getPricingUpdatedAt(),
          priceAdjustmentPercent: await getPriceAdjustmentPercent(),
          fleetVehicles: publicVehicles,
          vehicles: rates,
          siteBranding: await getSiteBranding(),
        },
        { headers: noStoreHeaders },
      );
    }

    if (loginMobile) {
      if (loginMobile === adminMobile) {
        const financeSummary = await getAdminFinanceSummary();
        const recent = await getRecentBookings();
        const drivers = await getDrivers();
        const driverCashSummary = await getDriverCashSummary();
        const driverLedger = await getDriverLedger();
        const withdrawalRequests = await getWithdrawals();

        return createPortalLoginResponse(request, "admin", loginMobile, {
          role: "admin",
          priceAdjustmentPercent: await getPriceAdjustmentPercent(),
          vehicleRateOverrides: await getVehicleRateOverrides(),
          fleetVehicles: await getFleetVehicles(),
          siteFont: await getSiteFont(),
          siteBranding: await getSiteBranding(),
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
          statusHistory: await getStatusHistory("admin"),
          assignmentHistory: await getAssignmentHistory("admin"),
          cashCollectionHistory: await getCashCollectionHistory(),
        });
      }

      const driverProfile = await env.DB.prepare(
        `SELECT driver_name, driver_mobile, vehicle_type, vehicle_number,
           bank_name, bank_account, bank_ifsc, email, address,
           emergency_contact, driving_license, license_expiry,
           identity_document, address_proof, police_verification,
           profile_photo, account_type, approval_status, active_status,
           joining_date, updated_at
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
        const latestBank = driverProfile
          ? await getDriverSavedBankDetails(loginMobile)
          : { bank_name: "", bank_account: "", bank_ifsc: "" };
        const profileWithBank = driverProfile
          ? {
              ...driverProfile,
              bank_name: driverProfile.bank_name || latestBank.bank_name,
              bank_account: driverProfile.bank_account || latestBank.bank_account,
              bank_ifsc: driverProfile.bank_ifsc || latestBank.bank_ifsc,
            }
          : driverProfile;

        const driverDashboardData = {
          role: "driver",
          driverProfile: profileWithBank,
          driverVehicles,
          nextRide: await getDriverNextRide(loginMobile),
          recentBookings: [
            ...matchingOpenBookings,
            ...(driverBookings.results || []),
          ],
          driverEarning: await getDriverEarning(loginMobile),
          driverCashInHand: await getDriverCashInHand(loginMobile),
          pendingCashTransfer: await getPendingDriverCashTransfers(loginMobile),
          maxWithdrawalAmount: await getDriverWithdrawableBalance(loginMobile),
          driverLedger: await getDriverLedger(loginMobile),
          withdrawalRequests: await getWithdrawals(loginMobile),
          statusHistory: await getStatusHistory("driver", loginMobile),
          assignmentHistory: await getAssignmentHistory("driver", loginMobile),
          cashCollectionHistory: await getCashCollectionHistory(loginMobile),
        };

        return hasRole(activePortalSession, "admin")
          ? Response.json(driverDashboardData, { headers: noStoreHeaders })
          : createPortalLoginResponse(request, "driver", loginMobile, driverDashboardData);
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
        const customerDashboardData = {
          role: "customer",
          recentBookings: customerBookings.results,
          statusHistory: await getStatusHistory("customer", loginMobile),
          assignmentHistory: await getAssignmentHistory("customer", loginMobile),
        };

        return hasRole(activePortalSession, "admin")
          ? Response.json(customerDashboardData, { headers: noStoreHeaders })
          : createPortalLoginResponse(request, "customer", loginMobile, customerDashboardData);
      }

      return Response.json(
        { error: "No User Found. Please Check Mobile Number." },
        { status: 404 },
      );
    }

    if (bookingId && mobile) {
      const booking = await env.DB.prepare(
        `SELECT booking_id, created_at, trip_type, vehicle, start_point, destination,
          one_side_km, billable_km, rate_per_km, estimated_fare, pickup_datetime, return_date,
          customer_name, customer_mobile, customer_email, status, ride_status,
          refund_status, refund_amount,
          driver_name, driver_mobile, vehicle_number, payment_status,
          payment_amount, payment_collection_mode, driver_cash_collected,
          refund_collection_mode, driver_cash_refunded,
          refund_driver_name, refund_driver_mobile,
          cancel_reason, ride_started_at, odometer_start, odometer_end, extra_km,
          extra_amount, ride_completed_at
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
      action !== "settleDriverCash" &&
      action !== "updateWithdrawal" &&
      action !== "recordCashDeposit" &&
      action !== "updateCashSettlement" &&
      action !== "updatePriceAdjustment" &&
      action !== "updateVehicleRates" &&
      action !== "updateFleetVehicles" &&
      action !== "updateSiteFont" &&
      action !== "updateSiteBranding"
    ) {
      return Response.json({ error: "Booking ID is required." }, { status: 400 });
    }

    await ensureBookingsTable();
    const portalSession = await getPortalSession(request);

    if (action === "updatePriceAdjustment") {
      if (!hasRole(portalSession, "admin", adminMobile)) {
        return Response.json({ error: "Only Admin Can Update Master Price." }, { status: 401 });
      }

      const priceAdjustmentPercent = Number(payload.priceAdjustmentPercent);

      if (
        !Number.isFinite(priceAdjustmentPercent) ||
        priceAdjustmentPercent < -90 ||
        priceAdjustmentPercent > 200
      ) {
        return Response.json(
          { error: "Price adjustment must be between -90% and 200%." },
          { status: 400 },
        );
      }

      await env.DB.prepare(
        `INSERT INTO app_settings (key, value, updated_at)
         VALUES ('price_adjustment_percent', ?, ?)
         ON CONFLICT(key) DO UPDATE SET
           value = excluded.value,
           updated_at = excluded.updated_at`,
      )
        .bind(String(priceAdjustmentPercent), new Date().toISOString())
        .run();

      return Response.json({ success: true, priceAdjustmentPercent });
    }

    if (action === "updateVehicleRates") {
      if (!hasRole(portalSession, "admin", adminMobile)) {
        return Response.json({ error: "Only Admin Can Update Car Fares." }, { status: 401 });
      }

      const vehicleRateOverrides = normalizeVehicleRateOverrides(
        payload.vehicleRateOverrides,
      );

      await env.DB.prepare(
        `INSERT INTO app_settings (key, value, updated_at)
         VALUES ('vehicle_rate_overrides', ?, ?)
         ON CONFLICT(key) DO UPDATE SET
           value = excluded.value,
           updated_at = excluded.updated_at`,
      )
        .bind(JSON.stringify(vehicleRateOverrides), new Date().toISOString())
        .run();

      return Response.json({ success: true, vehicleRateOverrides });
    }

    if (action === "updateFleetVehicles") {
      if (!hasRole(portalSession, "admin", adminMobile)) {
        return Response.json({ error: "Only Admin Can Update My Vehicle." }, { status: 401 });
      }

      const fleetVehicles = normalizeFleetVehicles(payload.fleetVehicles);

      await env.DB.prepare(
        `INSERT INTO app_settings (key, value, updated_at)
         VALUES ('fleet_vehicles', ?, ?)
         ON CONFLICT(key) DO UPDATE SET
           value = excluded.value,
           updated_at = excluded.updated_at`,
      )
        .bind(JSON.stringify(fleetVehicles), new Date().toISOString())
        .run();

      return Response.json({ success: true, fleetVehicles });
    }

    if (action === "updateSiteFont") {
      if (!hasRole(portalSession, "admin", adminMobile)) {
        return Response.json({ error: "Only Admin Can Update Site Font." }, { status: 401 });
      }

      const siteFont = normalizeSiteFont(payload.siteFont);

      await env.DB.prepare(
        `INSERT INTO app_settings (key, value, updated_at)
         VALUES ('site_font', ?, ?)
         ON CONFLICT(key) DO UPDATE SET
           value = excluded.value,
           updated_at = excluded.updated_at`,
      )
        .bind(siteFont, new Date().toISOString())
        .run();

      return Response.json({ success: true, siteFont });
    }

    if (action === "updateSiteBranding") {
      if (!hasRole(portalSession, "admin", adminMobile)) {
        return Response.json({ error: "Only Admin Can Update Site Branding." }, { status: 401 });
      }

      const rawSiteBranding =
        payload.siteBranding && typeof payload.siteBranding === "object"
          ? (payload.siteBranding as Partial<SiteBranding>)
          : {};

      if (
        typeof rawSiteBranding.iconUrl === "string" &&
        rawSiteBranding.iconUrl.startsWith("data:image/") &&
        rawSiteBranding.iconUrl.length > 900000
      ) {
        return Response.json(
          { error: "Icon Is Too Large. Please Upload The Image Again." },
          { status: 413 },
        );
      }

      const siteBranding = normalizeSiteBranding(rawSiteBranding);

      await env.DB.prepare(
        `INSERT INTO app_settings (key, value, updated_at)
         VALUES ('site_branding', ?, ?)
         ON CONFLICT(key) DO UPDATE SET
           value = excluded.value,
           updated_at = excluded.updated_at`,
      )
        .bind(JSON.stringify(siteBranding), new Date().toISOString())
        .run();

      return Response.json({ success: true, siteBranding });
    }

    const isAdmin =
      hasRole(portalSession, "admin", adminMobile) || clean(payload.pin) === adminPin;

    if (!isAdmin) {
      const customerMobile = clean(payload.customerMobile);
      const paymentStatus = clean(payload.paymentStatus);
      const paymentAmount = Number(payload.paymentAmount);
      const driverMobile = clean(payload.mobile);

      if (
        ["requestWithdrawal", "settleDriverCash", "acceptRide", "driverRideStatus", "driverCancelRide"].includes(action) &&
        !hasRole(portalSession, "driver", driverMobile)
      ) {
        return Response.json(
          { error: "Driver Session Is Invalid Or Expired. Please Sign In Again." },
          { status: 403 },
        );
      }

      if (action === "customerCancelRide") {
        if (!hasRole(portalSession, "customer", customerMobile)) {
          return Response.json(
            { error: "Customer Session Is Invalid Or Expired. Please Sign In Again." },
            { status: 403 },
          );
        }

        const cancelReason = clean(payload.cancelReason);
        const customerBooking = await env.DB.prepare(
          `SELECT booking_id, customer_mobile, driver_mobile, ride_status,
            ride_started_at, ride_completed_at, payment_amount
           FROM bookings
           WHERE booking_id = ? AND customer_mobile = ?
           LIMIT 1`,
        )
          .bind(bookingId, customerMobile)
          .first<{
            booking_id: string;
            customer_mobile: string;
            driver_mobile: string;
            ride_status: string;
            ride_started_at: string;
            ride_completed_at: string;
            payment_amount: number;
          }>();

        if (!customerBooking) {
          return Response.json({ error: "Booking Not Found." }, { status: 404 });
        }

        if (
          customerBooking.driver_mobile ||
          customerBooking.ride_started_at ||
          customerBooking.ride_completed_at ||
          (customerBooking.ride_status || "").includes("Cancel") ||
          (customerBooking.ride_status || "").includes("Complete")
        ) {
          return Response.json(
            { error: "Customer Cancellation Is Available Only Before Driver Assignment." },
            { status: 409 },
          );
        }

        if (!cancelReason) {
          return Response.json(
            { error: "Cancellation Reason Is Required." },
            { status: 400 },
          );
        }

        const cancelResult = await env.DB.prepare(
          `UPDATE bookings
           SET ride_status = 'Ride Cancelled',
               status = 'cancelled',
               cancel_reason = ?,
               refund_status = CASE
                 WHEN payment_amount > 0 THEN 'Pending'
                 ELSE refund_status
               END
           WHERE booking_id = ?
             AND customer_mobile = ?
             AND COALESCE(driver_mobile, '') = ''
             AND COALESCE(ride_started_at, '') = ''
             AND COALESCE(ride_completed_at, '') = ''`,
        )
          .bind(cancelReason, bookingId, customerMobile)
          .run();

        if (Number(cancelResult.meta.changes || 0) < 1) {
          return Response.json(
            { error: "Booking Status Changed Before Cancellation Could Complete." },
            { status: 409 },
          );
        }

        await recordStatusHistory({
          bookingId,
          oldStatus: customerBooking.ride_status,
          newStatus: "Ride Cancelled",
          actorRole: "customer",
          actorMobile: customerMobile,
          reason: cancelReason,
        });
        await recordAuditLog({
          action: "customer_booking_cancelled",
          entityType: "booking",
          entityId: bookingId,
          actorRole: "customer",
          actorMobile: customerMobile,
          details: {
            reason: cancelReason,
            refundPending: Number(customerBooking.payment_amount || 0) > 0,
          },
        });

        return Response.json({ success: true });
      }

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

        await env.DB.prepare(
          `UPDATE drivers
           SET bank_name = ?, bank_account = ?, bank_ifsc = ?, updated_at = ?
           WHERE driver_mobile = ?`,
        )
          .bind(bankName, bankAccount, bankIfsc, now, driverMobile)
          .run();

        return Response.json({ success: true });
      }

      if (action === "settleDriverCash" && driverMobile) {
        const driver = await env.DB.prepare(
          `SELECT driver_name, driver_mobile, vehicle_number
           FROM drivers WHERE driver_mobile = ? LIMIT 1`,
        )
          .bind(driverMobile)
          .first<{ driver_name: string; driver_mobile: string; vehicle_number: string }>();
        const amount = Math.round(Number(payload.amount || 0));
        const settlementMode = clean(payload.settlementMode);
        const referenceNumber = clean(payload.referenceNumber) ||
          `VTC-${Date.now().toString(36).toUpperCase()}`;

        if (!driver) {
          return Response.json({ error: "Driver Profile Not Found." }, { status: 404 });
        }

        if (!amount || amount < 1 || !["earning_adjustment", "admin_transfer"].includes(settlementMode)) {
          return Response.json({ error: "Valid Amount And Settlement Option Are Required." }, { status: 400 });
        }

        const cashInHand = await getDriverCashInHand(driverMobile);
        const pendingCashTransfer = await getPendingDriverCashTransfers(driverMobile);
        const availableCompanyCash = Math.max(0, cashInHand - pendingCashTransfer);
        if (amount > availableCompanyCash) {
          return Response.json(
            { error: `Available Company Cash For Settlement Is ₹${availableCompanyCash}.` },
            { status: 400 },
          );
        }

        if (settlementMode === "earning_adjustment") {
          const availableEarning = await getDriverWithdrawableBalance(driverMobile);
          if (amount > availableEarning) {
            return Response.json(
              { error: `Only ₹${availableEarning} Can Be Adjusted Against Available Earning.` },
              { status: 400 },
            );
          }
        }

        const settlementStatus = settlementMode === "earning_adjustment" ? "Completed" : "Pending";
        await env.DB.prepare(
          `INSERT INTO driver_cash_deposits (
            created_at, driver_name, driver_mobile, vehicle_number, booking_id,
            amount, payment_mode, remarks, receipt_reference, admin_mobile,
            collected_by, settlement_type, settlement_status
          ) VALUES (?, ?, ?, ?, '', ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
          .bind(
            new Date().toISOString(),
            driver.driver_name,
            driverMobile,
            driver.vehicle_number || "",
            amount,
            settlementMode === "earning_adjustment" ? "Cash Retained" : "Cash Transfer",
            settlementMode === "earning_adjustment"
              ? "Adjusted Against Driver Earning"
              : "Driver Marked Cash As Sent To Admin",
            referenceNumber,
            adminMobile,
            driverMobile,
            settlementMode,
            settlementStatus,
          )
          .run();

        await recordAuditLog({
          action: settlementMode === "earning_adjustment" ? "cash_adjusted_to_driver_earning" : "cash_transfer_requested",
          entityType: "driver_cash",
          entityId: referenceNumber,
          actorRole: "driver",
          actorMobile: driverMobile,
          details: { amount, settlementMode, settlementStatus },
        });

        return Response.json({ success: true, referenceNumber, settlementStatus });
      }

      if (customerMobile && paymentStatus === "Complete" && paymentAmount > 0) {
        if (!hasRole(portalSession, "customer", customerMobile)) {
          return Response.json(
            { error: "Online Payment Must Be Verified By Razorpay." },
            { status: 403 },
          );
        }
        const paymentBooking = await env.DB.prepare(
          `SELECT customer_mobile, ride_status, estimated_fare, extra_amount, payment_amount
           FROM bookings
           WHERE booking_id = ? AND customer_mobile = ?
           LIMIT 1`,
        )
          .bind(bookingId, customerMobile)
          .first<{
            customer_mobile: string;
            ride_status: string;
            estimated_fare: number;
            extra_amount: number;
            payment_amount: number;
          }>();

        if (!paymentBooking) {
          return Response.json({ error: "Booking not found." }, { status: 404 });
        }

        const payableTotal = Math.round(Number(paymentBooking.estimated_fare || 0) * 1.05) +
          Number(paymentBooking.extra_amount || 0);
        if (paymentAmount > payableTotal) {
          return Response.json(
            { error: `Payment Cannot Exceed Total Fare ₹${payableTotal}.` },
            { status: 400 },
          );
        }

        const normalizedPaymentStatus =
          paymentAmount >= payableTotal ? "Complete" : "Partially Paid";
        const previousPaymentAmount = Number(paymentBooking.payment_amount || 0);
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
          .bind(normalizedPaymentStatus, paymentAmount, bookingId, customerMobile)
          .run();

        await recordPaymentTransaction({
          bookingId,
          customerMobile,
          amount: Math.max(0, paymentAmount - previousPaymentAmount),
          transactionType: "Customer Online Payment",
          paymentMode: "Razorpay",
          referenceNumber: clean(payload.paymentReference),
          status: normalizedPaymentStatus,
          actorRole: "customer",
          actorMobile: customerMobile,
        });
        await recordAuditLog({
          action: "customer_payment_recorded",
          entityType: "booking",
          entityId: bookingId,
          actorRole: "customer",
          actorMobile: customerMobile,
          details: { paymentAmount, paymentStatus: normalizedPaymentStatus },
        });

        return Response.json({ success: true });
      }

      if (payload.action === "acceptRide" && driverMobile) {
        const driver = await env.DB.prepare(
          `SELECT driver_name, driver_mobile, vehicle_type, vehicle_number,
            approval_status, active_status, license_expiry
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

        if (
          (driver.approval_status && driver.approval_status !== "Approved") ||
          (driver.active_status && driver.active_status !== "Active")
        ) {
          return Response.json(
            { error: "Driver Profile Must Be Approved And Active Before Accepting Rides." },
            { status: 403 },
          );
        }

        if (driver.license_expiry && Date.parse(driver.license_expiry) < Date.now()) {
          return Response.json(
            { error: "Driving Licence Has Expired. Contact Admin." },
            { status: 403 },
          );
        }

        const booking = await env.DB.prepare(
          `SELECT booking_id, pickup_datetime, driver_mobile, vehicle, ride_status
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
            ride_status: string;
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
          driverVehicles.find(
            (vehicle) =>
              vehicle.vehicle_type === booking.vehicle &&
              (!vehicle.approval_status || vehicle.approval_status === "Approved") &&
              (!vehicle.active_status || vehicle.active_status === "Active") &&
              (!vehicle.insurance_expiry || Date.parse(vehicle.insurance_expiry) >= Date.now()),
          ) ||
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

        const conflict = await findNearbyDriverAssignmentConflict(
          bookingId,
          driverMobile,
          booking.pickup_datetime,
        );

        if (conflict) {
          return Response.json(
            {
              error: `Driver Already Assigned For Booking ${conflict.booking_id} On Date/Time ${conflict.pickup_datetime}.`,
            },
            { status: 409 },
          );
        }

        const assignmentResult = await env.DB.prepare(
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

        if (Number(assignmentResult.meta.changes || 0) < 1) {
          return Response.json(
            { error: "This Ride Was Accepted By Another Driver." },
            { status: 409 },
          );
        }

        await recordStatusHistory({
          bookingId,
          oldStatus: booking.ride_status || "Booking Confirmed",
          newStatus: "Driver Assigned",
          actorRole: "driver",
          actorMobile: driverMobile,
          reason: "Ride Accepted By Eligible Driver",
        });
        await recordAssignmentHistory({
          bookingId,
          newDriverMobile: driverMobile,
          newVehicleNumber: assignedVehicle.vehicle_number,
          actorRole: "driver",
          actorMobile: driverMobile,
          reason: "Driver Accepted Available Ride",
        });
        await recordAuditLog({
          action: "ride_accepted",
          entityType: "booking",
          entityId: bookingId,
          actorRole: "driver",
          actorMobile: driverMobile,
          details: { vehicleNumber: assignedVehicle.vehicle_number },
        });

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
            ride_status, customer_mobile, vehicle, vehicle_number, trip_type, estimated_fare,
            payment_amount, billable_km, rate_per_km, rate_per_hour, odometer_start
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
            ride_status: string;
            customer_mobile: string;
            vehicle: string;
            vehicle_number: string;
            trip_type: string;
            estimated_fare: number;
            payment_amount: number;
            billable_km: number;
            rate_per_km: number;
            rate_per_hour: number;
            odometer_start: number;
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

        if (
          rideStatus === "Ride Started" &&
          (assignedBooking.ride_started_at ||
            assignedBooking.ride_status === "Ride Cancelled" ||
            assignedBooking.ride_status === "Ride Complete")
        ) {
          return Response.json(
            { error: "Only An Assigned Active Ride Can Be Started." },
            { status: 409 },
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
        const collectionMode = clean(payload.collectionMode);
        const requestedPaymentAmount = Number(payload.paymentAmount);
        const odometerStart = Math.round(Number(payload.odometerStart || 0));
        const odometerEnd = Math.round(Number(payload.odometerEnd || 0));
        const storedOdometerStart = Math.round(Number(assignedBooking.odometer_start || 0));
        const activeOdometerStart =
          rideStatus === "Ride Started" ? odometerStart : storedOdometerStart;

        if (
          rideStatus === "Ride Started" &&
          (!Number.isFinite(odometerStart) || odometerStart < 0)
        ) {
          return Response.json(
            { error: "Enter start odometer reading before starting ride." },
            { status: 400 },
          );
        }

        if (rideStatus === "Ride Complete") {
          if (!assignedBooking.ride_started_at) {
            return Response.json(
              { error: "Start odometer reading is missing." },
              { status: 400 },
            );
          }

          if (
            !Number.isFinite(odometerEnd) ||
            odometerEnd <= activeOdometerStart
          ) {
            return Response.json(
              { error: "End odometer reading must be greater than start reading." },
              { status: 400 },
            );
          }
        }

        const actualKm =
          rideStatus === "Ride Complete" ? Math.max(0, odometerEnd - activeOdometerStart) : 0;
        const extraKm =
          rideStatus === "Ride Complete"
            ? Math.max(0, actualKm - Math.round(Number(assignedBooking.billable_km || 0)))
            : 0;
        const extraKmAmount =
          rideStatus === "Ride Complete"
            ? Math.round(extraKm * Number(assignedBooking.rate_per_km || 0) * 1.05)
            : 0;
        const includedHours = assignedBooking.trip_type.includes("4 Hr")
          ? 4
          : assignedBooking.trip_type.includes("10 Hr")
            ? 10
            : assignedBooking.trip_type.includes("Local") ||
                assignedBooking.trip_type.includes("8 Hr")
              ? 8
              : assignedBooking.trip_type.includes("Airport")
                ? 4
                : 0;
        const rideStartedAtMs = Date.parse(assignedBooking.ride_started_at || "");
        const rideDurationHours =
          rideStatus === "Ride Complete" && Number.isFinite(rideStartedAtMs)
            ? Math.max(0, (Date.parse(now) - rideStartedAtMs) / (60 * 60 * 1000))
            : 0;
        const extraHours =
          includedHours > 0 ? Math.max(0, Math.ceil(rideDurationHours - includedHours)) : 0;
        const effectiveRate = await getEffectiveBookingRate(assignedBooking.vehicle);
        const ratePerHour = Math.max(
          0,
          Number(assignedBooking.rate_per_hour || effectiveRate.perHour || 0),
        );
        const extraHourAmount = Math.round(extraHours * ratePerHour * 1.05);
        const extraAmount = extraKmAmount + extraHourAmount;
        const totalCollectable = Math.max(
          0,
          totalWithGst + extraAmount - paidAmount,
        );

        if (rideStatus === "Ride Complete" && totalCollectable > 0) {
          const validCollectionMode =
            collectionMode === "cash" || collectionMode === "payment_gateway";
          const collectedFullAmount =
            Number.isFinite(requestedPaymentAmount) &&
            requestedPaymentAmount >= totalWithGst + extraAmount;

          if (!validCollectionMode || !collectedFullAmount) {
            return Response.json(
              {
                error: `Collect Rs ${totalCollectable} Before Completing This Ride.`,
                balanceDue: totalCollectable,
              },
              { status: 400 },
            );
          }
        }

        const completedWithCollection =
          rideStatus === "Ride Complete" && totalCollectable > 0;
        const updatedPaymentAmount = completedWithCollection ? totalWithGst + extraAmount : 0;
        const driverCashCollected =
          completedWithCollection && collectionMode === "cash" ? totalCollectable : 0;

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
               odometer_start = CASE
                 WHEN ? > 0 THEN ?
                 ELSE odometer_start
               END,
               odometer_end = CASE
                 WHEN ? > 0 THEN ?
                 ELSE odometer_end
               END,
               extra_km = CASE
                 WHEN ? > 0 THEN ?
                 ELSE extra_km
               END,
               rate_per_hour = CASE
                 WHEN rate_per_hour <= 0 THEN ?
                 ELSE rate_per_hour
               END,
               extra_hours = CASE
                 WHEN ? > 0 THEN ?
                 ELSE extra_hours
               END,
               extra_hour_amount = CASE
                 WHEN ? > 0 THEN ?
                 ELSE extra_hour_amount
               END,
               extra_amount = CASE
                 WHEN ? > 0 THEN ?
                 ELSE extra_amount
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
            activeOdometerStart,
            activeOdometerStart,
            odometerEnd,
            odometerEnd,
            extraKm,
            extraKm,
            ratePerHour,
            extraHours,
            extraHours,
            extraHourAmount,
            extraHourAmount,
            extraAmount,
            extraAmount,
            now,
            bookingId,
            driverMobile,
          )
          .run();

        await recordStatusHistory({
          bookingId,
          oldStatus: assignedBooking.ride_status,
          newStatus: rideStatus,
          actorRole: "driver",
          actorMobile: driverMobile,
          reason: rideStatus === "Ride Started" ? "Ride Started By Driver" : "Ride Completed By Driver",
          remarks:
            rideStatus === "Ride Complete"
              ? `Odometer ${activeOdometerStart}-${odometerEnd}; Extra KM ${extraKm}; Extra Hours ${extraHours}`
              : `Start Odometer ${activeOdometerStart}`,
        });

        if (completedWithCollection) {
          await recordPaymentTransaction({
            bookingId,
            customerMobile: assignedBooking.customer_mobile,
            driverMobile,
            amount: totalCollectable,
            transactionType:
              collectionMode === "cash" ? "Customer Cash To Driver" : "Customer Online Payment",
            paymentMode: collectionMode === "cash" ? "Cash" : "Razorpay",
            referenceNumber: clean(payload.paymentReference),
            settlementStatus: collectionMode === "cash" ? "Driver Holding" : "Settled Online",
            actorRole: "driver",
            actorMobile: driverMobile,
          });
        }

        await recordAuditLog({
          action: rideStatus === "Ride Started" ? "ride_started" : "ride_completed",
          entityType: "booking",
          entityId: bookingId,
          actorRole: "driver",
          actorMobile: driverMobile,
          details: {
            activeOdometerStart,
            odometerEnd,
            extraKm,
            extraKmAmount,
            rideDurationHours,
            extraHours,
            ratePerHour,
            extraHourAmount,
            extraAmount,
            totalCollectable,
          },
        });

        if (rideStatus === "Ride Complete") {
          const updatedBooking = await getBookingById(bookingId);
          await sendCustomerBookingEmail(updatedBooking, "ride_complete");
        }

        return Response.json({ success: true });
      }

      if (payload.action === "driverCancelRide" && driverMobile) {
        const cancelReason = clean(payload.cancelReason);
        const assignedBooking = await env.DB.prepare(
          `SELECT booking_id, ride_status, ride_started_at, ride_completed_at
           FROM bookings
           WHERE booking_id = ? AND driver_mobile = ?
           LIMIT 1`,
        )
          .bind(bookingId, driverMobile)
          .first<{
            booking_id: string;
            ride_status: string;
            ride_started_at: string;
            ride_completed_at: string;
          }>();

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

        if (assignedBooking.ride_started_at) {
          return Response.json(
            { error: "Started Ride Can Only Be Cancelled By Admin." },
            { status: 409 },
          );
        }

        if (!cancelReason) {
          return Response.json(
            { error: "Cancellation Reason Is Required." },
            { status: 400 },
          );
        }

        await env.DB.prepare(
          `UPDATE bookings
           SET ride_status = 'Ride Cancelled',
               cancel_reason = ?
           WHERE booking_id = ? AND driver_mobile = ?`,
        )
          .bind(cancelReason, bookingId, driverMobile)
          .run();

        await recordStatusHistory({
          bookingId,
          oldStatus: assignedBooking.ride_status,
          newStatus: "Ride Cancelled",
          actorRole: "driver",
          actorMobile: driverMobile,
          reason: cancelReason,
        });
        await recordAuditLog({
          action: "ride_cancelled",
          entityType: "booking",
          entityId: bookingId,
          actorRole: "driver",
          actorMobile: driverMobile,
          details: { reason: cancelReason },
        });

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

      await recordAuditLog({
        action: `withdrawal_${withdrawalStatus.toLowerCase()}`,
        entityType: "driver_withdrawal",
        entityId: String(withdrawalId),
        actorRole: "admin",
        actorMobile: adminMobile,
      });

      return Response.json({ success: true });
    }

    if (action === "updateCashSettlement") {
      const settlementId = Number(payload.settlementId || 0);
      const settlementStatus = clean(payload.settlementStatus);

      if (!settlementId || !["Completed", "Rejected"].includes(settlementStatus)) {
        return Response.json({ error: "Valid Settlement And Status Are Required." }, { status: 400 });
      }

      const settlement = await env.DB.prepare(
        `SELECT id, driver_mobile, amount, settlement_type, settlement_status
         FROM driver_cash_deposits WHERE id = ? LIMIT 1`,
      )
        .bind(settlementId)
        .first<{ id: number; driver_mobile: string; amount: number; settlement_type: string; settlement_status: string }>();

      if (!settlement || settlement.settlement_type !== "admin_transfer" || settlement.settlement_status !== "Pending") {
        return Response.json({ error: "Pending Driver Cash Transfer Not Found." }, { status: 404 });
      }

      if (settlementStatus === "Completed") {
        const cashInHand = await getDriverCashInHand(settlement.driver_mobile);
        if (Number(settlement.amount || 0) > cashInHand) {
          return Response.json({ error: `Driver Cash In Hand Is Only ₹${cashInHand}.` }, { status: 409 });
        }
      }

      await env.DB.prepare(
        `UPDATE driver_cash_deposits SET settlement_status = ? WHERE id = ?`,
      )
        .bind(settlementStatus, settlementId)
        .run();
      await recordAuditLog({
        action: settlementStatus === "Completed" ? "cash_transfer_approved" : "cash_transfer_rejected",
        entityType: "driver_cash",
        entityId: String(settlementId),
        actorRole: "admin",
        actorMobile: adminMobile,
        details: { driverMobile: settlement.driver_mobile, amount: settlement.amount },
      });

      return Response.json({ success: true });
    }

    if (action === "recordCashDeposit") {
      const driverMobile = clean(payload.driverMobile);
      const amount = Math.round(Number(payload.amount || 0));
      const vehicleNumber = clean(payload.vehicleNumber);
      const bookingReference = clean(payload.bookingReference || payload.bookingId);
      const paymentMode = clean(payload.collectionMode) || "Cash";
      const remarks = clean(payload.remarks);
      const receiptReference = clean(payload.referenceNumber) ||
        `VTC-${Date.now().toString(36).toUpperCase()}`;

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
          created_at, driver_name, driver_mobile, vehicle_number, booking_id,
          amount, payment_mode, remarks, receipt_reference, admin_mobile, collected_by,
          settlement_type, settlement_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'admin_deposit', 'Completed')`,
      )
        .bind(
          new Date().toISOString(),
          driver.driver_name,
          driverMobile,
          vehicleNumber,
          bookingReference,
          amount,
          paymentMode,
          remarks,
          receiptReference,
          adminMobile,
          adminMobile,
        )
        .run();

      await recordPaymentTransaction({
        bookingId: bookingReference,
        driverMobile,
        amount,
        transactionType: "Driver Cash Handover To Admin",
        paymentMode,
        referenceNumber: receiptReference,
        settlementStatus: "Settled With Admin",
        actorRole: "admin",
        actorMobile: adminMobile,
      });
      await recordAuditLog({
        action: "driver_cash_received",
        entityType: "driver",
        entityId: driverMobile,
        actorRole: "admin",
        actorMobile: adminMobile,
        details: { amount, vehicleNumber, bookingReference, receiptReference },
      });

      return Response.json({ success: true, receiptReference });
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
    const requestedRefundDriverMobile = clean(payload.refundDriverMobile);
    const requestedRefundDriverName = clean(payload.refundDriverName);
    const requestedCollectionMode = clean(payload.collectionMode);
    const requestedCashCollected = Math.max(
      0,
      Math.round(Number(payload.cashCollected || 0)),
    );
    const requestedRefundAmount = Math.max(
      0,
      Math.round(Number(payload.refundAmount || 0)),
    );

    if (requestedCashCollected > 0 && !requestedDriverMobile) {
      return Response.json(
        { error: "Select Driver Who Received Cash." },
        { status: 400 },
      );
    }

    if (requestedRefundAmount > 0 && requestedCollectionMode === "refund_driver_cash" && !requestedRefundDriverMobile) {
      return Response.json(
        { error: "Select Driver Who Paid Refund." },
        { status: 400 },
      );
    }

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
      const conflict = await findNearbyDriverAssignmentConflict(
        bookingId,
        requestedDriverMobile,
        existingBooking.pickup_datetime,
      );

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
           refund_amount = CASE
             WHEN ? > 0 THEN refund_amount + ?
             ELSE refund_amount
           END,
           payment_status = COALESCE(NULLIF(?, ''), payment_status),
           payment_amount = COALESCE(?, payment_amount),
           vehicle = COALESCE(NULLIF(?, ''), vehicle),
           driver_name = COALESCE(NULLIF(?, ''), driver_name),
           driver_mobile = COALESCE(NULLIF(?, ''), driver_mobile),
           vehicle_number = COALESCE(NULLIF(?, ''), vehicle_number),
           payment_collection_mode = COALESCE(NULLIF(?, ''), payment_collection_mode),
           driver_cash_collected = CASE
             WHEN ? > 0 THEN driver_cash_collected + ?
             ELSE driver_cash_collected
           END,
           refund_collection_mode = CASE
             WHEN ? LIKE 'refund_%' THEN ?
             ELSE refund_collection_mode
           END,
           refund_driver_name = CASE
             WHEN ? = 'refund_driver_cash' THEN ?
             ELSE refund_driver_name
           END,
           refund_driver_mobile = CASE
             WHEN ? = 'refund_driver_cash' THEN ?
             ELSE refund_driver_mobile
           END,
           driver_cash_refunded = CASE
             WHEN ? > 0 AND ? = 'refund_driver_cash' THEN driver_cash_refunded + ?
             ELSE driver_cash_refunded
           END,
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
        requestedRefundAmount,
        requestedRefundAmount,
        clean(payload.paymentStatus),
        Number.isFinite(Number(payload.paymentAmount))
          ? Number(payload.paymentAmount)
          : null,
        clean(payload.vehicle),
        requestedDriverName,
        requestedDriverMobile,
        requestedVehicleNumber,
        requestedCollectionMode,
        requestedCashCollected,
        requestedCashCollected,
        requestedCollectionMode,
        requestedCollectionMode,
        requestedCollectionMode,
        requestedRefundDriverName,
        requestedCollectionMode,
        requestedRefundDriverMobile,
        requestedRefundAmount,
        requestedCollectionMode,
        requestedRefundAmount,
        clean(payload.cancelReason),
        rideStartedAt,
        rideStartedAt,
        rideCompletedAt,
        rideCompletedAt,
        bookingId,
      )
      .run();

    const resultingRideStatus = requestedRideStatus || existingBooking.ride_status;
    const resultingDriverMobile = requestedDriverMobile || existingBooking.driver_mobile;
    const resultingVehicleNumber = requestedVehicleNumber || existingBooking.vehicle_number;

    await recordStatusHistory({
      bookingId,
      oldStatus: existingBooking.ride_status,
      newStatus: resultingRideStatus,
      actorRole: "admin",
      actorMobile: adminMobile,
      reason: clean(payload.cancelReason) || "Admin Booking Update",
      remarks: clean(payload.remarks),
    });
    await recordAssignmentHistory({
      bookingId,
      oldDriverMobile: existingBooking.driver_mobile,
      newDriverMobile: resultingDriverMobile,
      oldVehicleNumber: existingBooking.vehicle_number,
      newVehicleNumber: resultingVehicleNumber,
      actorRole: "admin",
      actorMobile: adminMobile,
      reason: "Admin Assignment Update",
    });

    if (requestedCashCollected > 0) {
      await recordPaymentTransaction({
        bookingId,
        driverMobile: requestedDriverMobile,
        amount: requestedCashCollected,
        transactionType: "Customer Cash To Driver",
        paymentMode: "Cash",
        referenceNumber: clean(payload.paymentReference),
        settlementStatus: "Driver Holding",
        actorRole: "admin",
        actorMobile: adminMobile,
      });
    } else if (
      Number.isFinite(Number(payload.paymentAmount)) &&
      Number(payload.paymentAmount) > Number(existingBooking.payment_amount || 0)
    ) {
      await recordPaymentTransaction({
        bookingId,
        amount: Number(payload.paymentAmount) - Number(existingBooking.payment_amount || 0),
        transactionType: "Customer Online Payment",
        paymentMode: requestedCollectionMode || "Online",
        referenceNumber: clean(payload.paymentReference),
        actorRole: "admin",
        actorMobile: adminMobile,
      });
    }

    if (requestedRefundAmount > 0) {
      await recordPaymentTransaction({
        bookingId,
        driverMobile: requestedRefundDriverMobile,
        amount: requestedRefundAmount,
        transactionType: "Customer Refund",
        paymentMode:
          requestedCollectionMode === "refund_driver_cash" ? "Driver Cash" : "Online",
        referenceNumber: clean(payload.paymentReference),
        settlementStatus: "Refunded",
        actorRole: "admin",
        actorMobile: adminMobile,
      });
    }

    await recordAuditLog({
      action: "admin_booking_updated",
      entityType: "booking",
      entityId: bookingId,
      actorRole: "admin",
      actorMobile: adminMobile,
      details: {
        rideStatus: resultingRideStatus,
        driverMobile: resultingDriverMobile,
        vehicleNumber: resultingVehicleNumber,
        paymentAmount: payload.paymentAmount,
        refundAmount: requestedRefundAmount,
      },
    });

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
    const bookingId = clean(payload.bookingId);

    await ensureBookingsTable();
    const portalSession = await getPortalSession(request);
    const isAdmin =
      hasRole(portalSession, "admin", adminMobile) || clean(payload.pin) === adminPin;

    if (!isAdmin) {
      return Response.json({ error: "Invalid login mobile." }, { status: 401 });
    }

    if (!bookingId) {
      return Response.json({ error: "Booking ID is required." }, { status: 400 });
    }

    const bookingToDelete = await getBookingById(bookingId);
    await recordAuditLog({
      action: "booking_deleted",
      entityType: "booking",
      entityId: bookingId,
      actorRole: "admin",
      actorMobile: adminMobile,
      details: bookingToDelete
        ? { customerMobile: bookingToDelete.customer_mobile }
        : {},
    });
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
    const portalSession = await getPortalSession(request);

    if (action === "logout") {
      const sessionToken = getCookieValue(request, "vt_portal_session");
      if (sessionToken) {
        await env.DB.prepare("DELETE FROM portal_sessions WHERE token = ?")
          .bind(sessionToken)
          .run();
      }

      return Response.json(
        { success: true },
        {
          headers: {
            ...noStoreHeaders,
            "Set-Cookie": "vt_portal_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0",
          },
        },
      );
    }

    if (action === "saveDriver") {
      if (!hasRole(portalSession, "admin", adminMobile)) {
        return Response.json(
          { error: "Only Admin Can Register Driver And Vehicle." },
          { status: 401 },
        );
      }

      const driverName = clean(payload.name);
      const driverMobile = clean(payload.mobile);
      const vehicleType = clean(payload.vehicle);
      const vehicleNumber = clean(payload.vehicleNumber);
      const now = new Date().toISOString();
      const accountType = clean(payload.accountType) || "Driver-Cum-Owner";
      const approvalStatus = clean(payload.approvalStatus) || "Approved";
      const activeStatus = clean(payload.activeStatus) || "Active";

      if (!driverName || !driverMobile || !vehicleType || !vehicleNumber) {
        return Response.json(
          { error: "Driver Name, Mobile, Vehicle Type And Vehicle Number Are Required." },
          { status: 400 },
        );
      }

      await env.DB.prepare(
        `INSERT INTO drivers (
          driver_mobile, driver_name, vehicle_type, vehicle_number,
          email, address, emergency_contact, driving_license, license_expiry,
          identity_document, address_proof, police_verification, profile_photo,
          account_type, approval_status, active_status, joining_date, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(driver_mobile) DO UPDATE SET
          driver_name = excluded.driver_name,
          vehicle_type = excluded.vehicle_type,
          vehicle_number = excluded.vehicle_number,
          email = excluded.email,
          address = excluded.address,
          emergency_contact = excluded.emergency_contact,
          driving_license = excluded.driving_license,
          license_expiry = excluded.license_expiry,
          identity_document = excluded.identity_document,
          address_proof = excluded.address_proof,
          police_verification = excluded.police_verification,
          profile_photo = excluded.profile_photo,
          account_type = excluded.account_type,
          approval_status = excluded.approval_status,
          active_status = excluded.active_status,
          joining_date = excluded.joining_date,
          updated_at = excluded.updated_at`,
      )
        .bind(
          driverMobile,
          driverName,
          vehicleType,
          vehicleNumber,
          clean(payload.email).toLowerCase(),
          clean(payload.address),
          clean(payload.emergencyContact),
          clean(payload.drivingLicense),
          clean(payload.licenseExpiry),
          clean(payload.identityDocument),
          clean(payload.addressProof),
          clean(payload.policeVerification),
          clean(payload.profilePhoto),
          accountType,
          approvalStatus,
          activeStatus,
          clean(payload.joiningDate) || now.slice(0, 10),
          now,
        )
        .run();

      await env.DB.prepare(
        `INSERT INTO driver_vehicles (
          vehicle_number, driver_mobile, driver_name, vehicle_type, owner_mobile,
          seating_capacity, fuel_type, registration_certificate, insurance,
          insurance_expiry, permit, fitness_certificate, puc, vehicle_photo,
          approval_status, active_status, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(vehicle_number) DO UPDATE SET
          driver_mobile = excluded.driver_mobile,
          driver_name = excluded.driver_name,
          vehicle_type = excluded.vehicle_type,
          owner_mobile = excluded.owner_mobile,
          seating_capacity = excluded.seating_capacity,
          fuel_type = excluded.fuel_type,
          registration_certificate = excluded.registration_certificate,
          insurance = excluded.insurance,
          insurance_expiry = excluded.insurance_expiry,
          permit = excluded.permit,
          fitness_certificate = excluded.fitness_certificate,
          puc = excluded.puc,
          vehicle_photo = excluded.vehicle_photo,
          approval_status = excluded.approval_status,
          active_status = excluded.active_status,
          updated_at = excluded.updated_at`,
      )
        .bind(
          vehicleNumber,
          driverMobile,
          driverName,
          vehicleType,
          clean(payload.ownerMobile) || driverMobile,
          clean(payload.seatingCapacity),
          clean(payload.fuelType),
          clean(payload.registrationCertificate),
          clean(payload.insurance),
          clean(payload.insuranceExpiry),
          clean(payload.permit),
          clean(payload.fitnessCertificate),
          clean(payload.puc),
          clean(payload.vehiclePhoto),
          approvalStatus,
          activeStatus,
          now,
        )
        .run();

      await recordAuditLog({
        action: "driver_vehicle_onboarded",
        entityType: "driver",
        entityId: driverMobile,
        actorRole: "admin",
        actorMobile: adminMobile,
        details: { vehicleType, vehicleNumber, accountType, approvalStatus, activeStatus },
      });

      return Response.json({ success: true });
    }

    if (action === "updateDriverVehicle") {
      if (!hasRole(portalSession, "admin", adminMobile)) {
        return Response.json(
          { error: "Only Admin Can Update Driver And Vehicle." },
          { status: 401 },
        );
      }

      const originalVehicleNumber = clean(payload.originalVehicleNumber);
      const driverName = clean(payload.name);
      const driverMobile = clean(payload.mobile);
      const vehicleType = clean(payload.vehicle);
      const vehicleNumber = clean(payload.vehicleNumber);

      if (!originalVehicleNumber || !driverName || !driverMobile || !vehicleType || !vehicleNumber) {
        return Response.json(
          { error: "Original Vehicle, Driver Name, Mobile, Vehicle Type And Vehicle Number Are Required." },
          { status: 400 },
        );
      }

      const existingVehicle = await env.DB.prepare(
        `SELECT vehicle_number, driver_mobile
         FROM driver_vehicles
         WHERE vehicle_number = ?
         LIMIT 1`,
      )
        .bind(originalVehicleNumber)
        .first<{ vehicle_number: string; driver_mobile: string }>();

      if (!existingVehicle) {
        return Response.json({ error: "Registered Vehicle Not Found." }, { status: 404 });
      }

      if (vehicleNumber !== originalVehicleNumber) {
        const duplicateVehicle = await env.DB.prepare(
          `SELECT vehicle_number
           FROM driver_vehicles
           WHERE vehicle_number = ?
           LIMIT 1`,
        )
          .bind(vehicleNumber)
          .first<{ vehicle_number: string }>();

        if (duplicateVehicle) {
          return Response.json(
            { error: "This Vehicle Number Is Already Registered." },
            { status: 409 },
          );
        }
      }

      const now = new Date().toISOString();
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
        .bind(driverMobile, driverName, vehicleType, vehicleNumber, now)
        .run();

      await env.DB.prepare(
        `UPDATE driver_vehicles
         SET vehicle_number = ?,
             driver_mobile = ?,
             driver_name = ?,
             vehicle_type = ?,
             updated_at = ?
         WHERE vehicle_number = ?`,
      )
        .bind(vehicleNumber, driverMobile, driverName, vehicleType, now, originalVehicleNumber)
        .run();

      await env.DB.prepare(
        `UPDATE drivers SET
          email = COALESCE(NULLIF(?, ''), email),
          address = COALESCE(NULLIF(?, ''), address),
          emergency_contact = COALESCE(NULLIF(?, ''), emergency_contact),
          driving_license = COALESCE(NULLIF(?, ''), driving_license),
          license_expiry = COALESCE(NULLIF(?, ''), license_expiry),
          identity_document = COALESCE(NULLIF(?, ''), identity_document),
          address_proof = COALESCE(NULLIF(?, ''), address_proof),
          police_verification = COALESCE(NULLIF(?, ''), police_verification),
          profile_photo = COALESCE(NULLIF(?, ''), profile_photo),
          account_type = COALESCE(NULLIF(?, ''), account_type),
          approval_status = COALESCE(NULLIF(?, ''), approval_status),
          active_status = COALESCE(NULLIF(?, ''), active_status),
          joining_date = COALESCE(NULLIF(?, ''), joining_date)
         WHERE driver_mobile = ?`,
      )
        .bind(
          clean(payload.email).toLowerCase(),
          clean(payload.address),
          clean(payload.emergencyContact),
          clean(payload.drivingLicense),
          clean(payload.licenseExpiry),
          clean(payload.identityDocument),
          clean(payload.addressProof),
          clean(payload.policeVerification),
          clean(payload.profilePhoto),
          clean(payload.accountType),
          clean(payload.approvalStatus),
          clean(payload.activeStatus),
          clean(payload.joiningDate),
          driverMobile,
        )
        .run();

      await env.DB.prepare(
        `UPDATE driver_vehicles SET
          owner_mobile = COALESCE(NULLIF(?, ''), owner_mobile),
          seating_capacity = COALESCE(NULLIF(?, ''), seating_capacity),
          fuel_type = COALESCE(NULLIF(?, ''), fuel_type),
          registration_certificate = COALESCE(NULLIF(?, ''), registration_certificate),
          insurance = COALESCE(NULLIF(?, ''), insurance),
          insurance_expiry = COALESCE(NULLIF(?, ''), insurance_expiry),
          permit = COALESCE(NULLIF(?, ''), permit),
          fitness_certificate = COALESCE(NULLIF(?, ''), fitness_certificate),
          puc = COALESCE(NULLIF(?, ''), puc),
          vehicle_photo = COALESCE(NULLIF(?, ''), vehicle_photo),
          approval_status = COALESCE(NULLIF(?, ''), approval_status),
          active_status = COALESCE(NULLIF(?, ''), active_status)
         WHERE vehicle_number = ?`,
      )
        .bind(
          clean(payload.ownerMobile),
          clean(payload.seatingCapacity),
          clean(payload.fuelType),
          clean(payload.registrationCertificate),
          clean(payload.insurance),
          clean(payload.insuranceExpiry),
          clean(payload.permit),
          clean(payload.fitnessCertificate),
          clean(payload.puc),
          clean(payload.vehiclePhoto),
          clean(payload.approvalStatus),
          clean(payload.activeStatus),
          vehicleNumber,
        )
        .run();

      await recordAuditLog({
        action: "driver_vehicle_updated",
        entityType: "vehicle",
        entityId: vehicleNumber,
        actorRole: "admin",
        actorMobile: adminMobile,
        details: { originalVehicleNumber, driverMobile, driverName, vehicleType },
      });

      const remainingOldDriverVehicles = await env.DB.prepare(
        `SELECT COUNT(*) AS total
         FROM driver_vehicles
         WHERE driver_mobile = ?`,
      )
        .bind(existingVehicle.driver_mobile)
        .first<{ total: number }>();

      if (existingVehicle.driver_mobile !== driverMobile && !Number(remainingOldDriverVehicles?.total || 0)) {
        await env.DB.prepare("DELETE FROM drivers WHERE driver_mobile = ?")
          .bind(existingVehicle.driver_mobile)
          .run();
      }

      return Response.json({ success: true });
    }

    if (action === "deleteDriverVehicle") {
      if (!hasRole(portalSession, "admin", adminMobile)) {
        return Response.json(
          { error: "Only Admin Can Delete Driver And Vehicle." },
          { status: 401 },
        );
      }

      const vehicleNumber = clean(payload.vehicleNumber || payload.originalVehicleNumber);

      if (!vehicleNumber) {
        return Response.json({ error: "Vehicle Number Is Required." }, { status: 400 });
      }

      const existingVehicle = await env.DB.prepare(
        `SELECT vehicle_number, driver_mobile
         FROM driver_vehicles
         WHERE vehicle_number = ?
         LIMIT 1`,
      )
        .bind(vehicleNumber)
        .first<{ vehicle_number: string; driver_mobile: string }>();

      if (!existingVehicle) {
        return Response.json({ error: "Registered Vehicle Not Found." }, { status: 404 });
      }

      const activeRide = await env.DB.prepare(
        `SELECT booking_id
         FROM bookings
         WHERE vehicle_number = ?
           AND ride_status = 'Ride Started'
         LIMIT 1`,
      )
        .bind(vehicleNumber)
        .first<{ booking_id: string }>();

      if (activeRide) {
        return Response.json(
          { error: `Vehicle Is Engaged In Active Ride ${activeRide.booking_id}. Complete Or Cancel Ride Before Delete.` },
          { status: 409 },
        );
      }

      await env.DB.prepare("DELETE FROM driver_vehicles WHERE vehicle_number = ?")
        .bind(vehicleNumber)
        .run();

      await recordAuditLog({
        action: "driver_vehicle_deleted",
        entityType: "vehicle",
        entityId: vehicleNumber,
        actorRole: "admin",
        actorMobile: adminMobile,
        details: { driverMobile: existingVehicle.driver_mobile },
      });

      const remainingVehicle = await env.DB.prepare(
        `SELECT vehicle_number, vehicle_type
         FROM driver_vehicles
         WHERE driver_mobile = ?
         ORDER BY updated_at DESC
         LIMIT 1`,
      )
        .bind(existingVehicle.driver_mobile)
        .first<{ vehicle_number: string; vehicle_type: string }>();

      if (remainingVehicle) {
        await env.DB.prepare(
          `UPDATE drivers
           SET vehicle_number = ?, vehicle_type = ?, updated_at = ?
           WHERE driver_mobile = ?`,
        )
          .bind(
            remainingVehicle.vehicle_number,
            remainingVehicle.vehicle_type,
            new Date().toISOString(),
            existingVehicle.driver_mobile,
          )
          .run();
      } else {
        await env.DB.prepare("DELETE FROM drivers WHERE driver_mobile = ?")
          .bind(existingVehicle.driver_mobile)
          .run();
      }

      return Response.json({ success: true });
    }

    const tripType = clean(payload.tripType);
    const vehicle = clean(payload.vehicle);
    const startPoint = clean(payload.startPoint) || headOffice;
    const destination = clean(payload.destination);
    const date = clean(payload.date);
    const returnDate = clean(payload.returnDate);
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

    if (tripType === "Round Trip" && !returnDate) {
      return Response.json(
        { error: "Please select return date for round trip." },
        { status: 400 },
      );
    }

    const adjustedRate = await getEffectiveBookingRate(vehicle);
    const isRoundTrip = tripType === "Round Trip";
    const isLocal = tripType.includes("Local");
    const isAirport = tripType.includes("Airport");
    const localPackageKm = tripType.includes("10 Hr")
      ? 100
      : tripType.includes("4 Hr")
        ? 45
        : 90;
    const localPackageRate = tripType.includes("10 Hr")
      ? adjustedRate.local10hr
      : tripType.includes("4 Hr")
        ? adjustedRate.local4hr
        : adjustedRate.local8hr;
    const billableKm =
      isLocal
        ? Math.max(oneSideKm, localPackageKm)
        : isAirport
        ? Math.max(oneSideKm, 40)
        : packageType === "perKm"
        ? isRoundTrip
          ? oneSideKm * 2
          : oneSideKm
        : packageType === "halfDay"
          ? 40
          : 80;
    const estimatedFare =
      isLocal
        ? Math.round(
            localPackageRate +
              Math.max(0, billableKm - localPackageKm) * adjustedRate.perKm,
          )
        : isAirport || packageType === "perKm"
        ? Math.round(billableKm * adjustedRate.perKm)
        : adjustedRate[packageType];
    const createdAt = new Date().toISOString();
    const initialRideStatus = "Booking Confirmed";

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
        rate_per_hour,
        estimated_fare,
        pickup_datetime,
        return_date,
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        adjustedRate.perKm,
        adjustedRate.perHour,
        estimatedFare,
        date,
        tripType === "Round Trip" ? returnDate : "",
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

    await recordStatusHistory({
      bookingId,
      oldStatus: "",
      newStatus: initialRideStatus,
      actorRole: "customer",
      actorMobile: mobile,
      reason: "Website Booking Created",
    });
    await recordAuditLog({
      action: "booking_created",
      entityType: "booking",
      entityId: bookingId,
      actorRole: "customer",
      actorMobile: mobile,
      details: { tripType, vehicle, pickupDatetime: date, estimatedFare },
    });

    const booking = {
      bookingId,
      status: "pending",
      startPoint,
      destination,
      oneSideKm,
      billableKm,
      ratePerKm: adjustedRate.perKm,
      ratePerHour: adjustedRate.perHour,
      packageType,
      returnDate: tripType === "Round Trip" ? returnDate : "",
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
      ratePerKm: adjustedRate.perKm,
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
    ...(booking.return_date ? [["Return Date", booking.return_date]] : []),
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
