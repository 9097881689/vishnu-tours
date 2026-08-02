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
});

test("ships responsive role dashboard styling and all public policy pages", async () => {
  const css = await source("app/globals.css");
  const [homePage, publicChrome] = await Promise.all([
    source("app/page.tsx"),
    source("app/components/PublicChrome.tsx"),
  ]);

  assert.match(css, /\.role-dashboard-shell/);
  assert.match(css, /\.role-dashboard-sidebar/);
  assert.match(css, /@media \(max-width: 760px\)/);
  assert.match(css, /@media \(max-width: 500px\)/);
  assert.match(homePage, /Legal Name:<\/b> Visnu S Tours &amp; Travels/);
  assert.match(publicChrome, /Legal Name:<\/b> Visnu S Tours &amp; Travels/);
  assert.match(homePage, /Trade Name:<\/b> Munni Devi/);
  assert.match(publicChrome, /Trade Name:<\/b> Munni Devi/);
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
  ]) {
    await access(new URL(path, root));
  }
});
