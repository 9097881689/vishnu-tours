"use client";

import Link from "next/link";
import { WhatsAppIcon } from "./components/WhatsAppIcon";
import type { CSSProperties, ChangeEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BadgePercent,
  Banknote,
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  CarFront,
  CheckCircle2,
  ClipboardList,
  Clock3,
  CreditCard,
  Crown,
  Headphones,
  Home as HomeIcon,
  LogOut,
  Mail,
  MapPinned,
  Menu,
  Navigation,
  Plane,
  PhoneCall,
  Printer,
  Route,
  Settings,
  Share2,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";

const whatsappNumber = "917004291529";
const headOffice = "Mumbai, Maharashtra";
const perKmRate = 16;
const siteFontOptions = [
  { label: "Plus Jakarta Sans", value: "Plus Jakarta Sans", stack: "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif" },
  { label: "Inter", value: "Inter", stack: "var(--font-inter), Inter, sans-serif" },
  { label: "Poppins", value: "Poppins", stack: "var(--font-poppins), Poppins, sans-serif" },
  { label: "Manrope", value: "Manrope", stack: "var(--font-manrope), Manrope, sans-serif" },
  { label: "Montserrat", value: "Montserrat", stack: "var(--font-montserrat), Montserrat, sans-serif" },
  { label: "Nunito Sans", value: "Nunito Sans", stack: "var(--font-nunito-sans), 'Nunito Sans', sans-serif" },
  { label: "Open Sans", value: "Open Sans", stack: "var(--font-open-sans), 'Open Sans', sans-serif" },
  { label: "Roboto", value: "Roboto", stack: "var(--font-roboto), Roboto, sans-serif" },
  { label: "Lato", value: "Lato", stack: "var(--font-lato), Lato, sans-serif" },
  { label: "System UI", value: "System UI", stack: "system-ui, -apple-system, 'Segoe UI', sans-serif" },
];
const fromSuggestions = [
  "Mumbai Head Office",
  "Mumbai Airport",
  "Mumbai Central",
  "BKC Mumbai",
  "Dadar Mumbai",
  "Andheri Mumbai",
  "Navi Mumbai",
  "Thane Mumbai",
  "Bandra Mumbai",
  "Borivali Mumbai",
  "Malad Mumbai",
  "Goregaon Mumbai",
  "Powai Mumbai",
  "Ghatkopar Mumbai",
  "Kurla Mumbai",
  "Chembur Mumbai",
  "Mira Road Mumbai",
  "Vasai Mumbai",
];

const destinationDistances: Record<string, number> = {
  pune: 150,
  nashik: 170,
  shirdi: 240,
  surat: 280,
  vadodara: 420,
  ahmedabad: 525,
  goa: 590,
  indore: 585,
  ujjain: 640,
  hyderabad: 710,
  bangalore: 980,
  jaipur: 1150,
  delhi: 1420,
  bhopal: 780,
  nagpur: 820,
  kolhapur: 375,
  aurangabad: 335,
  lonavala: 85,
  alibaug: 95,
  mahableshwar: 260,
  mahabaleshwar: 260,
  udaipur: 760,
  chennai: 1340,
  kolkata: 1960,
};

const destinationSuggestions = [
  "Pune",
  "Pune Airport",
  "Nashik",
  "Shirdi",
  "Surat",
  "Vadodara",
  "Ahmedabad",
  "Goa",
  "Indore",
  "Ujjain",
  "Hyderabad",
  "Bangalore",
  "Jaipur",
  "Delhi",
  "Bhopal",
  "Nagpur",
  "Kolhapur",
  "Aurangabad",
  "Lonavala",
  "Alibaug",
  "Mahabaleshwar",
  "Udaipur",
  "Chennai",
  "Kolkata",
  "Agra",
  "Amritsar",
  "Ayodhya",
  "Chandigarh",
  "Dehradun",
  "Gurugram",
  "Gwalior",
  "Jodhpur",
  "Kota",
  "Lucknow",
  "Mathura",
  "Mount Abu",
  "Noida",
  "Patna",
  "Prayagraj",
  "Rajkot",
  "Ranchi",
  "Varanasi",
  "Vapi",
];

const bookingTypes = ["Outstation", "Airport", "In-City"];
const outstationTripOptions = ["One Way", "Round Trip"];
const airportTripOptions = [
  {
    value: "Airport Pickup T1",
    label: "Airport Pickup T1",
    mode: "pickup",
    location: "Mumbai Airport Terminal 1 (T1), Santacruz, Mumbai",
  },
  {
    value: "Airport Pickup T2",
    label: "Airport Pickup T2",
    mode: "pickup",
    location: "Mumbai Airport Terminal 2 (T2), Andheri East, Mumbai",
  },
  {
    value: "Airport Drop T1",
    label: "Airport Drop T1",
    mode: "drop",
    location: "Mumbai Airport Terminal 1 (T1), Santacruz, Mumbai",
  },
  {
    value: "Airport Drop T2",
    label: "Airport Drop T2",
    mode: "drop",
    location: "Mumbai Airport Terminal 2 (T2), Andheri East, Mumbai",
  },
] as const;
const localPackageOptions = [
  { id: "local4hr", label: "4 Hr / 45 KM", hours: 4, km: 45 },
  { id: "local8hr", label: "8 Hr / 90 KM", hours: 8, km: 90 },
  { id: "local10hr", label: "10 Hr / 100 KM", hours: 10, km: 100 },
] as const;
const roundTripDailyKm = 300;
const minimumLocalAirportKm = 40;

const packageOptions = [
  {
    id: "perKm",
    label: "Per KM Outstation",
    description: "All India Fare From Mumbai",
  },
  {
    id: "fullDay",
    label: "Full Day Local",
    description: "8 hours / 80 km package",
  },
  {
    id: "halfDay",
    label: "Half Day Local",
    description: "4 hours / 40 km package",
  },
  {
    id: "vip",
    label: "VIP Luxury Pack",
    description: "Premium Car, Priority Driver And Executive Service",
  },
] as const;

const rateTable: Record<
  string,
  {
    perKm: number;
    local4hr: number;
    local8hr: number;
    local10hr: number;
    perHour: number;
    fullDay: number;
    halfDay: number;
    vip: number;
    tag: string;
  }
> = {
  "Toyota Etios": {
    perKm: 24,
    local4hr: 1921,
    local8hr: 3492,
    local10hr: 3880,
    perHour: 388,
    fullDay: 3492,
    halfDay: 1921,
    vip: 4680,
    tag: "Economy",
  },
  "Maruti Ertiga": {
    perKm: 29,
    local4hr: 2324,
    local8hr: 4226,
    local10hr: 4696,
    perHour: 470,
    fullDay: 4226,
    halfDay: 2324,
    vip: 5580,
    tag: "Family",
  },
  "Toyota Rumion": {
    perKm: 29,
    local4hr: 2324,
    local8hr: 4226,
    local10hr: 4696,
    perHour: 470,
    fullDay: 4226,
    halfDay: 2324,
    vip: 5850,
    tag: "Comfort",
  },
  "Toyota Innova Crysta": {
    perKm: 32,
    local4hr: 2324,
    local8hr: 4226,
    local10hr: 4696,
    perHour: 470,
    fullDay: 4226,
    halfDay: 2324,
    vip: 7650,
    tag: "VIP",
  },
  "Toyota Innova Hycross": {
    perKm: 39,
    local4hr: 2685,
    local8hr: 4881,
    local10hr: 5423,
    perHour: 542,
    fullDay: 4881,
    halfDay: 2685,
    vip: 9900,
    tag: "Luxury VIP",
  },
};

const editableRateKeys = [
  "perKm",
  "local4hr",
  "local8hr",
  "local10hr",
  "perHour",
  "fullDay",
  "halfDay",
  "vip",
] as const;
type EditableRateKey = (typeof editableRateKeys)[number];
type VehicleRateOverrides = Record<string, Partial<Record<EditableRateKey, number>>>;
type VehicleRates = Record<EditableRateKey, number>;
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

const defaultSiteBranding: SiteBranding = {
  iconUrl: "/logo-mark-v2.png?v=20260801",
  headerLogoSize: 42,
  footerLogoSize: 62,
  faviconSize: 32,
};

function applyPriceAdjustment(amount: number, percent: number) {
  return Math.max(0, Math.round(amount * (1 + percent / 100)));
}

function buildEditableRateForm(
  vehicleName: string,
  overrides: VehicleRateOverrides = {},
  baseRateTable: Record<string, VehicleRates> = rateTable,
) {
  const fallbackRates =
    baseRateTable["Toyota Innova Crysta"] ||
    Object.values(baseRateTable)[0] ||
    rateTable["Toyota Innova Crysta"];
  const baseRates = baseRateTable[vehicleName] || fallbackRates;
  const manualRates = overrides[vehicleName] || {};

  return Object.fromEntries(
    editableRateKeys.map((rateKey) => [
      rateKey,
      String(manualRates[rateKey] ?? baseRates[rateKey]),
    ]),
  ) as Record<EditableRateKey, string>;
}

function buildRateTableFromVehicles(fleetVehicles: FleetVehicle[]) {
  return Object.fromEntries(
    fleetVehicles.map((item) => [item.name, item.rates]),
  ) as Record<string, VehicleRates>;
}

function createVehicleForm(vehicle?: FleetVehicle) {
  const source = vehicle || {
    name: "",
    type: "",
    seats: "4 Seats",
    luggage: "2 Suitcases",
    bestFor: "",
    photo: "",
    active: true,
    rates: {
      perKm: 0,
      local4hr: 0,
      local8hr: 0,
      local10hr: 0,
      perHour: 0,
      fullDay: 0,
      halfDay: 0,
      vip: 0,
    },
  };

  return {
    name: source.name,
    type: source.type,
    seats: source.seats,
    luggage: source.luggage,
    bestFor: source.bestFor,
    photo: source.photo,
    active: source.active,
    perKm: String(source.rates.perKm || ""),
    local4hr: String(source.rates.local4hr || ""),
    local8hr: String(source.rates.local8hr || ""),
    local10hr: String(source.rates.local10hr || ""),
    perHour: String(source.rates.perHour || ""),
    fullDay: String(source.rates.fullDay || ""),
    halfDay: String(source.rates.halfDay || ""),
    vip: String(source.rates.vip || ""),
  };
}

type VehicleForm = ReturnType<typeof createVehicleForm>;

function normalizeSiteBranding(value?: Partial<SiteBranding> | null): SiteBranding {
  return {
    iconUrl: value?.iconUrl || defaultSiteBranding.iconUrl,
    headerLogoSize: Number.isFinite(Number(value?.headerLogoSize))
      ? Math.min(120, Math.max(38, Math.round(Number(value?.headerLogoSize))))
      : defaultSiteBranding.headerLogoSize,
    footerLogoSize: Number.isFinite(Number(value?.footerLogoSize))
      ? Math.min(180, Math.max(48, Math.round(Number(value?.footerLogoSize))))
      : defaultSiteBranding.footerLogoSize,
    faviconSize: Number.isFinite(Number(value?.faviconSize))
      ? Math.min(96, Math.max(16, Math.round(Number(value?.faviconSize))))
      : defaultSiteBranding.faviconSize,
  };
}

async function optimizeBrandingImage(file: File): Promise<string> {
  const sourceUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const previewImage = new Image();
      previewImage.onload = () => resolve(previewImage);
      previewImage.onerror = () => reject(new Error("Image could not be decoded."));
      previewImage.src = sourceUrl;
    });
    const maxDimension = 720;
    const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");

    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Image editor is unavailable.");
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    let optimized = canvas.toDataURL("image/webp", 0.88);

    if (optimized.length > 820000) {
      optimized = canvas.toDataURL("image/webp", 0.7);
    }

    if (!optimized.startsWith("data:image/") || optimized.length > 880000) {
      throw new Error("Image remains too large after optimization.");
    }

    return optimized;
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

function getAirportOption(value: string) {
  return (
    airportTripOptions.find((option) => option.value === value) ||
    airportTripOptions[0]
  );
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (
        event: "payment.failed",
        handler: (response: {
          error?: { description?: string; reason?: string };
        }) => void,
      ) => void;
    };
    google?: {
      maps?: {
        places?: {
          Autocomplete: new (
            input: HTMLInputElement,
            options: Record<string, unknown>,
          ) => {
            addListener: (event: string, handler: () => void) => void;
            getPlace: () => {
              formatted_address?: string;
              name?: string;
              address_components?: Array<{
                long_name: string;
                short_name: string;
                types: string[];
              }>;
            };
          };
        };
        event?: {
          clearInstanceListeners: (instance: unknown) => void;
        };
      };
    };
  }
}

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

type PackageId = (typeof packageOptions)[number]["id"];
type PlaceSuggestion = {
  label: string;
  secondary?: string;
};

type RazorpaySuccess = {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
};

type DashboardBooking = {
  booking_id: string;
  created_at: string;
  trip_type: string;
  vehicle: string;
  start_point: string;
  destination: string;
  one_side_km?: number;
  billable_km?: number;
  rate_per_km?: number;
  rate_per_hour?: number;
  pickup_datetime?: string;
  return_date?: string;
  odometer_start?: number;
  odometer_end?: number;
  extra_km?: number;
  extra_hours?: number;
  extra_hour_amount?: number;
  extra_amount?: number;
  estimated_fare: number;
  customer_name: string;
  customer_mobile: string;
  status: string;
  ride_status?: string;
  refund_status?: string;
  refund_amount?: number;
  driver_name?: string;
  driver_mobile?: string;
  vehicle_number?: string;
  payment_status?: string;
  payment_amount?: number;
  payment_collection_mode?: string;
  driver_cash_collected?: number;
  refund_collection_mode?: string;
  driver_cash_refunded?: number;
  refund_driver_name?: string;
  refund_driver_mobile?: string;
  cancel_reason?: string;
  ride_started_at?: string;
  ride_completed_at?: string;
};

type DriverProfile = {
  name: string;
  mobile: string;
  vehicle: string;
  vehicleNumber: string;
  updatedAt?: string;
  status: "Available" | "Assigned";
  email?: string;
  address?: string;
  emergencyContact?: string;
  drivingLicense?: string;
  licenseExpiry?: string;
  accountType?: string;
  approvalStatus?: string;
  activeStatus?: string;
  joiningDate?: string;
  ownerMobile?: string;
  seatingCapacity?: string;
  fuelType?: string;
  insuranceExpiry?: string;
};

type DriverRow = {
  driver_name: string;
  driver_mobile: string;
  vehicle_type: string;
  vehicle_number: string;
  updated_at?: string;
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
};

type BookingStatusHistory = {
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

type CashCollectionHistory = {
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
  collected_by: string;
  settlement_type: string;
  settlement_status: string;
};

type AssignmentHistory = {
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

type DriverFormData = {
  name: string;
  mobile: string;
  vehicle: string;
  vehicleNumber: string;
  email?: string;
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

type DriverCashSummary = {
  driver_mobile: string;
  driver_name: string;
  cash_amount: number;
  cash_collected?: number;
  cash_deposited?: number;
  cash_refunded?: number;
  cash_adjusted_to_earning?: number;
  cash_sent_to_admin?: number;
  cash_rides: number;
};

type DriverWithdrawal = {
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
  admin_note?: string;
};

type PortalRole = "admin" | "driver" | "customer";
type DriverPanelTab = "dashboard" | "rides" | "wallet" | "vehicles" | "profile" | "history" | "support";
type CustomerPanelTab = "dashboard" | "bookings" | "payments" | "profile" | "notifications" | "support";
type AdminPanelTab =
  | "dashboard"
  | "breakup"
  | "bookings"
  | "pricing"
  | "customization"
  | "myVehicle"
  | "vehicles"
  | "ledger"
  | "withdrawals"
  | "portalLookup";

type AdminBreakupType =
  | "bookings"
  | "bookingAmount"
  | "collected"
  | "online"
  | "driverCash";

type WorkflowStage = {
  id: string;
  label: string;
};

const workflowStages: WorkflowStage[] = [
  { id: "booked", label: "Booked" },
  { id: "payment", label: "Payment Received" },
  { id: "confirmed", label: "Booking Confirmed" },
  { id: "assigned", label: "Driver And Vehicle Assigned" },
  { id: "started", label: "Ride Start" },
  { id: "complete", label: "Ride Complete" },
];

function getDestinationDistance(destination: string) {
  const normalizedDestination = destination.trim().toLowerCase();
  const directDistance = destinationDistances[normalizedDestination];

  if (directDistance) {
    return directDistance;
  }

  const matchingCity = Object.keys(destinationDistances).find((city) =>
    normalizedDestination.includes(city),
  );

  return matchingCity ? destinationDistances[matchingCity] : undefined;
}

function getPlaceSuggestions(
  input: string,
  suggestions: string[],
  fallbackCount: number,
) {
  const normalizedInput = input.trim().toLowerCase();
  const filtered = normalizedInput
    ? suggestions.filter((item) => item.toLowerCase().includes(normalizedInput))
    : suggestions;

  return filtered.slice(0, fallbackCount);
}

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function formatPaymentAmount(amount: number) {
  return amount === 0 ? "₹0" : formatInr(amount);
}

function formatDisplayDate(value: string) {
  if (!value) {
    return "Please Select";
  }

  const parsedDate = new Date(`${value}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

function formatDisplayDateTime(value?: string) {
  if (!value) {
    return "";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
}

function isPickupDue(booking: DashboardBooking) {
  const pickupDate = (booking.pickup_datetime || "").slice(0, 10);

  if (!pickupDate) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rideDate = new Date(`${pickupDate}T00:00:00`);

  return !Number.isNaN(rideDate.getTime()) && rideDate <= today;
}

function getCompletedWorkflowStages(booking: DashboardBooking) {
  const completed = new Set<string>(["booked"]);
  const rideStatus = (booking.ride_status || "").toLowerCase();
  const paymentStatus = (booking.payment_status || "").toLowerCase();
  const paymentReceived =
    paymentStatus === "complete" ||
    paymentStatus === "received" ||
    Number(booking.payment_amount || 0) > 0 ||
    rideStatus.includes("payment");

  if (paymentReceived) {
    completed.add("payment");
    completed.add("confirmed");
  }

  if (
    booking.booking_id?.startsWith("VTT") ||
    rideStatus.includes("confirmed") ||
    rideStatus.includes("booked")
  ) {
    completed.add("confirmed");
  }

  if (
    booking.driver_name ||
    booking.driver_mobile ||
    booking.vehicle_number ||
    rideStatus.includes("driver")
  ) {
    completed.add("assigned");
  }

  if (
    rideStatus.includes("started") ||
    rideStatus.includes("complete") ||
    (completed.has("assigned") && isPickupDue(booking))
  ) {
    completed.add("started");
  }

  if (rideStatus.includes("complete")) {
    completed.add("complete");
  }

  return completed;
}

function getInvoiceTotals(booking: DashboardBooking) {
  const baseFare = Number(booking.estimated_fare || 0);
  const tax = Math.round(baseFare * 0.05);
  const extraAmount = Number(booking.extra_amount || 0);
  const total = baseFare + tax + extraAmount;

  return { baseFare, tax, extraAmount, total };
}

function getAccountingBookingAmount(booking: DashboardBooking) {
  const rideStatus = (booking.ride_status || booking.status || "").toLowerCase();
  const paidAmount = Number(booking.payment_amount || 0);
  const refundAmount = Number(booking.refund_amount || 0);

  if (rideStatus.includes("cancel")) {
    if (paidAmount <= 0) {
      return 0;
    }

    if (refundAmount >= paidAmount) {
      return 0;
    }
  }

  return getInvoiceTotals(booking).total;
}

function getBalanceDue(booking: DashboardBooking) {
  const { total } = getInvoiceTotals(booking);

  return Math.max(0, total - Number(booking.payment_amount || 0));
}

function getOdometerExtra(booking: DashboardBooking, startReading: number, endReading: number) {
  const actualKm = Math.max(0, endReading - startReading);
  const billableKm = Math.round(Number(booking.billable_km || 0));
  const extraKm = Math.max(0, actualKm - billableKm);
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
  const startedAt = Date.parse(booking.ride_started_at || "");
  const actualHours = Number.isFinite(startedAt)
    ? Math.max(0, (Date.now() - startedAt) / (60 * 60 * 1000))
    : 0;
  const extraHours = includedHours > 0 ? Math.max(0, Math.ceil(actualHours - includedHours)) : 0;
  const extraHourAmount = Math.round(
    extraHours * Number(booking.rate_per_hour || 0) * 1.05,
  );
  const extraAmount = extraKmAmount + extraHourAmount;
  const finalChargeableKm = Math.max(billableKm, actualKm);
  const baseFare = Number(booking.estimated_fare || 0);
  const finalFareWithGst = baseFare + Math.round(baseFare * 0.05) + extraAmount;

  return {
    actualKm,
    billableKm,
    extraKm,
    extraKmAmount,
    actualHours,
    includedHours,
    extraHours,
    extraHourAmount,
    extraAmount,
    finalChargeableKm,
    finalFareWithGst,
  };
}

function sortDashboardBookings(bookings: DashboardBooking[]) {
  return [...bookings].sort((firstBooking, secondBooking) => {
    const firstOpen = firstBooking.driver_mobile ? 1 : 0;
    const secondOpen = secondBooking.driver_mobile ? 1 : 0;

    if (firstOpen !== secondOpen) {
      return firstOpen - secondOpen;
    }

    return (
      new Date(secondBooking.created_at).getTime() -
      new Date(firstBooking.created_at).getTime()
    );
  });
}

function isRideInProgress(booking: DashboardBooking) {
  const status = (booking.ride_status || "").toLowerCase();

  return (
    Boolean(booking.ride_started_at) &&
    status.includes("started") &&
    !status.includes("complete") &&
    !status.includes("cancel")
  );
}

const driverAssignmentConflictWindowMs = 6 * 60 * 60 * 1000;

function getAssignmentConflict(
  booking: DashboardBooking,
  driverMobile: string,
  bookings: DashboardBooking[],
) {
  const requestedPickupTime = Date.parse(booking.pickup_datetime || "");
  const normalizedDriverMobile = driverMobile.trim();

  if (!normalizedDriverMobile || Number.isNaN(requestedPickupTime)) {
    return null;
  }

  return (
    bookings.find((currentBooking) => {
      const status = (currentBooking.ride_status || "").toLowerCase();
      const currentPickupTime = Date.parse(currentBooking.pickup_datetime || "");

      return (
        currentBooking.booking_id !== booking.booking_id &&
        currentBooking.driver_mobile === normalizedDriverMobile &&
        !status.includes("cancel") &&
        !status.includes("complete") &&
        !Number.isNaN(currentPickupTime) &&
        Math.abs(currentPickupTime - requestedPickupTime) <= driverAssignmentConflictWindowMs
      );
    }) || null
  );
}

function isMumbaiPickup(value: string) {
  const pickup = value.trim().toLowerCase();
  const mumbaiAreas = [
    "mumbai",
    "bkc",
    "andheri",
    "bandra",
    "borivali",
    "dadar",
    "thane",
    "navi",
    "powai",
    "malad",
    "goregaon",
    "ghatkopar",
    "kurla",
    "chembur",
    "mira road",
    "vasai",
  ];

  if (!pickup) {
    return true;
  }

  return mumbaiAreas.some(
    (area) => pickup.includes(area) || (pickup.length >= 3 && area.startsWith(pickup)),
  );
}

function getLocationTripType(origin: string, destination: string) {
  const pickup = origin.trim().toLowerCase();
  const dropLocation = destination.trim().toLowerCase();

  if (pickup.includes("airport") || dropLocation.includes("airport")) {
    return "Airport";
  }

  if (dropLocation && isMumbaiPickup(origin) && isMumbaiPickup(destination)) {
    return "In-City";
  }

  if (dropLocation) {
    return "Outstation";
  }

  return null;
}

export default function Home() {
  const fromInputRef = useRef<HTMLInputElement>(null);
  const toInputRef = useRef<HTMLInputElement>(null);
  const carResultsRef = useRef<HTMLElement>(null);
  const reviewRef = useRef<HTMLElement>(null);
  const [bookingView, setBookingView] = useState<"home" | "cars" | "review">(
    "home",
  );
  const [tripType, setTripType] = useState("Outstation");
  const [outstationTripType, setOutstationTripType] = useState("One Way");
  const [airportTripType, setAirportTripType] = useState(airportTripOptions[0].value);
  const [localPackageType, setLocalPackageType] =
    useState<(typeof localPackageOptions)[number]["id"]>("local8hr");
  const [vehicle, setVehicle] = useState("Toyota Innova Crysta");
  const [startPoint, setStartPoint] = useState(headOffice);
  const [drop, setDrop] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  const [date, setDate] = useState("");
  const [bookingValidationTime] = useState(() => Date.now());
  const [returnDate, setReturnDate] = useState("");
  const [pickupTime, setPickupTime] = useState("10:00");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [packageType] = useState<PackageId>("perKm");
  const [paymentMode, setPaymentMode] = useState("Pay Advance After Fare Confirmation");
  const [paymentChoice, setPaymentChoice] = useState<"zero" | "part" | "full">(
    "part",
  );
  const [advanceAmount, setAdvanceAmount] = useState("500");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [bookingStatus, setBookingStatus] = useState("");
  const [ticketShareStatus, setTicketShareStatus] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const [showBookingTicket, setShowBookingTicket] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginMobile, setLoginMobile] = useState("");
  const [portalStatus, setPortalStatus] = useState("");
  const [portalRole, setPortalRole] = useState<PortalRole | null>(null);
  const [portalBookings, setPortalBookings] = useState<DashboardBooking[]>([]);
  const [driverVehicles, setDriverVehicles] = useState<DriverRow[]>([]);
  const [driverLedger, setDriverLedger] = useState<DashboardBooking[]>([]);
  const [bookingStatusHistory, setBookingStatusHistory] = useState<BookingStatusHistory[]>([]);
  const [assignmentHistory, setAssignmentHistory] = useState<AssignmentHistory[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<DriverWithdrawal[]>([]);
  const [activeDriverTab, setActiveDriverTab] = useState<DriverPanelTab>("dashboard");
  const [activeCustomerTab, setActiveCustomerTab] = useState<CustomerPanelTab>("dashboard");
  const [driverOnline, setDriverOnline] = useState(true);
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: "",
    bankName: "",
    bankAccount: "",
    bankIfsc: "",
  });
  const [activeAdminBreakup, setActiveAdminBreakup] =
    useState<AdminBreakupType>("bookings");
  const [activeAdminTab, setActiveAdminTab] = useState<AdminPanelTab>("dashboard");
  const [fleetVehicles, setFleetVehicles] =
    useState<FleetVehicle[]>(defaultFleetVehicles);
  const [vehicleMasterForm, setVehicleMasterForm] = useState<VehicleForm>(
    createVehicleForm(),
  );
  const [editingVehicleName, setEditingVehicleName] = useState("");
  const [vehicleMasterStatus, setVehicleMasterStatus] = useState("");
  const [adminBookingSearch, setAdminBookingSearch] = useState("");
  const [nextRide, setNextRide] = useState<DashboardBooking | null>(null);
  const [driverEarning, setDriverEarning] = useState({
    completedRides: 0,
    totalEarning: 0,
    cashAdjustedToEarning: 0,
    availableEarning: 0,
    cashInHand: 0,
  });
  const [pendingCashTransfer, setPendingCashTransfer] = useState(0);
  const [driverCashHistory, setDriverCashHistory] = useState<CashCollectionHistory[]>([]);
  const [cashSettlementForm, setCashSettlementForm] = useState({
    amount: "",
    referenceNumber: "",
  });
  const [maxWithdrawalAmount, setMaxWithdrawalAmount] = useState(0);
  const [collectionPrompt, setCollectionPrompt] = useState<DashboardBooking | null>(
    null,
  );
  const [collectionPromptMode, setCollectionPromptMode] = useState<
    "start" | "complete"
  >("complete");
  const [collectionStatus, setCollectionStatus] = useState("");
  const [showCustomerLogin, setShowCustomerLogin] = useState(false);
  const [customerStatus, setCustomerStatus] = useState("");
  const [customerLookup, setCustomerLookup] = useState({
    bookingId: "",
    mobile: "",
  });
  const [customerBooking, setCustomerBooking] = useState<DashboardBooking | null>(
    null,
  );
  const [adminLookupMobile, setAdminLookupMobile] = useState("");
  const [adminLookupStatus, setAdminLookupStatus] = useState("");
  const [adminLookupRole, setAdminLookupRole] = useState<PortalRole | null>(null);
  const [adminLookupBookings, setAdminLookupBookings] = useState<DashboardBooking[]>([]);
  const [adminLookupDriverVehicles, setAdminLookupDriverVehicles] = useState<DriverRow[]>([]);
  const [adminLookupDriverLedger, setAdminLookupDriverLedger] = useState<DashboardBooking[]>([]);
  const [adminLookupWithdrawals, setAdminLookupWithdrawals] = useState<DriverWithdrawal[]>([]);
  const [adminLookupNextRide, setAdminLookupNextRide] =
    useState<DashboardBooking | null>(null);
  const [adminLookupDriverEarning, setAdminLookupDriverEarning] = useState({
    completedRides: 0,
    totalEarning: 0,
    cashAdjustedToEarning: 0,
    availableEarning: 0,
    cashInHand: 0,
  });
  const [assignmentForm, setAssignmentForm] = useState<
    Record<
      string,
      {
        driverName: string;
        driverMobile: string;
        vehicleName: string;
        vehicleNumber: string;
      }
    >
  >({});
  const [dashboard, setDashboard] = useState<{
    totalBookings: number;
    totalFare: number;
    totalBookingAmount: number;
    totalCollected: number;
    onlineCollected: number;
    driverCashInHand: number;
    recentBookings: DashboardBooking[];
    driverCashSummary: DriverCashSummary[];
    driverLedger: DashboardBooking[];
    withdrawalRequests: DriverWithdrawal[];
    statusHistory: BookingStatusHistory[];
    assignmentHistory: AssignmentHistory[];
    cashCollectionHistory: CashCollectionHistory[];
    priceAdjustmentPercent: number;
    vehicleRateOverrides: VehicleRateOverrides;
    fleetVehicles: FleetVehicle[];
    siteFont: string;
    siteBranding: SiteBranding;
  } | null>(null);
  const [drivers, setDrivers] = useState<DriverProfile[]>([
    {
      name: "Vishnu Driver 1",
      mobile: "7004291529",
      vehicle: "Toyota Innova Crysta",
      vehicleNumber: "",
      status: "Available",
    },
  ]);
  const [driverProfileForm, setDriverProfileForm] = useState<DriverFormData>({
    name: "",
    mobile: "",
    vehicle: "Toyota Innova Crysta",
    vehicleNumber: "",
  });
  const [driverForm, setDriverForm] = useState<DriverFormData>({
    name: "",
    mobile: "",
    vehicle: "Toyota Innova Crysta",
    vehicleNumber: "",
    accountType: "Driver-Cum-Owner",
    approvalStatus: "Approved",
    activeStatus: "Active",
  });
  const [editingVehicleNumber, setEditingVehicleNumber] = useState("");
  const [adminPaymentPrompt, setAdminPaymentPrompt] =
    useState<DashboardBooking | null>(null);
  const [adminPaymentSource, setAdminPaymentSource] = useState<"online" | "driver_cash">(
    "online",
  );
  const [adminPaymentDriverMobile, setAdminPaymentDriverMobile] = useState("");
  const [adminRefundPrompt, setAdminRefundPrompt] =
    useState<DashboardBooking | null>(null);
  const [adminRefundType, setAdminRefundType] = useState<"full" | "partial">("full");
  const [adminRefundMode, setAdminRefundMode] = useState<"amount" | "percent">("amount");
  const [adminRefundValue, setAdminRefundValue] = useState("");
  const [adminRefundSource, setAdminRefundSource] = useState<"online" | "driver_cash">(
    "online",
  );
  const [adminRefundDriverMobile, setAdminRefundDriverMobile] = useState("");
  const [priceAdjustmentPercent, setPriceAdjustmentPercent] = useState(0);
  const [priceAdjustmentInput, setPriceAdjustmentInput] = useState("0");
  const [priceAdjustmentStatus, setPriceAdjustmentStatus] = useState("");
  const [siteFont, setSiteFont] = useState("Plus Jakarta Sans");
  const [siteBranding, setSiteBranding] =
    useState<SiteBranding>(defaultSiteBranding);
  const [isBrandingReady, setIsBrandingReady] = useState(false);
  const [brandingStatus, setBrandingStatus] = useState("");
  const [isBrandingProcessing, setIsBrandingProcessing] = useState(false);
  const [vehicleRateOverrides, setVehicleRateOverrides] =
    useState<VehicleRateOverrides>({});
  const [rateEditorVehicle, setRateEditorVehicle] = useState("Toyota Innova Crysta");
  const [rateEditorForm, setRateEditorForm] = useState<Record<EditableRateKey, string>>({
    perKm: "",
    local4hr: "",
    local8hr: "",
    local10hr: "",
    perHour: "",
    fullDay: "",
    halfDay: "",
    vip: "",
  });
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const [, setShowVehicleStep] = useState(false);
  const [activeSuggestionField, setActiveSuggestionField] = useState<
    "from" | "to" | null
  >(null);
  const [googleFromSuggestions, setGoogleFromSuggestions] = useState<
    PlaceSuggestion[]
  >([]);
  const [googleDestinationSuggestions, setGoogleDestinationSuggestions] =
    useState<PlaceSuggestion[]>([]);
  const [googleFromQuery, setGoogleFromQuery] = useState("");
  const [googleDestinationQuery, setGoogleDestinationQuery] = useState("");
  const [isDistanceLoading, setIsDistanceLoading] = useState(false);
  const [pickupFieldTouched, setPickupFieldTouched] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<{
    bookingId: string;
    estimatedFare: number;
    billableKm: number;
    ratePerKm: number;
  } | null>(null);
  const numericDistance = Math.max(0, Number(distanceKm) || 0);
  const roundTripDays =
    tripType === "Outstation" && outstationTripType === "Round Trip" && date && returnDate
      ? Math.max(
          1,
          Math.ceil(
            (new Date(`${returnDate}T00:00:00`).getTime() -
              new Date(`${date}T00:00:00`).getTime()) /
              86400000,
          ) + 1,
        )
      : 1;
  const selectedLocalPackage =
    localPackageOptions.find((item) => item.id === localPackageType) ||
    localPackageOptions[1];
  const billableDistance =
    tripType === "In-City"
      ? Math.max(numericDistance || selectedLocalPackage.km, selectedLocalPackage.km)
      : tripType === "Airport"
      ? Math.max(numericDistance || minimumLocalAirportKm, minimumLocalAirportKm)
      : tripType === "Outstation" && outstationTripType === "Round Trip"
        ? Math.max(numericDistance * 2, roundTripDays * roundTripDailyKm)
        : numericDistance;
  const effectiveTripType =
    tripType === "Outstation"
      ? outstationTripType
      : tripType === "Airport"
        ? airportTripType
        : `${selectedLocalPackage.label} Local`;
  const selectedPackage = {
    label:
      tripType === "In-City"
        ? selectedLocalPackage.label
        : tripType === "Outstation" && outstationTripType === "Round Trip"
          ? `${roundTripDays} Day Round Trip`
          : tripType === "Airport"
            ? airportTripType
            : packageOptions.find((item) => item.id === packageType)?.label ||
              packageOptions[0].label,
  };
  const vehicles = useMemo(
    () => fleetVehicles.filter((item) => item.active !== false),
    [fleetVehicles],
  );
  const activeRateTable = useMemo(
    () => buildRateTableFromVehicles(fleetVehicles),
    [fleetVehicles],
  );
  const adjustedRateTable = useMemo(() => {
    return Object.fromEntries(
      Object.entries(activeRateTable).map(([vehicleName, rates]) => [
        vehicleName,
        {
          ...rates,
          perKm: applyPriceAdjustment(
            vehicleRateOverrides[vehicleName]?.perKm ?? rates.perKm,
            priceAdjustmentPercent,
          ),
          local4hr: applyPriceAdjustment(
            vehicleRateOverrides[vehicleName]?.local4hr ?? rates.local4hr,
            priceAdjustmentPercent,
          ),
          local8hr: applyPriceAdjustment(
            vehicleRateOverrides[vehicleName]?.local8hr ?? rates.local8hr,
            priceAdjustmentPercent,
          ),
          local10hr: applyPriceAdjustment(
            vehicleRateOverrides[vehicleName]?.local10hr ?? rates.local10hr,
            priceAdjustmentPercent,
          ),
          perHour: applyPriceAdjustment(
            vehicleRateOverrides[vehicleName]?.perHour ?? rates.perHour,
            priceAdjustmentPercent,
          ),
          fullDay: applyPriceAdjustment(
            vehicleRateOverrides[vehicleName]?.fullDay ?? rates.fullDay,
            priceAdjustmentPercent,
          ),
          halfDay: applyPriceAdjustment(
            vehicleRateOverrides[vehicleName]?.halfDay ?? rates.halfDay,
            priceAdjustmentPercent,
          ),
          vip: applyPriceAdjustment(
            vehicleRateOverrides[vehicleName]?.vip ?? rates.vip,
            priceAdjustmentPercent,
          ),
        },
      ]),
    ) as Record<string, VehicleRates>;
  }, [activeRateTable, priceAdjustmentPercent, vehicleRateOverrides]);
  const vehicleRates = useMemo(
    () =>
      vehicles
        .map((item) => {
          const rates = adjustedRateTable[item.name];
          const localBaseFare = rates[selectedLocalPackage.id];
          const localExtraKm =
            tripType === "In-City"
              ? Math.max(0, billableDistance - selectedLocalPackage.km)
              : 0;
          const estimatedFare =
            tripType === "In-City"
              ? Math.round(localBaseFare + localExtraKm * rates.perKm)
              : Math.round(billableDistance * rates.perKm);

          return {
            ...item,
            ...rates,
            estimatedFare,
            fareLabel:
              tripType === "In-City"
                ? `${selectedLocalPackage.label} | Extra Rs. ${rates.perKm}/KM`
                : tripType === "Airport"
                ? `Minimum 40 KM | Extra Rs. ${rates.perKm}/KM`
                : `Rs. ${rates.perKm}/KM`,
          };
        })
        .sort((first, second) => first.estimatedFare - second.estimatedFare),
    [adjustedRateTable, billableDistance, selectedLocalPackage, tripType, vehicles],
  );
  const selectedVehicleRate =
    vehicleRates.find((item) => item.name === vehicle) || vehicleRates[0];
  const fareTotal = selectedVehicleRate?.estimatedFare || 0;
  const chargesAndTaxes = fareTotal ? Math.round(fareTotal * 0.05) : 0;
  const payableFare = fareTotal + chargesAndTaxes;
  const partPayAmount = Math.max(500, Math.round(payableFare * 0.25));
  const selectedPaymentAmount =
    paymentChoice === "zero" ? 0 : paymentChoice === "part" ? partPayAmount : payableFare;
  const formattedFare = formatInr(fareTotal);
  const pickupDateTime = date && pickupTime ? `${date}T${pickupTime}` : "";
  const localRoute = "Mumbai, Maharashtra Local Duty";
  const selectedAirportOption = getAirportOption(airportTripType);
  const isAirportPickup = tripType === "Airport" && selectedAirportOption.mode === "pickup";
  const isAirportDrop = tripType === "Airport" && selectedAirportOption.mode === "drop";
  const bookingStartPoint = startPoint;
  const bookingDropPoint = tripType === "In-City" ? localRoute : drop;
  const routeReady =
    tripType === "In-City"
      ? Boolean(startPoint.trim())
      : isAirportPickup
        ? Boolean(drop.trim())
        : Boolean(startPoint.trim() && drop.trim());
  const advanceBookingReady = pickupDateTime
    ? new Date(pickupDateTime).getTime() - bookingValidationTime >= 8 * 60 * 60 * 1000
    : true;
  const pickupAllowed = isMumbaiPickup(startPoint);
  const showPickupError =
    pickupFieldTouched &&
    !pickupAllowed &&
    startPoint.trim().length >= 3 &&
    activeSuggestionField !== "from";
  const fromQuery = startPoint.trim();
  const destinationQuery = drop.trim();
  const visibleFromSuggestions =
    googleFromQuery === fromQuery && googleFromSuggestions.length > 0
      ? googleFromSuggestions.slice(0, 5)
      : getPlaceSuggestions(startPoint, fromSuggestions, 5).map((item) => ({
          label: item,
          secondary: "Mumbai Pickup",
        }));
  const visibleDestinationSuggestions =
    googleDestinationQuery === destinationQuery &&
    googleDestinationSuggestions.length > 0
      ? googleDestinationSuggestions.slice(0, 5)
      : getPlaceSuggestions(drop, destinationSuggestions, 5).map((item) => ({
          label: item,
          secondary: "Popular Destination",
        }));

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowCookieConsent(
        localStorage.getItem("vishnuToursCookieConsent") !== "accepted",
      );
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const existingIcon = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    const iconLink = existingIcon || document.createElement("link");

    iconLink.rel = "icon";
    iconLink.href = siteBranding.iconUrl;
    iconLink.sizes = `${siteBranding.faviconSize}x${siteBranding.faviconSize}`;

    if (!existingIcon) {
      document.head.appendChild(iconLink);
    }
  }, [siteBranding.faviconSize, siteBranding.iconUrl]);

  useEffect(() => {
    let mounted = true;

    async function loadPriceSetting() {
      try {
        const response = await fetch("/api/bookings?settings=pricing");
        const result = (await response.json()) as {
          priceAdjustmentPercent?: number;
          vehicleRateOverrides?: VehicleRateOverrides;
          fleetVehicles?: FleetVehicle[];
          siteFont?: string;
          siteBranding?: SiteBranding;
        };
        const percent = Number(result.priceAdjustmentPercent || 0);

        if (mounted && Number.isFinite(percent)) {
          setPriceAdjustmentPercent(percent);
          setPriceAdjustmentInput(String(percent));
          const savedOverrides = result.vehicleRateOverrides || {};
          const savedFleetVehicles = result.fleetVehicles?.length
            ? result.fleetVehicles
            : defaultFleetVehicles;
          setSiteFont(result.siteFont || "Plus Jakarta Sans");
          setSiteBranding(normalizeSiteBranding(result.siteBranding));
          setFleetVehicles(savedFleetVehicles);
          setVehicle((currentVehicle) =>
            savedFleetVehicles.some((item) => item.name === currentVehicle)
              ? currentVehicle
              : savedFleetVehicles[0]?.name || "Toyota Innova Crysta",
          );
          setVehicleRateOverrides(savedOverrides);
          setRateEditorForm(
            buildEditableRateForm(
              "Toyota Innova Crysta",
              savedOverrides,
              buildRateTableFromVehicles(savedFleetVehicles),
            ),
          );
        }
      } catch {
        if (mounted) {
          setPriceAdjustmentPercent(0);
          setPriceAdjustmentInput("0");
          setFleetVehicles(defaultFleetVehicles);
          setVehicleRateOverrides({});
          setRateEditorForm(buildEditableRateForm("Toyota Innova Crysta", {}));
        }
      } finally {
        if (mounted) {
          setIsBrandingReady(true);
        }
      }
    }

    loadPriceSetting();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const query = startPoint.trim();

    if (query.length < 1 || activeSuggestionField !== "from") {
      return () => {
        mounted = false;
      };
    }

    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/places?field=from&input=${encodeURIComponent(query)}`,
        );
        const result = (await response.json()) as {
          suggestions?: PlaceSuggestion[];
        };

        if (mounted) {
          setGoogleFromQuery(query);
          setGoogleFromSuggestions(result.suggestions || []);
        }
      } catch {
        if (mounted) {
          setGoogleFromQuery("");
          setGoogleFromSuggestions([]);
        }
      }
    }, 220);

    return () => {
      mounted = false;
      window.clearTimeout(timeout);
    };
  }, [activeSuggestionField, startPoint]);

  useEffect(() => {
    let mounted = true;
    const query = drop.trim();

    if (query.length < 1 || activeSuggestionField !== "to") {
      return () => {
        mounted = false;
      };
    }

    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/places?field=to&input=${encodeURIComponent(query)}`,
        );
        const result = (await response.json()) as {
          suggestions?: PlaceSuggestion[];
        };

        if (mounted) {
          setGoogleDestinationQuery(query);
          setGoogleDestinationSuggestions(result.suggestions || []);
        }
      } catch {
        if (mounted) {
          setGoogleDestinationQuery("");
          setGoogleDestinationSuggestions([]);
        }
      }
    }, 220);

    return () => {
      mounted = false;
      window.clearTimeout(timeout);
    };
  }, [activeSuggestionField, drop]);

  useEffect(() => {
    let mounted = true;
    const origin = startPoint.trim();
    const destination = drop.trim();

    if (!isMumbaiPickup(origin) || destination.length < 4 || origin.length < 3) {
      return () => {
        mounted = false;
      };
    }

    const timeout = window.setTimeout(async () => {
      setIsDistanceLoading(true);

      try {
        const response = await fetch("/api/distance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ origin, destination }),
        });
        const result = (await response.json()) as {
          distanceKm?: number;
        };

        if (mounted && response.ok && result.distanceKm) {
          setDistanceKm(String(result.distanceKm));
        }
      } catch {
        // Keep the manually editable KM field as the fallback.
      } finally {
        if (mounted) {
          setIsDistanceLoading(false);
        }
      }
    }, 520);

    return () => {
      mounted = false;
      window.clearTimeout(timeout);
    };
  }, [drop, startPoint]);

  useEffect(() => {
    if (bookingView === "cars") {
      window.setTimeout(() => {
        carResultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }, [bookingView]);

  useEffect(() => {
    if (bookingView === "review") {
      window.setTimeout(() => {
        reviewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }, [bookingView]);

  const bookingText = useMemo(() => {
    return [
      "Hello Vishnu Tours, I Want To Book A Cab.",
      `Trip: ${effectiveTripType}`,
      `Cab: ${vehicle}`,
      `Start Point: ${bookingStartPoint}`,
      `Destination: ${bookingDropPoint || "Please confirm"}`,
      `Estimated Distance: ${numericDistance || "Please confirm"} km`,
      `Billable Distance: ${billableDistance || "Please confirm"} km`,
      `Rate: ${selectedVehicleRate?.fareLabel || `Rs. ${perKmRate}/KM`}`,
      `Estimated Fare: ${fareTotal ? formattedFare : "Please confirm"}`,
      `Date/Time: ${pickupDateTime || "Please confirm"}`,
      `Name: ${name || "Guest"}`,
      `Mobile: ${mobile || "Please confirm"}`,
      `Package: ${selectedPackage.label}`,
      `Payment: ${paymentMode}`,
    ].join("\n");
  }, [
    effectiveTripType,
    vehicle,
    bookingStartPoint,
    bookingDropPoint,
    numericDistance,
    billableDistance,
    fareTotal,
    formattedFare,
    pickupDateTime,
    name,
    mobile,
    selectedPackage.label,
    selectedVehicleRate?.fareLabel,
    paymentMode,
  ]);

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    bookingText,
  )}`;

  function updateDestination(value: string) {
    setDrop(value);
    setGoogleDestinationSuggestions([]);
    setGoogleDestinationQuery("");
    setShowVehicleStep(false);
    setBookingView("home");
    setConfirmedBooking(null);
    setIsPaymentComplete(false);
    setShowBookingTicket(false);
    const detectedTripType = getLocationTripType(startPoint, value);

    if (detectedTripType && detectedTripType !== tripType) {
      setTripType(detectedTripType);
    }

    const distance = getDestinationDistance(value);

    if (distance) {
      setDistanceKm(String(distance));
    }
  }

  function resetBooking() {
    setBookingView("home");
    setVehicle("Toyota Innova Crysta");
    setDrop("");
    setDistanceKm("");
    setDate("");
    setReturnDate("");
    setPickupTime("10:00");
    setName("");
    setMobile("");
    setEmail("");
    setPaymentMode("Pay Advance After Fare Confirmation");
    setPaymentChoice("part");
    setAdvanceAmount("500");
    setPaymentStatus("");
    setBookingStatus("");
    setTicketShareStatus("");
    setConfirmedBooking(null);
    setIsPaymentComplete(false);
    setShowBookingTicket(false);
  }

  function updateStartPoint(value: string) {
    setStartPoint(value);
    setGoogleFromSuggestions([]);
    setGoogleFromQuery("");
    setShowVehicleStep(false);
    setBookingView("home");
    setConfirmedBooking(null);
    setIsPaymentComplete(false);
    setShowBookingTicket(false);
    setBookingStatus("");
    const detectedTripType = getLocationTripType(value, drop);

    if (detectedTripType && detectedTripType !== tripType) {
      setTripType(detectedTripType);
    }
  }

  function useCurrentLocation() {
    setBookingStatus("");

    if (!navigator.geolocation) {
      setBookingStatus("Current Location Is Not Available In This Browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateStartPoint(
          `Current Location (${latitude.toFixed(5)}, ${longitude.toFixed(
            5,
          )}), Mumbai, Maharashtra`,
        );
      },
      () => {
        setBookingStatus("Please Allow Current Location Permission Or Type Your Pickup Location.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  function continueToRates() {
    setBookingStatus("");
    setConfirmedBooking(null);
    setIsPaymentComplete(false);

    if (!pickupAllowed) {
      setPickupFieldTouched(true);
      setBookingStatus(
        "Sorry, Pickup Is Available Only From Mumbai And Nearby Mumbai Areas.",
      );
      return;
    }

    if (!routeReady || !billableDistance || !date || !pickupTime) {
      setBookingStatus("Please Fill Required Location, Date, Time And Distance.");
      return;
    }

    if (!advanceBookingReady) {
      setBookingStatus("Booking Is Accepted Only At Least 8 Hours Before Pickup Time.");
      return;
    }

    if (tripType === "Outstation" && outstationTripType === "Round Trip" && !returnDate) {
      setBookingStatus("Please Select Drop Date For Round Trip.");
      return;
    }

    setShowVehicleStep(true);
    setBookingView("cars");
  }

  function reviewSelectedCab(selectedCab: string) {
    setVehicle(selectedCab);
    setBookingStatus("");
    setPaymentStatus("");
    setConfirmedBooking(null);
    setIsPaymentComplete(false);
    setShowBookingTicket(false);
    setBookingView("review");
  }

  async function submitBooking(selectedCab = vehicle) {
    if (!pickupAllowed) {
      setPickupFieldTouched(true);
      setBookingStatus(
        "Sorry, Pickup Is Available Only From Mumbai And Nearby Mumbai Areas.",
      );
      return;
    }

    if (!routeReady || !billableDistance || !pickupDateTime || !name || !mobile || !email) {
      setBookingStatus("Please Fill Required Location, KM, Date, Name, Mobile And Email.");
      return null;
    }

    if (!advanceBookingReady) {
      setBookingStatus("Booking Is Accepted Only At Least 8 Hours Before Pickup Time.");
      return null;
    }

    setVehicle(selectedCab);
    setIsBooking(true);
    setBookingStatus("");
    setConfirmedBooking(null);
    setIsPaymentComplete(false);
    setShowBookingTicket(false);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripType: effectiveTripType,
          vehicle: selectedCab,
          startPoint: bookingStartPoint,
          destination: bookingDropPoint,
          distanceKm: billableDistance,
          date: pickupDateTime,
          returnDate:
            tripType === "Outstation" && outstationTripType === "Round Trip"
              ? returnDate
              : "",
          name,
          mobile,
          email,
          packageType: selectedPackage.label,
          paymentMode,
        }),
      });
      const result = (await response.json()) as {
        booking?: {
          bookingId: string;
          estimatedFare: number;
          billableKm: number;
          ratePerKm: number;
        };
        error?: string;
      };

      if (!response.ok || !result.booking) {
        setBookingStatus(result.error || "Booking Could Not Be Saved.");
        return null;
      }

      setConfirmedBooking(result.booking);
      setAdvanceAmount(String(selectedPaymentAmount || result.booking.estimatedFare));
      setBookingStatus(`${selectedCab} Booking Has Been Saved Successfully.`);
      return result.booking;
    } catch {
      setBookingStatus("Booking Could Not Be Saved Because Of A Network Issue.");
      return null;
    } finally {
      setIsBooking(false);
    }
  }

  async function proceedReviewBooking() {
    const booking = await submitBooking(vehicle);

    if (!booking) {
      return;
    }

    if (selectedPaymentAmount > 0) {
      setAdvanceAmount(String(selectedPaymentAmount));
      await startPayment(booking, selectedPaymentAmount);
    } else {
      setIsPaymentComplete(false);
      setShowBookingTicket(true);
      playBookingConfirmSound();
      setBookingStatus("Booking Confirmed. Payment Is Pending.");
      setPaymentStatus("Booking Confirmed. Customer Can Pay Later.");
    }
  }

  function playBookingConfirmSound() {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;

      if (!AudioContextClass) {
        return;
      }

      const audioContext = new AudioContextClass();
      const gain = audioContext.createGain();
      gain.gain.setValueAtTime(0.001, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.18, audioContext.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.42);
      gain.connect(audioContext.destination);

      [660, 880].forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(
          frequency,
          audioContext.currentTime + index * 0.13,
        );
        oscillator.connect(gain);
        oscillator.start(audioContext.currentTime + index * 0.13);
        oscillator.stop(audioContext.currentTime + index * 0.13 + 0.18);
      });
    } catch {
      // Sound feedback is optional; booking confirmation should never fail.
    }
  }

  async function startPayment(
    bookingOverride?: {
      bookingId: string;
      estimatedFare: number;
      billableKm: number;
      ratePerKm: number;
    },
    amountOverride?: number,
  ) {
    const activeBooking = bookingOverride || confirmedBooking;
    const amount = Number(amountOverride || advanceAmount);

    if (!amount || amount < 1) {
      setPaymentStatus("Please enter a valid advance amount.");
      return;
    }

    if (!activeBooking) {
      setPaymentStatus("Please complete booking first, then pay.");
      return;
    }

    setIsPaying(true);
    setPaymentStatus("");

    let order: { keyId?: string; orderId?: string | null; error?: string };

    try {
      const response = await fetch("/api/razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(amount * 100),
          receipt: `vishnu-${activeBooking.bookingId}`,
          notes: {
	            bookingId: activeBooking.bookingId,
                customerMobile: mobile,
	            name,
            mobile,
            pickup: bookingStartPoint,
            drop: bookingDropPoint,
            vehicle,
            tripType: effectiveTripType,
            distanceKm: String(billableDistance),
            packageType: selectedPackage.label,
            estimatedFare: String(activeBooking.estimatedFare),
          },
        }),
      });
      order = (await response.json()) as {
        keyId?: string;
        orderId?: string | null;
        error?: string;
      };
    } catch {
      order = { error: "Payment Gateway Could Not Be Reached." };
    }

    if (!order.keyId) {
      setIsPaying(false);
      setPaymentStatus(
        order.error ||
          "Razorpay Credentials Are Not Configured. Please Add Razorpay Key ID And Key Secret.",
      );
      return;
    }

    if (!window.Razorpay) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Razorpay failed to load"));
        document.body.appendChild(script);
      }).catch(() => {
        setPaymentStatus("Payment Gateway Could Not Load. Please Try Again.");
      });
    }

    if (!window.Razorpay) {
      setIsPaying(false);
      return;
    }

    const checkoutOptions: Record<string, unknown> = {
      key: order.keyId,
      amount: Math.round(amount * 100),
      currency: "INR",
      name: "Vishnu Tours",
      description: `${activeBooking.bookingId} ${effectiveTripType} booking`,
      prefill: {
        name,
        contact: mobile,
        email,
      },
      notes: {
        bookingId: activeBooking.bookingId,
        pickup: bookingStartPoint,
        drop: bookingDropPoint,
        vehicle,
        tripType: effectiveTripType,
        distanceKm: String(billableDistance),
        packageType: selectedPackage.label,
        estimatedFare: String(activeBooking.estimatedFare),
      },
      theme: {
        color: "#f6bd16",
      },
	      handler: async (gatewayPayment: RazorpaySuccess) => {
          try {
            await verifyRazorpayPayment(activeBooking.bookingId, gatewayPayment);
            setIsPaymentComplete(true);
            setShowBookingTicket(true);
            setPaymentStatus("Payment Verified And Received Successfully.");
            playBookingConfirmSound();
          } catch (error) {
            setPaymentStatus(
              error instanceof Error ? error.message : "Payment Could Not Be Verified.",
            );
          } finally {
            setIsPaying(false);
          }
	      },
      modal: {
        ondismiss: () => {
          setIsPaying(false);
        setPaymentStatus("Payment Was Closed Before Completion.");
        },
      },
    };

    if (order.orderId) {
      checkoutOptions.order_id = order.orderId;
    }

    const checkout = new window.Razorpay(checkoutOptions);

    checkout.on("payment.failed", (response) => {
      setIsPaying(false);
      setPaymentStatus(
        response.error?.description ||
          "Payment Failed. No Amount Has Been Marked As Received.",
      );
    });

    checkout.open();
  }

  async function loadDashboard(options: { silent?: boolean } = {}) {
    const normalizedMobile = loginMobile.replace(/\D/g, "");

    if (!normalizedMobile) {
      setPortalStatus("Please Enter Mobile Number.");
      return;
    }

    if (!options.silent) {
      setPortalStatus("Loading Portal...");
      setPortalRole(null);
      setDashboard(null);
      setPortalBookings([]);
      setDriverVehicles([]);
      setDriverLedger([]);
      setBookingStatusHistory([]);
      setAssignmentHistory([]);
      setWithdrawalRequests([]);
      setDriverCashHistory([]);
      setNextRide(null);
      setMaxWithdrawalAmount(0);
      setPendingCashTransfer(0);
    }

    try {
      const response = await fetch(
        `/api/bookings?loginMobile=${encodeURIComponent(normalizedMobile)}`,
      );
      const result = (await response.json()) as {
        role?: PortalRole;
        totalBookings?: number;
        totalFare?: number;
        totalBookingAmount?: number;
        totalCollected?: number;
        onlineCollected?: number;
        driverCashInHand?: number;
        priceAdjustmentPercent?: number;
        vehicleRateOverrides?: VehicleRateOverrides;
        fleetVehicles?: FleetVehicle[];
        siteFont?: string;
        siteBranding?: SiteBranding;
        recentBookings?: DashboardBooking[];
        drivers?: DriverRow[];
        driverVehicles?: DriverRow[];
        driverLedger?: DashboardBooking[];
        withdrawalRequests?: DriverWithdrawal[];
        statusHistory?: BookingStatusHistory[];
        assignmentHistory?: AssignmentHistory[];
        cashCollectionHistory?: CashCollectionHistory[];
        nextRide?: DashboardBooking | null;
        driverCashSummary?: DriverCashSummary[];
        driverCashInHand?: number;
        driverProfile?: DriverRow | null;
        driverEarning?: {
          completedRides: number;
          totalEarning: number;
          cashAdjustedToEarning: number;
          availableEarning: number;
        };
        maxWithdrawalAmount?: number;
        pendingCashTransfer?: number;
        error?: string;
      };

      if (!response.ok) {
        const loginError = result.error || "No User Found. Please Check Mobile Number.";
        setPortalStatus(loginError);
        if (!options.silent) {
          window.alert(loginError);
          setDashboard(null);
        }
        return;
      }

      setPortalRole(result.role || "customer");
      setPortalBookings(sortDashboardBookings(result.recentBookings || []));
      setDriverVehicles(result.driverVehicles || []);
      setDriverLedger(result.driverLedger || []);
      setBookingStatusHistory(result.statusHistory || []);
      setAssignmentHistory(result.assignmentHistory || []);
      setWithdrawalRequests(result.withdrawalRequests || []);
      setDriverCashHistory(result.cashCollectionHistory || []);
      setNextRide(result.nextRide || null);

      if (result.drivers) {
        setDrivers(
          result.drivers.map((driver) => ({
            name: driver.driver_name,
            mobile: driver.driver_mobile,
            vehicle: driver.vehicle_type,
            vehicleNumber: driver.vehicle_number,
            updatedAt: driver.updated_at,
            status: "Available",
            email: driver.email,
            address: driver.address,
            emergencyContact: driver.emergency_contact,
            drivingLicense: driver.driving_license,
            licenseExpiry: driver.license_expiry,
            accountType: driver.account_type,
            approvalStatus: driver.approval_status,
            activeStatus: driver.active_status,
            joiningDate: driver.joining_date,
            ownerMobile: driver.owner_mobile,
            seatingCapacity: driver.seating_capacity,
            fuelType: driver.fuel_type,
            insuranceExpiry: driver.insurance_expiry,
          })),
        );
      }

      if (result.role === "admin") {
        const currentPriceAdjustment = Number(result.priceAdjustmentPercent || 0);

        setPriceAdjustmentPercent(currentPriceAdjustment);
        setPriceAdjustmentInput(String(currentPriceAdjustment));
        const savedOverrides = result.vehicleRateOverrides || {};
        const savedFleetVehicles = result.fleetVehicles?.length
          ? result.fleetVehicles
          : defaultFleetVehicles;
        const savedSiteFont = result.siteFont || "Plus Jakarta Sans";
        const savedSiteBranding = normalizeSiteBranding(result.siteBranding);

        setSiteFont(savedSiteFont);
        setSiteBranding(savedSiteBranding);
        setFleetVehicles(savedFleetVehicles);
        setVehicleRateOverrides(savedOverrides);
        setRateEditorForm(
          buildEditableRateForm(
            rateEditorVehicle,
            savedOverrides,
            buildRateTableFromVehicles(savedFleetVehicles),
          ),
        );
        setDashboard({
          totalBookings: result.totalBookings || 0,
          totalFare: result.totalFare || 0,
          totalBookingAmount: result.totalBookingAmount || result.totalFare || 0,
          totalCollected: result.totalCollected || 0,
          onlineCollected: result.onlineCollected || 0,
          driverCashInHand: result.driverCashInHand || 0,
          priceAdjustmentPercent: currentPriceAdjustment,
          siteFont: savedSiteFont,
          siteBranding: savedSiteBranding,
          recentBookings: result.recentBookings || [],
          driverCashSummary: result.driverCashSummary || [],
          driverLedger: result.driverLedger || [],
          withdrawalRequests: result.withdrawalRequests || [],
          statusHistory: result.statusHistory || [],
          assignmentHistory: result.assignmentHistory || [],
          cashCollectionHistory: result.cashCollectionHistory || [],
          vehicleRateOverrides: savedOverrides,
          fleetVehicles: savedFleetVehicles,
        });
      }

      if (result.role === "driver") {
        setDriverProfileForm({
          name: result.driverProfile?.driver_name || "",
          mobile: normalizedMobile,
          vehicle: result.driverProfile?.vehicle_type || "Toyota Innova Crysta",
          vehicleNumber: result.driverProfile?.vehicle_number || "",
          email: result.driverProfile?.email || "",
          address: result.driverProfile?.address || "",
          emergencyContact: result.driverProfile?.emergency_contact || "",
          drivingLicense: result.driverProfile?.driving_license || "",
          licenseExpiry: result.driverProfile?.license_expiry || "",
          accountType: result.driverProfile?.account_type || "Driver-Cum-Owner",
          approvalStatus: result.driverProfile?.approval_status || "Approved",
          activeStatus: result.driverProfile?.active_status || "Active",
          joiningDate: result.driverProfile?.joining_date || "",
        });
        setDriverEarning({
          completedRides: result.driverEarning?.completedRides || 0,
          totalEarning: result.driverEarning?.totalEarning || 0,
          cashAdjustedToEarning: result.driverEarning?.cashAdjustedToEarning || 0,
          availableEarning: result.driverEarning?.availableEarning || 0,
          cashInHand: result.driverCashInHand || 0,
        });
        setPendingCashTransfer(result.pendingCashTransfer || 0);
        setMaxWithdrawalAmount(result.maxWithdrawalAmount || 0);
        setWithdrawalForm((currentForm) => ({
          ...currentForm,
          bankName: result.driverProfile?.bank_name || currentForm.bankName,
          bankAccount: result.driverProfile?.bank_account || currentForm.bankAccount,
          bankIfsc: result.driverProfile?.bank_ifsc || currentForm.bankIfsc,
        }));
      }

      if (!options.silent) {
        setPortalStatus("");
      }
    } catch {
      const loginError = "Portal Could Not Load. Please Try Again.";
      if (!options.silent) {
        setPortalStatus(loginError);
        window.alert(loginError);
        setDashboard(null);
      }
    }
  }

  useEffect(() => {
    const normalizedLoginMobile = loginMobile.replace(/\D/g, "");
    const adminIsViewingAnotherDashboard =
      normalizedLoginMobile === "7004291529" && portalRole !== "admin";

    if (!portalRole || !normalizedLoginMobile || adminIsViewingAnotherDashboard) {
      return;
    }

    const refreshTimer = window.setInterval(() => {
      void loadDashboard({ silent: true });
    }, 15000);

    return () => window.clearInterval(refreshTimer);
    // Dashboard refresh intentionally follows the active login identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portalRole, loginMobile]);

  async function openAdminLookupDashboard(targetMobile = adminLookupMobile) {
    const normalizedMobile = targetMobile.replace(/\D/g, "");

    if (!normalizedMobile) {
      setAdminLookupStatus("Please Enter Driver Or Customer Mobile Number.");
      return;
    }

    if (normalizedMobile === "7004291529") {
      setAdminLookupStatus("Admin Dashboard Is Already Open.");
      return;
    }

    setActiveAdminTab("portalLookup");
    setAdminLookupStatus("Opening Dashboard...");
    setAdminLookupRole(null);
    setAdminLookupBookings([]);
    setAdminLookupDriverVehicles([]);
    setAdminLookupDriverLedger([]);
    setAdminLookupWithdrawals([]);
    setAdminLookupNextRide(null);

    try {
      const response = await fetch(
        `/api/bookings?loginMobile=${encodeURIComponent(normalizedMobile)}`,
      );
      const result = (await response.json()) as {
        role?: PortalRole;
        recentBookings?: DashboardBooking[];
        driverVehicles?: DriverRow[];
        driverLedger?: DashboardBooking[];
        withdrawalRequests?: DriverWithdrawal[];
        nextRide?: DashboardBooking | null;
        driverCashInHand?: number;
        driverEarning?: {
          completedRides: number;
          totalEarning: number;
          cashAdjustedToEarning: number;
          availableEarning: number;
        };
        error?: string;
      };

      if (!response.ok) {
        setAdminLookupStatus(result.error || "No User Found. Please Check Mobile Number.");
        return;
      }

      setAdminLookupRole(result.role || "customer");
      setAdminLookupBookings(sortDashboardBookings(result.recentBookings || []));
      setAdminLookupDriverVehicles(result.driverVehicles || []);
      setAdminLookupDriverLedger(result.driverLedger || []);
      setAdminLookupWithdrawals(result.withdrawalRequests || []);
      setAdminLookupNextRide(result.nextRide || null);
      setAdminLookupDriverEarning({
        completedRides: result.driverEarning?.completedRides || 0,
        totalEarning: result.driverEarning?.totalEarning || 0,
        cashAdjustedToEarning: result.driverEarning?.cashAdjustedToEarning || 0,
        availableEarning: result.driverEarning?.availableEarning || 0,
        cashInHand: result.driverCashInHand || 0,
      });
      setAdminLookupStatus("");
    } catch {
      setAdminLookupStatus("Dashboard Could Not Be Opened.");
    }
  }

  function getAdminLookupOptions(activeDashboard: NonNullable<typeof dashboard>) {
    const driverMap = new Map<string, DriverProfile>();

    drivers.forEach((driver) => {
      if (driver.mobile && driver.mobile !== "7004291529" && !driverMap.has(driver.mobile)) {
        driverMap.set(driver.mobile, driver);
      }
    });

    const driverOptions = Array.from(driverMap.values()).map((driver) => ({
      key: `driver-${driver.mobile}`,
      label: `Driver | ${driver.name || "Driver"} | ${driver.mobile} | ${driver.vehicle}`,
      mobile: driver.mobile,
    }));
    const customerMap = new Map<string, string>();

    activeDashboard.recentBookings.forEach((booking) => {
      if (booking.customer_mobile) {
        customerMap.set(booking.customer_mobile, booking.customer_name || "Customer");
      }
    });

    const customerOptions = Array.from(customerMap.entries()).map(([mobile, name]) => ({
      key: `customer-${mobile}`,
      label: `Customer | ${name} | ${mobile}`,
      mobile,
    }));

    return [...driverOptions, ...customerOptions];
  }

  function getUniqueDriverOptions() {
    const driverMap = new Map<string, DriverProfile>();

    drivers.forEach((driver) => {
      if (driver.mobile && !driverMap.has(driver.mobile)) {
        driverMap.set(driver.mobile, driver);
      }
    });

    return Array.from(driverMap.values());
  }

  function selectAdminLookupDashboard(mobile: string) {
    setAdminLookupMobile(mobile);

    if (!mobile) {
      return;
    }

    openAdminLookupDashboard(mobile);
  }

  async function saveIndividualCarFare() {
    const normalizedMobile = loginMobile.replace(/\D/g, "");
    const nextRates: Partial<Record<EditableRateKey, number>> = {};

    for (const rateKey of editableRateKeys) {
      const rateValue = Number(rateEditorForm[rateKey]);

      if (!Number.isFinite(rateValue) || rateValue < 0 || rateValue > 1000000) {
        setPriceAdjustmentStatus("Enter Valid Car Fare Amounts.");
        return;
      }

      nextRates[rateKey] = Math.round(rateValue);
    }

    const nextOverrides = {
      ...vehicleRateOverrides,
      [rateEditorVehicle]: nextRates,
    };

    setPriceAdjustmentStatus("Saving Individual Car Fare...");

    try {
      const response = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateVehicleRates",
          adminMobile: normalizedMobile,
          vehicleRateOverrides: nextOverrides,
        }),
      });
      const result = (await response.json()) as {
        error?: string;
        vehicleRateOverrides?: VehicleRateOverrides;
      };

      if (!response.ok) {
        setPriceAdjustmentStatus(result.error || "Car Fare Could Not Be Updated.");
        return;
      }

      const savedOverrides = result.vehicleRateOverrides || nextOverrides;

      setVehicleRateOverrides(savedOverrides);
      setRateEditorForm(
        buildEditableRateForm(rateEditorVehicle, savedOverrides, activeRateTable),
      );
      setDashboard((currentDashboard) =>
        currentDashboard
          ? { ...currentDashboard, vehicleRateOverrides: savedOverrides }
          : currentDashboard,
      );
      setPriceAdjustmentStatus("Individual Car Fare Updated Successfully.");
    } catch {
      setPriceAdjustmentStatus("Car Fare Could Not Be Updated.");
    }
  }

  function resetIndividualCarFareInput() {
    setRateEditorForm(
      buildEditableRateForm(rateEditorVehicle, vehicleRateOverrides, activeRateTable),
    );
    setPriceAdjustmentStatus("");
  }

  function parseVehicleMasterForm() {
    const vehicleName = vehicleMasterForm.name.trim();

    if (!vehicleName) {
      setVehicleMasterStatus("Please Enter Vehicle Name.");
      return null;
    }

    const rates = Object.fromEntries(
      editableRateKeys.map((rateKey) => [
        rateKey,
        Math.round(Number(vehicleMasterForm[rateKey]) || 0),
      ]),
    ) as VehicleRates;

    if (editableRateKeys.some((rateKey) => rates[rateKey] < 1)) {
      setVehicleMasterStatus("Please Enter Complete Rate Chart For This Vehicle.");
      return null;
    }

    return {
      name: vehicleName,
      type: vehicleMasterForm.type.trim() || "Corporate Cab",
      seats: vehicleMasterForm.seats.trim() || "4 Seats",
      luggage: vehicleMasterForm.luggage.trim() || "2 Suitcases",
      bestFor:
        vehicleMasterForm.bestFor.trim() ||
        "Corporate Guests, Airport Transfers And Outstation Travel",
      photo: vehicleMasterForm.photo.trim() || "/fleet/innova-crysta.png?v=52a12bf",
      active: vehicleMasterForm.active,
      rates,
    };
  }

  async function saveFleetVehicles(nextFleetVehicles: FleetVehicle[], successMessage: string) {
    const normalizedMobile = loginMobile.replace(/\D/g, "");

    setVehicleMasterStatus("Saving My Vehicle...");

    try {
      const response = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateFleetVehicles",
          adminMobile: normalizedMobile,
          fleetVehicles: nextFleetVehicles,
        }),
      });
      const result = (await response.json()) as {
        error?: string;
        fleetVehicles?: FleetVehicle[];
      };

      if (!response.ok) {
        setVehicleMasterStatus(result.error || "Vehicle Could Not Be Saved.");
        return false;
      }

      const savedFleetVehicles = result.fleetVehicles?.length
        ? result.fleetVehicles
        : nextFleetVehicles;

      setFleetVehicles(savedFleetVehicles);
      setDashboard((currentDashboard) =>
        currentDashboard
          ? { ...currentDashboard, fleetVehicles: savedFleetVehicles }
          : currentDashboard,
      );
      setVehicle((currentVehicle) =>
        savedFleetVehicles.some((item) => item.name === currentVehicle)
          ? currentVehicle
          : savedFleetVehicles[0]?.name || "Toyota Innova Crysta",
      );
      setRateEditorVehicle((currentVehicle) =>
        savedFleetVehicles.some((item) => item.name === currentVehicle)
          ? currentVehicle
          : savedFleetVehicles[0]?.name || "Toyota Innova Crysta",
      );
      setVehicleMasterStatus(successMessage);
      return true;
    } catch {
      setVehicleMasterStatus("Vehicle Could Not Be Saved.");
      return false;
    }
  }

  async function saveVehicleMaster() {
    const nextVehicle = parseVehicleMasterForm();

    if (!nextVehicle) {
      return;
    }

    const duplicateVehicle = fleetVehicles.find(
      (item) =>
        item.name.toLowerCase() === nextVehicle.name.toLowerCase() &&
        item.name !== editingVehicleName,
    );

    if (duplicateVehicle) {
      setVehicleMasterStatus("This Vehicle Name Already Exists.");
      return;
    }

    const nextFleetVehicles = editingVehicleName
      ? fleetVehicles.map((item) =>
          item.name === editingVehicleName ? nextVehicle : item,
        )
      : [...fleetVehicles, nextVehicle];
    const saved = await saveFleetVehicles(
      nextFleetVehicles,
      editingVehicleName ? "Vehicle Updated Successfully." : "New Vehicle Added Successfully.",
    );

    if (saved) {
      setEditingVehicleName("");
      setVehicleMasterForm(createVehicleForm());
    }
  }

  function editVehicleMaster(vehicleItem: FleetVehicle) {
    setEditingVehicleName(vehicleItem.name);
    setVehicleMasterForm(createVehicleForm(vehicleItem));
    setVehicleMasterStatus("Edit Vehicle Details And Click Save Vehicle.");
  }

  function handleVehiclePhotoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setVehicleMasterStatus("Please Upload A Valid Image File.");
      event.target.value = "";
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setVehicleMasterStatus("Image Size Should Be Less Than 4 MB.");
      event.target.value = "";
      return;
    }

    setVehicleMasterStatus("Preparing Vehicle Photo...");

    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const maxWidth = 900;
        const maxHeight = 520;
        const scale = Math.min(1, maxWidth / image.width, maxHeight / image.height);
        const canvas = document.createElement("canvas");

        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));

        const context = canvas.getContext("2d");

        if (!context) {
          setVehicleMasterStatus("Photo Could Not Be Prepared.");
          return;
        }

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        const photoDataUrl = canvas.toDataURL("image/jpeg", 0.82);

        setVehicleMasterForm((currentForm) => ({
          ...currentForm,
          photo: photoDataUrl,
        }));
        setVehicleMasterStatus("Photo Uploaded. Click Save Vehicle To Publish.");
      };

      image.onerror = () => {
        setVehicleMasterStatus("Photo Could Not Be Loaded.");
      };

      image.src = String(reader.result || "");
    };

    reader.onerror = () => {
      setVehicleMasterStatus("Photo Upload Failed.");
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  }

  async function deleteVehicleMaster(vehicleName: string) {
    if (fleetVehicles.length <= 1) {
      setVehicleMasterStatus("At Least One Vehicle Must Remain Active On Site.");
      return;
    }

    if (!window.confirm(`Delete ${vehicleName} From My Vehicle?`)) {
      return;
    }

    const saved = await saveFleetVehicles(
      fleetVehicles.filter((item) => item.name !== vehicleName),
      "Vehicle Deleted Successfully.",
    );

    if (saved && editingVehicleName === vehicleName) {
      setEditingVehicleName("");
      setVehicleMasterForm(createVehicleForm());
    }
  }

  async function saveMasterPriceAdjustment() {
    const normalizedMobile = loginMobile.replace(/\D/g, "");
    const percent = Number(priceAdjustmentInput);

    if (!Number.isFinite(percent) || percent < -90 || percent > 200) {
      setPriceAdjustmentStatus("Enter A Valid Percentage Between -90 And 200.");
      return;
    }

    setPriceAdjustmentStatus("Saving Master Price...");

    try {
      const response = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updatePriceAdjustment",
          adminMobile: normalizedMobile,
          priceAdjustmentPercent: percent,
        }),
      });
      const result = (await response.json()) as {
        error?: string;
        priceAdjustmentPercent?: number;
      };

      if (!response.ok) {
        setPriceAdjustmentStatus(result.error || "Master Price Could Not Be Updated.");
        return;
      }

      const savedPercent = Number(result.priceAdjustmentPercent || percent);

      setPriceAdjustmentPercent(savedPercent);
      setPriceAdjustmentInput(String(savedPercent));
      setDashboard((currentDashboard) =>
        currentDashboard
          ? { ...currentDashboard, priceAdjustmentPercent: savedPercent }
          : currentDashboard,
      );
      setPriceAdjustmentStatus("Master Price Updated Successfully.");
    } catch {
      setPriceAdjustmentStatus("Master Price Could Not Be Updated.");
    }
  }

  async function saveSiteFont() {
    const normalizedMobile = loginMobile.replace(/\D/g, "");

    setPriceAdjustmentStatus("Saving Site Font...");

    try {
      const response = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateSiteFont",
          adminMobile: normalizedMobile,
          siteFont,
        }),
      });
      const result = (await response.json()) as {
        error?: string;
        siteFont?: string;
      };

      if (!response.ok) {
        setPriceAdjustmentStatus(result.error || "Site Font Could Not Be Updated.");
        return;
      }

      const savedSiteFont = result.siteFont || siteFont;

      setSiteFont(savedSiteFont);
      setDashboard((currentDashboard) =>
        currentDashboard ? { ...currentDashboard, siteFont: savedSiteFont } : currentDashboard,
      );
      setPriceAdjustmentStatus("Site Font Updated Successfully.");
    } catch {
      setPriceAdjustmentStatus("Site Font Could Not Be Updated.");
    }
  }

  function updateSiteBrandingField<Key extends keyof SiteBranding>(
    key: Key,
    value: SiteBranding[Key],
  ) {
    setSiteBranding((currentBranding) =>
      normalizeSiteBranding({ ...currentBranding, [key]: value }),
    );
    setBrandingStatus("");
  }

  async function handleSiteIconUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setBrandingStatus("Please Upload A Valid Image File.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setBrandingStatus("Image Is Too Large. Please Upload An Image Under 8 MB.");
      return;
    }

    setBrandingStatus("Preparing Icon Preview...");
    setIsBrandingProcessing(true);

    try {
      const optimizedIcon = await optimizeBrandingImage(file);
      updateSiteBrandingField("iconUrl", optimizedIcon);
      setBrandingStatus("Icon Ready For Preview. Click Save Customization.");
    } catch {
      setBrandingStatus("Icon Could Not Be Prepared. Please Try A PNG, JPG Or WebP Image.");
    } finally {
      setIsBrandingProcessing(false);
      event.target.value = "";
    }
  }

  async function saveSiteBranding() {
    const normalizedMobile = loginMobile.replace(/\D/g, "");
    const nextBranding = normalizeSiteBranding(siteBranding);

    setBrandingStatus("Saving Site Customization...");

    try {
      const response = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateSiteBranding",
          adminMobile: normalizedMobile,
          siteBranding: nextBranding,
        }),
      });
      const result = (await response.json()) as {
        error?: string;
        siteBranding?: SiteBranding;
      };

      if (!response.ok) {
        setBrandingStatus(result.error || "Site Customization Could Not Be Updated.");
        return;
      }

      const savedBranding = normalizeSiteBranding(result.siteBranding || nextBranding);

      setSiteBranding(savedBranding);
      setDashboard((currentDashboard) =>
        currentDashboard
          ? { ...currentDashboard, siteBranding: savedBranding }
          : currentDashboard,
      );
      setBrandingStatus("Site Customization Updated Successfully.");
    } catch {
      setBrandingStatus("Site Customization Could Not Be Updated.");
    }
  }

  async function updateBookingOperation(
    bookingId: string,
    updates: {
      rideStatus?: string;
      refundStatus?: string;
      refundAmount?: number;
      paymentStatus?: string;
      paymentAmount?: number;
      collectionMode?: string;
      cashCollected?: number;
      vehicle?: string;
      driverName?: string;
      driverMobile?: string;
      refundDriverName?: string;
      refundDriverMobile?: string;
      vehicleNumber?: string;
      cancelReason?: string;
    },
  ) {
    setPortalStatus("Updating Booking...");

    try {
      const response = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: loginMobile.replace(/\D/g, ""), bookingId, ...updates }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setPortalStatus(result.error || "Update Failed.");
        return;
      }

      await loadDashboard();
      setPortalStatus("Booking Updated.");
    } catch {
      setPortalStatus("Update Failed.");
    }
  }

  async function deleteBooking(bookingId: string) {
    setPortalStatus("Deleting Booking...");

    try {
      const response = await fetch("/api/bookings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: loginMobile.replace(/\D/g, ""),
          bookingId,
        }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setPortalStatus(result.error || "Delete Failed.");
        return;
      }

      await loadDashboard();
      setPortalStatus("Booking Deleted.");
    } catch {
      setPortalStatus("Delete Failed.");
    }
  }

  async function saveDriverProfile(form: DriverFormData = driverProfileForm) {
    if (!form.name.trim() || !form.mobile.trim() || !form.vehicleNumber.trim()) {
      setPortalStatus("Enter Driver Name, Mobile, Vehicle Type And Vehicle Number.");
      return false;
    }

    setPortalStatus("Saving Driver Profile...");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "saveDriver",
          requesterMobile: loginMobile.replace(/\D/g, ""),
          name: form.name,
          mobile: form.mobile.replace(/\D/g, ""),
          vehicle: form.vehicle,
          vehicleNumber: form.vehicleNumber,
          email: form.email,
          address: form.address,
          emergencyContact: form.emergencyContact,
          drivingLicense: form.drivingLicense,
          licenseExpiry: form.licenseExpiry,
          identityDocument: form.identityDocument,
          addressProof: form.addressProof,
          policeVerification: form.policeVerification,
          profilePhoto: form.profilePhoto,
          accountType: form.accountType,
          approvalStatus: form.approvalStatus,
          activeStatus: form.activeStatus,
          joiningDate: form.joiningDate,
          ownerMobile: form.ownerMobile,
          seatingCapacity: form.seatingCapacity,
          fuelType: form.fuelType,
          registrationCertificate: form.registrationCertificate,
          insurance: form.insurance,
          insuranceExpiry: form.insuranceExpiry,
          permit: form.permit,
          fitnessCertificate: form.fitnessCertificate,
          puc: form.puc,
          vehiclePhoto: form.vehiclePhoto,
        }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setPortalStatus(result.error || "Driver Profile Could Not Be Saved.");
        return false;
      }

      setPortalStatus("Driver Profile Saved.");
      await loadDashboard();
      return true;
    } catch {
      setPortalStatus("Driver Profile Could Not Be Saved.");
      return false;
    }
  }

  async function acceptRide(booking: DashboardBooking) {
    if (!driverProfileForm.name || !driverProfileForm.vehicleNumber) {
      setPortalStatus("Admin Must Register Driver And Vehicle Before Accepting Ride.");
      return;
    }

    setPortalStatus("Accepting Ride...");

    try {
      const response = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "acceptRide",
          mobile: driverProfileForm.mobile.replace(/\D/g, ""),
          bookingId: booking.booking_id,
        }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setPortalStatus(result.error || "Ride Could Not Be Accepted.");
        return;
      }

      await loadDashboard();
      setPortalStatus("Ride Accepted And Assigned To You.");
    } catch {
      setPortalStatus("Ride Could Not Be Accepted.");
    }
  }

  async function updateDriverRideStatus(
    booking: DashboardBooking,
    rideStatus: "Ride Started" | "Ride Complete",
  ) {
    if (booking.driver_mobile !== driverProfileForm.mobile.replace(/\D/g, "")) {
      setPortalStatus("This Ride Is Not Assigned To This Driver.");
      return;
    }

    const balanceDue = getBalanceDue(booking);
    let odometerPayload:
      | { odometerStart?: number; odometerEnd?: number; extraAmount?: number }
      | null = null;

    if (rideStatus === "Ride Started") {
      const reading = window.prompt("Enter Start Odometer Reading Before Ride Start.");

      if (reading === null) {
        return;
      }

      const odometerStart = Math.round(Number(reading));

      if (!Number.isFinite(odometerStart) || odometerStart < 0) {
        setPortalStatus("Enter Valid Start Odometer Reading.");
        window.alert("Enter Valid Start Odometer Reading.");
        return;
      }

      odometerPayload = { odometerStart };
    }

    if (balanceDue > 0 && rideStatus === "Ride Started" && !booking.ride_started_at) {
      setCollectionPromptMode("start");
      setCollectionPrompt({
        ...booking,
        odometer_start: odometerPayload?.odometerStart ?? booking.odometer_start,
      });
      setCollectionStatus("");
      return;
    }

    if (balanceDue > 0 && rideStatus === "Ride Complete") {
      const odometer = promptCompletionOdometer(booking);

      if (!odometer) {
        return;
      }

      setCollectionPromptMode("complete");
      setCollectionPrompt({
        ...booking,
        odometer_end: odometer.odometerEnd,
        extra_km: odometer.extraKm,
        extra_hours: odometer.extraHours,
        extra_hour_amount: odometer.extraHourAmount,
        extra_amount: odometer.extraAmount,
      });
      setCollectionStatus("");
      return;
    }

    if (rideStatus === "Ride Complete") {
      const odometer = promptCompletionOdometer(booking);

      if (!odometer) {
        return;
      }

      if (odometer.extraAmount > 0) {
        setCollectionPromptMode("complete");
        setCollectionPrompt({
          ...booking,
          odometer_end: odometer.odometerEnd,
          extra_km: odometer.extraKm,
          extra_hours: odometer.extraHours,
          extra_hour_amount: odometer.extraHourAmount,
          extra_amount: odometer.extraAmount,
        });
        setCollectionStatus("");
        return;
      }

      await submitDriverRideStatus(booking, rideStatus, odometer);
      return;
    }

    await submitDriverRideStatus(booking, rideStatus, odometerPayload || undefined);
  }

  async function submitDriverRideStatus(
    booking: DashboardBooking,
    rideStatus: "Ride Started" | "Ride Complete",
    collection?: {
      collectionMode?: "cash" | "payment_gateway";
      paymentAmount?: number;
      paymentReference?: string;
      cashCollected?: number;
      odometerStart?: number;
      odometerEnd?: number;
      extraAmount?: number;
    },
  ) {
    setPortalStatus("Updating Ride Status...");
    setCollectionStatus(collection ? "Updating Collection And Ride Status..." : "");

    try {
      const response = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "driverRideStatus",
          mobile: driverProfileForm.mobile.replace(/\D/g, ""),
          bookingId: booking.booking_id,
          rideStatus,
          ...collection,
        }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setPortalStatus(result.error || "Ride Status Could Not Be Updated.");
        setCollectionStatus(result.error || "Ride Status Could Not Be Updated.");
        return;
      }

      await loadDashboard();
      setCollectionPrompt(null);
      setCollectionStatus("");
      setPortalStatus(`${rideStatus} Updated.`);
    } catch {
      setPortalStatus("Ride Status Could Not Be Updated.");
      setCollectionStatus("Ride Status Could Not Be Updated.");
    }
  }

  async function cancelDriverRide(booking: DashboardBooking) {
    if (booking.driver_mobile !== driverProfileForm.mobile.replace(/\D/g, "")) {
      setPortalStatus("This Ride Is Not Assigned To This Driver.");
      return;
    }

    if (booking.ride_started_at) {
      setPortalStatus("Started Ride Can Only Be Cancelled By Admin.");
      return;
    }

    const cancelReason = window.prompt("Enter Cancellation Reason.");

    if (!cancelReason?.trim()) {
      setPortalStatus("Cancellation Reason Is Required.");
      return;
    }

    setPortalStatus("Cancelling Ride...");

    try {
      const response = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "driverCancelRide",
          mobile: driverProfileForm.mobile.replace(/\D/g, ""),
          bookingId: booking.booking_id,
          cancelReason: cancelReason.trim(),
        }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setPortalStatus(result.error || "Ride Could Not Be Cancelled.");
        return;
      }

      await loadDashboard();
      setPortalStatus("Ride Cancelled.");
    } catch {
      setPortalStatus("Ride Could Not Be Cancelled.");
    }
  }

  function promptCompletionOdometer(booking: DashboardBooking) {
    const startReading = Math.round(Number(booking.odometer_start || 0));

    if (!booking.ride_started_at) {
      setPortalStatus("Start Odometer Reading Is Missing.");
      window.alert("Start Odometer Reading Is Missing. Start The Ride First.");
      return null;
    }

    const enteredReading = booking.odometer_end
      ? String(booking.odometer_end)
      : window.prompt(`Enter End Odometer Reading. Start Reading: ${startReading}`);

    if (enteredReading === null) {
      return null;
    }

    const odometerEnd = Math.round(Number(enteredReading));

    if (!Number.isFinite(odometerEnd) || odometerEnd <= startReading) {
      setPortalStatus("End Odometer Reading Must Be Greater Than Start Reading.");
      window.alert("End Odometer Reading Must Be Greater Than Start Reading.");
      return null;
    }

    const extra = getOdometerExtra(booking, startReading, odometerEnd);

    return {
      odometerEnd,
      actualKm: extra.actualKm,
      bookedKm: extra.billableKm,
      extraKm: extra.extraKm,
      extraKmAmount: extra.extraKmAmount,
      extraHours: extra.extraHours,
      extraHourAmount: extra.extraHourAmount,
      extraAmount: extra.extraAmount,
      finalChargeableKm: extra.finalChargeableKm,
      finalFareWithGst: extra.finalFareWithGst,
    };
  }

  async function completeRideWithCash(booking: DashboardBooking) {
    const balanceDue = getBalanceDue(booking);
    const odometer = promptCompletionOdometer(booking);

    if (!odometer) {
      return;
    }

    const cashToCollect = balanceDue;

    if (cashToCollect <= 0) {
      await submitDriverRideStatus(booking, "Ride Complete", odometer);
      return;
    }

    await submitDriverRideStatus(booking, "Ride Complete", {
      collectionMode: "cash",
      paymentAmount: getInvoiceTotals(booking).total,
      cashCollected: cashToCollect,
      ...odometer,
    });
  }

  async function completeRideWithGateway(booking: DashboardBooking) {
    const balanceDue = getBalanceDue(booking);
    const odometer = promptCompletionOdometer(booking);

    if (!odometer) {
      return;
    }

    const amountToCollect = balanceDue;

    if (amountToCollect <= 0) {
      await submitDriverRideStatus(booking, "Ride Complete", odometer);
      return;
    }

    setIsPaying(true);
    setCollectionStatus("Opening Razorpay QR And Payment Gateway...");

    let order: { keyId?: string; orderId?: string | null; error?: string };

    try {
      const response = await fetch("/api/razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(amountToCollect * 100),
          receipt: `driver-${booking.booking_id}`,
          notes: {
            bookingId: booking.booking_id,
            collectionBy: driverProfileForm.mobile,
            balanceDue: String(amountToCollect),
            odometerStart: String(odometer.odometerStart || booking.odometer_start || 0),
            odometerEnd: String(odometer.odometerEnd || 0),
            vehicle: booking.vehicle,
            pickup: booking.start_point,
            drop: booking.destination,
          },
        }),
      });
      order = (await response.json()) as {
        keyId?: string;
        orderId?: string | null;
        error?: string;
      };
    } catch {
      order = { error: "Payment Gateway Could Not Be Reached." };
    }

    if (!order.keyId) {
      setIsPaying(false);
      setCollectionStatus(
        order.error ||
          "Razorpay Credentials Are Not Configured. Please Add Razorpay Key ID And Key Secret.",
      );
      return;
    }

    if (!window.Razorpay) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Razorpay failed to load"));
        document.body.appendChild(script);
      }).catch(() => {
        setCollectionStatus("Payment Gateway Could Not Load. Please Try Again.");
      });
    }

    if (!window.Razorpay) {
      setIsPaying(false);
      return;
    }

    const checkoutOptions: Record<string, unknown> = {
      key: order.keyId,
      amount: Math.round(amountToCollect * 100),
      currency: "INR",
      name: "Vishnu Tours",
      description: `${booking.booking_id} Balance Collection`,
      prefill: {
        name: booking.customer_name,
        contact: booking.customer_mobile,
      },
      notes: {
        bookingId: booking.booking_id,
        balanceDue: String(amountToCollect),
        driverMobile: driverProfileForm.mobile,
      },
      theme: {
        color: "#f6bd16",
      },
      handler: async (gatewayPayment: RazorpaySuccess) => {
        try {
          const verification = await verifyRazorpayPayment(
            booking.booking_id,
            gatewayPayment,
          );
          playBookingConfirmSound();
          await submitDriverRideStatus(booking, "Ride Complete", {
            collectionMode: "payment_gateway",
            paymentAmount:
              verification.paymentAmount || getInvoiceTotals(booking).total,
            paymentReference: gatewayPayment.razorpay_payment_id,
            ...odometer,
          });
        } catch (error) {
          setCollectionStatus(
            error instanceof Error ? error.message : "Payment Could Not Be Verified.",
          );
        } finally {
          setIsPaying(false);
        }
      },
      modal: {
        ondismiss: () => {
          setIsPaying(false);
          setCollectionStatus("Payment Window Was Closed Before Completion.");
        },
      },
    };

    if (order.orderId) {
      checkoutOptions.order_id = order.orderId;
    }

    const checkout = new window.Razorpay(checkoutOptions);

    checkout.on("payment.failed", (response) => {
      setIsPaying(false);
      setCollectionStatus(
        response.error?.description ||
          "Payment Failed. Ride Balance Is Still Pending.",
      );
    });

    checkout.open();
  }

  async function onboardDriver() {
    if (
      !driverForm.name.trim() ||
      !driverForm.mobile.trim() ||
      !driverForm.vehicleNumber.trim()
    ) {
      setPortalStatus("Please Enter Driver Name, Mobile And Vehicle Number.");
      return;
    }

    if (editingVehicleNumber) {
      setPortalStatus("Updating Driver Vehicle...");

      try {
        const response = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "updateDriverVehicle",
            requesterMobile: loginMobile.replace(/\D/g, ""),
            originalVehicleNumber: editingVehicleNumber,
            name: driverForm.name,
            mobile: driverForm.mobile.replace(/\D/g, ""),
            vehicle: driverForm.vehicle,
            vehicleNumber: driverForm.vehicleNumber,
            email: driverForm.email,
            address: driverForm.address,
            emergencyContact: driverForm.emergencyContact,
            drivingLicense: driverForm.drivingLicense,
            licenseExpiry: driverForm.licenseExpiry,
            identityDocument: driverForm.identityDocument,
            addressProof: driverForm.addressProof,
            policeVerification: driverForm.policeVerification,
            profilePhoto: driverForm.profilePhoto,
            accountType: driverForm.accountType,
            approvalStatus: driverForm.approvalStatus,
            activeStatus: driverForm.activeStatus,
            joiningDate: driverForm.joiningDate,
            ownerMobile: driverForm.ownerMobile,
            seatingCapacity: driverForm.seatingCapacity,
            fuelType: driverForm.fuelType,
            registrationCertificate: driverForm.registrationCertificate,
            insurance: driverForm.insurance,
            insuranceExpiry: driverForm.insuranceExpiry,
            permit: driverForm.permit,
            fitnessCertificate: driverForm.fitnessCertificate,
            puc: driverForm.puc,
            vehiclePhoto: driverForm.vehiclePhoto,
          }),
        });
        const result = (await response.json()) as { error?: string };

        if (!response.ok) {
          setPortalStatus(result.error || "Driver Vehicle Could Not Be Updated.");
          return;
        }

        await loadDashboard();
        setPortalStatus("Driver Vehicle Updated.");
      } catch {
        setPortalStatus("Driver Vehicle Could Not Be Updated.");
        return;
      }
    } else {
      const saved = await saveDriverProfile(driverForm);

      if (!saved) {
        return;
      }

      setPortalStatus("Driver Onboarded.");
    }

    setDriverForm({
      name: "",
      mobile: "",
      vehicle: "Toyota Innova Crysta",
      vehicleNumber: "",
    });
    setEditingVehicleNumber("");
  }

  async function deleteDriverVehicle(driver: DriverProfile) {
    if (!driver.vehicleNumber) {
      setPortalStatus("Vehicle Number Missing.");
      return;
    }

    const confirmed = window.confirm(
      `Delete ${driver.name} | ${driver.vehicle} | ${driver.vehicleNumber}?`,
    );

    if (!confirmed) {
      return;
    }

    setPortalStatus("Deleting Driver Vehicle...");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "deleteDriverVehicle",
          requesterMobile: loginMobile.replace(/\D/g, ""),
          vehicleNumber: driver.vehicleNumber,
        }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setPortalStatus(result.error || "Driver Vehicle Could Not Be Deleted.");
        return;
      }

      if (editingVehicleNumber === driver.vehicleNumber) {
        setDriverForm({
          name: "",
          mobile: "",
          vehicle: "Toyota Innova Crysta",
          vehicleNumber: "",
        });
        setEditingVehicleNumber("");
      }

      await loadDashboard();
      setPortalStatus("Driver Vehicle Deleted.");
    } catch {
      setPortalStatus("Driver Vehicle Could Not Be Deleted.");
    }
  }

  async function autoAssignDriver(booking: DashboardBooking) {
    const availableDriver =
      drivers.find(
        (driver) =>
          driver.status === "Available" &&
          driver.vehicle === booking.vehicle,
      ) || drivers.find((driver) => driver.status === "Available");

    if (!availableDriver) {
      setPortalStatus("No Available Driver Found.");
      return;
    }

    const conflict = dashboard
      ? getAssignmentConflict(booking, availableDriver.mobile, dashboard.recentBookings)
      : null;

    if (conflict) {
      const warning = `${availableDriver.name} Is Already Assigned For Booking ${conflict.booking_id} On ${formatDisplayDateTime(conflict.pickup_datetime)}.`;
      setPortalStatus(warning);
      window.alert(warning);
      return;
    }

    setDrivers((currentDrivers) =>
      currentDrivers.map((driver) =>
        driver.mobile === availableDriver.mobile
          ? { ...driver, status: "Assigned" }
          : driver,
      ),
    );

    await updateBookingOperation(booking.booking_id, {
      rideStatus: "Driver Assigned",
      vehicle: availableDriver.vehicle,
      driverName: availableDriver.name,
      driverMobile: availableDriver.mobile,
      vehicleNumber: availableDriver.vehicleNumber,
    });
  }

  async function manualAssignDriver(booking: DashboardBooking) {
    const form = assignmentForm[booking.booking_id];

    if (!form?.driverMobile || !form.vehicleName || !form.vehicleNumber) {
      setPortalStatus("Select Driver, Cab And Vehicle Number.");
      return;
    }

    const selectedDriver = drivers.find((driver) => driver.mobile === form.driverMobile);
    const conflict = dashboard
      ? getAssignmentConflict(booking, form.driverMobile, dashboard.recentBookings)
      : null;

    if (conflict) {
      const warning = `${selectedDriver?.name || form.driverName || "Driver"} Is Already Assigned For Booking ${conflict.booking_id} On ${formatDisplayDateTime(conflict.pickup_datetime)}.`;
      setPortalStatus(warning);
      window.alert(warning);
      return;
    }

    await updateBookingOperation(booking.booking_id, {
      rideStatus: "Driver Assigned",
      vehicle: form.vehicleName,
      driverName: selectedDriver?.name || form.driverName,
      driverMobile: form.driverMobile,
      vehicleNumber: form.vehicleNumber,
    });
  }

  async function startRide(booking: DashboardBooking) {
    if (!booking.driver_mobile) {
      setPortalStatus("Assign Driver And Vehicle Before Starting The Ride.");
      return;
    }

    await updateBookingOperation(booking.booking_id, {
      rideStatus: "Ride Started",
    });
  }

  function openAdminPaymentPrompt(booking: DashboardBooking) {
    setAdminPaymentPrompt(booking);
    setAdminPaymentSource("online");
    setAdminPaymentDriverMobile(booking.driver_mobile || "");
  }

  async function submitAdminPaymentReceived() {
    if (!adminPaymentPrompt) {
      return;
    }

    const selectedDriver = drivers.find(
      (driver) => driver.mobile === adminPaymentDriverMobile,
    );
    const totalWithGst = getInvoiceTotals(adminPaymentPrompt).total;
    const balanceToCollect = Math.max(
      0,
      totalWithGst - Number(adminPaymentPrompt.payment_amount || 0),
    );

    if (adminPaymentSource === "driver_cash" && !selectedDriver) {
      setPortalStatus("Select Driver Who Received Cash.");
      return;
    }

    const cashDriver = adminPaymentSource === "driver_cash" ? selectedDriver : undefined;

    await updateBookingOperation(adminPaymentPrompt.booking_id, {
      paymentStatus: "Complete",
      paymentAmount: totalWithGst,
      rideStatus: "Payment Received",
      collectionMode: adminPaymentSource === "online" ? "online" : "driver_cash",
      cashCollected: adminPaymentSource === "driver_cash" ? balanceToCollect : 0,
      driverName: cashDriver?.name,
      driverMobile: cashDriver?.mobile,
      vehicle: cashDriver?.vehicle,
      vehicleNumber: cashDriver?.vehicleNumber,
    });
    setAdminPaymentPrompt(null);
  }

  function openAdminRefundPrompt(booking: DashboardBooking) {
    setAdminRefundPrompt(booking);
    setAdminRefundType("full");
    setAdminRefundMode("amount");
    setAdminRefundValue("");
    setAdminRefundSource("online");
    setAdminRefundDriverMobile(booking.driver_mobile || "");
  }

  async function submitAdminRefund() {
    if (!adminRefundPrompt) {
      return;
    }

    const paidAmount = Number(adminRefundPrompt.payment_amount || 0);
    const alreadyRefunded = Number(adminRefundPrompt.refund_amount || 0);
    const refundableAmount = Math.max(0, paidAmount - alreadyRefunded);
    const partialValue = Number(adminRefundValue || 0);
    const refundAmount =
      adminRefundType === "full"
        ? refundableAmount
        : adminRefundMode === "percent"
          ? Math.round((refundableAmount * partialValue) / 100)
          : Math.round(partialValue);

    if (refundableAmount < 1) {
      setPortalStatus("No Refundable Amount Available.");
      return;
    }

    if (!refundAmount || refundAmount < 1 || refundAmount > refundableAmount) {
      setPortalStatus(`Refund Amount Must Be Between ₹1 And ${formatInr(refundableAmount)}.`);
      return;
    }

    const selectedRefundDriver = drivers.find(
      (driver) => driver.mobile === adminRefundDriverMobile,
    );

    if (adminRefundSource === "driver_cash" && !selectedRefundDriver) {
      setPortalStatus("Select Driver Who Paid Refund.");
      return;
    }

    const isRideComplete = (adminRefundPrompt.ride_status || "")
      .toLowerCase()
      .includes("complete");
    const refundDriver = adminRefundSource === "driver_cash" ? selectedRefundDriver : undefined;

    await updateBookingOperation(adminRefundPrompt.booking_id, {
      refundStatus:
        refundAmount === refundableAmount ? "Refund Completed" : "Partial Refund Completed",
      refundAmount,
      rideStatus: isRideComplete ? "Ride Complete With Refund" : "Ride Cancelled",
      cancelReason: isRideComplete ? "" : "Cancelled After Refund",
      collectionMode: adminRefundSource === "driver_cash" ? "refund_driver_cash" : "refund_online",
      refundDriverName: refundDriver?.name,
      refundDriverMobile: refundDriver?.mobile,
    });
    setAdminRefundPrompt(null);
  }

  async function verifyRazorpayPayment(bookingId: string, payment: RazorpaySuccess) {
    const response = await fetch("/api/razorpay-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId,
        razorpayOrderId: payment.razorpay_order_id,
        razorpayPaymentId: payment.razorpay_payment_id,
        razorpaySignature: payment.razorpay_signature,
      }),
    });
    const result = (await response.json()) as {
      success?: boolean;
      paymentAmount?: number;
      error?: string;
    };

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Payment Could Not Be Verified.");
    }

    return result;
  }

  async function payPortalBooking(booking: DashboardBooking) {
    const amountToPay = getBalanceDue(booking);

    if (amountToPay <= 0) {
      setPortalStatus("This Booking Has No Pending Balance.");
      return;
    }

    setIsPaying(true);
    setPortalStatus("Opening Secure Razorpay Payment...");

    try {
      const orderResponse = await fetch("/api/razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(amountToPay * 100),
          receipt: `customer-${booking.booking_id}`,
          notes: {
            bookingId: booking.booking_id,
            customerMobile: booking.customer_mobile,
            vehicle: booking.vehicle,
            pickup: booking.start_point,
            drop: booking.destination,
          },
        }),
      });
      const order = (await orderResponse.json()) as {
        keyId?: string;
        orderId?: string;
        error?: string;
      };

      if (!orderResponse.ok || !order.keyId || !order.orderId) {
        throw new Error(order.error || "Payment Gateway Is Not Available.");
      }

      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Razorpay Could Not Load."));
          document.body.appendChild(script);
        });
      }

      if (!window.Razorpay) {
        throw new Error("Razorpay Could Not Load.");
      }

      const checkout = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: Math.round(amountToPay * 100),
        currency: "INR",
        name: "Vishnu Tours",
        description: `${booking.booking_id} Booking Payment`,
        prefill: {
          name: booking.customer_name,
          contact: booking.customer_mobile,
          email: booking.customer_email,
        },
        notes: {
          bookingId: booking.booking_id,
          customerMobile: booking.customer_mobile,
        },
        theme: { color: "#075bd8" },
        handler: async (gatewayPayment: RazorpaySuccess) => {
          try {
            await verifyRazorpayPayment(booking.booking_id, gatewayPayment);
            playBookingConfirmSound();
            await loadDashboard();
            setPortalStatus("Payment Verified And Received Successfully.");
          } catch (error) {
            setPortalStatus(
              error instanceof Error ? error.message : "Payment Could Not Be Verified.",
            );
          } finally {
            setIsPaying(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsPaying(false);
            setPortalStatus("Payment Window Was Closed Before Completion.");
          },
        },
      });

      checkout.on("payment.failed", (response) => {
        setIsPaying(false);
        setPortalStatus(
          response.error?.description ||
            "Payment Failed. No Amount Has Been Marked As Received.",
        );
      });

      checkout.open();
    } catch (error) {
      setIsPaying(false);
      setPortalStatus(
        error instanceof Error ? error.message : "Payment Gateway Could Not Be Opened.",
      );
    }
  }

  async function cancelCustomerBooking(booking: DashboardBooking) {
    const cancelReason = window.prompt("Enter Cancellation Reason.");
    if (!cancelReason?.trim()) {
      setPortalStatus("Cancellation Reason Is Required.");
      return;
    }

    setPortalStatus("Cancelling Booking...");
    try {
      const response = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "customerCancelRide",
          bookingId: booking.booking_id,
          customerMobile: booking.customer_mobile,
          cancelReason: cancelReason.trim(),
        }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error || "Booking Could Not Be Cancelled.");
      }

      await loadDashboard();
      setPortalStatus("Booking Cancelled Successfully.");
    } catch (error) {
      setPortalStatus(
        error instanceof Error ? error.message : "Booking Could Not Be Cancelled.",
      );
    }
  }

  async function logoutPortal() {
    await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    }).catch(() => undefined);

    setPortalRole(null);
    setPortalBookings([]);
    setDashboard(null);
    setPortalStatus("");
    setShowLogin(false);
  }

  async function loadCustomerBooking() {
    setCustomerStatus("Loading Booking...");
    setCustomerBooking(null);

    try {
      const response = await fetch(
        `/api/bookings?bookingId=${encodeURIComponent(
          customerLookup.bookingId,
        )}&mobile=${encodeURIComponent(customerLookup.mobile)}`,
      );
      const result = (await response.json()) as {
        booking?: DashboardBooking;
        error?: string;
      };

      if (!response.ok || !result.booking) {
        setCustomerStatus(result.error || "Booking Not Found.");
        return;
      }

      setCustomerBooking(result.booking);
      setCustomerStatus("");
    } catch {
      setCustomerStatus("Customer Booking Could Not Load.");
    }
  }

  async function requestCashWithdrawal() {
    const amount = Math.round(Number(withdrawalForm.amount || 0));

    if (!amount || amount < 1) {
      setPortalStatus("Enter Valid Withdrawal Amount.");
      return;
    }

    setPortalStatus("Submitting Withdrawal Request...");

    try {
      const response = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "requestWithdrawal",
          mobile: driverProfileForm.mobile.replace(/\D/g, ""),
          amount,
          bankName: withdrawalForm.bankName,
          bankAccount: withdrawalForm.bankAccount,
          bankIfsc: withdrawalForm.bankIfsc,
        }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setPortalStatus(result.error || "Withdrawal Request Failed.");
        return;
      }

      setWithdrawalForm({
        amount: "",
        bankName: withdrawalForm.bankName,
        bankAccount: withdrawalForm.bankAccount,
        bankIfsc: withdrawalForm.bankIfsc,
      });
      await loadDashboard();
      setPortalStatus("Withdrawal Request Sent To Admin.");
    } catch {
      setPortalStatus("Withdrawal Request Failed.");
    }
  }

  async function settleDriverCash(settlementMode: "earning_adjustment" | "admin_transfer") {
    const amount = Math.round(Number(cashSettlementForm.amount || 0));
    const availableCash = Math.max(0, driverEarning.cashInHand - pendingCashTransfer);

    if (!amount || amount < 1 || amount > availableCash) {
      setPortalStatus(`Enter An Amount Between ₹1 And ${formatInr(availableCash)}.`);
      return;
    }

    if (settlementMode === "earning_adjustment" && amount > driverEarning.availableEarning) {
      setPortalStatus(`Only ${formatInr(driverEarning.availableEarning)} Can Be Adjusted Against Earning.`);
      return;
    }

    setPortalStatus("Updating Automated Cash Ledger...");
    try {
      const response = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "settleDriverCash",
          mobile: driverProfileForm.mobile.replace(/\D/g, ""),
          amount,
          settlementMode,
          referenceNumber: cashSettlementForm.referenceNumber,
        }),
      });
      const result = (await response.json()) as {
        error?: string;
        referenceNumber?: string;
        settlementStatus?: string;
      };

      if (!response.ok) {
        setPortalStatus(result.error || "Cash Settlement Could Not Be Saved.");
        return;
      }

      setCashSettlementForm({ amount: "", referenceNumber: "" });
      await loadDashboard();
      setPortalStatus(
        settlementMode === "earning_adjustment"
          ? `Cash Adjusted Against Earning. Reference ${result.referenceNumber}.`
          : `Cash Transfer Sent For Admin Approval. Reference ${result.referenceNumber}.`,
      );
    } catch {
      setPortalStatus("Cash Settlement Could Not Be Saved.");
    }
  }

  async function updateCashSettlement(settlementId: number, settlementStatus: "Completed" | "Rejected") {
    setPortalStatus("Updating Cash Transfer...");
    try {
      const response = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateCashSettlement",
          mobile: loginMobile.replace(/\D/g, ""),
          settlementId,
          settlementStatus,
        }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setPortalStatus(result.error || "Cash Transfer Could Not Be Updated.");
        return;
      }

      await loadDashboard();
      setPortalStatus(`Cash Transfer ${settlementStatus}.`);
    } catch {
      setPortalStatus("Cash Transfer Could Not Be Updated.");
    }
  }

  async function updateWithdrawalStatus(withdrawalId: number, status: string) {
    setPortalStatus("Updating Withdrawal...");

    try {
      const response = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateWithdrawal",
          mobile: loginMobile.replace(/\D/g, ""),
          withdrawalId,
          withdrawalStatus: status,
        }),
      });
      const result = (await response.json()) as { error?: string; receiptReference?: string };

      if (!response.ok) {
        setPortalStatus(result.error || "Withdrawal Update Failed.");
        return;
      }

      await loadDashboard();
      setPortalStatus(`Withdrawal ${status}.`);
    } catch {
      setPortalStatus("Withdrawal Update Failed.");
    }
  }

  async function recordDriverCashDeposit(driver: DriverCashSummary) {
    const cashInHand = Math.round(Number(driver.cash_amount || 0));

    if (cashInHand < 1) {
      setPortalStatus("No Driver Cash In Hand To Receive.");
      return;
    }

    const enteredAmount = window.prompt(
      `Enter Cash Collected From ${driver.driver_name || "Driver"}. Cash In Hand: ${formatInr(cashInHand)}`,
      String(cashInHand),
    );

    if (enteredAmount === null) {
      return;
    }

    const amount = Math.round(Number(enteredAmount || 0));

    if (!amount || amount < 1 || amount > cashInHand) {
      setPortalStatus(`Cash Collected Amount Must Be Between ₹1 And ${formatInr(cashInHand)}.`);
      return;
    }

    const driverVehicle = drivers.find((item) => item.mobile === driver.driver_mobile);
    const bookingReference = window.prompt(
      "Enter Booking Or Trip Reference (Optional).",
      "",
    );
    if (bookingReference === null) {
      return;
    }
    const remarks = window.prompt("Enter Collection Remarks (Optional).", "Cash Handed To Admin");
    if (remarks === null) {
      return;
    }
    setPortalStatus("Updating Driver Cash Ledger...");

    try {
      const response = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "recordCashDeposit",
          mobile: loginMobile.replace(/\D/g, ""),
          driverMobile: driver.driver_mobile,
          vehicleNumber: driverVehicle?.vehicleNumber || "",
          bookingReference,
          amount,
          collectionMode: "Cash",
          remarks,
        }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setPortalStatus(result.error || "Driver Cash Ledger Could Not Be Updated.");
        return;
      }

      await loadDashboard();
      setPortalStatus(`Driver Cash Collected. Receipt ${result.receiptReference}.`);
    } catch {
      setPortalStatus("Driver Cash Ledger Could Not Be Updated.");
    }
  }

  function renderDriverLedger(bookings: DashboardBooking[]) {
    return (
      <div className="ledger-table">
        {bookings.length ? (
          bookings.map((booking) => {
            const totalFare = getInvoiceTotals(booking).total;
            const driverCash = Number(booking.driver_cash_collected || 0);
            const driverRefund = Number(booking.driver_cash_refunded || 0);
            const extraAmount = Number(booking.extra_amount || 0);
            const onlineCollected = Math.max(
              0,
              Number(booking.payment_amount || 0) - driverCash,
            );
            const isProgress = !(booking.ride_status || "")
              .toLowerCase()
              .includes("complete");

            return (
              <div
                className={`ledger-row ${isProgress ? "ledger-progress-row" : ""}`}
                key={`ledger-${booking.booking_id}`}
              >
                <strong>{booking.booking_id}</strong>
                <span>{formatDisplayDateTime(booking.ride_started_at || booking.pickup_datetime)}</span>
                <span>{booking.start_point} To {booking.destination}</span>
                <span>Fare {formatInr(totalFare)}</span>
                {extraAmount > 0 ? (
                  <span className="ledger-collected-amount">
                    Extra {formatInr(extraAmount)}
                  </span>
                ) : null}
                <span className={onlineCollected > 0 ? "ledger-collected-amount" : ""}>
                  Online {formatPaymentAmount(onlineCollected)}
                </span>
                <span className={driverCash > 0 ? "ledger-collected-amount" : ""}>
                  Driver Cash {formatPaymentAmount(driverCash)}
                </span>
                {driverRefund > 0 ? (
                  <span className="ledger-deducted-amount">
                    Refund -{formatInr(driverRefund)}
                  </span>
                ) : null}
              </div>
            );
          })
        ) : (
          <p>No Driver Ledger Entries Yet.</p>
        )}
      </div>
    );
  }

  function renderStatusActivity(history: BookingStatusHistory[]) {
    return (
      <div className="portal-activity-list">
        {history.length ? (
          history.slice(0, 20).map((item) => (
            <div className="portal-activity-row" key={`status-${item.id}`}>
              <span className="portal-activity-dot" aria-hidden="true" />
              <div>
                <strong>{item.booking_id} · {item.new_status}</strong>
                <p>{item.reason || "Booking Status Updated"}</p>
              </div>
              <time>{formatDisplayDateTime(item.created_at)}</time>
            </div>
          ))
        ) : (
          <p className="portal-empty-state">No Status Activity Yet.</p>
        )}
      </div>
    );
  }

  function openPublicBookingForm() {
    setShowLogin(false);
    window.setTimeout(() => {
      document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
  }

  function renderWithdrawalList(withdrawals: DriverWithdrawal[], canManage: boolean) {
    return (
      <div className="ledger-table">
        {withdrawals.length ? (
          withdrawals.map((withdrawal) => (
            <div
              className={`ledger-row withdrawal-${withdrawal.status.toLowerCase()}`}
              key={`withdrawal-${withdrawal.id}`}
            >
              <strong>WR-{withdrawal.id}</strong>
              <span>{formatDisplayDateTime(withdrawal.created_at)}</span>
              <span>{withdrawal.driver_name} | {withdrawal.driver_mobile}</span>
              <span>{formatInr(withdrawal.amount)}</span>
              <span>{withdrawal.bank_name} | {withdrawal.bank_account}</span>
              <span>{withdrawal.bank_ifsc}</span>
              <b>{withdrawal.status}</b>
              {canManage ? (
                <div className="booking-actions">
                  <button
                    type="button"
                    disabled={withdrawal.status === "Completed"}
                    onClick={() => updateWithdrawalStatus(withdrawal.id, "Completed")}
                  >
                    Approve Withdrawal
                  </button>
                  <button
                    type="button"
                    disabled={withdrawal.status === "Rejected"}
                    onClick={() => updateWithdrawalStatus(withdrawal.id, "Rejected")}
                  >
                    Reject
                  </button>
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <p>No Withdrawal Requests Yet.</p>
        )}
      </div>
    );
  }

  function renderCollectionAmount(amount: number) {
    const hasBalance = amount > 0;

    return (
      <span className={`collect-amount-lockup ${hasBalance ? "collect-due" : "collect-clear"}`}>
        {hasBalance ? (
          <span className="collect-action-badge">
            <span className="collect-hand-icon" aria-hidden="true">
              ₹
            </span>
            <span>Collect</span>
          </span>
        ) : null}
        <span className="cash-collect-icon" aria-hidden="true" />
        <span>{hasBalance ? formatInr(amount) : "₹0"}</span>
      </span>
    );
  }

  function getAdminFinanceMetrics(activeDashboard: NonNullable<typeof dashboard>) {
    const allBookings = activeDashboard.recentBookings || [];
    const ledgerBookings = activeDashboard.driverLedger || [];
    const totalBookingAmount = allBookings.reduce(
      (total, booking) => total + getAccountingBookingAmount(booking),
      0,
    );
    const totalCollected = allBookings.reduce(
      (total, booking) =>
        total +
        Math.max(
          0,
          Number(booking.payment_amount || 0) - Number(booking.refund_amount || 0),
        ),
      0,
    );
    const driverCashCollected = ledgerBookings.reduce(
      (total, booking) =>
        total +
        Math.max(
          0,
          Number(booking.driver_cash_collected || 0) -
            Number(booking.driver_cash_refunded || 0),
        ),
      0,
    );
    const onlineCollected = Math.max(0, totalCollected - driverCashCollected);
    const driverCashInHand = activeDashboard.driverCashSummary.reduce(
      (total, driver) => total + Number(driver.cash_amount || 0),
      0,
    );

    return {
      allBookings,
      ledgerBookings,
      totalBookingAmount: activeDashboard.totalBookingAmount || totalBookingAmount,
      totalCollected: activeDashboard.totalCollected || totalCollected,
      onlineCollected: activeDashboard.onlineCollected || onlineCollected,
      driverCashInHand: activeDashboard.driverCashInHand || driverCashInHand,
    };
  }

  function renderAdminMetricBreakup(activeDashboard: NonNullable<typeof dashboard>) {
    const metrics = getAdminFinanceMetrics(activeDashboard);
    const titleMap: Record<AdminBreakupType, string> = {
      bookings: "Total Booking Breakup",
      bookingAmount: "Total Ride Amount Breakup",
      collected: "Amount Collected Breakup",
      online: "Online Collection Breakup",
      driverCash: "Company Cash With Drivers Breakup",
    };

    if (activeAdminBreakup === "driverCash") {
      return (
        <div className="metric-breakup-panel">
          <h3>{titleMap[activeAdminBreakup]}</h3>
          <div className="ledger-table">
            {activeDashboard.driverCashSummary.length ? (
              activeDashboard.driverCashSummary.map((driver) => (
                <div className="ledger-row" key={`cash-${driver.driver_mobile}`}>
                  <strong>{driver.driver_name || "Driver"}</strong>
                  <span>{driver.driver_mobile}</span>
                  <span>Collected {formatInr(Number(driver.cash_collected || 0))}</span>
                  <span>
                    In Hand{" "}
                    <strong className="cash-in-hand-amount">
                      {formatInr(Number(driver.cash_amount || 0))}
                    </strong>
                  </span>
                  <span>{driver.cash_rides} Cash Ride</span>
                </div>
              ))
            ) : (
              <p>No Company Cash With Drivers.</p>
            )}
          </div>
        </div>
      );
    }

    const rows =
      activeAdminBreakup === "online"
        ? metrics.ledgerBookings.filter(
            (booking) =>
              Number(booking.payment_amount || 0) -
                Number(booking.driver_cash_collected || 0) >
              0,
          )
        : metrics.allBookings;

    return (
      <div className="metric-breakup-panel">
        <h3>{titleMap[activeAdminBreakup]}</h3>
        <div className="ledger-table">
          {rows.length ? (
            rows.map((booking) => {
              const totalFare = getAccountingBookingAmount(booking);
              const driverCash = Number(booking.driver_cash_collected || 0);
              const online = Math.max(0, Number(booking.payment_amount || 0) - driverCash);
              const valueMap: Record<Exclude<AdminBreakupType, "driverCash">, string> = {
                bookings: booking.ride_status || "Booked",
                bookingAmount: formatInr(totalFare),
                collected: formatPaymentAmount(booking.payment_amount || 0),
                online: formatPaymentAmount(online),
              };

              return (
                <div className="ledger-row" key={`breakup-${activeAdminBreakup}-${booking.booking_id}`}>
                  <strong>{booking.booking_id}</strong>
                  <span>{booking.customer_name}</span>
                  <span>{booking.start_point} To {booking.destination}</span>
                  <span>{formatDisplayDateTime(booking.pickup_datetime)}</span>
                  <span>{booking.vehicle}</span>
                  <b>{valueMap[activeAdminBreakup as Exclude<AdminBreakupType, "driverCash">]}</b>
                </div>
              );
            })
          ) : (
            <p>No Breakup Data Yet.</p>
          )}
        </div>
      </div>
    );
  }

  function renderBookingTimeline(booking: DashboardBooking) {
    const completedStages = getCompletedWorkflowStages(booking);
    const isCancelled = (booking.ride_status || "").toLowerCase().includes("cancel");
    const stageTimes: Record<string, string> = {
      started: formatDisplayDateTime(booking.ride_started_at),
      complete: formatDisplayDateTime(booking.ride_completed_at),
    };

    return (
      <div className="status-timeline" aria-label="Ride status timeline">
        {workflowStages.map((stage) => (
          <div
            className={`status-step ${completedStages.has(stage.id) ? "is-complete" : ""}`}
            key={`${booking.booking_id}-${stage.id}`}
          >
            <span />
            <strong>{stage.label}</strong>
            {stageTimes[stage.id] ? <small>{stageTimes[stage.id]}</small> : null}
          </div>
        ))}
        {isCancelled ? <em>Ride Cancelled</em> : null}
      </div>
    );
  }

  function renderInvoice(booking: DashboardBooking) {
    const invoice = getInvoiceTotals(booking);

    return (
      <div className="invoice-box">
        <div>
          <strong>Tax Invoice</strong>
          <span>{booking.booking_id}</span>
        </div>
        <p>
          {booking.customer_name} | {booking.customer_mobile}
        </p>
        <dl>
          <dt>Base Fare</dt>
          <dd>{formatInr(invoice.baseFare)}</dd>
          <dt>GST 5%</dt>
          <dd>{formatInr(invoice.tax)}</dd>
          <dt>Total Payable</dt>
          <dd>{formatInr(invoice.total)}</dd>
        </dl>
      </div>
    );
  }

  function getAdminTaskCounts(activeDashboard: NonNullable<typeof dashboard>) {
    const activeBookings = activeDashboard.recentBookings.filter((booking) => {
      const status = (booking.ride_status || booking.status || "").toLowerCase();
      return !status.includes("cancel") && !status.includes("complete");
    });
    const startedBookings = activeBookings.filter((booking) => isRideInProgress(booking));
    const engagedVehicleNumbers = new Set(
      startedBookings
        .map((booking) => (booking.vehicle_number || "").trim().toLowerCase())
        .filter(Boolean),
    );
    const engagedDriverMobiles = new Set(
      startedBookings
        .map((booking) => (booking.driver_mobile || "").trim())
        .filter(Boolean),
    );
    const registeredVehicleNumbers = new Set(
      drivers
        .map((driver) => (driver.vehicleNumber || "").trim().toLowerCase())
        .filter(Boolean),
    );
    const registeredDriverMobiles = new Set(
      drivers.map((driver) => driver.mobile.trim()).filter(Boolean),
    );
    const assignmentPending = activeBookings.filter(
      (booking) => !booking.driver_mobile || !booking.vehicle_number,
    ).length;
    const paymentPending = activeBookings.filter((booking) => {
      const totalFare = getInvoiceTotals(booking).total;
      return Number(booking.payment_amount || 0) < totalFare;
    }).length;
    const ridePending = activeBookings.filter((booking) => {
      const status = (booking.ride_status || "").toLowerCase();
      return !status.includes("started");
    }).length;
    const withdrawalPending = activeDashboard.withdrawalRequests.filter(
      (withdrawal) => withdrawal.status === "Pending",
    ).length;

    return {
      assignmentPending,
      paymentPending,
      ridePending,
      rideInProgress: startedBookings.length,
      withdrawalPending,
      bookings: activeDashboard.recentBookings.length,
      vehicles: drivers.length,
      ledger: activeDashboard.driverLedger.length,
      withdrawals: activeDashboard.withdrawalRequests.length,
      totalCarsWithDriver: registeredVehicleNumbers.size,
      totalDrivers: registeredDriverMobiles.size,
      vacantCars: Math.max(0, registeredVehicleNumbers.size - engagedVehicleNumbers.size),
      vacantDrivers: Math.max(0, registeredDriverMobiles.size - engagedDriverMobiles.size),
      engagedVehicleNumbers,
      engagedDriverMobiles,
    };
  }

  function isStartedRideVehicle(
    vehicleNumber: string | undefined,
    bookings: DashboardBooking[],
  ) {
    const normalizedVehicleNumber = (vehicleNumber || "").trim().toLowerCase();

    if (!normalizedVehicleNumber) {
      return false;
    }

    return bookings.some((booking) => {
      return (
        isRideInProgress(booking) &&
        (booking.vehicle_number || "").trim().toLowerCase() === normalizedVehicleNumber
      );
    });
  }

  function getDriverVehicleCompletedRideCount(driver: DriverProfile) {
    const driverMobile = driver.mobile.trim();
    const vehicleNumber = driver.vehicleNumber.trim().toLowerCase();

    return (dashboard?.recentBookings || []).filter((booking) => {
      const status = (booking.ride_status || "").toLowerCase();
      const sameDriver = driverMobile && booking.driver_mobile === driverMobile;
      const sameVehicle =
        vehicleNumber && (booking.vehicle_number || "").trim().toLowerCase() === vehicleNumber;

      return status.includes("complete") && (sameDriver || sameVehicle);
    }).length;
  }

  function renderPortalBookingCard(booking: DashboardBooking, canManage: boolean) {
    const normalizedStatus = (booking.ride_status || "").toLowerCase();
    const cardStatusClass = normalizedStatus.includes("cancel")
      ? "booking-card-cancelled"
      : normalizedStatus.includes("complete")
        ? "booking-card-complete"
        : "booking-card-progress";
    const invoiceTotals = getInvoiceTotals(booking);
    const balanceDue = getBalanceDue(booking);
    const bookingStatusAudit = bookingStatusHistory.filter(
      (item) => item.booking_id === booking.booking_id,
    );
    const bookingAssignmentAudit = assignmentHistory.filter(
      (item) => item.booking_id === booking.booking_id,
    );
    const hasPayment = Number(booking.payment_amount || 0) > 0;
    const isBookingConfirmed = (booking.ride_status || "")
      .toLowerCase()
      .includes("confirm");
    const uniqueDrivers = drivers.filter(
      (driver, index, driverList) =>
        driverList.findIndex((item) => item.mobile === driver.mobile) === index,
    );
    const selectedVehicleName =
      assignmentForm[booking.booking_id]?.vehicleName || booking.vehicle;
    const assignmentVehicleRows = drivers.filter(
      (driver) => driver.vehicle === selectedVehicleName,
    );
    const driverVehicleTypes = new Set(
      driverVehicles.map((driverVehicle) => driverVehicle.vehicle_type),
    );
    const canDriverAcceptBooking =
      portalRole !== "driver" ||
      Boolean(driverVehicleTypes.size
        ? driverVehicleTypes.has(booking.vehicle)
        : driverProfileForm.vehicle === booking.vehicle);

    return (
      <article className={cardStatusClass} key={booking.booking_id}>
        <div className="booking-row-head">
          <strong>{booking.booking_id}</strong>
          <span className={isBookingConfirmed ? "booking-confirmed-chip" : ""}>
            {booking.ride_status || "Booked"}
          </span>
        </div>
        {renderBookingTimeline(booking)}
        <div className="booking-detail-grid">
          <small>Customer</small>
          <b>
            {booking.customer_name} | {booking.customer_mobile}
          </b>
          <small>Route</small>
          <b>
            {booking.start_point} To {booking.destination}
          </b>
          <small>Cab</small>
          <b>{booking.vehicle}</b>
          <small>Booking Date And Time</small>
          <b>{formatDisplayDateTime(booking.created_at)}</b>
          <small>Pickup Date And Time</small>
          <b>{formatDisplayDateTime(booking.pickup_datetime || booking.created_at)}</b>
          {booking.ride_completed_at ? (
            <>
              <small>Drop Date And Time</small>
              <b>{formatDisplayDateTime(booking.ride_completed_at)}</b>
            </>
          ) : null}
          {booking.return_date && !booking.ride_completed_at ? (
            <>
              <small>Planned Drop Date</small>
              <b>{formatDisplayDate(booking.return_date)}</b>
            </>
          ) : null}
          {booking.ride_started_at ? (
            <>
              <small>Start Odometer</small>
              <b>{booking.odometer_start} KM</b>
            </>
          ) : null}
          {booking.ride_completed_at ? (
            <>
              <small>End Odometer</small>
              <b>{booking.odometer_end} KM</b>
            </>
          ) : null}
          {booking.ride_started_at && booking.ride_completed_at ? (
            <>
              <small>Actual Travel Distance</small>
              <b>
                {Math.max(
                  0,
                  Number(booking.odometer_end || 0) - Number(booking.odometer_start || 0),
                )}{" "}
                KM
              </b>
            </>
          ) : null}
          {booking.extra_km ? (
            <>
              <small>Extra KM</small>
              <b>{booking.extra_km} KM | {formatInr(Number(booking.extra_amount || 0))}</b>
              <small>Final Fare</small>
              <b>{formatInr(invoiceTotals.total)}</b>
            </>
          ) : null}
          <small>Fare</small>
          <b>{formatInr(invoiceTotals.total)} Including GST 5%</b>
          <small>Payment</small>
          <b className={hasPayment ? "payment-prepaid-text" : "payment-postpaid-text"}>
            {booking.payment_status || "Pending"} |{" "}
            {formatPaymentAmount(booking.payment_amount || 0)}
          </b>
          <small>Balance Due</small>
          <b className={balanceDue > 0 ? "balance-due-text" : "balance-clear-text"}>
            {balanceDue > 0 ? formatInr(balanceDue) : "No Balance"}
          </b>
          <small>Collection</small>
          <b>
            {booking.payment_collection_mode
              ? booking.payment_collection_mode === "cash"
                ? "Cash Collected By Driver"
                : "Razorpay / QR Collected"
              : "Not Collected"}
            {booking.driver_cash_collected
              ? ` | Driver Cash ${formatInr(booking.driver_cash_collected)}`
              : ""}
          </b>
          <small>Refund</small>
          <b>
            {booking.refund_status || "None"}
            {booking.refund_amount ? ` | ${formatInr(booking.refund_amount)}` : ""}
            {booking.refund_driver_name
              ? ` | By ${booking.refund_driver_name}`
              : booking.refund_collection_mode === "refund_online"
                ? " | Online/Admin"
                : ""}
          </b>
	          <small>Driver</small>
	          <b>
	            {booking.driver_name
	              ? `${booking.driver_name} | ${booking.driver_mobile}`
	              : "Will Assign Soon"}
	          </b>
	          <small>Vehicle No.</small>
	          <b>{booking.vehicle_number || "Will Assign Soon"}</b>
          <small>Cancel Reason</small>
          <b>{booking.cancel_reason || "None"}</b>
        </div>
        {(bookingStatusAudit.length || bookingAssignmentAudit.length) ? (
          <details className="booking-audit-details">
            <summary>Booking History</summary>
            <div>
              {bookingStatusAudit.map((item) => (
                <p key={`booking-status-${item.id}`}>
                  <strong>{item.new_status}</strong>
                  <span>{formatDisplayDateTime(item.created_at)} · {item.actor_role}</span>
                  <small>{item.reason || "Status Updated"}</small>
                </p>
              ))}
              {bookingAssignmentAudit.map((item) => (
                <p key={`booking-assignment-${item.id}`}>
                  <strong>Driver / Vehicle Assigned</strong>
                  <span>{formatDisplayDateTime(item.created_at)} · {item.assigned_by_role}</span>
                  <small>{item.new_driver_mobile || "Driver Pending"} · {item.new_vehicle_number || "Vehicle Pending"}</small>
                </p>
              ))}
            </div>
          </details>
        ) : null}
        {portalRole === "customer" ? renderInvoice(booking) : null}
        {portalRole === "customer" &&
        !normalizedStatus.includes("cancel") &&
        !normalizedStatus.includes("complete") ? (
          <div className="booking-actions portal-customer-actions">
            {balanceDue > 0 ? (
              <button
                type="button"
                disabled={isPaying}
                onClick={() => payPortalBooking(booking)}
              >
                {isPaying ? "Opening Payment..." : `Pay ${formatInr(balanceDue)} Online`}
              </button>
            ) : null}
            {!booking.driver_mobile && !booking.ride_started_at ? (
              <button
                className="customer-cancel-booking"
                type="button"
                onClick={() => cancelCustomerBooking(booking)}
              >
                Cancel Booking
              </button>
            ) : null}
          </div>
        ) : null}
        {portalRole === "driver" && !booking.driver_mobile ? (
          <div className="booking-actions">
            <button
              type="button"
              disabled={
                !driverProfileForm.name ||
                !driverProfileForm.vehicleNumber ||
                !canDriverAcceptBooking
              }
              onClick={() => acceptRide(booking)}
            >
              Accept Ride
            </button>
          </div>
        ) : null}
        {portalRole === "driver" &&
        booking.driver_mobile === driverProfileForm.mobile.replace(/\D/g, "") ? (
          <>
            <div
              className={`driver-due-panel ${
                balanceDue > 0 ? "driver-due-pending" : "driver-due-clear"
              }`}
            >
              <span>Due Amount Before Start / Complete</span>
              <strong>{renderCollectionAmount(balanceDue)}</strong>
            </div>
            <div className="booking-actions driver-ride-actions">
              <button
                type="button"
                disabled={Boolean(booking.ride_started_at)}
                onClick={() => updateDriverRideStatus(booking, "Ride Started")}
              >
                Ride Start
              </button>
              <button
                type="button"
                disabled={Boolean(booking.ride_completed_at)}
                onClick={() => cancelDriverRide(booking)}
              >
                Cancel Ride
              </button>
              <button
                type="button"
                disabled={!booking.ride_started_at || Boolean(booking.ride_completed_at)}
                onClick={() => updateDriverRideStatus(booking, "Ride Complete")}
              >
                Ride Complete
              </button>
            </div>
          </>
        ) : null}
        {canManage ? (
          <>
            <div className="manual-assign-grid">
              <select
                value={assignmentForm[booking.booking_id]?.driverMobile || ""}
                onChange={(event) =>
                  {
                  const selectedDriver = drivers.find(
                    (driver) => driver.mobile === event.target.value,
                  );

                  setAssignmentForm((currentForm) => ({
                    ...currentForm,
                    [booking.booking_id]: {
                      driverName: selectedDriver?.name || "",
                      driverMobile: selectedDriver?.mobile || "",
                      vehicleName:
                        currentForm[booking.booking_id]?.vehicleName ||
                        booking.vehicle,
                      vehicleNumber:
                        currentForm[booking.booking_id]?.vehicleNumber || "",
                    },
                  }));
                  }
                }
              >
                <option value="">Select Driver</option>
                {uniqueDrivers.map((driver) => (
                  <option key={`${booking.booking_id}-${driver.mobile}`} value={driver.mobile}>
                    {driver.name} | {driver.mobile}
                  </option>
                ))}
              </select>
              <select
                value={assignmentForm[booking.booking_id]?.vehicleName || ""}
                onChange={(event) =>
                  setAssignmentForm((currentForm) => ({
                    ...currentForm,
                    [booking.booking_id]: {
                      driverName:
                        currentForm[booking.booking_id]?.driverName || "",
                      vehicleName: event.target.value,
                      driverMobile:
                        currentForm[booking.booking_id]?.driverMobile || "",
                      vehicleNumber: "",
                    },
                  }))
                }
              >
                <option value="">Select Cab</option>
                {vehicles.map((item) => (
                  <option key={`${booking.booking_id}-${item.name}`} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
              <select
                value={assignmentForm[booking.booking_id]?.vehicleNumber || ""}
                onChange={(event) =>
                  {
                  const selectedVehicle = drivers.find(
                    (driver) => driver.vehicleNumber === event.target.value,
                  );

                  setAssignmentForm((currentForm) => ({
                    ...currentForm,
                    [booking.booking_id]: {
                      driverName:
                        currentForm[booking.booking_id]?.driverName ||
                        selectedVehicle?.name ||
                        "",
                      driverMobile:
                        currentForm[booking.booking_id]?.driverMobile || "",
                      vehicleName:
                        selectedVehicle?.vehicle ||
                        currentForm[booking.booking_id]?.vehicleName ||
                        booking.vehicle,
                      vehicleNumber: event.target.value,
                    },
                  }));
                  }
                }
              >
                <option value="">Select Vehicle Number</option>
                {assignmentVehicleRows
                  .filter((driver) => driver.vehicleNumber)
                  .map((driver) => (
                    <option
                      key={`${booking.booking_id}-${driver.vehicleNumber}`}
                      value={driver.vehicleNumber}
                    >
                      {driver.vehicleNumber} | {driver.vehicle}
                    </option>
                  ))}
              </select>
              <button type="button" onClick={() => manualAssignDriver(booking)}>
                Assign Driver
              </button>
            </div>
            <div className="booking-actions">
              <button type="button" onClick={() => autoAssignDriver(booking)}>
                Auto Assign Driver
              </button>
              <button
                type="button"
                onClick={() => startRide(booking)}
              >
                Ride Started
              </button>
              <button
                type="button"
                onClick={() =>
                  updateBookingOperation(booking.booking_id, {
                    rideStatus: "Ride Complete",
                  })
                }
              >
                Ride Complete
              </button>
              <button
                type="button"
                onClick={() =>
                  updateBookingOperation(booking.booking_id, {
                    rideStatus: "Ride Cancelled",
                    cancelReason: "Cancelled From Admin Backend",
                  })
                }
              >
                Cancel Ride
              </button>
              <button
                type="button"
                onClick={() => openAdminPaymentPrompt(booking)}
              >
                Payment Received
              </button>
              <button
                type="button"
                onClick={() =>
                  updateBookingOperation(booking.booking_id, {
                    paymentStatus: "Failed",
                    paymentAmount: 0,
                  })
                }
              >
                Payment Failed
              </button>
              <button
                className="refund-action"
                type="button"
                onClick={() => openAdminRefundPrompt(booking)}
              >
                Refund
              </button>
              <button
                className="danger-action"
                type="button"
                onClick={() => deleteBooking(booking.booking_id)}
              >
                Delete Booking
              </button>
            </div>
          </>
        ) : null}
      </article>
    );
  }

  function renderRolePortalDashboard() {
    if (!portalRole || portalRole === "admin") {
      return null;
    }

    const isDriver = portalRole === "driver";
    const todayKey = new Date().toISOString().slice(0, 10);
    const currentMonthKey = todayKey.slice(0, 7);
    const customerName = portalBookings[0]?.customer_name || "Customer";
    const completedBookings = portalBookings.filter((booking) =>
      (booking.ride_status || "").toLowerCase().includes("complete"),
    );
    const cancelledBookings = portalBookings.filter((booking) =>
      (booking.ride_status || "").toLowerCase().includes("cancel"),
    );
    const activeBookings = portalBookings.filter(
      (booking) =>
        !(booking.ride_status || "").toLowerCase().includes("complete") &&
        !(booking.ride_status || "").toLowerCase().includes("cancel"),
    );
    const todayTrips = portalBookings.filter((booking) =>
      (booking.pickup_datetime || "").startsWith(todayKey),
    );
    const monthEarnings = driverLedger
      .filter(
        (booking) =>
          (booking.ride_completed_at || booking.pickup_datetime || "").startsWith(currentMonthKey) &&
          (booking.ride_status || "").toLowerCase().includes("complete"),
      )
      .reduce((total, booking) => total + getInvoiceTotals(booking).total, 0);
    const openRideRequests = portalBookings.filter((booking) => !booking.driver_mobile);
    const assignedDriverRides = portalBookings.filter(
      (booking) =>
        booking.driver_mobile === driverProfileForm.mobile.replace(/\D/g, "") &&
        !(booking.ride_status || "").toLowerCase().includes("complete") &&
        !(booking.ride_status || "").toLowerCase().includes("cancel"),
    );
    const driverTabs: Array<{ id: DriverPanelTab; label: string; icon: ReactNode; count?: number }> = [
      { id: "dashboard", label: "Dashboard", icon: <HomeIcon /> },
      { id: "rides", label: "Ride Requests", icon: <Navigation />, count: openRideRequests.length + assignedDriverRides.length },
      { id: "history", label: "My Trips", icon: <MapPinned />, count: completedBookings.length },
      { id: "wallet", label: "Earnings & Wallet", icon: <WalletCards />, count: withdrawalRequests.filter((item) => item.status === "Pending").length },
      { id: "vehicles", label: "Vehicles", icon: <CarFront />, count: driverVehicles.length },
      { id: "profile", label: "Profile & Documents", icon: <UserRound /> },
      { id: "support", label: "Help & Support", icon: <Headphones /> },
    ];
    const customerTabs: Array<{ id: CustomerPanelTab; label: string; icon: ReactNode; count?: number }> = [
      { id: "dashboard", label: "Dashboard", icon: <HomeIcon /> },
      { id: "bookings", label: "My Bookings", icon: <ClipboardList />, count: portalBookings.length },
      { id: "payments", label: "Payments & Invoices", icon: <CreditCard />, count: portalBookings.filter((item) => getBalanceDue(item) > 0).length },
      { id: "profile", label: "Profile & Addresses", icon: <UserRound /> },
      { id: "notifications", label: "Notifications", icon: <Bell />, count: bookingStatusHistory.length },
      { id: "support", label: "Help & Support", icon: <Headphones /> },
    ];

    return (
      <div className={`role-dashboard-shell ${isDriver ? "driver-role-shell" : "customer-role-shell"}`}>
        <aside className="role-dashboard-sidebar">
          <div className="role-sidebar-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={siteBranding.iconUrl} alt="Vishnu Tours" />
            <div><strong>Vishnu Tours</strong><span>{isDriver ? "Driver Console" : "Customer Portal"}</span></div>
          </div>
          <nav aria-label={`${isDriver ? "Driver" : "Customer"} dashboard navigation`}>
            {(isDriver ? driverTabs : customerTabs).map((tab) => (
              <button
                className={(isDriver ? activeDriverTab : activeCustomerTab) === tab.id ? "is-active" : ""}
                key={tab.id}
                type="button"
                onClick={() => isDriver
                  ? setActiveDriverTab(tab.id as DriverPanelTab)
                  : setActiveCustomerTab(tab.id as CustomerPanelTab)}
              >
                <b aria-hidden="true">{tab.icon}</b>
                <span>{tab.label}</span>
                {typeof tab.count === "number" ? <em>{tab.count}</em> : null}
              </button>
            ))}
          </nav>
          <button className="role-sidebar-logout" type="button" onClick={logoutPortal}>
            <LogOut aria-hidden="true" />
            Sign Out
          </button>
        </aside>

        <section className="role-dashboard-main">
          <header className="role-dashboard-header">
            <div className="role-dashboard-heading">
              <button className="portal-menu-button" type="button" aria-label="Dashboard menu">
                <Menu aria-hidden="true" />
              </button>
              <div>
                <span>{isDriver ? "Driver Dashboard" : "Customer Dashboard"}</span>
                <strong>{isDriver ? driverProfileForm.name || "Registered Driver" : customerName}</strong>
              </div>
            </div>
            {isDriver ? (
              <div className="portal-user-summary">
                <label className="driver-online-toggle">
                  <span>{driverOnline ? "Online" : "Offline"}</span>
                  <input checked={driverOnline} onChange={(event) => setDriverOnline(event.target.checked)} type="checkbox" />
                  <i aria-hidden="true" />
                </label>
                <b>{(driverProfileForm.name || "Driver").slice(0, 1).toUpperCase()}</b>
              </div>
            ) : (
              <div className="portal-user-summary">
                <span className="customer-header-mobile">{loginMobile}</span>
                <b>{customerName.slice(0, 1).toUpperCase()}</b>
              </div>
            )}
          </header>
          {portalStatus ? <p className="role-dashboard-status">{portalStatus}</p> : null}

          {isDriver && activeDriverTab === "dashboard" ? (
            <div className="role-dashboard-view">
              <div className="portal-welcome-banner driver-welcome-banner">
                <div><span>Welcome Back</span><h2>{driverProfileForm.name || "Driver"}</h2><p>{nextRide ? `Next Pickup ${formatDisplayDateTime(nextRide.pickup_datetime)}` : "You Have No Assigned Upcoming Ride."}</p></div>
                <button type="button" onClick={() => setActiveDriverTab("rides")}>View Ride Requests</button>
              </div>
              <div className="portal-kpi-grid">
                <div><span>Today&apos;s Trips</span><strong>{todayTrips.length}</strong><small>{assignedDriverRides.length} Active / Assigned</small></div>
                <div><span>Available Earning</span><strong>{formatInr(driverEarning.availableEarning)}</strong><small>{driverEarning.completedRides} Completed Rides</small></div>
                <div><span>This Month</span><strong>{formatInr(monthEarnings)}</strong><small>Completed Ride Value</small></div>
                <div><span>Company Cash With You</span><strong>{formatInr(driverEarning.cashInHand)}</strong><small>{pendingCashTransfer ? `${formatInr(pendingCashTransfer)} Awaiting Approval` : "Belongs To Admin"}</small></div>
              </div>
              <section className="driver-dashboard-actions">
                <div>
                  <span>Quick Actions</span>
                  <h3>{assignedDriverRides[0] ? `${assignedDriverRides[0].booking_id} · ${assignedDriverRides[0].destination}` : "No Assigned Ride"}</h3>
                  <p>{assignedDriverRides[0] ? `${assignedDriverRides[0].vehicle} · ${formatDisplayDateTime(assignedDriverRides[0].pickup_datetime)}` : "Accept or receive an assigned ride to enable controls."}</p>
                </div>
                <div className="driver-command-buttons">
                  <button
                    className="start-command"
                    type="button"
                    disabled={!assignedDriverRides[0] || Boolean(assignedDriverRides[0]?.ride_started_at)}
                    onClick={() => assignedDriverRides[0] && updateDriverRideStatus(assignedDriverRides[0], "Ride Started")}
                  ><Navigation />Start Ride</button>
                  <button
                    className="cancel-command"
                    type="button"
                    disabled={!assignedDriverRides[0] || Boolean(assignedDriverRides[0]?.ride_completed_at)}
                    onClick={() => assignedDriverRides[0] && cancelDriverRide(assignedDriverRides[0])}
                  ><Clock3 />Cancel Ride</button>
                  <button
                    className="complete-command"
                    type="button"
                    disabled={!assignedDriverRides[0]?.ride_started_at || Boolean(assignedDriverRides[0]?.ride_completed_at)}
                    onClick={() => assignedDriverRides[0] && updateDriverRideStatus(assignedDriverRides[0], "Ride Complete")}
                  ><CheckCircle2 />Complete Ride</button>
                </div>
              </section>
              <div className="portal-dashboard-columns">
                <section className="portal-surface">
                  <div className="portal-section-heading"><div><span>New Work</span><h3>Ride Requests</h3></div><button type="button" onClick={() => setActiveDriverTab("rides")}>View All</button></div>
                  {openRideRequests.length ? openRideRequests.slice(0, 2).map((booking) => renderPortalBookingCard(booking, false)) : <p className="portal-empty-state">No Eligible Open Ride Request.</p>}
                </section>
                <section className="portal-surface">
                  <div className="portal-section-heading"><div><span>Current Schedule</span><h3>Assigned Rides</h3></div></div>
                  {assignedDriverRides.length ? assignedDriverRides.slice(0, 2).map((booking) => renderPortalBookingCard(booking, false)) : <p className="portal-empty-state">No Assigned Ride At This Time.</p>}
                </section>
              </div>
            </div>
          ) : null}

          {isDriver && activeDriverTab === "rides" ? (
            <div className="role-dashboard-view"><div className="portal-page-title"><span>Dispatch</span><h2>Available And Assigned Rides</h2><p>Only matching registered vehicle categories can be accepted.</p></div><div className="portal-booking-list">{portalBookings.length ? portalBookings.map((booking) => renderPortalBookingCard(booking, false)) : <p className="portal-empty-state">No Rides Found.</p>}</div></div>
          ) : null}

          {isDriver && activeDriverTab === "wallet" ? (
            <div className="role-dashboard-view">
              <div className="portal-page-title"><span>Settlement</span><h2>Earnings And Wallet</h2><p>Cash liability, completed ride earnings and payout requests are shown separately.</p></div>
              <div className="portal-kpi-grid">
                <div><span>Gross Ride Earning</span><strong>{formatInr(driverEarning.totalEarning)}</strong></div>
                <div><span>Available Earning</span><strong>{formatInr(driverEarning.availableEarning)}</strong><small>After Payout And Cash Adjustment</small></div>
                <div><span>Company Cash With You</span><strong>{formatInr(driverEarning.cashInHand)}</strong><small>{formatInr(pendingCashTransfer)} Pending Approval</small></div>
                <div><span>Maximum Withdrawal</span><strong>{formatInr(maxWithdrawalAmount)}</strong></div>
              </div>
              <section className="portal-surface company-cash-settlement">
                <div className="portal-section-heading"><div><span>Company Money</span><h3>Settle Cash In Hand</h3></div></div>
                <p>Customer cash belongs to the company. Keep it only by adjusting it against your available earning, or send it to admin for approval.</p>
                <div className="cash-settlement-balance">
                  <span>Available For Settlement</span>
                  <strong>{formatInr(Math.max(0, driverEarning.cashInHand - pendingCashTransfer))}</strong>
                </div>
                <div className="cash-settlement-form">
                  <input inputMode="numeric" placeholder="Settlement Amount" value={cashSettlementForm.amount} onChange={(event) => setCashSettlementForm((form) => ({ ...form, amount: event.target.value }))} />
                  <input placeholder="Transfer Reference (Optional)" value={cashSettlementForm.referenceNumber} onChange={(event) => setCashSettlementForm((form) => ({ ...form, referenceNumber: event.target.value }))} />
                  <button className="earning-adjust-action" type="button" disabled={driverEarning.availableEarning < 1} onClick={() => settleDriverCash("earning_adjustment")}>Keep Against Earning</button>
                  <button type="button" onClick={() => settleDriverCash("admin_transfer")}>Send To Admin</button>
                </div>
                <div className="cash-settlement-history">
                  {driverCashHistory.length ? driverCashHistory.slice(0, 8).map((entry) => (
                    <div key={`driver-cash-settlement-${entry.id}`}>
                      <span>{formatDisplayDateTime(entry.created_at)}</span>
                      <strong>{entry.settlement_type === "earning_adjustment" ? "Kept Against Earning" : "Sent To Admin"}</strong>
                      <b>{formatInr(entry.amount)}</b>
                      <i className={`settlement-status settlement-${entry.settlement_status.toLowerCase()}`}>{entry.settlement_status}</i>
                    </div>
                  )) : <span>No Cash Settlement Yet.</span>}
                </div>
              </section>
              <section className="portal-surface">
                <div className="portal-section-heading"><div><span>Payout</span><h3>Cash Withdrawal Request</h3></div></div>
                <div className="driver-form withdrawal-form">
                  <input value={withdrawalForm.amount} onChange={(event) => setWithdrawalForm((form) => ({ ...form, amount: event.target.value }))} placeholder="Amount" inputMode="numeric" />
                  <input value={withdrawalForm.bankName} onChange={(event) => setWithdrawalForm((form) => ({ ...form, bankName: event.target.value }))} placeholder="Bank Name" />
                  <input value={withdrawalForm.bankAccount} onChange={(event) => setWithdrawalForm((form) => ({ ...form, bankAccount: event.target.value }))} placeholder="Account Number" />
                  <input value={withdrawalForm.bankIfsc} onChange={(event) => setWithdrawalForm((form) => ({ ...form, bankIfsc: event.target.value }))} placeholder="IFSC Code" />
                  <button type="button" onClick={requestCashWithdrawal}>Request Withdrawal</button>
                  <button className="ghost-action" disabled={maxWithdrawalAmount < 1} type="button" onClick={() => setWithdrawalForm((form) => ({ ...form, amount: String(maxWithdrawalAmount) }))}>Use Maximum</button>
                </div>
                {renderWithdrawalList(withdrawalRequests, false)}
              </section>
              <section className="portal-surface"><div className="portal-section-heading"><div><span>Transactions</span><h3>Driver Ledger</h3></div></div>{renderDriverLedger(driverLedger)}</section>
            </div>
          ) : null}

          {isDriver && activeDriverTab === "vehicles" ? (
            <div className="role-dashboard-view"><div className="portal-page-title"><span>Registered Fleet</span><h2>My Vehicles</h2><p>Only admin-approved vehicles can be used to accept matching rides.</p></div><div className="portal-vehicle-grid">{driverVehicles.length ? driverVehicles.map((item) => { const engaged = isStartedRideVehicle(item.vehicle_number, portalBookings); return <article key={`vehicle-${item.vehicle_number}`}><div><span>{item.vehicle_type}</span><strong>{item.vehicle_number}</strong><small>{item.fuel_type || "Fuel Not Set"} · {item.seating_capacity || "Seats Not Set"}</small></div><b className={engaged ? "vehicle-engaged" : "vehicle-vacant"}>{engaged ? "Engaged" : "Vacant"}</b><p>{item.approval_status || "Approved"} · {item.active_status || "Active"}</p></article>; }) : <p className="portal-empty-state">No Registered Vehicle Found.</p>}</div></div>
          ) : null}

          {isDriver && activeDriverTab === "profile" ? (
            <div className="role-dashboard-view"><div className="portal-page-title"><span>Account</span><h2>Profile And Documents</h2></div><section className="portal-surface portal-profile-grid"><div><span>Driver Name</span><strong>{driverProfileForm.name || "Not Available"}</strong></div><div><span>Mobile</span><strong>{driverProfileForm.mobile}</strong></div><div><span>Primary Vehicle</span><strong>{driverProfileForm.vehicle}</strong></div><div><span>Vehicle Number</span><strong>{driverProfileForm.vehicleNumber || "Not Available"}</strong></div><div><span>Approval</span><strong>{driverVehicles[0]?.approval_status || "Approved"}</strong></div><div><span>Account Type</span><strong>{driverProfileForm.accountType || "Driver-Cum-Owner"}</strong></div></section><section className="portal-surface"><div className="portal-section-heading"><div><span>Audit Trail</span><h3>Recent Status Activity</h3></div></div>{renderStatusActivity(bookingStatusHistory)}</section></div>
          ) : null}

          {isDriver && activeDriverTab === "history" ? (
            <div className="role-dashboard-view"><div className="portal-page-title"><span>Completed Work</span><h2>Trip History</h2></div><div className="portal-booking-list">{[...completedBookings, ...cancelledBookings].length ? [...completedBookings, ...cancelledBookings].map((booking) => renderPortalBookingCard(booking, false)) : <p className="portal-empty-state">No Completed Or Cancelled Ride Yet.</p>}</div></div>
          ) : null}

          {isDriver && activeDriverTab === "support" ? (
            <div className="role-dashboard-view"><div className="portal-page-title"><span>Assistance</span><h2>Driver Help And Support</h2></div><section className="portal-support-panel"><div><strong>WhatsApp Operations Support</strong><p>Contact admin for assignment, document or settlement help.</p></div><a href={whatsappUrl} target="_blank">Open WhatsApp</a></section></div>
          ) : null}

          {!isDriver && activeCustomerTab === "dashboard" ? (
            <div className="role-dashboard-view">
              <div className="portal-welcome-banner customer-welcome-banner">
                <div>
                  <span>Welcome Back</span>
                  <h2>{customerName}</h2>
                  <p>Book, track, pay and download trip details from one place.</p>
                  <button type="button" onClick={openPublicBookingForm}>Book A Cab</button>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/fleet/hycross.png" alt="Toyota Innova Hycross" />
              </div>
              <div className="portal-kpi-grid"><div><span>Total Bookings</span><strong>{portalBookings.length}</strong></div><div><span>Upcoming Trips</span><strong>{activeBookings.length}</strong></div><div><span>Completed Trips</span><strong>{completedBookings.length}</strong></div><div><span>Cancelled Trips</span><strong>{cancelledBookings.length}</strong></div></div>
              <div className="portal-dashboard-columns">
                <section className="portal-surface"><div className="portal-section-heading"><div><span>Next Journey</span><h3>Upcoming Trip</h3></div><button type="button" onClick={() => setActiveCustomerTab("bookings")}>View All</button></div>{activeBookings.length ? renderPortalBookingCard(activeBookings[0], false) : <p className="portal-empty-state">No Upcoming Booking.</p>}</section>
                <section className="portal-surface"><div className="portal-section-heading"><div><span>Activity</span><h3>Recent Booking Updates</h3></div></div>{renderStatusActivity(bookingStatusHistory.slice(0, 6))}</section>
              </div>
            </div>
          ) : null}

          {!isDriver && activeCustomerTab === "bookings" ? (
            <div className="role-dashboard-view"><div className="portal-page-title"><span>Journeys</span><h2>My Bookings</h2></div><div className="portal-booking-list">{portalBookings.length ? portalBookings.map((booking) => renderPortalBookingCard(booking, false)) : <p className="portal-empty-state">No Bookings Found.</p>}</div></div>
          ) : null}

          {!isDriver && activeCustomerTab === "payments" ? (
            <div className="role-dashboard-view"><div className="portal-page-title"><span>Fare And Tax</span><h2>Payments And Invoices</h2><p>All amounts include applicable GST and final ride distance adjustments.</p></div><div className="portal-payment-list">{portalBookings.map((booking) => { const totals = getInvoiceTotals(booking); const due = getBalanceDue(booking); return <article key={`payment-${booking.booking_id}`}><div><strong>{booking.booking_id}</strong><span>{booking.vehicle} · {formatDisplayDateTime(booking.pickup_datetime)}</span></div><div><span>Total</span><b>{formatInr(totals.total)}</b></div><div><span>Paid</span><b className="ledger-collected-amount">{formatInr(Number(booking.payment_amount || 0))}</b></div><div><span>Due</span><b className={due ? "ledger-deducted-amount" : "ledger-collected-amount"}>{formatInr(due)}</b></div><button type="button" onClick={() => setActiveCustomerTab("bookings")}>View Invoice</button></article>; })}</div></div>
          ) : null}

          {!isDriver && activeCustomerTab === "profile" ? (
            <div className="role-dashboard-view"><div className="portal-page-title"><span>Account</span><h2>Profile And Saved Locations</h2></div><section className="portal-surface portal-profile-grid"><div><span>Customer Name</span><strong>{customerName}</strong></div><div><span>Mobile Number</span><strong>{portalBookings[0]?.customer_mobile || loginMobile}</strong></div><div><span>Recent Pickup</span><strong>{portalBookings[0]?.start_point || "No Saved Pickup"}</strong></div><div><span>Recent Destination</span><strong>{portalBookings[0]?.destination || "No Saved Destination"}</strong></div></section></div>
          ) : null}

          {!isDriver && activeCustomerTab === "notifications" ? (
            <div className="role-dashboard-view"><div className="portal-page-title"><span>Booking Updates</span><h2>Notifications</h2></div><section className="portal-surface">{renderStatusActivity(bookingStatusHistory)}</section></div>
          ) : null}

          {!isDriver && activeCustomerTab === "support" ? (
            <div className="role-dashboard-view"><div className="portal-page-title"><span>Assistance</span><h2>Customer Help And Support</h2></div><section className="portal-support-panel"><div><strong>WhatsApp Customer Support</strong><p>Share your booking number for faster help with pickup, payment or cancellation.</p></div><a href={whatsappUrl} target="_blank">Open WhatsApp</a></section></div>
          ) : null}
        </section>
      </div>
    );
  }

  const activeSiteFontStack =
    siteFontOptions.find((option) => option.value === siteFont)?.stack ||
    siteFontOptions[0].stack;

  const bookingTicketText = confirmedBooking
    ? [
        "Vishnu Tours - Booking Confirmed",
        `Booking Number: ${confirmedBooking.bookingId}`,
        `Trip Type: ${effectiveTripType}`,
        `Cab: ${vehicle}`,
        `Pickup: ${startPoint}`,
        `Drop: ${drop}`,
        `Pickup Date And Time: ${formatDisplayDate(date)}, ${pickupTime}`,
        ...(tripType === "Outstation" &&
        outstationTripType === "Round Trip" &&
        returnDate
          ? [`Drop Date: ${formatDisplayDate(returnDate)}`]
          : []),
        `Billable Distance: ${confirmedBooking.billableKm} KM`,
        `Customer: ${name}`,
        `Mobile: ${mobile}`,
        `Fare: ${formatInr(confirmedBooking.estimatedFare)}`,
        `Payment: ${
          isPaymentComplete
            ? `${formatPaymentAmount(selectedPaymentAmount)} Paid`
            : "Payment Pending"
        }`,
        "Support: +91 7004291529",
      ].join("\n")
    : "";
  const ticketWhatsAppUrl = `https://wa.me/?text=${encodeURIComponent(
    bookingTicketText,
  )}`;
  const ticketEmailUrl = `mailto:?subject=${encodeURIComponent(
    `Vishnu Tours Booking ${confirmedBooking?.bookingId || ""}`,
  )}&body=${encodeURIComponent(bookingTicketText)}`;

  async function shareBookingTicket() {
    if (!bookingTicketText || !confirmedBooking) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Vishnu Tours Booking ${confirmedBooking.bookingId}`,
          text: bookingTicketText,
        });
        setTicketShareStatus("Booking details shared successfully.");
        return;
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(bookingTicketText);
        setTicketShareStatus(
          "Booking details copied. You can paste and share them.",
        );
        return;
      }

      setTicketShareStatus("Please use WhatsApp or Email to share this booking.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setTicketShareStatus(
        "Sharing was not completed. Please use WhatsApp or Email.",
      );
    }
  }

  return (
    <main
      className="site-font-shell"
      style={
        {
          "--active-site-font": activeSiteFontStack,
          "--site-header-logo-size": `${siteBranding.headerLogoSize}px`,
          "--site-footer-logo-size": `${siteBranding.footerLogoSize}px`,
        } as CSSProperties
      }
    >
      <header className="top-strip main-menu">
        <Link className="brand" href="/" aria-label="Vishnu Tours home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={`brand-logo ${isBrandingReady ? "branding-ready" : "branding-loading"}`}
            src={siteBranding.iconUrl}
            alt="Vishnu Tours logo"
          />
          <span>
            <strong>Vishnu Tours</strong>
          </span>
        </Link>
        <nav className="main-nav" aria-label="Primary navigation">
          <a href="#home">Home</a>
          <Link href="/about-us">About Us</Link>
          <a href="#fleet">Our Fleet</a>
          <a href="#booking">Outstation</a>
          <a href="#booking">Airport Transfer</a>
          <a href="#booking">Local Rental</a>
          <a href="#contact">Contact Us</a>
        </nav>
        <div className="header-actions">
          <a className="call-button" href={whatsappUrl} target="_blank">
            WhatsApp 7004291529
          </a>
          <button
            className="login-button"
            type="button"
            onClick={() => setShowLogin(true)}
          >
            Login
          </button>
        </div>
      </header>

      {bookingView === "home" ? (
      <>
      <section className="hero focused-booking-hero" id="home">
        <div className="hero-content">
          <div className="hero-copy">
            <p className="hero-kicker">Mumbai&apos;s <b>Most Trusted</b> Cab Service</p>
            <h1>Stress Free Travel <span>Every Mile With Us</span></h1>
            <p>
              Experience Safe, Comfortable And Timely Rides With Vishnu Tours.
            </p>
            <div className="hero-service-points" aria-label="Service benefits">
              <span><b>24x7 Support</b> Always Available</span>
              <span><b>Clean & Safe Cabs</b> Well Maintained</span>
              <span><b>On-Time Service</b> Always On Time</span>
              <span><b>Affordable Pricing</b> Best Fare Guarantee</span>
            </div>
          </div>

          <form
            className="booking-panel savaari-booking-panel"
            id="booking"
            onSubmit={(event) => {
              event.preventDefault();
              continueToRates();
            }}
          >
            <h2 className="booking-title">Cab Booking</h2>
            <div className="trip-tabs" role="tablist" aria-label="Trip type">
              {bookingTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={tripType === type ? "active" : ""}
                  onClick={() => {
                    setTripType(type);
                    if (type !== "Outstation") {
                      setReturnDate("");
                    }
                    if (type === "In-City") {
                      setStartPoint(headOffice);
                      setDrop(localRoute);
                      setDistanceKm(String(selectedLocalPackage.km));
                    }
                    if (type === "Airport" && !distanceKm) {
                      setDistanceKm("40");
                    }
                    if (type === "Airport") {
                      const selectedAirport = getAirportOption(airportTripType);

                      if (selectedAirport.mode === "pickup") {
                        setStartPoint(selectedAirport.location);
                        setDrop("");
                      } else {
                        setStartPoint(headOffice);
                        setDrop(selectedAirport.location);
                      }
                    }
                    setShowVehicleStep(false);
                    setBookingView("home");
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
            <div className={`route-form-row ${tripType === "In-City" ? "local-route-row" : ""}`}>
              <label className="booking-field choose-trip-field">
                <span>Choose Trip</span>
                {tripType === "Outstation" ? (
                  <select
                    value={outstationTripType}
                    onChange={(event) => {
                      setOutstationTripType(event.target.value);
                      if (event.target.value !== "Round Trip") {
                        setReturnDate("");
                      }
                      setShowVehicleStep(false);
                      setBookingView("home");
                    }}
                  >
                    {outstationTripOptions.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                ) : null}
                {tripType === "Airport" ? (
                  <select
                    value={airportTripType}
                    onChange={(event) => {
                      const type = event.target.value;
                      const selectedAirport = getAirportOption(type);

                      setAirportTripType(type);
                      if (selectedAirport.mode === "pickup") {
                        setStartPoint(selectedAirport.location);
                        setDrop("");
                      } else {
                        setStartPoint(headOffice);
                        setDrop(selectedAirport.location);
                      }
                      if (!distanceKm) {
                        setDistanceKm("40");
                      }
                      setShowVehicleStep(false);
                      setBookingView("home");
                    }}
                  >
                    {airportTripOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : null}
                {tripType === "In-City" ? (
                  <select
                    value={localPackageType}
                    onChange={(event) => {
                      const selected = localPackageOptions.find(
                        (item) => item.id === event.target.value,
                      );

                      setLocalPackageType(
                        event.target.value as (typeof localPackageOptions)[number]["id"],
                      );
                      if (!startPoint.trim()) {
                        setStartPoint(headOffice);
                      }
                      setDrop(localRoute);
                      setDistanceKm(String(selected?.km || selectedLocalPackage.km));
                      setShowVehicleStep(false);
                      setBookingView("home");
                    }}
                  >
                    {localPackageOptions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                ) : null}
              </label>
              {tripType === "In-City" ? (
                <label className="place-field booking-field local-pickup-field">
                  <span>Pickup Location</span>
                  <div className="location-input-wrap">
                    <input
                      ref={fromInputRef}
                      value={startPoint}
                      onChange={(event) => {
                        setPickupFieldTouched(false);
                        setActiveSuggestionField("from");
                        updateStartPoint(event.target.value);
                      }}
                      onFocus={() => {
                        setPickupFieldTouched(false);
                        setActiveSuggestionField("from");
                      }}
                      onBlur={() => {
                        setPickupFieldTouched(true);
                        window.setTimeout(() => setActiveSuggestionField(null), 140);
                      }}
                      placeholder="Enter Mumbai Pickup"
                      autoComplete="off"
                      required
                    />
                    <button
                      className="current-location-button"
                      type="button"
                      onClick={useCurrentLocation}
                    >
                      Current
                    </button>
                  </div>
                  {activeSuggestionField === "from" && visibleFromSuggestions.length ? (
                    <div className="place-suggestions" aria-label="Mumbai pickup suggestions">
                      {visibleFromSuggestions.map((item) => (
                        <button
                          key={`${item.label}-${item.secondary || "local-pickup"}`}
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => {
                            setPickupFieldTouched(false);
                            updateStartPoint(item.label);
                            setGoogleFromSuggestions([]);
                            setGoogleFromQuery("");
                            setActiveSuggestionField(null);
                          }}
                        >
                          <span>{item.secondary || "Pickup"}</span>
                          <strong>{item.label}</strong>
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {showPickupError ? (
                    <small className="field-error">
                      Pickup Is Available Only From Mumbai And Nearby Mumbai Areas.
                    </small>
                  ) : null}
                </label>
              ) : (
              <>
              <label className="place-field booking-field">
                <span>{isAirportDrop ? "Pickup Location" : "From"}</span>
                <div className="location-input-wrap">
                  <input
                    ref={fromInputRef}
                    value={startPoint}
                    onChange={(event) => {
                      setPickupFieldTouched(false);
                      setActiveSuggestionField("from");
                      updateStartPoint(event.target.value);
                    }}
                    onFocus={() => {
                      setPickupFieldTouched(false);
                      setActiveSuggestionField("from");
                    }}
                    onBlur={() => {
                      setPickupFieldTouched(true);
                      window.setTimeout(() => setActiveSuggestionField(null), 140);
                    }}
                    placeholder="Enter Pickup Location"
                    autoComplete="off"
                    readOnly={isAirportPickup}
                    required
                  />
                  {!isAirportPickup ? (
                    <button
                      className="current-location-button"
                      type="button"
                      onClick={useCurrentLocation}
                    >
                      Current
                    </button>
                  ) : null}
                </div>
                {activeSuggestionField === "from" &&
                visibleFromSuggestions.length &&
                !isAirportPickup ? (
                  <div className="place-suggestions" aria-label="Mumbai pickup suggestions">
                    {visibleFromSuggestions.map((item) => (
                      <button
                        key={`${item.label}-${item.secondary || "pickup"}`}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          setPickupFieldTouched(false);
                          updateStartPoint(item.label);
                          setGoogleFromSuggestions([]);
                          setGoogleFromQuery("");
                          setActiveSuggestionField(null);
                        }}
                      >
                        <span>{item.secondary || "Pickup"}</span>
                        <strong>{item.label}</strong>
                      </button>
                    ))}
                  </div>
                ) : null}
                {showPickupError ? (
                  <small className="field-error">
                    Pickup Is Available Only From Mumbai And Nearby Mumbai Areas.
                  </small>
                ) : null}
              </label>
              <button className="route-swap" type="button" aria-label="Mumbai pickup only">
                ⇄
              </button>
              <label className="place-field booking-field">
                <span>{isAirportPickup ? "Drop Location" : "To"}</span>
                <input
                  ref={toInputRef}
                  value={drop}
                  onChange={(event) => {
                    setActiveSuggestionField("to");
                    updateDestination(event.target.value);
                  }}
                  onFocus={() => setActiveSuggestionField("to")}
                  onBlur={() =>
                    window.setTimeout(() => setActiveSuggestionField(null), 140)
                  }
                  placeholder="Enter Drop Location"
                  autoComplete="off"
                  readOnly={isAirportDrop}
                  required
                />
                {activeSuggestionField === "to" &&
                visibleDestinationSuggestions.length &&
                !isAirportDrop ? (
                  <div className="place-suggestions" aria-label="India destination suggestions">
                    {visibleDestinationSuggestions.map((item) => (
                      <button
                        key={`${item.label}-${item.secondary || "destination"}`}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          updateDestination(item.label);
                          setGoogleDestinationSuggestions([]);
                          setGoogleDestinationQuery("");
                          setActiveSuggestionField(null);
                        }}
                      >
                        <span>{item.secondary || "Destination"}</span>
                        <strong>{item.label}</strong>
                      </button>
                    ))}
                  </div>
                ) : null}
              </label>
              </>
              )}
              <label className="booking-field">
                <span>Pick Up Date</span>
                <input
                  value={date}
                  onChange={(event) => {
                    const selectedPickupDate = event.target.value;

                    setDate(selectedPickupDate);
                    if (returnDate && returnDate < selectedPickupDate) {
                      setReturnDate("");
                    }
                    setShowVehicleStep(false);
                    setBookingView("home");
                  }}
                  type="date"
                  required
                />
              </label>
              {tripType === "Outstation" && outstationTripType === "Round Trip" ? (
                <label className="booking-field">
                  <span>Drop Date</span>
                  <input
                    value={returnDate}
                    onChange={(event) => {
                      setReturnDate(event.target.value);
                      setShowVehicleStep(false);
                      setBookingView("home");
                    }}
                    min={date || undefined}
                    type="date"
                    required
                  />
                </label>
              ) : null}
              <label className="booking-field">
                <span>Pick Up Time</span>
                <input
                  value={pickupTime}
                  onChange={(event) => {
                    setPickupTime(event.target.value);
                    setShowVehicleStep(false);
                    setBookingView("home");
                  }}
                  type="time"
                  step="60"
                  required
                />
              </label>
              <label className="booking-field km-field">
                <span>KM</span>
                <input
                  value={distanceKm}
                  onChange={(event) => {
                    setDistanceKm(event.target.value);
                    setShowVehicleStep(false);
                    setBookingView("home");
                  }}
                  placeholder="Auto"
                  inputMode="numeric"
                  required
                />
                {isDistanceLoading ? (
                  <small className="field-hint">Google distance checking...</small>
                ) : null}
              </label>
            </div>
            {bookingStatus && bookingView === "home" ? (
              <p className="booking-error">{bookingStatus}</p>
            ) : null}
            <button className="submit-button explore-cabs-button" type="submit">
              Explore Cabs
            </button>
            <p className="booking-rating-strip">
              24x7 Support | Free Cancellation Before Assignment | Mumbai Pickup Only
            </p>
          </form>
        </div>
      </section>

      <section className="homepage-fleet-strip" id="fleet" aria-label="Vishnu Tours car fleet">
        <div className="homepage-fleet-head">
          <h2>Popular Cabs</h2>
        </div>
        <div className="homepage-fleet-list">
          {vehicles.map((item) => (
            <article className="homepage-fleet-card" key={`home-${item.name}`}>
              <div className="homepage-fleet-photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.photo} alt={`${item.name} white cab`} />
              </div>
              <div>
                <small>{item.type}</small>
                <h3>{item.name}</h3>
                <p>{item.seats} | {item.luggage} | White AC Cab</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      </>
      ) : null}

      {bookingView === "cars" ? (
        <section className="car-results-section savaari-results" ref={carResultsRef}>
          <div className="select-car-topbar">
            <div>
              <span>Home &gt; Select Car</span>
              <strong>
                {startPoint} - {drop}
              </strong>
            </div>
            <div>
              <span>Trip Type</span>
              <strong>{effectiveTripType}</strong>
            </div>
            <div>
              <span>Pick Up</span>
              <strong>{formatDisplayDate(date)}</strong>
            </div>
            {tripType === "Outstation" && outstationTripType === "Round Trip" ? (
              <div>
                <span>Return</span>
                <strong>{formatDisplayDate(returnDate)}</strong>
              </div>
            ) : null}
            <div>
              <span>Time</span>
              <strong>{pickupTime}</strong>
            </div>
            <button type="button" onClick={() => setBookingView("home")}>
              Modify Booking
            </button>
          </div>
          <div className="vehicle-card-list" aria-live="polite">
            {vehicleRates.map((item) => {
              const tax = Math.round(item.estimatedFare * 0.05);
              const total = item.estimatedFare + tax;
              const marketTotal = Math.round(total / 0.9);
              const saving = Math.max(0, marketTotal - total);

              return (
                <article className="select-car-card" key={item.name}>
                  <div className="car-art">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.photo} alt={`${item.name} cab`} />
                  </div>
                  <div className="car-detail-block">
                    <h3>
                      {item.name} <span>4.8 ★</span>
                    </h3>
                    <p>{item.type} | {item.seats} AC Cab</p>
                    <ul>
                      <li>Driver Allowance Included</li>
                      <li>
                        {billableDistance || 0} KMs Included | Extra Distance: Rs.{" "}
                        {item.perKm}/KM
                      </li>
                      <li>Extra Time After Package: {formatInr(item.perHour)}/Hour</li>
                      <li>
                        {item.seats.startsWith("4") ? "4" : "6"} Passengers | {item.luggage}
                      </li>
                      <li>{selectedPackage.label}</li>
                    </ul>
                    <button type="button" className="link-button">
                      Inclusions and Exclusions
                    </button>
                  </div>
                  <div className="car-price-block">
                    <span className="discount-line">Direct Owner Rate</span>
                    <del>{formatInr(marketTotal)}</del>
                    <strong>{formatInr(total)}</strong>
                    <span className="saving-line">You Save {formatInr(saving)}</span>
                    <small>Including GST 5%: {formatInr(tax)}</small>
                    <button
                      className="book-cab-button select-car-button"
                      type="button"
                      onClick={() => reviewSelectedCab(item.name)}
                    >
                      Select Car
                    </button>
                  </div>
                  <div className="promise-line">
                    Verified Owner Fleet • Clean Cars • On-Time Pickup
                  </div>
                </article>
              );
            })}
          </div>
          <div className="result-promise-band result-promise-band-bottom">
            <strong>₹ Book Now At Zero Cost</strong>
            <strong>Free Cancellations Up To 1 Hour</strong>
            <strong>24/7 Customer Support</strong>
          </div>
        </section>
      ) : null}

      {bookingView === "review" ? (
        <section className="review-page" ref={reviewRef}>
          {showBookingTicket && confirmedBooking ? (
            <article className="payment-complete-screen" aria-live="polite">
              <span>{isPaymentComplete ? "Payment Successful" : "Booking Confirmed"}</span>
              <div className="success-tick" aria-hidden="true">✓</div>
              <h2>Booking Confirmed</h2>
              <div className="confirmation-number">
                <small>Booking Number</small>
                <strong>{confirmedBooking.bookingId}</strong>
              </div>
              <div className="confirmation-grid">
                <div>
                  <small>Trip Type</small>
                  <strong>{effectiveTripType}</strong>
                </div>
                <div>
                  <small>Cab</small>
                  <strong>{vehicle}</strong>
                </div>
                <div>
                  <small>Pickup</small>
                  <strong>{startPoint}</strong>
                </div>
                <div>
                  <small>Drop</small>
                  <strong>{drop}</strong>
                </div>
                <div>
                  <small>Date And Time</small>
                  <strong>{formatDisplayDate(date)}, {pickupTime}</strong>
                </div>
                {tripType === "Outstation" && outstationTripType === "Round Trip" ? (
                  <div>
                    <small>Drop Date</small>
                    <strong>{formatDisplayDate(returnDate)}</strong>
                  </div>
                ) : null}
                <div>
                  <small>Billable Distance</small>
                  <strong>{confirmedBooking.billableKm} KM</strong>
                </div>
                <div>
                  <small>Customer</small>
                  <strong>{name}</strong>
                </div>
                <div>
                  <small>Mobile</small>
                  <strong>{mobile}</strong>
                </div>
                <div>
                  <small>Fare</small>
                  <strong>{formatInr(confirmedBooking.estimatedFare)}</strong>
                </div>
                <div>
                  <small>Payment</small>
                  <strong>
                    {isPaymentComplete
                      ? `${formatPaymentAmount(selectedPaymentAmount)} Paid`
                      : "Payment Pending"}
                  </strong>
                </div>
              </div>
              <div className="ticket-action-bar" aria-label="Booking ticket actions">
                <button
                  className="ticket-share-action"
                  type="button"
                  onClick={shareBookingTicket}
                >
                  <Share2 aria-hidden="true" />
                  Share
                </button>
                <a
                  className="ticket-whatsapp-action"
                  href={ticketWhatsAppUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <WhatsAppIcon />
                  WhatsApp
                </a>
                <a href={ticketEmailUrl}>
                  <Mail aria-hidden="true" />
                  Email
                </a>
                <button type="button" onClick={() => window.print()}>
                  <Printer aria-hidden="true" />
                  Print
                </button>
              </div>
              {ticketShareStatus ? (
                <small className="ticket-share-status" role="status">
                  {ticketShareStatus}
                </small>
              ) : null}
              <button
                className="primary-action inline-action"
                type="button"
                onClick={resetBooking}
              >
                Book Another Cab
              </button>
            </article>
          ) : (
          <>
          <div className="review-main">
            <article className="review-card">
              <h3>Contact & Pickup Details</h3>
              <div className="review-form-grid">
                <label>
                  Full Name
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Guest Name"
                    required
                  />
                </label>
                <label>
                  Mobile No.
                  <input
                    value={mobile}
                    onChange={(event) => setMobile(event.target.value)}
                    placeholder="Mobile Number"
                    inputMode="tel"
                    required
                  />
                </label>
                <label className="wide-field">
                  Email ID
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Email Optional"
                    type="email"
                  />
                </label>
                <label className="wide-field">
                  Pickup Location
                  <input value={startPoint} readOnly />
                </label>
                <label className="wide-field">
                  Drop Location
                  <input value={drop} readOnly />
                </label>
              </div>
            </article>
            {bookingStatus ? (
              <p className={confirmedBooking ? "booking-success" : "booking-error"}>
                {bookingStatus}
              </p>
            ) : null}
          </div>
          <aside className="payment-sidebar">
            <div className="free-cancel-note">Free Cancellation Till 1 Hr Of Departure</div>
            <div className="payment-options-card">
              <h2>Payment Options</h2>
              {[
                { id: "zero", label: "Book At Zero", note: `Pay ${formatInr(payableFare)} Later`, amount: 0 },
                { id: "part", label: "Part Pay", note: "Pay 25% Now And Rest To The Driver", amount: partPayAmount },
                { id: "full", label: "Full Pay", note: "Full Amount", amount: payableFare },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={
                    paymentChoice === option.id
                      ? "payment-option active"
                      : "payment-option"
                  }
                  onClick={() => {
                    setPaymentChoice(option.id as "zero" | "part" | "full");
                    setPaymentMode(option.label);
                    setAdvanceAmount(String(option.amount));
                  }}
                >
                  <span />
                  <strong>{option.label}</strong>
                  <small>{option.note}</small>
                  <b>{formatPaymentAmount(option.amount)}</b>
                </button>
              ))}
              <div className="coupon-row">
                <input placeholder="Enter A Coupon" />
                <button type="button">Apply</button>
              </div>
              <button
                className="submit-button proceed-button"
                type="button"
                onClick={proceedReviewBooking}
                disabled={isBooking || isPaying}
              >
                {isBooking || isPaying ? "Processing..." : "Proceed"}
              </button>
              <button className="fare-breakup" type="button">
                View Fare Breakup
              </button>
              {paymentStatus ? <p className="payment-status">{paymentStatus}</p> : null}
            </div>
          </aside>
          </>
          )}
        </section>
      ) : null}

      {bookingView === "home" ? (
      <>
      <a className="enquiry-tab" href={whatsappUrl} target="_blank">Enquiry</a>
      <a className="floating-whatsapp" href={whatsappUrl} target="_blank" aria-label="Chat With Vishnu Tours On WhatsApp" title="Chat On WhatsApp">
        <WhatsAppIcon aria-hidden="true" />
        <span>WhatsApp</span>
      </a>
      <section className="homepage-steps-section" id="why-us" aria-label="Why choose Vishnu Tours">
        <div className="homepage-section-head">
          <h2>Why Choose Vishnu Tours?</h2>
        </div>
        <div className="homepage-steps-grid">
          {[
            {
              title: "24x7 Customer Support",
              text: "We Are Always Here To Help You.",
            },
            {
              title: "Mumbai Pickup Coverage",
              text: "Pickup And Drop Support Across Mumbai.",
            },
            {
              title: "Sanitized And Safe Cars",
              text: "Your Safety And Comfort Are Our Priority.",
            },
            {
              title: "Professional Drivers",
              text: "Polite, Experienced And Verified Drivers.",
            },
            {
              title: "Transparent Pricing",
              text: "No Hidden Charges. See Your Fare Clearly.",
            },
            {
              title: "Easy Booking",
              text: "Quick Website Booking And Confirmation.",
            },
          ].map((item, index) => (
            <article className="homepage-step-card" key={item.title}>
              <b aria-hidden="true">{["☎", "⌖", "▣", "♙", "₹", "✓"][index]}</b>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="homepage-services-section" id="services" aria-label="Important services">
        <div className="homepage-section-head">
          <h2>Our Services</h2>
        </div>
        <div className="homepage-service-grid">
          {[
            { title: "Airport T1 And T2", text: "Premium Pickup Or Drop With Mumbai Airport Terminal Options.", icon: <Plane /> },
            { title: "Corporate Office Travel", text: "Meeting, Site Visit, Hotel And Guest Movement Support.", icon: <Building2 /> },
            { title: "Mumbai Local Duty", text: "4 Hr / 45 KM And 8 Hr / 90 KM In-City Packages.", icon: <MapPinned /> },
            { title: "All India Outstation", text: "Mumbai Pickup For One Way And Round Trip Travel.", icon: <Route /> },
            { title: "VIP Event Movement", text: "Clean White Cars For Weddings, Events And Executive Guests.", icon: <Crown /> },
            { title: "Booking Support", text: "Clear Fare, Cab Selection And Confirmation Before Travel.", icon: <Headphones /> },
          ].map(({ title, text, icon }) => (
            <article className="homepage-service-card" key={title}>
              <div className="homepage-service-image" aria-hidden="true">
                {icon}
              </div>
              <div className="homepage-service-body">
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="homepage-comfort-section" aria-label="Travel with comfort and trust">
        <div className="homepage-section-head">
          <h2>Travel With Comfort & Trust</h2>
          <p>Rides For Every Need, Every Journey And Every Destination.</p>
        </div>
        <div className="homepage-comfort-grid">
          {[
            ["Professional Chauffeurs", "Trained, Polite And Committed To Your Safety.", "/home/corporate-transfer.png"],
            ["For Business & Professionals", "Punctual, Reliable And Productive Travel Experience.", "/home/innova-hycross-vip-pickup.jpg?v=7f31a1"],
            ["For Families & Loved Ones", "Comfortable Rides For Memorable Journeys Together.", "/home/family-travel-v2.jpg"],
          ].map(([title, text, image]) => (
            <article className="homepage-comfort-card" key={title}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt={title} />
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="site-footer" id="contact">
        <div className="footer-column footer-brand-column">
          <Link className="footer-brand-lockup" href="/" aria-label="Vishnu Tours home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={`footer-logo ${isBrandingReady ? "branding-ready" : "branding-loading"}`}
              src={siteBranding.iconUrl}
              alt="Vishnu Tours icon"
            />
            <span className="footer-brand-copy">
              <strong><b>Vishnu</b> <em>Tours</em></strong>
              <small>Corporate Cabs From Mumbai</small>
            </span>
          </Link>
          <span className="footer-legal-name">
            <b>Registered Enterprise:</b> VISHNU S.TOURS &amp; TRAVELS
          </span>
          <span className="footer-legal-name">
            <b>Udyam:</b> UDYAM-MH-18-0242307
          </span>
          <span>Premium Cab Booking From Mumbai For Corporate Guests, Airport Transfers And Outstation Trips.</span>
        </div>
        <div className="footer-column">
          <strong>Quick Links</strong>
          <a href="#home">Home</a>
          <Link href="/about-us">About Us</Link>
          <a href="#fleet">Our Fleet</a>
          <a href="#booking">Book Cab</a>
        </div>
        <div className="footer-column">
          <strong>Our Services</strong>
          <a href="#booking">Outstation Trips</a>
          <a href="#booking">Airport Transfers</a>
          <a href="#booking">In-City Travel</a>
          <a href="#services">Corporate Travel</a>
        </div>
        <div className="footer-column">
          <strong>Company</strong>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/terms-and-conditions">Terms And Conditions</Link>
          <Link href="/cancellation-refund">Cancellation And Refund</Link>
          <Link href="/cookie-policy">Cookie Policy</Link>
        </div>
        <div className="footer-column">
          <strong>Contact Us</strong>
          <Link href="/price-chart">Live Price Chart</Link>
          <span>Mumbai, Maharashtra, India</span>
          <a href="mailto:cricketsikho@gmail.com">cricketsikho@gmail.com</a>
          <a className="footer-phone-link" href="tel:+917004291529">
            <PhoneCall aria-hidden="true" />
            <span>+91 7004291529</span>
          </a>
          <a className="footer-whatsapp-link" href={whatsappUrl} target="_blank">
            <WhatsAppIcon aria-hidden="true" />
            <span>WhatsApp Booking</span>
          </a>
        </div>
        <div className="footer-booking-cta" aria-label="Book Vishnu Tours cab">
          <div>
            <strong>Need A Cab From Mumbai?</strong>
            <span>Choose Your Journey And Get A Clear Fare Before You Confirm.</span>
          </div>
          <a href="#booking">Book Your Cab Now</a>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Vishnu Tours. All Rights Reserved.</span>
          <span>Safe & Comfortable Travel From Mumbai</span>
        </div>
      </footer>
      </>
      ) : null}

      {showCookieConsent ? (
        <div className="cookie-consent" role="dialog" aria-live="polite" aria-label="Cookie consent">
          <div>
            <strong>Cookie Notice</strong>
            <span>
              We Use Essential Cookies And Local Storage To Improve Booking, Login And Website Experience.
            </span>
          </div>
          <div className="cookie-actions">
            <a href="/cookie-policy">Cookie Policy</a>
            <button
              type="button"
              onClick={() => {
                localStorage.setItem("vishnuToursCookieConsent", "accepted");
                setShowCookieConsent(false);
              }}
            >
              Accept
            </button>
          </div>
        </div>
      ) : null}

      {collectionPrompt ? (
        <div className="collection-modal-backdrop" role="dialog" aria-modal="true">
          <div className="collection-modal">
            <button
              className="admin-close"
              type="button"
              onClick={() => {
                setCollectionPrompt(null);
                setCollectionStatus("");
              }}
            >
              ×
            </button>
            <span className="collection-alert-label">
              {collectionPromptMode === "start"
                ? "Pending Balance Reminder"
                : "Final Collection Amount"}
            </span>
            <h2>{collectionPrompt.booking_id}</h2>
            <p>
              {collectionPrompt.customer_name}{" "}
              {collectionPromptMode === "complete"
                ? "Has Final Collection For"
                : "Has Pending Balance For"}{" "}
              {collectionPrompt.start_point} To {collectionPrompt.destination}.
            </p>
            <strong className="collection-due-amount">
              {renderCollectionAmount(getBalanceDue(collectionPrompt))}
            </strong>
            <div className="collection-meta-grid">
              <span>Total Fare With GST</span>
              <b>{formatInr(getInvoiceTotals(collectionPrompt).total)}</b>
              <span>Already Paid</span>
              <b>{formatPaymentAmount(collectionPrompt.payment_amount || 0)}</b>
              {collectionPromptMode === "complete" && collectionPrompt.odometer_end ? (
                <>
                  <span>Actual Distance</span>
                  <b>
                    {Math.max(
                      0,
                      Number(collectionPrompt.odometer_end || 0) -
                        Number(collectionPrompt.odometer_start || 0),
                    )}{" "}
                    KM
                  </b>
                  <span>Extra KM Charge</span>
                  <b>
                    {Number(collectionPrompt.extra_km || 0)} KM |{" "}
                    {formatInr(
                      Math.max(
                        0,
                        Number(collectionPrompt.extra_amount || 0) -
                          Number(collectionPrompt.extra_hour_amount || 0),
                      ),
                    )}
                  </b>
                  <span>Extra Time Charge</span>
                  <b>
                    {Number(collectionPrompt.extra_hours || 0)} Hour |{" "}
                    {formatInr(Number(collectionPrompt.extra_hour_amount || 0))}
                  </b>
                </>
              ) : null}
              <span>Cab</span>
              <b>{collectionPrompt.vehicle}</b>
            </div>
            {collectionPromptMode === "start" ? (
              <div className="collection-actions">
                <button
                  type="button"
                  onClick={() =>
                    submitDriverRideStatus(collectionPrompt, "Ride Started", {
                      odometerStart: Number(collectionPrompt.odometer_start || 0),
                    })
                  }
                >
                  Start Ride Now
                </button>
                <button
                  className="ghost-action"
                  type="button"
                  onClick={() => setCollectionPrompt(null)}
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="collection-actions">
                <button
                  type="button"
                  disabled={isPaying}
                  onClick={() => completeRideWithCash(collectionPrompt)}
                >
                  Cash Collected And Complete
                </button>
                <button
                  type="button"
                  disabled={isPaying}
                  onClick={() => completeRideWithGateway(collectionPrompt)}
                >
                  Open Razorpay QR
                </button>
              </div>
            )}
            {collectionStatus ? (
              <p className="collection-status">{collectionStatus}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      {adminPaymentPrompt ? (
        <div className="collection-modal-backdrop" role="dialog" aria-modal="true">
          <div className="collection-modal admin-payment-modal">
            <button
              className="admin-close"
              type="button"
              onClick={() => setAdminPaymentPrompt(null)}
            >
              ×
            </button>
            <span className="collection-alert-label">Admin Payment Received</span>
            <h2>{adminPaymentPrompt.booking_id}</h2>
            <p>
              Select How Payment Was Received For {adminPaymentPrompt.customer_name}.
            </p>
            <div className="collection-meta-grid">
              <span>Total Fare With GST</span>
              <b>{formatInr(getInvoiceTotals(adminPaymentPrompt).total)}</b>
              <span>Already Paid</span>
              <b>{formatPaymentAmount(adminPaymentPrompt.payment_amount || 0)}</b>
              <span>Balance To Update</span>
              <b>
                {formatInr(
                  Math.max(
                    0,
                    getInvoiceTotals(adminPaymentPrompt).total -
                      Number(adminPaymentPrompt.payment_amount || 0),
                  ),
                )}
              </b>
            </div>
            <label className="admin-payment-field">
              <span>Payment Received By</span>
              <select
                value={adminPaymentSource}
                onChange={(event) =>
                  setAdminPaymentSource(event.target.value as "online" | "driver_cash")
                }
              >
                <option value="online">Online</option>
                <option value="driver_cash">Driver Cash</option>
              </select>
            </label>
            {adminPaymentSource === "driver_cash" ? (
              <label className="admin-payment-field">
                <span>Select Driver</span>
                <select
                  value={adminPaymentDriverMobile}
                  onChange={(event) => setAdminPaymentDriverMobile(event.target.value)}
                >
                  <option value="">Select Driver Who Received Cash</option>
                  {getUniqueDriverOptions().map((driver) => (
                    <option
                      key={`payment-driver-${driver.mobile}-${driver.vehicleNumber}`}
                      value={driver.mobile}
                    >
                      {driver.name} | {driver.mobile} | {driver.vehicle}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <div className="collection-actions">
              <button type="button" onClick={submitAdminPaymentReceived}>
                Confirm Payment Received
              </button>
              <button
                className="ghost-action"
                type="button"
                onClick={() => setAdminPaymentPrompt(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {adminRefundPrompt ? (
        <div className="collection-modal-backdrop" role="dialog" aria-modal="true">
          <div className="collection-modal admin-payment-modal">
            <button
              className="admin-close"
              type="button"
              onClick={() => setAdminRefundPrompt(null)}
            >
              ×
            </button>
            <span className="collection-alert-label refund-label">Refund Customer</span>
            <h2>{adminRefundPrompt.booking_id}</h2>
            <div className="collection-meta-grid">
              <span>Paid Amount</span>
              <b>{formatPaymentAmount(adminRefundPrompt.payment_amount || 0)}</b>
              <span>Already Refunded</span>
              <b>{formatPaymentAmount(adminRefundPrompt.refund_amount || 0)}</b>
              <span>Refundable Amount</span>
              <b>
                {formatPaymentAmount(
                  Math.max(
                    0,
                    Number(adminRefundPrompt.payment_amount || 0) -
                      Number(adminRefundPrompt.refund_amount || 0),
                  ),
                )}
              </b>
            </div>
            <label className="admin-payment-field">
              <span>Refund Type</span>
              <select
                value={adminRefundType}
                onChange={(event) => setAdminRefundType(event.target.value as "full" | "partial")}
              >
                <option value="full">Full Refund</option>
                <option value="partial">Partial Refund</option>
              </select>
            </label>
            {adminRefundType === "partial" ? (
              <>
                <label className="admin-payment-field">
                  <span>Partial Refund By</span>
                  <select
                    value={adminRefundMode}
                    onChange={(event) =>
                      setAdminRefundMode(event.target.value as "amount" | "percent")
                    }
                  >
                    <option value="amount">Manual Amount</option>
                    <option value="percent">Percentage</option>
                  </select>
                </label>
                <label className="admin-payment-field">
                  <span>{adminRefundMode === "percent" ? "Refund Percent" : "Refund Amount"}</span>
                  <input
                    value={adminRefundValue}
                    onChange={(event) => setAdminRefundValue(event.target.value)}
                    placeholder={adminRefundMode === "percent" ? "Enter Percent" : "Enter Amount"}
                    inputMode="numeric"
                  />
                </label>
              </>
            ) : null}
            <label className="admin-payment-field">
              <span>Refund Paid By</span>
              <select
                value={adminRefundSource}
                onChange={(event) =>
                  setAdminRefundSource(event.target.value as "online" | "driver_cash")
                }
              >
                <option value="online">Online / Admin</option>
                <option value="driver_cash">Driver Cash</option>
              </select>
            </label>
            {adminRefundSource === "driver_cash" ? (
              <label className="admin-payment-field">
                <span>Select Driver</span>
                <select
                  value={adminRefundDriverMobile}
                  onChange={(event) => setAdminRefundDriverMobile(event.target.value)}
                >
                  <option value="">Select Driver Who Paid Refund</option>
                  {getUniqueDriverOptions().map((driver) => (
                    <option
                      key={`refund-driver-${driver.mobile}-${driver.vehicleNumber}`}
                      value={driver.mobile}
                    >
                      {driver.name} | {driver.mobile} | {driver.vehicle}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <div className="collection-actions">
              <button type="button" onClick={submitAdminRefund}>
                Confirm Refund
              </button>
              <button
                className="ghost-action"
                type="button"
                onClick={() => setAdminRefundPrompt(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showLogin ? (
        <div className="admin-modal" role="dialog" aria-modal="true">
          <div className={`admin-card ${!portalRole ? "login-card" : ""}`}>
            <button
              className="admin-close"
              type="button"
              onClick={() => setShowLogin(false)}
            >
              ×
            </button>
	            {!portalRole ? (
                <>
                  <div className="portal-login-brand">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={siteBranding.iconUrl} alt="Vishnu Tours" />
                    <span>Secure Role Portal</span>
                  </div>
                  <h2>Vishnu Tours Login</h2>
                  <p>
                    Enter Mobile Number To Open Admin, Driver Or Customer Portal.
                  </p>
                  <div className="admin-login-row">
                    <input
                      value={loginMobile}
                      onChange={(event) => setLoginMobile(event.target.value)}
                      placeholder="Enter Mobile Number"
                      inputMode="tel"
                    />
                    <button type="button" onClick={loadDashboard}>
                      Sign In
                    </button>
                  </div>
                </>
              ) : null}
	            {portalStatus && portalRole !== "admin" ? <p className="admin-status">{portalStatus}</p> : null}
	            {portalRole && portalRole !== "admin" ? (
	              <div className="portal-role-chip">
	                {portalRole === "admin"
	                  ? "Admin Panel"
                  : portalRole === "driver"
                    ? "Driver Panel"
	                    : "Customer Panel"}
	              </div>
	            ) : null}
	            {portalRole === "admin" && dashboard ? (
	              <div className="admin-dashboard">
                {(() => {
                  const adminMetrics = getAdminFinanceMetrics(dashboard);
                  const metricCards: Array<{
                    id: AdminBreakupType;
                    label: string;
                    value: string;
                    className?: string;
                  }> = [
                    {
                      id: "bookings",
                      label: "Total No Of Booking",
                      value: String(dashboard.totalBookings),
                    },
                    {
                      id: "bookingAmount",
                      label: "Total Ride Amount",
                      value: formatInr(adminMetrics.totalBookingAmount),
                    },
                    {
                      id: "collected",
                      label: "Amount Collected",
                      value: formatInr(adminMetrics.totalCollected),
                      className: "collected-metric",
                    },
                    {
                      id: "online",
                      label: "Online",
                      value: formatInr(adminMetrics.onlineCollected),
                    },
                    {
                      id: "driverCash",
                      label: "Company Cash With Drivers",
                      value: formatInr(adminMetrics.driverCashInHand),
                      className: "cash-metric",
                    },
                  ];

	                  return (
	                    <>
                        <div className="admin-content-topbar">
                          <div className="portal-role-chip admin-top-role-chip">
                            Admin Panel
                          </div>
                          {portalStatus ? <p className="admin-status">{portalStatus}</p> : null}
                          <div className="admin-switch-panel">
                            <strong>Switch Dashboard</strong>
                            <select
                              value={adminLookupMobile}
                              onChange={(event) => selectAdminLookupDashboard(event.target.value)}
                            >
                              <option value="">Select Driver Or Customer Dashboard</option>
                              {getAdminLookupOptions(dashboard).map((option) => (
                                <option key={option.key} value={option.mobile}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
	                      {activeAdminTab !== "dashboard" ? metricCards.map((card) => (
	                        <button
                          className={`admin-metric metric-button ${
                            activeAdminBreakup === card.id ? "is-active" : ""
                          } ${card.className || ""}`}
                          key={card.id}
                          type="button"
                          onClick={() => {
                            setActiveAdminBreakup(card.id);
                            setActiveAdminTab("breakup");
                          }}
                        >
                          <span>{card.label}</span>
                          <strong>{card.value}</strong>
                        </button>
	                      )) : null}
                      <div className="admin-tabs">
                        {(() => {
                          const taskCounts = getAdminTaskCounts(dashboard);
                          const tabs: Array<{
                            id: AdminPanelTab;
                            label: string;
                            icon: ReactNode;
                            count: number;
                          }> = [
                            {
                              id: "dashboard",
                              label: "Dashboard",
                              icon: <HomeIcon />,
                              count: taskCounts.bookings,
                            },
                            {
                              id: "bookings",
                              label: "Bookings & Assignment",
                              icon: <CalendarDays />,
                              count: taskCounts.bookings,
                            },
                            {
                              id: "vehicles",
                              label: "Drivers & Vehicles",
                              icon: <Users />,
                              count: taskCounts.vehicles,
                            },
                            {
                              id: "myVehicle",
                              label: "My Fleet",
                              icon: <CarFront />,
                              count: fleetVehicles.length,
                            },
                            {
                              id: "ledger",
                              label: "Payments & Driver Cash",
                              icon: <Banknote />,
                              count: taskCounts.ledger,
                            },
                            {
                              id: "withdrawals",
                              label: "Withdrawal Requests",
                              icon: <WalletCards />,
                              count: taskCounts.withdrawalPending,
                            },
                            {
                              id: "breakup",
                              label: "Reports & Breakup",
                              icon: <BarChart3 />,
                              count: taskCounts.bookings,
                            },
                            {
                              id: "pricing",
                              label: "Price Control",
                              icon: <BadgePercent />,
                              count: Math.round(priceAdjustmentPercent),
                            },
                            {
                              id: "customization",
                              label: "Settings & Customization",
                              icon: <Settings />,
                              count: siteBranding.headerLogoSize,
                            },
                            {
                              id: "portalLookup",
                              label: "Driver & Customer Dashboards",
                              icon: <UserRound />,
                              count: adminLookupBookings.length,
                            },
                          ];

		                          return (
                              <>
                                <div className="admin-sidebar-brand">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={siteBranding.iconUrl} alt="Vishnu Tours" />
                                  <div><strong>Vishnu Tours</strong><span>Admin Console</span></div>
                                </div>
                                <div className="admin-sidebar-stat-group">
                                  <strong>Admin Workload</strong>
                                  <span>
                                    <b>{taskCounts.assignmentPending}</b>
                                    Driver Assign Pending
                                  </span>
                                  <span>
                                    <b>{taskCounts.paymentPending}</b>
                                    Payment Pending
                                  </span>
                                  <span>
                                    <b>{taskCounts.ridePending}</b>
                                    Ride Pending
                                  </span>
                                  <span>
                                    <b>{taskCounts.rideInProgress}</b>
                                    In Progress
                                  </span>
                                </div>
                                <div className="admin-sidebar-stat-group fleet-stat-group">
                                  <strong>Fleet Status</strong>
                                  <span>
                                    <b>{taskCounts.totalCarsWithDriver}</b>
                                    Total Cars With Driver
                                  </span>
                                  <span>
                                    <b>{taskCounts.vacantCars}</b>
                                    Vacant Cars
                                  </span>
                                  <span>
                                    <b>{taskCounts.vacantDrivers}</b>
                                    Vacant Drivers
                                  </span>
                                </div>
                                <div className="admin-sidebar-nav">
                                  {tabs.map((tab) => (
                                    <button
                                      className={activeAdminTab === tab.id ? "is-active" : ""}
                                      key={tab.id}
                                      type="button"
                                      onClick={() => setActiveAdminTab(tab.id)}
                                    >
                                      <i aria-hidden="true">{tab.icon}</i>
                                      <span>{tab.label}</span>
                                      <b>{tab.count}</b>
                                    </button>
                                  ))}
                                  <button
                                    className="admin-sidebar-logout"
                                    type="button"
                                    onClick={logoutPortal}
                                  >
                                    <i aria-hidden="true"><LogOut /></i>
                                    <span>Logout</span>
                                  </button>
                                </div>
                              </>
                            );
	                        })()}
	                      </div>
	                    </>
	                  );
                })()}
                {activeAdminTab === "dashboard" ? (() => {
                  const finance = getAdminFinanceMetrics(dashboard);
                  const completed = dashboard.recentBookings.filter((booking) =>
                    (booking.ride_status || "").toLowerCase().includes("complete"),
                  ).length;
                  const cancelled = dashboard.recentBookings.filter((booking) =>
                    (booking.ride_status || "").toLowerCase().includes("cancel"),
                  ).length;
                  const ongoing = dashboard.recentBookings.filter((booking) =>
                    (booking.ride_status || "").toLowerCase().includes("start"),
                  ).length;
                  const pending = Math.max(0, dashboard.totalBookings - completed - cancelled - ongoing);
                  const statusTotal = Math.max(1, completed + cancelled + ongoing + pending);
                  const completedPercent = Math.round((completed / statusTotal) * 100);
                  const ongoingPercent = Math.round((ongoing / statusTotal) * 100);
                  const cancelledPercent = Math.round((cancelled / statusTotal) * 100);
                  const uniqueCustomers = new Set(
                    dashboard.recentBookings.map((booking) => booking.customer_mobile).filter(Boolean),
                  ).size;
                  const revenueSeries = dashboard.recentBookings.slice(0, 10).reverse();
                  const revenueMaximum = Math.max(
                    1,
                    ...revenueSeries.map((booking) => getInvoiceTotals(booking).total),
                  );
                  const vehicleCounts = dashboard.recentBookings.reduce<Record<string, number>>(
                    (counts, booking) => {
                      counts[booking.vehicle] = (counts[booking.vehicle] || 0) + 1;
                      return counts;
                    },
                    {},
                  );
                  const topVehicles = Object.entries(vehicleCounts)
                    .sort((first, second) => second[1] - first[1])
                    .slice(0, 4);

                  return (
                    <div className="admin-overview admin-tab-panel">
                      <div className="admin-overview-title">
                        <div>
                          <span>Overview</span>
                          <h2>Dashboard</h2>
                        </div>
                        <button type="button" onClick={() => setActiveAdminTab("bookings")}>Manage Bookings</button>
                      </div>
                      <div className="admin-overview-kpis">
                        <article><span><ClipboardList /></span><div><small>Total Bookings</small><strong>{dashboard.totalBookings}</strong><em>Live booking records</em></div></article>
                        <article><span><Banknote /></span><div><small>Total Revenue</small><strong>{formatInr(finance.totalBookingAmount)}</strong><em>Final ride value</em></div></article>
                        <article><span><WalletCards /></span><div><small>Company Cash With Drivers</small><strong>{formatInr(finance.driverCashInHand)}</strong><em>Pending driver settlement</em></div></article>
                        <article><span><Users /></span><div><small>Total Drivers</small><strong>{drivers.length}</strong><em>{drivers.filter((driver) => driver.status === "Available").length} available</em></div></article>
                        <article><span><UserRound /></span><div><small>Total Customers</small><strong>{uniqueCustomers}</strong><em>Recent booking customers</em></div></article>
                      </div>
                      <div className="admin-analytics-grid">
                        <section className="admin-analytics-card admin-revenue-card">
                          <div className="admin-panel-heading"><div><span>Booking Analytics</span><h3>Revenue Overview</h3></div><b>Recent Rides</b></div>
                          <div className="admin-booking-chart" aria-label="Recent ride revenue chart">
                            {revenueSeries.length ? revenueSeries.map((booking) => (
                              <div key={`revenue-${booking.booking_id}`}>
                                <i style={{ height: `${Math.max(12, Math.round((getInvoiceTotals(booking).total / revenueMaximum) * 100))}%` }} />
                                <small>{booking.booking_id.replace("VTT", "")}</small>
                              </div>
                            )) : <p>No Booking Analytics Yet.</p>}
                          </div>
                        </section>
                        <section className="admin-analytics-card admin-status-card">
                          <div className="admin-panel-heading"><div><span>Live Operations</span><h3>Booking Status</h3></div></div>
                          <div className="admin-status-visual">
                            <div
                              className="admin-status-donut"
                              style={{
                                "--completed": `${completedPercent * 3.6}deg`,
                                "--ongoing": `${(completedPercent + ongoingPercent) * 3.6}deg`,
                                "--cancelled": `${(completedPercent + ongoingPercent + cancelledPercent) * 3.6}deg`,
                              } as CSSProperties}
                            >
                              <strong>{dashboard.totalBookings}</strong>
                              <span>Total</span>
                            </div>
                            <div className="admin-status-legend">
                              <span><i className="status-completed" />Completed <b>{completed}</b></span>
                              <span><i className="status-ongoing" />Ongoing <b>{ongoing}</b></span>
                              <span><i className="status-cancelled" />Cancelled <b>{cancelled}</b></span>
                              <span><i className="status-pending" />Pending <b>{pending}</b></span>
                            </div>
                          </div>
                        </section>
                        <section className="admin-analytics-card admin-recent-table-card">
                          <div className="admin-panel-heading"><div><span>Latest Activity</span><h3>Recent Bookings</h3></div><button type="button" onClick={() => setActiveAdminTab("bookings")}>View All</button></div>
                          <div className="admin-compact-bookings">
                            {dashboard.recentBookings.slice(0, 5).map((booking) => (
                              <button type="button" key={`overview-${booking.booking_id}`} onClick={() => setActiveAdminTab("bookings")}>
                                <span><b>{booking.booking_id}</b><small>{booking.customer_name}</small></span>
                                <span><b>{booking.destination}</b><small>{formatDisplayDateTime(booking.pickup_datetime)}</small></span>
                                <em className={(booking.ride_status || "").toLowerCase().includes("complete") ? "is-complete" : ""}>{booking.ride_status || "Booked"}</em>
                              </button>
                            ))}
                          </div>
                        </section>
                        <section className="admin-analytics-card admin-top-vehicles-card">
                          <div className="admin-panel-heading"><div><span>Fleet Performance</span><h3>Top Vehicles</h3></div><button type="button" onClick={() => setActiveAdminTab("myVehicle")}>View Fleet</button></div>
                          <div className="admin-top-vehicles">
                            {topVehicles.length ? topVehicles.map(([vehicleName, tripCount]) => {
                              const fleetVehicle = fleetVehicles.find((vehicle) => vehicle.name === vehicleName);
                              return (
                                <button type="button" key={`top-${vehicleName}`} onClick={() => setActiveAdminTab("myVehicle")}>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={fleetVehicle?.photo || "/fleet/innova-crysta.png"} alt={vehicleName} />
                                  <span><strong>{vehicleName}</strong><small>{tripCount} Trips</small></span>
                                  <CarFront />
                                </button>
                              );
                            }) : <p>No Vehicle Trip Data Yet.</p>}
                          </div>
                        </section>
                      </div>
                    </div>
                  );
                })() : null}
                {activeAdminTab === "breakup" ? renderAdminMetricBreakup(dashboard) : null}
	                {activeAdminTab === "bookings" ? (
	                  <div className="admin-recent admin-tab-panel">
	                    <h3>Booking Details And Operations</h3>
                      <div className="admin-booking-search">
                        <input
                          value={adminBookingSearch}
                          onChange={(event) => setAdminBookingSearch(event.target.value)}
                          placeholder="Search Booking No. Or Mobile No."
                          inputMode="search"
                        />
                      </div>
	                    {dashboard.recentBookings.filter((booking) => {
                        const query = adminBookingSearch.trim().toLowerCase();

                        if (!query) {
                          return true;
                        }

                        return (
                          booking.booking_id.toLowerCase().includes(query) ||
                          booking.customer_mobile.toLowerCase().includes(query) ||
                          (booking.driver_mobile || "").toLowerCase().includes(query)
                        );
                      }).length ? (
	                      dashboard.recentBookings.filter((booking) => {
                          const query = adminBookingSearch.trim().toLowerCase();

                          if (!query) {
                            return true;
                          }

                          return (
                            booking.booking_id.toLowerCase().includes(query) ||
                            booking.customer_mobile.toLowerCase().includes(query) ||
                            (booking.driver_mobile || "").toLowerCase().includes(query)
                          );
                        }).map((booking) =>
	                        renderPortalBookingCard(booking, true),
	                      )
	                    ) : (
	                      <p>No Booking Found.</p>
	                    )}
	                  </div>
	                ) : null}
                {activeAdminTab === "pricing" ? (
                  <div className="admin-ops-panel admin-tab-panel price-control-panel">
                    <div className="price-control-card">
                      <h3>Master Price Increase Or Decrease</h3>
                      <p>
                        This Percentage Applies To All Cars, Per KM, Local Package,
                        Per Day, Per Hour And VIP Package Fares.
                      </p>
                      <div className="price-control-form">
                        <label>
                          <span>Adjustment Percentage</span>
                          <input
                            value={priceAdjustmentInput}
                            onChange={(event) => setPriceAdjustmentInput(event.target.value)}
                            placeholder="Example 10 Or -10"
                            inputMode="decimal"
                          />
                        </label>
                        <button type="button" onClick={saveMasterPriceAdjustment}>
                          Save Master Price
                        </button>
                        <button
                          className="ghost-price-action"
                          type="button"
                          onClick={() => {
                            setPriceAdjustmentInput("0");
                            setPriceAdjustmentStatus("");
                          }}
                        >
                          Reset Input
                        </button>
                      </div>
                      <div className="price-adjustment-summary">
                        <span>Current Master Adjustment</span>
                        <strong
                          className={
                            priceAdjustmentPercent >= 0
                              ? "price-positive"
                              : "price-negative"
                          }
                        >
                          {priceAdjustmentPercent > 0 ? "+" : ""}
                          {priceAdjustmentPercent}%
                        </strong>
                      </div>
                      {priceAdjustmentStatus ? (
                        <p className="admin-status">{priceAdjustmentStatus}</p>
                      ) : null}
                    </div>
                    <div className="price-control-card individual-price-card">
                      <h3>Individual Car Fare</h3>
                      <p>
                        Select One Car And Update Its Fare Manually. Master Percentage
                        Will Apply On Top Of These Saved Car Rates.
                      </p>
                      <label className="individual-rate-select">
                        <span>Select Car</span>
                        <select
                          value={rateEditorVehicle}
                          onChange={(event) => {
                            const selectedCar = event.target.value;
                            setRateEditorVehicle(selectedCar);
                            setRateEditorForm(
                              buildEditableRateForm(
                                selectedCar,
                                vehicleRateOverrides,
                                activeRateTable,
                              ),
                            );
                          }}
                        >
                          {vehicles.map((item) => (
                            <option key={item.name} value={item.name}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <div className="individual-rate-grid">
                        {editableRateKeys.map((rateKey) => (
                          <label key={rateKey}>
                            <span>
                              {rateKey === "perKm"
                                ? "Per KM"
                                : rateKey === "local4hr"
                                  ? "4 Hr / 45 KM"
                                  : rateKey === "local8hr"
                                    ? "8 Hr / 90 KM"
                                    : rateKey === "local10hr"
                                      ? "10 Hr / 100 KM"
                                      : rateKey === "perHour"
                                        ? "Per Hour After Package"
                                      : rateKey === "fullDay"
                                        ? "Full Day"
                                        : rateKey === "halfDay"
                                          ? "Half Day"
                                          : "VIP"}
                            </span>
                            <input
                              value={rateEditorForm[rateKey]}
                              onChange={(event) =>
                                setRateEditorForm((currentForm) => ({
                                  ...currentForm,
                                  [rateKey]: event.target.value,
                                }))
                              }
                              inputMode="numeric"
                              placeholder="Amount"
                            />
                          </label>
                        ))}
                      </div>
                      <div className="price-control-form individual-rate-actions">
                        <button type="button" onClick={saveIndividualCarFare}>
                          Save Car Fare
                        </button>
                        <button
                          className="ghost-price-action"
                          type="button"
                          onClick={resetIndividualCarFareInput}
                        >
                          Reset Input
                        </button>
                      </div>
                    </div>
                    <div className="price-control-card site-font-card">
                      <h3>Site Font</h3>
                      <p>
                        Select One Font For The Complete Public Website, Booking Flow
                        And Footer.
                      </p>
                      <div className="price-control-form">
                        <label>
                          <span>Font Family</span>
                          <select
                            value={siteFont}
                            onChange={(event) => setSiteFont(event.target.value)}
                          >
                            {siteFontOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>
                        <button type="button" onClick={saveSiteFont}>
                          Save Site Font
                        </button>
                      </div>
                    </div>
                    <div className="price-preview-table">
                      <h3>Adjusted Fare Preview</h3>
                      {vehicles.map((item) => {
                        const defaultBase = activeRateTable[item.name];
                        const override = vehicleRateOverrides[item.name] || {};
                        if (!defaultBase) {
                          return null;
                        }
                        const base = {
                          ...defaultBase,
                          perKm: override.perKm ?? defaultBase.perKm,
                          local4hr: override.local4hr ?? defaultBase.local4hr,
                          local8hr: override.local8hr ?? defaultBase.local8hr,
                          local10hr: override.local10hr ?? defaultBase.local10hr,
                          perHour: override.perHour ?? defaultBase.perHour,
                          fullDay: override.fullDay ?? defaultBase.fullDay,
                          halfDay: override.halfDay ?? defaultBase.halfDay,
                          vip: override.vip ?? defaultBase.vip,
                        };
                        const adjusted = adjustedRateTable[item.name];

                        return (
                          <div className="price-preview-row" key={item.name}>
                            <strong>{item.name}</strong>
                            <span>KM {formatInr(base.perKm)} → {formatInr(adjusted.perKm)}</span>
                            <span>4 Hr / 45 KM {formatInr(base.local4hr)} → {formatInr(adjusted.local4hr)}</span>
                            <span>8 Hr / 90 KM {formatInr(base.local8hr)} → {formatInr(adjusted.local8hr)}</span>
                            <span>10 Hr / 100 KM {formatInr(base.local10hr)} → {formatInr(adjusted.local10hr)}</span>
                            <span>Per Hour {formatInr(base.perHour)} → {formatInr(adjusted.perHour)}</span>
                            <span>Full Day {formatInr(base.fullDay)} → {formatInr(adjusted.fullDay)}</span>
                            <span>VIP {formatInr(base.vip)} → {formatInr(adjusted.vip)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
                {activeAdminTab === "customization" ? (
                  <div className="admin-ops-panel admin-tab-panel customization-panel">
                    <div className="price-control-card customization-card">
                      <h3>Site Icon And Logo Size</h3>
                      <p>
                        Upload The Main Site Icon And Adjust Header, Footer And Browser
                        Tab Icon Size From One Place.
                      </p>
                      <div className="customization-preview">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={siteBranding.iconUrl} alt="Vishnu Tours site icon preview" />
                        <div>
                          <strong>Live Logo Preview</strong>
                          <span>Saved Icon Applies On Homepage, Footer And Browser Tab.</span>
                        </div>
                      </div>
                      <div className="customization-grid">
                        <label className="custom-upload-field">
                          <span>Upload Site Icon Image</span>
                          <input
                            accept="image/*"
                            onChange={handleSiteIconUpload}
                            type="file"
                          />
                        </label>
                        <label>
                          <span>Icon Image URL</span>
                          <input
                            value={siteBranding.iconUrl}
                            onChange={(event) =>
                              updateSiteBrandingField("iconUrl", event.target.value)
                            }
                            placeholder="/logo-icon.png"
                          />
                        </label>
                        <label>
                          <span>Header Logo Size: {siteBranding.headerLogoSize}px</span>
                          <input
                            min="38"
                            max="120"
                            value={siteBranding.headerLogoSize}
                            onChange={(event) =>
                              updateSiteBrandingField(
                                "headerLogoSize",
                                Number(event.target.value),
                              )
                            }
                            type="range"
                          />
                        </label>
                        <label>
                          <span>Footer Logo Size: {siteBranding.footerLogoSize}px</span>
                          <input
                            min="48"
                            max="180"
                            value={siteBranding.footerLogoSize}
                            onChange={(event) =>
                              updateSiteBrandingField(
                                "footerLogoSize",
                                Number(event.target.value),
                              )
                            }
                            type="range"
                          />
                        </label>
                        <label>
                          <span>Browser Tab Icon Size: {siteBranding.faviconSize}px</span>
                          <input
                            min="16"
                            max="96"
                            value={siteBranding.faviconSize}
                            onChange={(event) =>
                              updateSiteBrandingField(
                                "faviconSize",
                                Number(event.target.value),
                              )
                            }
                            type="range"
                          />
                        </label>
                      </div>
                      <div className="price-control-form individual-rate-actions">
                        <button
                          type="button"
                          disabled={isBrandingProcessing}
                          onClick={saveSiteBranding}
                        >
                          {isBrandingProcessing ? "Preparing Icon..." : "Save Customization"}
                        </button>
                        <button
                          className="ghost-price-action"
                          type="button"
                          onClick={() => {
                            setSiteBranding(defaultSiteBranding);
                            setBrandingStatus("");
                          }}
                        >
                          Reset To Default
                        </button>
                      </div>
                      {brandingStatus ? (
                        <p className="admin-status">{brandingStatus}</p>
                      ) : null}
                    </div>
                  </div>
                ) : null}
                {activeAdminTab === "myVehicle" ? (
                  <div className="admin-ops-panel admin-tab-panel my-vehicle-panel">
                    <div className="vehicle-master-card">
                      <div className="vehicle-master-head">
                        <div>
                          <h3>{editingVehicleName ? "Update Vehicle" : "Add New Vehicle"}</h3>
                          <p>
                            Add The Same Public Details, Photo And Fare Chart That Customers
                            See On Homepage, Cab Selection And Price Chart.
                          </p>
                        </div>
                        {editingVehicleName ? (
                          <button
                            className="ghost-price-action"
                            type="button"
                            onClick={() => {
                              setEditingVehicleName("");
                              setVehicleMasterForm(createVehicleForm());
                              setVehicleMasterStatus("");
                            }}
                          >
                            New Vehicle
                          </button>
                        ) : null}
                      </div>
                      <div className="vehicle-master-form">
                        <label>
                          <span>Vehicle Name</span>
                          <input
                            value={vehicleMasterForm.name}
                            onChange={(event) =>
                              setVehicleMasterForm((currentForm) => ({
                                ...currentForm,
                                name: event.target.value,
                              }))
                            }
                            placeholder="Example Toyota Fortuner"
                          />
                        </label>
                        <label>
                          <span>Vehicle Category</span>
                          <input
                            value={vehicleMasterForm.type}
                            onChange={(event) =>
                              setVehicleMasterForm((currentForm) => ({
                                ...currentForm,
                                type: event.target.value,
                              }))
                            }
                            placeholder="Premium SUV"
                          />
                        </label>
                        <label>
                          <span>Passenger Seats</span>
                          <input
                            value={vehicleMasterForm.seats}
                            onChange={(event) =>
                              setVehicleMasterForm((currentForm) => ({
                                ...currentForm,
                                seats: event.target.value,
                              }))
                            }
                            placeholder="6-7 Seats"
                          />
                        </label>
                        <label>
                          <span>Luggage</span>
                          <input
                            value={vehicleMasterForm.luggage}
                            onChange={(event) =>
                              setVehicleMasterForm((currentForm) => ({
                                ...currentForm,
                                luggage: event.target.value,
                              }))
                            }
                            placeholder="2 Suitcases"
                          />
                        </label>
                        <label className="wide-field">
                          <span>Best For Public Text</span>
                          <input
                            value={vehicleMasterForm.bestFor}
                            onChange={(event) =>
                              setVehicleMasterForm((currentForm) => ({
                                ...currentForm,
                                bestFor: event.target.value,
                              }))
                            }
                            placeholder="VIP Guests, Airport And Long Route Travel"
                          />
                        </label>
                        <label className="wide-field">
                          <span>Vehicle Photo URL</span>
                          <input
                            value={vehicleMasterForm.photo}
                            onChange={(event) =>
                              setVehicleMasterForm((currentForm) => ({
                                ...currentForm,
                                photo: event.target.value,
                              }))
                            }
                            placeholder="/fleet/innova-crysta.png?v=52a12bf"
                          />
                        </label>
                        <label className="vehicle-photo-upload">
                          <span>Upload Vehicle Photo</span>
                          <input
                            accept="image/*"
                            onChange={handleVehiclePhotoUpload}
                            type="file"
                          />
                        </label>
                        <div className="vehicle-photo-preview">
                          {vehicleMasterForm.photo ? (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={vehicleMasterForm.photo}
                                alt="Selected vehicle preview"
                              />
                              <span>Photo Preview</span>
                            </>
                          ) : (
                            <span>No Photo Selected</span>
                          )}
                        </div>
                        <label className="vehicle-active-toggle">
                          <input
                            checked={vehicleMasterForm.active}
                            onChange={(event) =>
                              setVehicleMasterForm((currentForm) => ({
                                ...currentForm,
                                active: event.target.checked,
                              }))
                            }
                            type="checkbox"
                          />
                          <span>Show This Vehicle On Public Site</span>
                        </label>
                      </div>
                      <div className="vehicle-master-rate-grid">
                        {editableRateKeys.map((rateKey) => (
                          <label key={`vehicle-master-${rateKey}`}>
                            <span>
                              {rateKey === "perKm"
                                ? "Per KM"
                                : rateKey === "local4hr"
                                  ? "4 Hr / 45 KM"
                                  : rateKey === "local8hr"
                                    ? "8 Hr / 90 KM"
                                    : rateKey === "local10hr"
                                      ? "10 Hr / 100 KM"
                                      : rateKey === "perHour"
                                        ? "Per Hour After Package"
                                      : rateKey === "fullDay"
                                        ? "Full Day"
                                        : rateKey === "halfDay"
                                          ? "Half Day"
                                          : "VIP"}
                            </span>
                            <input
                              value={vehicleMasterForm[rateKey]}
                              onChange={(event) =>
                                setVehicleMasterForm((currentForm) => ({
                                  ...currentForm,
                                  [rateKey]: event.target.value,
                                }))
                              }
                              inputMode="numeric"
                              placeholder="Amount"
                            />
                          </label>
                        ))}
                      </div>
                      <div className="vehicle-master-actions">
                        <button type="button" onClick={saveVehicleMaster}>
                          {editingVehicleName ? "Save Vehicle Update" : "Add Vehicle To Site"}
                        </button>
                        <button
                          className="ghost-price-action"
                          type="button"
                          onClick={() => setVehicleMasterForm(createVehicleForm())}
                        >
                          Clear Form
                        </button>
                      </div>
                      {vehicleMasterStatus ? (
                        <p className="admin-status">{vehicleMasterStatus}</p>
                      ) : null}
                    </div>
                    <div className="vehicle-master-list-card">
                      <h3>My Vehicle List</h3>
                      <div className="vehicle-master-list">
                        {fleetVehicles.map((item) => (
                          <article className="vehicle-master-row" key={item.name}>
                            <div className="vehicle-master-thumb">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={item.photo} alt={`${item.name} vehicle`} />
                            </div>
                            <div>
                              <strong>{item.name}</strong>
                              <span>{item.type} | {item.seats} | {item.luggage}</span>
                              <small>
                                {formatInr(item.rates.perKm)} / KM |{" "}
                                {formatInr(item.rates.local8hr)} 8 Hr / 90 KM
                                {" | "}{formatInr(item.rates.perHour)} / Extra Hour
                              </small>
                              <b className={item.active ? "vehicle-vacant" : "vehicle-engaged"}>
                                {item.active ? "Public Active" : "Hidden"}
                              </b>
                            </div>
                            <div className="driver-vehicle-actions">
                              <button type="button" onClick={() => editVehicleMaster(item)}>
                                Edit
                              </button>
                              <button
                                className="danger-action"
                                type="button"
                                onClick={() => deleteVehicleMaster(item.name)}
                              >
                                Delete
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
                {activeAdminTab === "vehicles" ? (
                  <div className="admin-ops-panel admin-tab-panel vehicle-admin-panel">
	                    <div>
	                      <h3>Admin Driver And Vehicle Registration</h3>
                        {editingVehicleNumber ? (
                          <p className="edit-mode-note">
                            Editing Vehicle {editingVehicleNumber}
                          </p>
                        ) : null}
	                      <div className="driver-form">
                        <input
                          value={driverForm.name}
                          onChange={(event) =>
                            setDriverForm((currentForm) => ({
                              ...currentForm,
                              name: event.target.value,
                            }))
                          }
                          placeholder="Driver Name"
                        />
                        <input
                          value={driverForm.mobile}
                          onChange={(event) =>
                            setDriverForm((currentForm) => ({
                              ...currentForm,
                              mobile: event.target.value,
                            }))
                          }
                          placeholder="Driver Mobile"
                        />
                        <input
                          value={driverForm.vehicleNumber}
                          onChange={(event) =>
                            setDriverForm((currentForm) => ({
                              ...currentForm,
                              vehicleNumber: event.target.value,
                            }))
                          }
                          placeholder="Vehicle Number"
                        />
                        <select
                          value={driverForm.vehicle}
                          onChange={(event) =>
                            setDriverForm((currentForm) => ({
                              ...currentForm,
                              vehicle: event.target.value,
                            }))
                          }
                        >
                          {vehicles.map((item) => (
                            <option key={item.name} value={item.name}>
                              {item.name}
                            </option>
                          ))}
                        </select>
	                        <details className="onboarding-details">
                            <summary>Driver, Owner And Compliance Details</summary>
                            <div className="onboarding-details-grid">
                              <input value={driverForm.email || ""} onChange={(event) => setDriverForm((form) => ({ ...form, email: event.target.value }))} placeholder="Email (Optional)" type="email" />
                              <input value={driverForm.address || ""} onChange={(event) => setDriverForm((form) => ({ ...form, address: event.target.value }))} placeholder="Address (Optional)" />
                              <input value={driverForm.emergencyContact || ""} onChange={(event) => setDriverForm((form) => ({ ...form, emergencyContact: event.target.value }))} placeholder="Emergency Contact" inputMode="tel" />
                              <input value={driverForm.drivingLicense || ""} onChange={(event) => setDriverForm((form) => ({ ...form, drivingLicense: event.target.value }))} placeholder="Driving Licence Number" />
                              <label><span>Licence Expiry</span><input value={driverForm.licenseExpiry || ""} onChange={(event) => setDriverForm((form) => ({ ...form, licenseExpiry: event.target.value }))} type="date" /></label>
                              <input value={driverForm.identityDocument || ""} onChange={(event) => setDriverForm((form) => ({ ...form, identityDocument: event.target.value }))} placeholder="Identity Document Reference" />
                              <input value={driverForm.addressProof || ""} onChange={(event) => setDriverForm((form) => ({ ...form, addressProof: event.target.value }))} placeholder="Address Proof Reference" />
                              <input value={driverForm.policeVerification || ""} onChange={(event) => setDriverForm((form) => ({ ...form, policeVerification: event.target.value }))} placeholder="Police Verification Reference" />
                              <select value={driverForm.accountType || "Driver-Cum-Owner"} onChange={(event) => setDriverForm((form) => ({ ...form, accountType: event.target.value }))}>
                                <option value="Driver">Driver</option>
                                <option value="Driver-Cum-Owner">Driver-Cum-Owner</option>
                              </select>
                              <select value={driverForm.approvalStatus || "Approved"} onChange={(event) => setDriverForm((form) => ({ ...form, approvalStatus: event.target.value }))}>
                                <option value="Approved">Approved</option>
                                <option value="Pending">Pending Approval</option>
                                <option value="Rejected">Rejected</option>
                              </select>
                              <select value={driverForm.activeStatus || "Active"} onChange={(event) => setDriverForm((form) => ({ ...form, activeStatus: event.target.value }))}>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                              </select>
                              <label><span>Joining Date</span><input value={driverForm.joiningDate || ""} onChange={(event) => setDriverForm((form) => ({ ...form, joiningDate: event.target.value }))} type="date" /></label>
                              <input value={driverForm.ownerMobile || ""} onChange={(event) => setDriverForm((form) => ({ ...form, ownerMobile: event.target.value }))} placeholder="Vehicle Owner Mobile" inputMode="tel" />
                              <input value={driverForm.seatingCapacity || ""} onChange={(event) => setDriverForm((form) => ({ ...form, seatingCapacity: event.target.value }))} placeholder="Seating Capacity" />
                              <select value={driverForm.fuelType || ""} onChange={(event) => setDriverForm((form) => ({ ...form, fuelType: event.target.value }))}>
                                <option value="">Select Fuel Type</option>
                                <option value="Diesel">Diesel</option>
                                <option value="Petrol">Petrol</option>
                                <option value="Hybrid">Hybrid</option>
                                <option value="CNG">CNG</option>
                                <option value="EV">EV</option>
                              </select>
                              <input value={driverForm.registrationCertificate || ""} onChange={(event) => setDriverForm((form) => ({ ...form, registrationCertificate: event.target.value }))} placeholder="RC Reference" />
                              <input value={driverForm.insurance || ""} onChange={(event) => setDriverForm((form) => ({ ...form, insurance: event.target.value }))} placeholder="Insurance Reference" />
                              <label><span>Insurance Expiry</span><input value={driverForm.insuranceExpiry || ""} onChange={(event) => setDriverForm((form) => ({ ...form, insuranceExpiry: event.target.value }))} type="date" /></label>
                              <input value={driverForm.permit || ""} onChange={(event) => setDriverForm((form) => ({ ...form, permit: event.target.value }))} placeholder="Permit Reference" />
                              <input value={driverForm.fitnessCertificate || ""} onChange={(event) => setDriverForm((form) => ({ ...form, fitnessCertificate: event.target.value }))} placeholder="Fitness Certificate" />
                              <input value={driverForm.puc || ""} onChange={(event) => setDriverForm((form) => ({ ...form, puc: event.target.value }))} placeholder="PUC Reference" />
                              <input value={driverForm.vehiclePhoto || ""} onChange={(event) => setDriverForm((form) => ({ ...form, vehiclePhoto: event.target.value }))} placeholder="Vehicle Photo URL" type="url" />
                            </div>
                          </details>
	                        <button type="button" onClick={onboardDriver}>
	                          {editingVehicleNumber ? "Update Driver Vehicle" : "Register Driver Vehicle"}
	                        </button>
                          {editingVehicleNumber ? (
                            <button
                              className="ghost-admin-action"
                              type="button"
                              onClick={() => {
                                setEditingVehicleNumber("");
                                setDriverForm({
                                  name: "",
                                  mobile: "",
                                  vehicle: "Toyota Innova Crysta",
                                  vehicleNumber: "",
                                });
                                setPortalStatus("");
                              }}
                            >
                              Cancel Edit
                            </button>
                          ) : null}
	                      </div>
	                    </div>
		                    <div>
		                      <h3>Registered Driver Vehicles</h3>
		                      <div className="registered-vehicle-table-wrap">
                          <table className="registered-vehicle-table">
                            <thead>
                              <tr>
                                <th>Date</th>
                                <th>Driver Name</th>
                                <th>Vehicle Name</th>
                                <th>Vehicle Number</th>
                                <th>Mobile</th>
                                <th>Completed Rides</th>
                                <th>Driver / Owner</th>
                                <th>Status</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
	                        {drivers.map((driver) => {
	                          const isEngaged = isStartedRideVehicle(
	                            driver.vehicleNumber,
	                            dashboard.recentBookings,
	                          );
                            const completedRideCount = getDriverVehicleCompletedRideCount(driver);
	
	                          return (
	                            <tr
	                              key={`${driver.name}-${driver.mobile}-${driver.vehicleNumber}`}
	                            >
                                <td>
                                  {driver.updatedAt
                                    ? formatDisplayDate(driver.updatedAt.slice(0, 10))
                                    : "Not Available"}
                                </td>
                                <td>{driver.name}</td>
                                <td>{driver.vehicle}</td>
                                <td>{driver.vehicleNumber || "Vehicle No. Pending"}</td>
                                <td>{driver.mobile}</td>
                                <td>{completedRideCount}</td>
                                <td>Driver / Owner</td>
                                <td>
		                              <b className={isEngaged ? "vehicle-engaged" : "vehicle-vacant"}>
		                                {isEngaged ? "Engaged" : "Vacant"}
		                              </b>
                                </td>
                                <td>
	                                <div className="driver-vehicle-actions">
	                                  <button
	                                    type="button"
	                                    onClick={() => {
                                      setEditingVehicleNumber(driver.vehicleNumber);
                                      setDriverForm({
                                        name: driver.name,
                                        mobile: driver.mobile,
                                        vehicle: driver.vehicle || "Toyota Innova Crysta",
                                        vehicleNumber: driver.vehicleNumber,
                                        email: driver.email,
                                        address: driver.address,
                                        emergencyContact: driver.emergencyContact,
                                        drivingLicense: driver.drivingLicense,
                                        licenseExpiry: driver.licenseExpiry,
                                        accountType: driver.accountType || "Driver-Cum-Owner",
                                        approvalStatus: driver.approvalStatus || "Approved",
                                        activeStatus: driver.activeStatus || "Active",
                                        joiningDate: driver.joiningDate,
                                        ownerMobile: driver.ownerMobile,
                                        seatingCapacity: driver.seatingCapacity,
                                        fuelType: driver.fuelType,
                                        insuranceExpiry: driver.insuranceExpiry,
                                      });
                                      setPortalStatus("Edit Driver Vehicle Details And Click Update.");
                                    }}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="danger-action"
                                    type="button"
                                    onClick={() => deleteDriverVehicle(driver)}
                                  >
	                                    Delete
	                                  </button>
	                                </div>
                                </td>
		                            </tr>
	                          );
	                        })}
                            </tbody>
                          </table>
	                      </div>
	                    </div>
                  </div>
                ) : null}
                {activeAdminTab === "ledger" ? (
                  <div className="admin-ops-panel ledger-panel admin-tab-panel">
                    <div>
                      <h3>Driver Cash Collection</h3>
                      <div className="driver-list">
                        {dashboard.driverCashSummary.length ? (
                          dashboard.driverCashSummary.map((driver) => (
                            <div
                              className="driver-cash-row"
                              key={`${driver.driver_mobile}-${driver.cash_amount}`}
                            >
                              <span>
                                {driver.driver_name || "Driver"} | {driver.driver_mobile} |{" "}
                                Collected {formatInr(Number(driver.cash_collected || 0))} |{" "}
                                Refunded {formatInr(Number(driver.cash_refunded || 0))} |{" "}
                                Sent To Admin {formatInr(Number(driver.cash_sent_to_admin || 0))} |{" "}
                                Kept Against Earning {formatInr(Number(driver.cash_adjusted_to_earning || 0))} |{" "}
                                Company Cash With Driver{" "}
                                <strong className="cash-in-hand-amount">
                                  {formatInr(Number(driver.cash_amount || 0))}
                                </strong>{" "}
                                |{" "}
                                {driver.cash_rides} Ride
                              </span>
                              <button
                                type="button"
                                disabled={Number(driver.cash_amount || 0) < 1}
                                onClick={() => recordDriverCashDeposit(driver)}
                              >
                                Receive Cash
                              </button>
                            </div>
                          ))
                        ) : (
                          <span>No Driver Cash Collection Yet.</span>
                        )}
                      </div>
                      <h3>Cash Collection History</h3>
                      <div className="cash-history-table-wrap">
                        <table className="cash-history-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Driver</th>
                              <th>Vehicle</th>
                              <th>Booking</th>
                              <th>Mode</th>
                              <th>Settlement</th>
                              <th>Amount</th>
                              <th>Receipt</th>
                              <th>Remarks</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dashboard.cashCollectionHistory.length ? (
                              dashboard.cashCollectionHistory.map((entry) => (
                                <tr key={`cash-history-${entry.id}`}>
                                  <td>{formatDisplayDateTime(entry.created_at)}</td>
                                  <td>{entry.driver_name} · {entry.driver_mobile}</td>
                                  <td>{entry.vehicle_number || "Not Linked"}</td>
                                  <td>{entry.booking_id || "General Settlement"}</td>
                                  <td>{entry.payment_mode}</td>
                                  <td><span className={`settlement-status settlement-${entry.settlement_status.toLowerCase()}`}>{entry.settlement_status}</span></td>
                                  <td className="ledger-collected-amount">{formatInr(entry.amount)}</td>
                                  <td>{entry.receipt_reference}</td>
                                  <td>{entry.remarks || "Cash Handover"}</td>
                                  <td className="cash-settlement-actions">
                                    {entry.settlement_type === "admin_transfer" && entry.settlement_status === "Pending" ? (<>
                                      <button type="button" onClick={() => updateCashSettlement(entry.id, "Completed")}>Approve</button>
                                      <button className="danger-action" type="button" onClick={() => updateCashSettlement(entry.id, "Rejected")}>Reject</button>
                                    </>) : <span>Recorded</span>}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr><td colSpan={10}>No Cash Collection History Yet.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div>
                      <h3>Driver Ledger</h3>
                      {renderDriverLedger(dashboard.driverLedger)}
                    </div>
                  </div>
                ) : null}
                {activeAdminTab === "withdrawals" ? (
                  <div className="admin-ops-panel ledger-panel admin-tab-panel">
                    <div>
                      <h3>Cash Withdrawal Requests</h3>
                      {renderWithdrawalList(dashboard.withdrawalRequests, true)}
                    </div>
                  </div>
                ) : null}
                {activeAdminTab === "portalLookup" ? (
                  <div className="admin-ops-panel ledger-panel admin-tab-panel">
                    <div>
                      <h3>Open Driver Or Customer Dashboard</h3>
                      <select
                        className="admin-dashboard-select"
                        value={adminLookupMobile}
                        onChange={(event) => selectAdminLookupDashboard(event.target.value)}
                      >
                        <option value="">Select Driver Or Customer Dashboard</option>
                        {getAdminLookupOptions(dashboard).map((option) => (
                          <option key={`tab-${option.key}`} value={option.mobile}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {adminLookupStatus ? (
                        <p className="admin-status">{adminLookupStatus}</p>
                      ) : null}
                      {adminLookupRole ? (
                        <div className="portal-role-chip lookup-role-chip">
                          {adminLookupRole === "driver"
                            ? "Driver Dashboard View"
                            : "Customer Dashboard View"}
                        </div>
                      ) : null}
                      {adminLookupRole === "driver" ? (
                        <>
                          <div className="driver-earning-panel">
                            <div>
                              <span>Total Earning</span>
                              <strong>{formatInr(adminLookupDriverEarning.totalEarning)}</strong>
                            </div>
                            <div>
                              <span>Completed Rides</span>
                              <strong>{adminLookupDriverEarning.completedRides}</strong>
                            </div>
                            <div>
                              <span>Cash In Hand</span>
                              <strong>{formatInr(adminLookupDriverEarning.cashInHand)}</strong>
                            </div>
                          </div>
                          {adminLookupNextRide ? (
                            <div className="next-ride-panel">
                              <span>Next Ride</span>
                              <strong>
                                {adminLookupNextRide.booking_id} |{" "}
                                {formatDisplayDateTime(adminLookupNextRide.pickup_datetime)}
                              </strong>
                              <p>
                                {adminLookupNextRide.start_point} To{" "}
                                {adminLookupNextRide.destination} |{" "}
                                {adminLookupNextRide.vehicle}
                              </p>
                            </div>
                          ) : null}
                          <h3>Registered Vehicles</h3>
                          <div className="driver-list">
                            {adminLookupDriverVehicles.length ? (
                              adminLookupDriverVehicles.map((driverVehicle) => (
                                <span
                                  key={`lookup-${driverVehicle.driver_mobile}-${driverVehicle.vehicle_number}`}
                                >
                                  Owner {driverVehicle.driver_name} |{" "}
                                  {driverVehicle.vehicle_type} |{" "}
                                  {driverVehicle.vehicle_number}
                                </span>
                              ))
                            ) : (
                              <span>No Registered Vehicle Found.</span>
                            )}
                          </div>
                          <h3>Driver Ledger</h3>
                          {renderDriverLedger(adminLookupDriverLedger)}
                          <h3>Withdrawal Requests</h3>
                          {renderWithdrawalList(adminLookupWithdrawals, false)}
                        </>
                      ) : null}
                      {adminLookupRole ? (
                        <div className="admin-recent lookup-booking-list">
                          <h3>
                            {adminLookupRole === "driver"
                              ? "Available And Assigned Rides"
                              : "Customer Bookings"}
                          </h3>
                          {adminLookupBookings.length ? (
                            adminLookupBookings.map((booking) =>
                              renderPortalBookingCard(booking, false),
                            )
                          ) : (
                            <p>No Bookings Found.</p>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
            {portalRole && portalRole !== "admin" ? renderRolePortalDashboard() : null}
            {false ? (
              <div
                className={`admin-dashboard portal-dashboard ${
                  portalRole === "driver"
                    ? "driver-portal-dashboard"
                    : "customer-portal-dashboard"
                }`}
              >
                {portalRole === "driver" ? (
                  <>
                  <div className="driver-earning-panel">
                    <div>
                      <span>Total Earning</span>
                      <strong>{formatInr(driverEarning.totalEarning)}</strong>
                    </div>
                    <div>
                      <span>Completed Rides</span>
                      <strong>{driverEarning.completedRides}</strong>
                    </div>
                    <div>
                      <span>Cash In Hand</span>
                      <strong>{formatInr(driverEarning.cashInHand)}</strong>
                    </div>
                  </div>
                  <div className="admin-ops-panel ledger-panel">
                    <div>
                      <h3>Cash Withdrawal Request</h3>
                      <div className="withdrawal-limit-box">
                        <span>Maximum Withdrawal After Cash Adjustment</span>
                        <strong>{formatInr(maxWithdrawalAmount)}</strong>
                        <button
                          type="button"
                          disabled={maxWithdrawalAmount < 1}
                          onClick={() =>
                            setWithdrawalForm((currentForm) => ({
                              ...currentForm,
                              amount: String(maxWithdrawalAmount),
                            }))
                          }
                        >
                          Use Max
                        </button>
                      </div>
                      <div className="driver-form withdrawal-form">
                        <input
                          value={withdrawalForm.amount}
                          onChange={(event) =>
                            setWithdrawalForm((currentForm) => ({
                              ...currentForm,
                              amount: event.target.value,
                            }))
                          }
                          placeholder="Amount"
                          inputMode="numeric"
                        />
                        <input
                          value={withdrawalForm.bankName}
                          onChange={(event) =>
                            setWithdrawalForm((currentForm) => ({
                              ...currentForm,
                              bankName: event.target.value,
                            }))
                          }
                          placeholder="Bank Name"
                        />
                        <input
                          value={withdrawalForm.bankAccount}
                          onChange={(event) =>
                            setWithdrawalForm((currentForm) => ({
                              ...currentForm,
                              bankAccount: event.target.value,
                            }))
                          }
                          placeholder="Account Number"
                        />
                        <input
                          value={withdrawalForm.bankIfsc}
                          onChange={(event) =>
                            setWithdrawalForm((currentForm) => ({
                              ...currentForm,
                              bankIfsc: event.target.value,
                            }))
                          }
                          placeholder="IFSC Code"
                        />
                        <button type="button" onClick={requestCashWithdrawal}>
                          Request Withdrawal
                        </button>
                      </div>
                      {renderWithdrawalList(withdrawalRequests, false)}
                    </div>
                  </div>
                  <div className="admin-ops-panel ledger-panel">
                    <div>
                      <h3>My Driver Ledger</h3>
                      {renderDriverLedger(driverLedger)}
                    </div>
                  </div>
                  {nextRide ? (
                    <div className="next-ride-panel">
                      <span>Next Ride</span>
                      <strong>
                        {nextRide.booking_id} |{" "}
                        {formatDisplayDateTime(nextRide.pickup_datetime)}
                      </strong>
                      <p>
                        {nextRide.start_point} To {nextRide.destination} |{" "}
                        {nextRide.vehicle} | {nextRide.vehicle_number || "Vehicle Pending"}
                      </p>
                    </div>
                  ) : null}
                  <div className="admin-ops-panel driver-profile-panel">
                    <div>
                      <h3>Driver Profile</h3>
                      {driverProfileForm.name && driverProfileForm.vehicleNumber ? (
                        <div className="driver-profile-summary">
                          <strong>{driverProfileForm.name}</strong>
                          <span>Mobile: {driverProfileForm.mobile}</span>
                          <span>Primary Vehicle: {driverProfileForm.vehicle}</span>
                          <span>Primary Vehicle No: {driverProfileForm.vehicleNumber}</span>
                        </div>
                      ) : (
                        <p className="driver-profile-note">
                          Admin Must Register This Driver Before Rides Can Be Accepted.
                        </p>
                      )}
                      <div className="driver-list">
                        {driverVehicles.length ? (
                          driverVehicles.map((driverVehicle) => {
                            const isEngaged = isStartedRideVehicle(
                              driverVehicle.vehicle_number,
                              portalBookings,
                            );

                            return (
                              <div
                                className="driver-vehicle-row"
                                key={`${driverVehicle.driver_mobile}-${driverVehicle.vehicle_number}`}
                              >
                                <span>
                                  Owner {driverVehicle.driver_name} |{" "}
                                  {driverVehicle.vehicle_type} |{" "}
                                  {driverVehicle.vehicle_number}
                                </span>
                                <b className={isEngaged ? "vehicle-engaged" : "vehicle-vacant"}>
                                  {isEngaged ? "Engaged" : "Vacant"}
                                </b>
                              </div>
                            );
                          })
                        ) : (
                          <span>No Registered Vehicle Found For This Driver.</span>
                        )}
                      </div>
                    </div>
                  </div>
                  </>
                ) : null}
                <div className="admin-recent">
                  <h3>
                    {portalRole === "driver" ? "Available And Assigned Rides" : "Your Bookings"}
                  </h3>
                  {portalBookings.length ? (
                    portalBookings.map((booking) =>
                      renderPortalBookingCard(booking, false),
                    )
                  ) : (
                    <p>No Bookings Found.</p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {showCustomerLogin ? (
        <div className="admin-modal" role="dialog" aria-modal="true">
          <div className="admin-card customer-card">
            <button
              className="admin-close"
              type="button"
              onClick={() => setShowCustomerLogin(false)}
            >
              ×
            </button>
            <h2>Customer Booking Portal</h2>
            <p>Enter Booking Number And Mobile Number To View Ride Details.</p>
            <div className="admin-login-row">
              <input
                value={customerLookup.bookingId}
                onChange={(event) =>
                  setCustomerLookup((currentLookup) => ({
                    ...currentLookup,
                    bookingId: event.target.value,
                  }))
                }
                placeholder="Booking Number"
              />
              <input
                value={customerLookup.mobile}
                onChange={(event) =>
                  setCustomerLookup((currentLookup) => ({
                    ...currentLookup,
                    mobile: event.target.value,
                  }))
                }
                placeholder="Mobile Number"
              />
              <button type="button" onClick={loadCustomerBooking}>
                View Booking
              </button>
            </div>
            {customerStatus ? (
              <p className="admin-status">{customerStatus}</p>
            ) : null}
            {customerBooking ? (
              <article className="customer-booking-ticket">
                <div className="booking-row-head">
                  <strong>{customerBooking.booking_id}</strong>
                  <span>{customerBooking.ride_status || "Booked"}</span>
                </div>
                <div className="booking-detail-grid">
                  <small>Customer</small>
                  <b>
                    {customerBooking.customer_name} |{" "}
                    {customerBooking.customer_mobile}
                  </b>
                  <small>Route</small>
                  <b>
                    {customerBooking.start_point} To{" "}
                    {customerBooking.destination}
                  </b>
                  <small>Cab</small>
                  <b>{customerBooking.vehicle}</b>
                  <small>Booking Date And Time</small>
                  <b>{formatDisplayDateTime(customerBooking.created_at)}</b>
                  <small>Pickup Date And Time</small>
                  <b>
                    {formatDisplayDateTime(
                      customerBooking.pickup_datetime || customerBooking.created_at,
                    )}
                  </b>
                  {customerBooking.ride_completed_at ? (
                    <>
                      <small>Drop Date And Time</small>
                      <b>{formatDisplayDateTime(customerBooking.ride_completed_at)}</b>
                    </>
                  ) : null}
                  {customerBooking.return_date && !customerBooking.ride_completed_at ? (
                    <>
                      <small>Planned Drop Date</small>
                      <b>{formatDisplayDate(customerBooking.return_date)}</b>
                    </>
                  ) : null}
                  <small>Fare</small>
                  <b>{formatInr(customerBooking.estimated_fare)}</b>
                  <small>Payment</small>
                  <b>
                    {customerBooking.payment_status || "Pending"} |{" "}
                    {formatInr(customerBooking.payment_amount || 0)}
                  </b>
	              <small>Driver</small>
	              <b>
	                {customerBooking.driver_name
	                  ? `${customerBooking.driver_name} | ${customerBooking.driver_mobile}`
	                  : "Will Assign Soon"}
	              </b>
	              <small>Vehicle No.</small>
	              <b>{customerBooking.vehicle_number || "Will Assign Soon"}</b>
                  <small>Refund</small>
                  <b>
                    {customerBooking.refund_status || "None"}
                    {customerBooking.refund_amount
                      ? ` | ${formatInr(customerBooking.refund_amount)}`
                      : ""}
                    {customerBooking.refund_driver_name
                      ? ` | By ${customerBooking.refund_driver_name}`
                      : customerBooking.refund_collection_mode === "refund_online"
                        ? " | Online/Admin"
                        : ""}
                  </b>
                  <small>Cancel Reason</small>
                  <b>{customerBooking.cancel_reason || "None"}</b>
                </div>
              </article>
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}
