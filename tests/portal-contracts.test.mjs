import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), "utf8");
}

test("keeps the three role portals connected to real booking data", async () => {
  const page = await source("app/page.tsx");

  assert.match(page, /renderRolePortalDashboard/);
  assert.match(page, /activeDriverTab/);
  assert.match(page, /activeCustomerTab/);
  assert.match(page, /portalBookings\.filter/);
  assert.match(page, /renderPortalBookingCard/);
  assert.match(page, /My Driver Ledger/);
  assert.match(page, /Payments And Invoices/);
  assert.match(page, /payPortalBooking/);
  assert.match(page, /cancelCustomerBooking/);
  assert.match(page, /logoutPortal/);
  assert.match(page, /optimizeBrandingImage/);
  assert.match(page, /canvas\.toDataURL\("image\/webp"/);
  assert.match(page, /icon: <Plane \/>/);
  assert.match(page, /icon: <Building2 \/>/);
  assert.doesNotMatch(page, /Total Revenue[\s\S]{0,80}12,45,600/);
});

test("persists audit, payment, assignment and status history without replacing booking tables", async () => {
  const bookingsApi = await source("app/api/bookings/route.ts");

  for (const table of [
    "portal_sessions",
    "booking_status_history",
    "assignment_history",
    "payment_transactions",
    "audit_logs",
    "payment_gateway_orders",
  ]) {
    assert.match(bookingsApi, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
  }

  assert.match(bookingsApi, /assignmentResult\.meta\.changes/);
  assert.match(bookingsApi, /recordStatusHistory/);
  assert.match(bookingsApi, /recordAssignmentHistory/);
  assert.match(bookingsApi, /recordPaymentTransaction/);
  assert.match(bookingsApi, /SameSite=Strict/);
  assert.match(bookingsApi, /customerCancelRide/);
  assert.match(bookingsApi, /Icon Is Too Large\. Please Upload The Image Again\./);
  assert.doesNotMatch(bookingsApi, /iconUrl\.slice\(0, 900000\)/);
  assert.match(bookingsApi, /DELETE FROM portal_sessions WHERE token/);
  assert.doesNotMatch(bookingsApi, /DROP TABLE/i);
});

test("automates company cash held by drivers and earning settlements", async () => {
  const [bookingsApi, page] = await Promise.all([
    source("app/api/bookings/route.ts"),
    source("app/page.tsx"),
  ]);

  assert.match(bookingsApi, /settlement_type TEXT NOT NULL DEFAULT 'admin_deposit'/);
  assert.match(bookingsApi, /settlement_status TEXT NOT NULL DEFAULT 'Completed'/);
  assert.match(bookingsApi, /action === "settleDriverCash"/);
  assert.match(bookingsApi, /action === "updateCashSettlement"/);
  assert.match(bookingsApi, /earning\.availableEarning/);
  assert.match(bookingsApi, /settlement_status = 'Completed'/);
  assert.match(bookingsApi, /getDriverCashBalances/);
  assert.match(bookingsApi, /current\.cash_amount \+= event\.amount/);
  assert.match(bookingsApi, /current\.cash_amount = Math\.max\(0, current\.cash_amount - event\.amount\)/);
  assert.match(bookingsApi, /Only A Driver Registered For.*Can Start Or Complete This Ride/);
  assert.match(page, /Company Cash With Drivers/);
  assert.match(page, /Keep Against Earning/);
  assert.match(page, /Send To Admin/);
  assert.match(page, /Awaiting Approval/);
  assert.match(page, /loadDashboard\(\{ silent: true \}\)/);
});

test("verifies Razorpay signatures on the server before updating payment", async () => {
  const [orderApi, verifyApi] = await Promise.all([
    source("app/api/razorpay-order/route.ts"),
    source("app/api/razorpay-verify/route.ts"),
  ]);

  assert.match(orderApi, /payment_gateway_orders/);
  assert.match(orderApi, /pending booking fare/i);
  assert.match(verifyApi, /HMAC/);
  assert.match(verifyApi, /SHA-256/);
  assert.match(verifyApi, /razorpaySignature/);
  assert.match(verifyApi, /crypto\.subtle\.sign/);
  assert.match(verifyApi, /safeEqual\(expectedSignature, signature\)/);
  assert.match(verifyApi, /payment_transactions/);
  assert.match(verifyApi, /isInitialBookingPayment \? "booking_confirmed" : "payment_received"/);
  assert.match(verifyApi, /bookingId\.startsWith\("PENDING-"\)/);
  assert.match(verifyApi, /ride_status = CASE WHEN \? THEN 'Booking Confirmed'/);
});

test("allows only admin-approved normal Razorpay refunds", async () => {
  const [refundApi, page] = await Promise.all([
    source("app/api/razorpay-refund/route.ts"),
    source("app/page.tsx"),
  ]);

  assert.match(refundApi, /Only Admin Can Initiate Refund/);
  assert.match(refundApi, /X-Refund-Idempotency/);
  assert.match(refundApi, /speed: "normal"/);
  assert.match(refundApi, /payment_gateway_refunds/);
  assert.match(refundApi, /razorpay_refund_initiated/);
  assert.match(refundApi, /sendBookingStatusEmail\(updatedBooking, "refund_updated"\)/);
  assert.match(page, /Approve Razorpay Refund/);
  assert.match(page, /\/api\/razorpay-refund/);
});

test("emails every important booking lifecycle update to customer and admin", async () => {
  const [bookingsApi, emailService, envExample] = await Promise.all([
    source("app/api/bookings/route.ts"),
    source("app/lib/booking-email.ts"),
    source(".env.example"),
  ]);

  for (const event of [
    "booking_confirmed",
    "booking_updated",
    "payment_received",
    "driver_assigned",
    "ride_started",
    "ride_cancelled",
    "refund_updated",
    "ride_complete",
  ]) {
    assert.match(emailService, new RegExp(`\\| "${event}"|${event}:`));
  }

  assert.match(bookingsApi, /sendBookingStatusEmail\(updatedBooking, "ride_cancelled"\)/);
  assert.match(bookingsApi, /rideStatus === "Ride Complete" \? "ride_complete" : "ride_started"/);
  assert.match(emailService, /BOOKING_ADMIN_EMAIL/);
  assert.match(emailService, /bcc: adminEmail/);
  assert.match(emailService, /Current Total Fare/);
  assert.match(emailService, /Refund Status/);
  assert.match(envExample, /BOOKING_ADMIN_EMAIL=cricketsikho@gmail\.com/);
});

test("persists per-hour vehicle fares and adds excess ride time to final fare", async () => {
  const [bookingsApi, page, priceChart] = await Promise.all([
    source("app/api/bookings/route.ts"),
    source("app/page.tsx"),
    source("app/price-chart/page.tsx"),
  ]);

  assert.match(bookingsApi, /rate_per_hour INTEGER NOT NULL DEFAULT 0/);
  assert.match(bookingsApi, /extra_hours INTEGER NOT NULL DEFAULT 0/);
  assert.match(bookingsApi, /extraHourAmount = Math\.round\(extraHours \* ratePerHour \* 1\.05\)/);
  assert.match(bookingsApi, /const extraAmount = extraKmAmount \+ extraHourAmount/);
  assert.match(page, /"perHour"/);
  assert.match(page, /Per Hour After Package/);
  assert.match(priceChart, /item\.rates\.perHour/);
});

test("ships responsive role dashboard styling and all public policy pages", async () => {
  const css = await source("app/globals.css");
  const [homePage, publicChrome, aboutPage] = await Promise.all([
    source("app/page.tsx"),
    source("app/components/PublicChrome.tsx"),
    source("app/about-us/page.tsx"),
  ]);

  assert.match(css, /\.role-dashboard-shell/);
  assert.match(css, /\.role-dashboard-sidebar/);
  assert.match(css, /@media \(max-width: 760px\)/);
  assert.match(css, /@media \(max-width: 500px\)/);
  assert.match(homePage, /Registered Enterprise:<\/b> VISHNU S\.TOURS &amp; TRAVELS/);
  assert.match(publicChrome, /Registered Enterprise:<\/b> VISHNU S\.TOURS &amp; TRAVELS/);
  assert.doesNotMatch(homePage, /Udyam:<\/b> UDYAM-MH-18-0242307/);
  assert.doesNotMatch(publicChrome, /Udyam:<\/b> UDYAM-MH-18-0242307/);
  assert.match(aboutPage, /UDYAM-MH-18-0242307/);
  assert.match(
    css,
    /\.collection-modal-backdrop\s*\{[\s\S]*?z-index:\s*2147483100/,
    "ride collection confirmation must stay above the role dashboard modal",
  );

  for (const path of [
    "app/privacy-policy/page.tsx",
    "app/terms-and-conditions/page.tsx",
    "app/cancellation-refund/page.tsx",
    "app/cookie-policy/page.tsx",
    "app/disclaimer/page.tsx",
    "app/price-chart/page.tsx",
    "app/about-us/page.tsx",
  ]) {
    await access(new URL(path, root));
  }
});
