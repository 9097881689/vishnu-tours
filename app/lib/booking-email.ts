import { env } from "cloudflare:workers";

export type BookingEmailEvent =
  | "booking_confirmed"
  | "booking_updated"
  | "payment_received"
  | "driver_assigned"
  | "ride_started"
  | "ride_cancelled"
  | "refund_updated"
  | "ride_complete";

export type BookingEmailRecord = {
  booking_id: string;
  customer_email: string;
  customer_name: string;
  customer_mobile: string;
  start_point: string;
  destination: string;
  trip_type: string;
  vehicle: string;
  pickup_datetime: string;
  return_date?: string | null;
  driver_name?: string | null;
  driver_mobile?: string | null;
  vehicle_number?: string | null;
  estimated_fare?: number | null;
  extra_amount?: number | null;
  payment_amount?: number | null;
  payment_status?: string | null;
  payment_collection_mode?: string | null;
  refund_amount?: number | null;
  refund_status?: string | null;
  cancel_reason?: string | null;
  ride_status?: string | null;
  ride_started_at?: string | null;
  ride_completed_at?: string | null;
};

const eventCopy: Record<
  BookingEmailEvent,
  { subject: string; title: string; intro: string; accent: string }
> = {
  booking_confirmed: {
    subject: "Booking Confirmed",
    title: "Your Booking Is Confirmed",
    intro:
      "Thank you for choosing Vishnu Tours. Your booking has been recorded and confirmed successfully.",
    accent: "#f6bd16",
  },
  booking_updated: {
    subject: "Booking Updated",
    title: "Your Booking Has Been Updated",
    intro:
      "An update has been made to your booking. Please review the latest journey and payment details below.",
    accent: "#38bdf8",
  },
  payment_received: {
    subject: "Payment Received",
    title: "Your Payment Has Been Received",
    intro:
      "We have updated the payment received against your booking. The latest paid amount and balance are shown below.",
    accent: "#22c55e",
  },
  driver_assigned: {
    subject: "Driver And Vehicle Assigned",
    title: "Driver And Vehicle Assigned",
    intro:
      "Your driver and vehicle have been assigned. Please keep your phone available near the pickup time.",
    accent: "#38bdf8",
  },
  ride_started: {
    subject: "Ride Started",
    title: "Your Ride Has Started",
    intro:
      "Your driver has marked the ride as started. The current booking and payment details are below.",
    accent: "#f59e0b",
  },
  ride_cancelled: {
    subject: "Booking Cancelled",
    title: "Your Booking Has Been Cancelled",
    intro:
      "This booking has been marked cancelled. Any applicable refund status and cancellation reason are shown below.",
    accent: "#ef4444",
  },
  refund_updated: {
    subject: "Refund Updated",
    title: "Your Refund Status Has Been Updated",
    intro:
      "A refund update has been recorded for your booking. Please review the amount and current status below.",
    accent: "#ef4444",
  },
  ride_complete: {
    subject: "Ride Completed",
    title: "Your Ride Is Complete",
    intro:
      "Your ride has been marked complete. Thank you for travelling with Vishnu Tours.",
    accent: "#22c55e",
  },
};

const adminEventCopy: Record<BookingEmailEvent, { title: string; action: string }> = {
  booking_confirmed: {
    title: "New Booking Confirmed",
    action: "Review the journey and payment details, then arrange the requested cab and driver.",
  },
  booking_updated: {
    title: "Booking Details Changed",
    action: "Review the changed details and confirm that the existing cab and driver plan is still valid.",
  },
  payment_received: {
    title: "Customer Payment Received",
    action: "Verify the paid amount and monitor any remaining balance shown below.",
  },
  driver_assigned: {
    title: "Driver And Vehicle Assigned",
    action: "Confirm that the assigned driver has received the trip and customer contact details.",
  },
  ride_started: {
    title: "Ride Started",
    action: "The ride is now active. Monitor the trip and any pending customer balance.",
  },
  ride_cancelled: {
    title: "Booking Cancelled",
    action: "Review the cancellation reason and process any applicable refund or ledger adjustment.",
  },
  refund_updated: {
    title: "Refund Status Updated",
    action: "Verify the refund amount, payment source and corresponding ledger adjustment.",
  },
  ride_complete: {
    title: "Ride Completed",
    action: "Review the final fare, payment collection and driver cash ledger before closing the booking.",
  },
};

export async function sendBookingStatusEmail(
  booking: BookingEmailRecord | null | undefined,
  event: BookingEmailEvent,
) {
  if (!booking) return { sent: false, reason: "missing_booking" };

  const resendApiKey = process.env.RESEND_API_KEY || "";
  const fromEmail = process.env.CUSTOMER_EMAIL_FROM || "";
  const adminEmail = process.env.BOOKING_ADMIN_EMAIL || "cricketsikho@gmail.com";

  const copy = eventCopy[event];
  const baseFareWithGst = Math.round(Number(booking.estimated_fare || 0) * 1.05);
  const extraAmount = Math.max(0, Number(booking.extra_amount || 0));
  const finalFare = baseFareWithGst + extraAmount;
  const paidAmount = Math.max(0, Number(booking.payment_amount || 0));
  const balanceDue = Math.max(0, finalFare - paidAmount);
  const driverLine = booking.driver_name
    ? `${booking.driver_name} | ${booking.driver_mobile || "Mobile Pending"} | ${
        booking.vehicle_number || "Vehicle Number Pending"
      }`
    : "Will Be Assigned Soon";
  const rows = [
    ["Booking ID", booking.booking_id],
    ["Journey", `${booking.start_point} To ${booking.destination}`],
    ["Trip Type", booking.trip_type],
    ["Cab", booking.vehicle],
    ["Pickup Date And Time", booking.pickup_datetime],
    ...(booking.return_date ? [["Drop / Return Date", booking.return_date]] : []),
    ["Customer", `${booking.customer_name} | ${booking.customer_mobile}`],
    ["Driver / Vehicle", driverLine],
    ["Fare Including GST 5%", `Rs ${baseFareWithGst}`],
    ...(extraAmount > 0 ? [["Extra Fare", `Rs ${extraAmount}`]] : []),
    ["Current Total Fare", `Rs ${finalFare}`],
    ["Paid Amount", `Rs ${paidAmount}`],
    ["Balance Due", `Rs ${balanceDue}`],
    ["Payment Status", booking.payment_status || "Pending"],
    ["Ride Status", booking.ride_status || "Booking Confirmed"],
    ...(booking.refund_status && booking.refund_status !== "None"
      ? [["Refund Status", booking.refund_status]]
      : []),
    ...(Number(booking.refund_amount || 0) > 0
      ? [["Refund Amount", `Rs ${Number(booking.refund_amount || 0)}`]]
      : []),
    ...(booking.cancel_reason ? [["Cancellation Reason", booking.cancel_reason]] : []),
  ];
  const adminRows = [
    ["Booking ID", booking.booking_id],
    ["Customer", `${booking.customer_name} | ${booking.customer_mobile}`],
    ["Customer Email", booking.customer_email || "Not Provided"],
    ...rows.slice(1),
  ];
  const htmlRows = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#64748b;font-weight:700;">${escapeHtml(label)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#0f172a;font-weight:800;">${escapeHtml(value)}</td>
        </tr>`,
    )
    .join("");
  const html = `
    <div style="margin:0;padding:24px;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
        <div style="padding:22px 24px;background:${copy.accent};color:#111827;">
          <h1 style="margin:0;font-size:24px;line-height:1.25;">${escapeHtml(copy.title)}</h1>
          <p style="margin:8px 0 0;font-size:14px;font-weight:700;">Vishnu Tours - Corporate Cabs From Mumbai</p>
        </div>
        <div style="padding:22px 24px;">
          <p style="margin:0 0 18px;color:#334155;font-size:15px;line-height:1.6;">Dear ${escapeHtml(
            booking.customer_name,
          )}, ${escapeHtml(copy.intro)}</p>
          <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">${htmlRows}</table>
          <p style="margin:18px 0 0;color:#334155;font-size:14px;line-height:1.6;">For support, call or WhatsApp +91 7004291529 or reply to this email.</p>
          <p style="margin:16px 0 0;color:#0f172a;font-weight:800;">Regards,<br/>Vishnu Tours</p>
        </div>
      </div>
    </div>`;
  const text = [
    copy.title,
    "",
    `Dear ${booking.customer_name}, ${copy.intro}`,
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    "Support: +91 7004291529",
    "Regards, Vishnu Tours",
  ].join("\n");
  const adminCopy = adminEventCopy[event];
  const adminHtmlRows = adminRows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #dbe4f0;color:#52637a;font-weight:700;">${escapeHtml(label)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #dbe4f0;color:#0f172a;font-weight:800;">${escapeHtml(value)}</td>
        </tr>`,
    )
    .join("");
  const adminHtml = `
    <div style="margin:0;padding:24px;background:#eef3f8;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #dbe4f0;border-radius:12px;overflow:hidden;">
        <div style="padding:20px 24px;background:#082f58;color:#ffffff;">
          <p style="margin:0 0 6px;color:#f6bd16;font-size:12px;font-weight:800;text-transform:uppercase;">Vishnu Tours Admin Notification</p>
          <h1 style="margin:0;font-size:23px;line-height:1.3;">${escapeHtml(adminCopy.title)}</h1>
        </div>
        <div style="padding:22px 24px;">
          <div style="margin:0 0 18px;padding:14px 16px;background:#fff8df;border-left:4px solid #f6bd16;color:#24364d;font-size:14px;line-height:1.55;">
            <strong>Admin Action:</strong> ${escapeHtml(adminCopy.action)}
          </div>
          <table style="width:100%;border-collapse:collapse;border:1px solid #dbe4f0;">${adminHtmlRows}</table>
          <p style="margin:18px 0 0;color:#52637a;font-size:13px;line-height:1.6;">This is an automated operational update from the Vishnu Tours booking system.</p>
        </div>
      </div>
    </div>`;
  const adminText = [
    `VISHNU TOURS ADMIN - ${adminCopy.title}`,
    "",
    `ADMIN ACTION: ${adminCopy.action}`,
    "",
    ...adminRows.map(([label, value]) => `${label}: ${value}`),
    "",
    "Automated Vishnu Tours booking system update.",
  ].join("\n");

  let adminSent = false;
  try {
    const emailBinding = (env as unknown as {
      EMAIL?: {
        send(message: {
          from: string;
          to: string;
          subject: string;
          html: string;
          text: string;
          replyTo?: string;
        }): Promise<unknown>;
      };
    }).EMAIL;

    if (emailBinding && adminEmail) {
      await emailBinding.send({
        from: "bookings@instantbackgroundremove.com",
        to: adminEmail,
        replyTo: adminEmail,
        subject: `[Vishnu Tours Admin] ${copy.subject} | ${booking.booking_id}`,
        html: adminHtml,
        text: adminText,
      });
      adminSent = true;
    }
  } catch (error) {
    console.warn("Cloudflare admin email notification failed.", error);
  }

  if (!booking.customer_email || !resendApiKey || !fromEmail) {
    return adminSent
      ? { sent: true, channel: "cloudflare_admin" }
      : { sent: false, reason: "customer_email_not_configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: booking.customer_email,
        ...(!adminSent && adminEmail && adminEmail !== booking.customer_email
          ? { bcc: adminEmail }
          : {}),
        reply_to: adminEmail || undefined,
        subject: `${copy.subject} - ${booking.booking_id} | Vishnu Tours`,
        html,
        text,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.warn("Booking email notification failed.", response.status, detail);
      return { sent: false, reason: "provider_rejected" };
    }
  } catch (error) {
    console.warn("Booking email notification could not reach provider.", error);
    return { sent: false, reason: "provider_unreachable" };
  }

  return { sent: true };
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
