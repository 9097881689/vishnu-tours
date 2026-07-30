"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const whatsappNumber = "917004291529";
const headOffice = "Mumbai, Maharashtra";
const perKmRate = 16;
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
    fullDay: 3492,
    halfDay: 1921,
    vip: 4680,
    tag: "Economy",
  },
  "Maruti Ertiga": {
    perKm: 29,
    local4hr: 2324,
    local8hr: 4226,
    fullDay: 4226,
    halfDay: 2324,
    vip: 5580,
    tag: "Family",
  },
  "Toyota Rumion": {
    perKm: 29,
    local4hr: 2324,
    local8hr: 4226,
    fullDay: 4226,
    halfDay: 2324,
    vip: 5850,
    tag: "Comfort",
  },
  "Toyota Innova Crysta": {
    perKm: 32,
    local4hr: 2324,
    local8hr: 4226,
    fullDay: 4226,
    halfDay: 2324,
    vip: 7650,
    tag: "VIP",
  },
  "Toyota Innova Hycross": {
    perKm: 39,
    local4hr: 2685,
    local8hr: 4881,
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
  "fullDay",
  "halfDay",
  "vip",
] as const;
type EditableRateKey = (typeof editableRateKeys)[number];
type VehicleRateOverrides = Record<string, Partial<Record<EditableRateKey, number>>>;

function applyPriceAdjustment(amount: number, percent: number) {
  return Math.max(0, Math.round(amount * (1 + percent / 100)));
}

function buildEditableRateForm(
  vehicleName: string,
  overrides: VehicleRateOverrides = {},
) {
  const baseRates = rateTable[vehicleName] || rateTable["Toyota Innova Crysta"];
  const manualRates = overrides[vehicleName] || {};

  return Object.fromEntries(
    editableRateKeys.map((rateKey) => [
      rateKey,
      String(manualRates[rateKey] ?? baseRates[rateKey]),
    ]),
  ) as Record<EditableRateKey, string>;
}

function getAirportOption(value: string) {
  return (
    airportTripOptions.find((option) => option.value === value) ||
    airportTripOptions[0]
  );
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
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

const vehicles = [
  {
    name: "Toyota Innova Crysta",
    type: "Premium MUV",
    seats: "6-7 Seats",
    bestFor: "VIP, Family, Airport And Highway Travel",
    photo: "/fleet/innova-crysta.png?v=52a12bf",
  },
  {
    name: "Toyota Innova Hycross",
    type: "Luxury Hybrid",
    seats: "6-7 Seats",
    bestFor: "Executive Guests, Weddings And Long Routes",
    photo: "/fleet/hycross.png?v=52a12bf",
  },
  {
    name: "Maruti Ertiga",
    type: "Comfort MUV",
    seats: "6-7 Seats",
    bestFor: "Round Trip, Family Tour And Station Pickup",
    photo: "/fleet/ertiga.png?v=52a12bf",
  },
  {
    name: "Toyota Rumion",
    type: "Spacious MUV",
    seats: "6-7 Seats",
    bestFor: "Local Booking, Outstation And Group Travel",
    photo: "/fleet/rumion.png?v=52a12bf",
  },
  {
    name: "Toyota Etios",
    type: "Sedan",
    seats: "4 Seats",
    bestFor: "City Rides, Business Visits And One Day Travel",
    photo: "/fleet/etios.png?v=52a12bf",
  },
];

type PackageId = (typeof packageOptions)[number]["id"];
type PlaceSuggestion = {
  label: string;
  secondary?: string;
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
  pickup_datetime?: string;
  return_date?: string;
  odometer_start?: number;
  odometer_end?: number;
  extra_km?: number;
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
  status: "Available" | "Assigned";
};

type DriverRow = {
  driver_name: string;
  driver_mobile: string;
  vehicle_type: string;
  vehicle_number: string;
  bank_name?: string;
  bank_account?: string;
  bank_ifsc?: string;
};

type DriverCashSummary = {
  driver_mobile: string;
  driver_name: string;
  cash_amount: number;
  cash_collected?: number;
  cash_deposited?: number;
  cash_refunded?: number;
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
type AdminPanelTab =
  | "breakup"
  | "bookings"
  | "pricing"
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

  if (rideStatus.includes("confirmed")) {
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

function getBalanceDue(booking: DashboardBooking) {
  const { total } = getInvoiceTotals(booking);

  return Math.max(0, total - Number(booking.payment_amount || 0));
}

function getOdometerExtra(booking: DashboardBooking, startReading: number, endReading: number) {
  const actualKm = Math.max(0, endReading - startReading);
  const billableKm = Math.round(Number(booking.billable_km || 0));
  const extraKm = Math.max(0, actualKm - billableKm);
  const extraAmount = Math.round(extraKm * Number(booking.rate_per_km || 0) * 1.05);
  const finalChargeableKm = Math.max(billableKm, actualKm);
  const baseFare = Number(booking.estimated_fare || 0);
  const finalFareWithGst = baseFare + Math.round(baseFare * 0.05) + extraAmount;

  return { actualKm, billableKm, extraKm, extraAmount, finalChargeableKm, finalFareWithGst };
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
  const [withdrawalRequests, setWithdrawalRequests] = useState<DriverWithdrawal[]>([]);
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: "",
    bankName: "",
    bankAccount: "",
    bankIfsc: "",
  });
  const [activeAdminBreakup, setActiveAdminBreakup] =
    useState<AdminBreakupType>("bookings");
  const [activeAdminTab, setActiveAdminTab] = useState<AdminPanelTab>("bookings");
  const [nextRide, setNextRide] = useState<DashboardBooking | null>(null);
  const [driverEarning, setDriverEarning] = useState({
    completedRides: 0,
    totalEarning: 0,
    cashInHand: 0,
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
    priceAdjustmentPercent: number;
    vehicleRateOverrides: VehicleRateOverrides;
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
  const [driverProfileForm, setDriverProfileForm] = useState({
    name: "",
    mobile: "",
    vehicle: "Toyota Innova Crysta",
    vehicleNumber: "",
  });
  const [driverForm, setDriverForm] = useState({
    name: "",
    mobile: "",
    vehicle: "Toyota Innova Crysta",
    vehicleNumber: "",
  });
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
  const [vehicleRateOverrides, setVehicleRateOverrides] =
    useState<VehicleRateOverrides>({});
  const [rateEditorVehicle, setRateEditorVehicle] = useState("Toyota Innova Crysta");
  const [rateEditorForm, setRateEditorForm] = useState<Record<EditableRateKey, string>>({
    perKm: "",
    local4hr: "",
    local8hr: "",
    fullDay: "",
    halfDay: "",
    vip: "",
  });
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
  const adjustedRateTable = useMemo(() => {
    return Object.fromEntries(
      Object.entries(rateTable).map(([vehicleName, rates]) => [
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
    ) as typeof rateTable;
  }, [priceAdjustmentPercent, vehicleRateOverrides]);
  const vehicleRates = useMemo(
    () =>
      vehicles
        .map((item) => {
          const rates = adjustedRateTable[item.name];
          const localBaseFare =
            selectedLocalPackage.id === "local4hr" ? rates.local4hr : rates.local8hr;
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
    [adjustedRateTable, billableDistance, selectedLocalPackage, tripType],
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
    ? new Date(pickupDateTime).getTime() - Date.now() >= 8 * 60 * 60 * 1000
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
    let mounted = true;

    async function loadPriceSetting() {
      try {
        const response = await fetch("/api/bookings?settings=pricing");
        const result = (await response.json()) as {
          priceAdjustmentPercent?: number;
          vehicleRateOverrides?: VehicleRateOverrides;
        };
        const percent = Number(result.priceAdjustmentPercent || 0);

        if (mounted && Number.isFinite(percent)) {
          setPriceAdjustmentPercent(percent);
          setPriceAdjustmentInput(String(percent));
          const savedOverrides = result.vehicleRateOverrides || {};
          setVehicleRateOverrides(savedOverrides);
          setRateEditorForm(buildEditableRateForm("Toyota Innova Crysta", savedOverrides));
        }
      } catch {
        if (mounted) {
          setPriceAdjustmentPercent(0);
          setPriceAdjustmentInput("0");
          setVehicleRateOverrides({});
          setRateEditorForm(buildEditableRateForm("Toyota Innova Crysta", {}));
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
      handler: async () => {
        setIsPaying(false);
        setIsPaymentComplete(true);
        setShowBookingTicket(true);
        setPaymentStatus("Payment Received Successfully.");
        playBookingConfirmSound();
        await updatePaymentReceived(activeBooking, amount);
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

    checkout.open();
  }

  async function loadDashboard() {
    const normalizedMobile = loginMobile.replace(/\D/g, "");

    if (!normalizedMobile) {
      setPortalStatus("Please Enter Mobile Number.");
      return;
    }

    setPortalStatus("Loading Portal...");
    setPortalRole(null);
    setDashboard(null);
    setPortalBookings([]);
    setDriverVehicles([]);
    setDriverLedger([]);
    setWithdrawalRequests([]);
    setNextRide(null);
    setMaxWithdrawalAmount(0);

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
        recentBookings?: DashboardBooking[];
        drivers?: DriverRow[];
        driverVehicles?: DriverRow[];
        driverLedger?: DashboardBooking[];
        withdrawalRequests?: DriverWithdrawal[];
        nextRide?: DashboardBooking | null;
        driverCashSummary?: DriverCashSummary[];
        driverCashInHand?: number;
        driverProfile?: DriverRow | null;
        driverEarning?: {
          completedRides: number;
          totalEarning: number;
        };
        maxWithdrawalAmount?: number;
        error?: string;
      };

      if (!response.ok) {
        const loginError = result.error || "No User Found. Please Check Mobile Number.";
        setPortalStatus(loginError);
        window.alert(loginError);
        setDashboard(null);
        return;
      }

      setPortalRole(result.role || "customer");
      setPortalBookings(sortDashboardBookings(result.recentBookings || []));
      setDriverVehicles(result.driverVehicles || []);
      setDriverLedger(result.driverLedger || []);
      setWithdrawalRequests(result.withdrawalRequests || []);
      setNextRide(result.nextRide || null);

      if (result.drivers) {
        setDrivers(
          result.drivers.map((driver) => ({
            name: driver.driver_name,
            mobile: driver.driver_mobile,
            vehicle: driver.vehicle_type,
            vehicleNumber: driver.vehicle_number,
            status: "Available",
          })),
        );
      }

      if (result.role === "admin") {
        const currentPriceAdjustment = Number(result.priceAdjustmentPercent || 0);

        setPriceAdjustmentPercent(currentPriceAdjustment);
        setPriceAdjustmentInput(String(currentPriceAdjustment));
        const savedOverrides = result.vehicleRateOverrides || {};
        setVehicleRateOverrides(savedOverrides);
        setRateEditorForm(buildEditableRateForm(rateEditorVehicle, savedOverrides));
        setDashboard({
          totalBookings: result.totalBookings || 0,
          totalFare: result.totalFare || 0,
          totalBookingAmount: result.totalBookingAmount || result.totalFare || 0,
          totalCollected: result.totalCollected || 0,
          onlineCollected: result.onlineCollected || 0,
          driverCashInHand: result.driverCashInHand || 0,
          priceAdjustmentPercent: currentPriceAdjustment,
          recentBookings: result.recentBookings || [],
          driverCashSummary: result.driverCashSummary || [],
          driverLedger: result.driverLedger || [],
          withdrawalRequests: result.withdrawalRequests || [],
          vehicleRateOverrides: savedOverrides,
        });
      }

      if (result.role === "driver") {
        setDriverProfileForm({
          name: result.driverProfile?.driver_name || "",
          mobile: normalizedMobile,
          vehicle: result.driverProfile?.vehicle_type || "Toyota Innova Crysta",
          vehicleNumber: result.driverProfile?.vehicle_number || "",
        });
        setDriverEarning({
          completedRides: result.driverEarning?.completedRides || 0,
          totalEarning: result.driverEarning?.totalEarning || 0,
          cashInHand: result.driverCashInHand || 0,
        });
        setMaxWithdrawalAmount(result.maxWithdrawalAmount || 0);
        setWithdrawalForm((currentForm) => ({
          ...currentForm,
          bankName: result.driverProfile?.bank_name || currentForm.bankName,
          bankAccount: result.driverProfile?.bank_account || currentForm.bankAccount,
          bankIfsc: result.driverProfile?.bank_ifsc || currentForm.bankIfsc,
        }));
      }

      setPortalStatus("");
    } catch {
      const loginError = "Portal Could Not Load. Please Try Again.";
      setPortalStatus(loginError);
      window.alert(loginError);
      setDashboard(null);
    }
  }

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
      setRateEditorForm(buildEditableRateForm(rateEditorVehicle, savedOverrides));
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
    setRateEditorForm(buildEditableRateForm(rateEditorVehicle, vehicleRateOverrides));
    setPriceAdjustmentStatus("");
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

  async function saveDriverProfile(form = driverProfileForm) {
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

      const odometerStart = Math.round(Number(reading || 0));

      if (odometerStart < 1) {
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
        odometer_start: odometerPayload?.odometerStart || booking.odometer_start,
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

    setPortalStatus("Cancelling Ride...");

    try {
      const response = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "driverCancelRide",
          mobile: driverProfileForm.mobile.replace(/\D/g, ""),
          bookingId: booking.booking_id,
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

    if (startReading < 1) {
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

    const odometerEnd = Math.round(Number(enteredReading || 0));

    if (odometerEnd <= startReading) {
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
      handler: async () => {
        setIsPaying(false);
        playBookingConfirmSound();
        await submitDriverRideStatus(booking, "Ride Complete", {
          collectionMode: "payment_gateway",
          paymentAmount: getInvoiceTotals(booking).total,
          ...odometer,
        });
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

    const saved = await saveDriverProfile(driverForm);

    if (!saved) {
      return;
    }

    setDriverForm({
      name: "",
      mobile: "",
      vehicle: "Toyota Innova Crysta",
      vehicleNumber: "",
    });
    setPortalStatus("Driver Onboarded.");
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

  async function updatePaymentReceived(
    activeBooking: {
      bookingId: string;
    },
    amount: number,
  ) {
    await fetch("/api/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId: activeBooking.bookingId,
        customerMobile: mobile,
        paymentStatus: "Complete",
        paymentAmount: amount,
      }),
    }).catch(() => undefined);
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
      const result = (await response.json()) as { error?: string };

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

    setPortalStatus("Updating Driver Cash Ledger...");

    try {
      const response = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "recordCashDeposit",
          mobile: loginMobile.replace(/\D/g, ""),
          driverMobile: driver.driver_mobile,
          amount,
        }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setPortalStatus(result.error || "Driver Cash Ledger Could Not Be Updated.");
        return;
      }

      await loadDashboard();
      setPortalStatus("Driver Cash Collected And Ledger Updated.");
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
      (total, booking) => total + getInvoiceTotals(booking).total,
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
      bookingAmount: "Total Booking Amount Breakup",
      collected: "Amount Collected Breakup",
      online: "Online Collection Breakup",
      driverCash: "Driver Cash In Hand Breakup",
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
              <p>No Driver Cash In Hand Yet.</p>
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
              const totalFare = getInvoiceTotals(booking).total;
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

  function renderPortalBookingCard(booking: DashboardBooking, canManage: boolean) {
    const normalizedStatus = (booking.ride_status || "").toLowerCase();
    const cardStatusClass = normalizedStatus.includes("cancel")
      ? "booking-card-cancelled"
      : normalizedStatus.includes("complete")
        ? "booking-card-complete"
        : "booking-card-progress";
    const invoiceTotals = getInvoiceTotals(booking);
    const balanceDue = getBalanceDue(booking);
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
          <small>Pickup Date</small>
          <b>
            {formatDisplayDate((booking.pickup_datetime || booking.created_at).slice(0, 10))}
          </b>
          <small>Booking Date And Time</small>
          <b>{formatDisplayDateTime(booking.pickup_datetime || booking.created_at)}</b>
          {booking.return_date ? (
            <>
              <small>Drop Date</small>
              <b>{formatDisplayDate(booking.return_date)}</b>
            </>
          ) : null}
          {booking.odometer_start ? (
            <>
              <small>Start Odometer</small>
              <b>{booking.odometer_start} KM</b>
            </>
          ) : null}
          {booking.odometer_end ? (
            <>
              <small>End Odometer</small>
              <b>{booking.odometer_end} KM</b>
            </>
          ) : null}
          {booking.odometer_start && booking.odometer_end ? (
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
              : "Not Assigned"}
          </b>
          <small>Vehicle No.</small>
          <b>{booking.vehicle_number || "Not Assigned"}</b>
          <small>Cancel Reason</small>
          <b>{booking.cancel_reason || "None"}</b>
        </div>
        {portalRole === "customer" ? renderInvoice(booking) : null}
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

  return (
    <main>
      <header className="top-strip main-menu">
        <a className="brand" href="#home" aria-label="Vishnu Tours home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="brand-logo" src="/logo.svg?v=fce5649" alt="Vishnu Tours logo" />
          <span>
            <strong>Vishnu Tours</strong>
          </span>
        </a>
        <div className="header-actions">
          <a className="call-button" href={whatsappUrl} target="_blank">
            WhatsApp 7004291529
          </a>
          <a href={whatsappUrl} target="_blank">
            Request Help
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

      <section className="hero" id="home">
        <div className="taxi-visual" aria-hidden="true">
          <span className="road-line" />
          <div className="vip-visual-card">
            <span>VIP</span>
            <strong>Luxury Cab Service</strong>
            <small>Mumbai Corporate Pickup | All India Trips</small>
          </div>
        </div>
        <div className="hero-content">
          <div className="hero-copy">
            <h1>VIP Luxury Cab Service</h1>
            <p>
              Premium Cab Booking From Mumbai For Corporate Guests, Airport
              Transfers, In-City Movement And Outstation Trips. Select Your
              Cab, Review Fare Details And Enjoy A Comfortable Journey.
            </p>
            <div className="hero-actions">
              <a className="primary-action" href="#booking">
                Book Cab Now
              </a>
              <a className="secondary-action" href="tel:+917004291529">
                Call for Help
              </a>
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
            <h2 className="booking-title">Corporate Cab Booking In Mumbai</h2>
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

      <section className="homepage-fleet-strip" aria-label="Vishnu Tours car fleet">
        <div className="homepage-fleet-head">
          <span>Owner Fleet</span>
          <h2>Cars For Corporate, VIP And Family Travel</h2>
          <p>Sedan And MUV Options Available From Mumbai For Airport, In-City, Round Trip And Outstation Travel.</p>
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
                <p>{item.seats} | White AC Cab</p>
              </div>
            </article>
          ))}
        </div>
      </section>

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
                      <li>
                        {item.seats.startsWith("4") ? "4" : "6"} Passengers | 2 Suitcases
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
                    New Car Promise - Actual Owner Fleet, Clean VIP Service
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
      <section className="trust-strip" aria-label="Service highlights">
        <div>
          <strong>Best Rate Options</strong>
          <span>Corporate-Friendly Pricing</span>
        </div>
        <div>
          <strong>Direct Owner Fleet</strong>
          <span>No Middle Commission</span>
        </div>
        <div>
          <strong>VIP Coordination</strong>
          <span>Guest Movement Support</span>
        </div>
        <div>
          <strong>Online Payment</strong>
          <span>Razorpay After Booking</span>
        </div>
      </section>

      <footer className="site-footer" id="contact">
        <div>
          <strong>Vishnu Tours</strong>
          <span>Visnu S Tours & Travels</span>
        </div>
        <nav className="footer-nav" aria-label="Footer navigation">
          <a href="#home">Home</a>
          <a href="#booking">Book Taxi</a>
        </nav>
        <div>
          <a href={whatsappUrl} target="_blank">
            WhatsApp: 7004291529
          </a>
          <a href={whatsappUrl} target="_blank">
            WhatsApp Help
          </a>
        </div>
      </footer>

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
                    {formatInr(Number(collectionPrompt.extra_amount || 0))}
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
          <div className="admin-card">
            <button
              className="admin-close"
              type="button"
              onClick={() => setShowLogin(false)}
            >
              ×
            </button>
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
                View
              </button>
            </div>
            {portalStatus ? <p className="admin-status">{portalStatus}</p> : null}
            {portalRole ? (
              <div className="portal-role-chip">
                {portalRole === "admin"
                  ? "Admin Panel"
                  : portalRole === "driver"
                    ? "Driver Panel"
                    : "Customer Panel"}
              </div>
            ) : null}
            {portalRole === "admin" && dashboard ? (
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
                <span>Select A Driver Or Customer To Open Their Dashboard Automatically.</span>
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
                      label: "Total Booking Amount",
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
                      label: "In Driver Hand",
                      value: formatInr(adminMetrics.driverCashInHand),
                      className: "cash-metric",
                    },
                  ];

                  return (
                    <>
                      {metricCards.map((card) => (
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
                      ))}
                      <div className="admin-tabs">
                        {(() => {
                          const taskCounts = getAdminTaskCounts(dashboard);
                          const tabs: Array<{
                            id: AdminPanelTab;
                            label: string;
                            count: number;
                          }> = [
                            {
                              id: "breakup",
                              label: "Total Booking Breakup",
                              count: taskCounts.bookings,
                            },
                            {
                              id: "bookings",
                              label: "Booking",
                              count: taskCounts.bookings,
                            },
                            {
                              id: "pricing",
                              label: "Price Control",
                              count: Math.round(priceAdjustmentPercent),
                            },
                            {
                              id: "vehicles",
                              label: "Registered Driver Vehicles",
                              count: taskCounts.vehicles,
                            },
                            {
                              id: "ledger",
                              label: "Driver Ledger",
                              count: taskCounts.ledger,
                            },
                            {
                              id: "withdrawals",
                              label: "Cash Withdrawal Requests",
                              count: taskCounts.withdrawalPending,
                            },
                            {
                              id: "portalLookup",
                              label: "Open Any Dashboard",
                              count: adminLookupBookings.length,
                            },
                          ];

                          return tabs.map((tab) => (
                            <button
                              className={activeAdminTab === tab.id ? "is-active" : ""}
                              key={tab.id}
                              type="button"
                              onClick={() => setActiveAdminTab(tab.id)}
                            >
                              <span>{tab.label}</span>
                              <b>{tab.count}</b>
                            </button>
                          ));
                        })()}
                      </div>
                      <div className="admin-task-strip">
                        {(() => {
                          const taskCounts = getAdminTaskCounts(dashboard);
                          return (
                            <>
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
                            </>
                          );
                        })()}
                      </div>
                    </>
                  );
                })()}
                {activeAdminTab === "breakup" ? renderAdminMetricBreakup(dashboard) : null}
                {activeAdminTab === "bookings" ? (
                  <div className="admin-recent admin-tab-panel">
                    <h3>Booking Details And Operations</h3>
                    {dashboard.recentBookings.length ? (
                      dashboard.recentBookings.map((booking) =>
                        renderPortalBookingCard(booking, true),
                      )
                    ) : (
                      <p>No Bookings Yet.</p>
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
                              buildEditableRateForm(selectedCar, vehicleRateOverrides),
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
                    <div className="price-preview-table">
                      <h3>Adjusted Fare Preview</h3>
                      {vehicles.map((item) => {
                        const defaultBase = rateTable[item.name];
                        const override = vehicleRateOverrides[item.name] || {};
                        const base = {
                          ...defaultBase,
                          perKm: override.perKm ?? defaultBase.perKm,
                          local4hr: override.local4hr ?? defaultBase.local4hr,
                          local8hr: override.local8hr ?? defaultBase.local8hr,
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
                            <span>Full Day {formatInr(base.fullDay)} → {formatInr(adjusted.fullDay)}</span>
                            <span>VIP {formatInr(base.vip)} → {formatInr(adjusted.vip)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
                {activeAdminTab === "vehicles" ? (
                  <div className="admin-ops-panel admin-tab-panel vehicle-admin-panel">
                    <div>
                      <h3>Admin Driver And Vehicle Registration</h3>
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
                        <button type="button" onClick={onboardDriver}>
                          Register Driver Vehicle
                        </button>
                      </div>
                    </div>
                    <div>
                      <h3>Registered Driver Vehicles</h3>
                      {(() => {
                        const taskCounts = getAdminTaskCounts(dashboard);

                        return (
                          <div className="fleet-availability-strip">
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
                            <span>
                              <b>{taskCounts.rideInProgress}</b>
                              Engaged Vehicles
                            </span>
                          </div>
                        );
                      })()}
                      <div className="driver-list">
                        {drivers.map((driver) => {
                          const isEngaged = isStartedRideVehicle(
                            driver.vehicleNumber,
                            dashboard.recentBookings,
                          );

                          return (
                            <div
                              className="driver-vehicle-row"
                              key={`${driver.name}-${driver.mobile}-${driver.vehicleNumber}`}
                            >
                              <span>
                                Owner {driver.name} | {driver.mobile} | {driver.vehicle} |{" "}
                                {driver.vehicleNumber || "Vehicle No. Pending"}
                              </span>
                              <b className={isEngaged ? "vehicle-engaged" : "vehicle-vacant"}>
                                {isEngaged ? "Engaged" : "Vacant"}
                              </b>
                            </div>
                          );
                        })}
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
                                Deposited {formatInr(Number(driver.cash_deposited || 0))} |{" "}
                                In Hand{" "}
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
                                Cash Collected
                              </button>
                            </div>
                          ))
                        ) : (
                          <span>No Driver Cash Collection Yet.</span>
                        )}
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
            {portalRole && portalRole !== "admin" ? (
              <div className="admin-dashboard single-column-dashboard">
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
                  <small>Date</small>
                  <b>
                    {formatDisplayDate(
                      (customerBooking.pickup_datetime || customerBooking.created_at).slice(
                        0,
                        10,
                      ),
                    )}
                  </b>
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
                      : "Not Assigned"}
                  </b>
                  <small>Vehicle No.</small>
                  <b>{customerBooking.vehicle_number || "Not Assigned"}</b>
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
