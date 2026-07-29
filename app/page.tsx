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

const bookingTypes = ["Airport", "In-City", "Outstation"];
const popularPickupSuggestions = [
  "Mumbai Airport",
  "BKC Mumbai",
  "Andheri Mumbai",
  "Bandra Mumbai",
  "Powai Mumbai",
];
const popularDestinationSuggestions = [
  "Pune",
  "Nashik",
  "Surat",
  "Goa",
  "Delhi",
  "Bangalore",
];

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
  { perKm: number; fullDay: number; halfDay: number; vip: number; tag: string }
> = {
  "Toyota Etios": {
    perKm: 16,
    fullDay: 3200,
    halfDay: 1900,
    vip: 5200,
    tag: "Economy",
  },
  "Maruti Ertiga": {
    perKm: 18,
    fullDay: 4200,
    halfDay: 2600,
    vip: 6200,
    tag: "Family",
  },
  "Maruti Rumion": {
    perKm: 18,
    fullDay: 4300,
    halfDay: 2700,
    vip: 6500,
    tag: "Comfort",
  },
  "Toyota Innova Crysta": {
    perKm: 22,
    fullDay: 5800,
    halfDay: 3600,
    vip: 8500,
    tag: "VIP",
  },
  "Toyota Hycross": {
    perKm: 26,
    fullDay: 7200,
    halfDay: 4600,
    vip: 11000,
    tag: "Luxury VIP",
  },
};

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
    photo: "/fleet/innova-crysta.png?v=343ab08",
  },
  {
    name: "Toyota Hycross",
    type: "Luxury Hybrid",
    seats: "6-7 Seats",
    bestFor: "Executive Guests, Weddings And Long Routes",
    photo: "/fleet/hycross.png?v=343ab08",
  },
  {
    name: "Maruti Ertiga",
    type: "Comfort MUV",
    seats: "6-7 Seats",
    bestFor: "Round Trip, Family Tour And Station Pickup",
    photo: "/fleet/ertiga.png?v=343ab08",
  },
  {
    name: "Maruti Rumion",
    type: "Spacious MUV",
    seats: "6-7 Seats",
    bestFor: "Local Booking, Outstation And Group Travel",
    photo: "/fleet/rumion.png?v=343ab08",
  },
  {
    name: "Toyota Etios",
    type: "Sedan",
    seats: "4 Seats",
    bestFor: "City Rides, Business Visits And One Day Travel",
    photo: "/fleet/etios.png?v=343ab08",
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
  estimated_fare: number;
  customer_name: string;
  customer_mobile: string;
  status: string;
  ride_status?: string;
  refund_status?: string;
  driver_name?: string;
  driver_mobile?: string;
  vehicle_number?: string;
  payment_status?: string;
  payment_amount?: number;
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
};

type PortalRole = "admin" | "driver" | "customer";

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
  return amount
    ? new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(amount)
    : "Enter KM";
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
  const total = baseFare + tax;

  return { baseFare, tax, total };
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
  const [vehicle, setVehicle] = useState("Toyota Innova Crysta");
  const [startPoint, setStartPoint] = useState(headOffice);
  const [drop, setDrop] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  const [date, setDate] = useState("");
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
  const [driverEarning, setDriverEarning] = useState({
    completedRides: 0,
    totalEarning: 0,
  });
  const [showCustomerLogin, setShowCustomerLogin] = useState(false);
  const [customerStatus, setCustomerStatus] = useState("");
  const [customerLookup, setCustomerLookup] = useState({
    bookingId: "",
    mobile: "",
  });
  const [customerBooking, setCustomerBooking] = useState<DashboardBooking | null>(
    null,
  );
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
    recentBookings: DashboardBooking[];
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
  const billableDistance = numericDistance;
  const selectedPackage =
    packageOptions.find((item) => item.id === packageType) || packageOptions[0];
  const vehicleRates = useMemo(
    () =>
      vehicles
        .map((item) => {
          const rates = rateTable[item.name];
          const estimatedFare =
            packageType === "perKm"
              ? Math.round(billableDistance * rates.perKm)
              : rates[packageType];

          return {
            ...item,
            ...rates,
            estimatedFare,
            fareLabel:
              packageType === "perKm"
                ? `Rs. ${rates.perKm}/KM`
                : packageType === "fullDay"
                  ? "8 Hr / 80 KM"
                  : packageType === "halfDay"
                    ? "4 Hr / 40 KM"
                    : "VIP Package",
          };
        })
        .sort((first, second) => first.estimatedFare - second.estimatedFare),
    [billableDistance, packageType],
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
      `Trip: ${tripType}`,
      `Cab: ${vehicle}`,
      `Start Point: ${startPoint}`,
      `Destination: ${drop || "Please confirm"}`,
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
    tripType,
    vehicle,
    startPoint,
    drop,
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

    if (!startPoint || !drop || !numericDistance || !date || !pickupTime) {
      setBookingStatus("Please Fill From, To, Date, Time And Distance.");
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

    if (!drop || !numericDistance || !pickupDateTime || !name || !mobile) {
      setBookingStatus("Please Fill From, To, KM, Date, Name And Mobile Number.");
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
          tripType,
          vehicle: selectedCab,
          startPoint,
          destination: drop,
          distanceKm: numericDistance,
          date: pickupDateTime,
          name,
          mobile,
          packageType,
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
            pickup: startPoint,
            drop,
            vehicle,
            tripType,
            distanceKm: String(numericDistance),
            packageType,
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
      description: `${activeBooking.bookingId} ${tripType} booking`,
      prefill: {
        name,
        contact: mobile,
      },
      notes: {
        bookingId: activeBooking.bookingId,
        pickup: startPoint,
        drop,
        vehicle,
        tripType,
        distanceKm: String(numericDistance),
        packageType,
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

    try {
      const response = await fetch(
        `/api/bookings?loginMobile=${encodeURIComponent(normalizedMobile)}`,
      );
      const result = (await response.json()) as {
        role?: PortalRole;
        totalBookings?: number;
        totalFare?: number;
        recentBookings?: DashboardBooking[];
        drivers?: DriverRow[];
        driverProfile?: DriverRow | null;
        driverEarning?: {
          completedRides: number;
          totalEarning: number;
        };
        error?: string;
      };

      if (!response.ok) {
        setPortalStatus(result.error || "Login Failed.");
        setDashboard(null);
        return;
      }

      setPortalRole(result.role || "customer");
      setPortalBookings(result.recentBookings || []);

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
        setDashboard({
          totalBookings: result.totalBookings || 0,
          totalFare: result.totalFare || 0,
          recentBookings: result.recentBookings || [],
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
        });
      }

      setPortalStatus("");
    } catch {
      setPortalStatus("Portal Could Not Load.");
      setDashboard(null);
    }
  }

  async function updateBookingOperation(
    bookingId: string,
    updates: {
      rideStatus?: string;
      refundStatus?: string;
      paymentStatus?: string;
      paymentAmount?: number;
      vehicle?: string;
      driverName?: string;
      driverMobile?: string;
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
      setPortalStatus("Please Save Driver Profile Before Accepting Ride.");
      return;
    }

    if (booking.vehicle !== driverProfileForm.vehicle) {
      setPortalStatus(
        `This Ride Requires ${booking.vehicle}. Your Saved Vehicle Is ${driverProfileForm.vehicle}.`,
      );
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

    setPortalStatus("Updating Ride Status...");

    try {
      const response = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "driverRideStatus",
          mobile: driverProfileForm.mobile.replace(/\D/g, ""),
          bookingId: booking.booking_id,
          rideStatus,
        }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setPortalStatus(result.error || "Ride Status Could Not Be Updated.");
        return;
      }

      await loadDashboard();
      setPortalStatus(`${rideStatus} Updated.`);
    } catch {
      setPortalStatus("Ride Status Could Not Be Updated.");
    }
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

  function renderPortalBookingCard(booking: DashboardBooking, canManage: boolean) {
    const normalizedStatus = (booking.ride_status || "").toLowerCase();
    const cardStatusClass = normalizedStatus.includes("cancel")
      ? "booking-card-cancelled"
      : normalizedStatus.includes("complete")
        ? "booking-card-complete"
        : "booking-card-progress";

    return (
      <article className={cardStatusClass} key={booking.booking_id}>
        <div className="booking-row-head">
          <strong>{booking.booking_id}</strong>
          <span>{booking.ride_status || "Booked"}</span>
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
          <small>Fare</small>
          <b>{formatInr(booking.estimated_fare)}</b>
          <small>Payment</small>
          <b>
            {booking.payment_status || "Pending"} |{" "}
            {formatPaymentAmount(booking.payment_amount || 0)}
          </b>
          <small>Refund</small>
          <b>{booking.refund_status || "None"}</b>
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
                booking.vehicle !== driverProfileForm.vehicle
              }
              onClick={() => acceptRide(booking)}
            >
              Accept Ride
            </button>
          </div>
        ) : null}
        {portalRole === "driver" &&
        booking.driver_mobile === driverProfileForm.mobile.replace(/\D/g, "") ? (
          <div className="booking-actions">
            <button
              type="button"
              disabled={Boolean(booking.ride_started_at)}
              onClick={() => updateDriverRideStatus(booking, "Ride Started")}
            >
              Ride Started
            </button>
            <button
              type="button"
              disabled={!booking.ride_started_at || Boolean(booking.ride_completed_at)}
              onClick={() => updateDriverRideStatus(booking, "Ride Complete")}
            >
              Ride Complete
            </button>
          </div>
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
                        selectedDriver?.vehicle ||
                        currentForm[booking.booking_id]?.vehicleName ||
                        booking.vehicle,
                      vehicleNumber: selectedDriver?.vehicleNumber || "",
                    },
                  }));
                  }
                }
              >
                <option value="">Select Driver</option>
                {drivers.map((driver) => (
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
                      vehicleNumber:
                        currentForm[booking.booking_id]?.vehicleNumber || "",
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
                  setAssignmentForm((currentForm) => ({
                    ...currentForm,
                    [booking.booking_id]: {
                      driverName:
                        currentForm[booking.booking_id]?.driverName || "",
                      driverMobile:
                        currentForm[booking.booking_id]?.driverMobile || "",
                      vehicleName:
                        currentForm[booking.booking_id]?.vehicleName || booking.vehicle,
                      vehicleNumber: event.target.value,
                    },
                  }))
                }
              >
                <option value="">Select Vehicle Number</option>
                {drivers
                  .map((driver) => driver.vehicleNumber)
                  .filter(Boolean)
                  .map((number) => (
                    <option key={`${booking.booking_id}-${number}`} value={number}>
                      {number}
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
                onClick={() =>
                  updateBookingOperation(booking.booking_id, {
                    paymentStatus: "Complete",
                    paymentAmount: getInvoiceTotals(booking).total,
                    rideStatus: "Payment Received",
                  })
                }
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
                type="button"
                onClick={() =>
                  updateBookingOperation(booking.booking_id, {
                    refundStatus: "Refund Requested",
                  })
                }
              >
                Refund Customer
              </button>
              <button
                type="button"
                onClick={() =>
                  updateBookingOperation(booking.booking_id, {
                    refundStatus: "Refund Completed",
                  })
                }
              >
                Refund Complete
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
      <div className="top-strip">
        <span>Welcome Guest</span>
        <a href={whatsappUrl} target="_blank">WhatsApp: +91 7004291529</a>
        <a href={whatsappUrl} target="_blank">
          Request Help
        </a>
      </div>
      <header className="site-header">
        <a className="brand" href="#home" aria-label="Vishnu Tours home">
          <span className="brand-mark">VT</span>
          <span>
            <strong>Vishnu Tours</strong>
          </span>
        </a>
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
                Cab, Review Fare Details And Pay Securely On The Website.
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
                    setShowVehicleStep(false);
                    setBookingView("home");
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="route-form-row">
              <label className="place-field booking-field">
                <span>From</span>
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
                <span>To</span>
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
                  required
                />
                {activeSuggestionField === "to" && visibleDestinationSuggestions.length ? (
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
              <label className="booking-field">
                <span>Pick Up Date</span>
                <input
                  value={date}
                  onChange={(event) => {
                    setDate(event.target.value);
                    setShowVehicleStep(false);
                    setBookingView("home");
                  }}
                  type="date"
                  required
                />
              </label>
              <label className="booking-field">
                <span>Pick Up Time</span>
                <select
                  value={pickupTime}
                  onChange={(event) => {
                    setPickupTime(event.target.value);
                    setShowVehicleStep(false);
                    setBookingView("home");
                  }}
                >
                  {[
                    "06:00",
                    "07:00",
                    "08:00",
                    "09:00",
                    "10:00",
                    "11:00",
                    "12:00",
                    "13:00",
                    "14:00",
                    "15:00",
                    "16:00",
                    "17:00",
                    "18:00",
                    "19:00",
                    "20:00",
                    "21:00",
                  ].map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
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
            <div className="quick-suggestions compact-suggestions" aria-label="Popular route">
              <span>Popular</span>
              <div>
                {popularPickupSuggestions.slice(0, 3).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setPickupFieldTouched(false);
                      updateStartPoint(item);
                    }}
                  >
                    {item}
                  </button>
                ))}
                {popularDestinationSuggestions.slice(0, 4).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => updateDestination(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
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
              <strong>{tripType}</strong>
            </div>
            <div>
              <span>Pick Up</span>
              <strong>{formatDisplayDate(date)}</strong>
            </div>
            <div>
              <span>Time</span>
              <strong>{pickupTime}</strong>
            </div>
            <button type="button" onClick={() => setBookingView("home")}>
              Modify Booking
            </button>
          </div>
          <div className="result-promise-band">
            <strong>₹ Book Now At Zero Cost</strong>
            <strong>Free Cancellations Up To 1 Hour</strong>
            <strong>24/7 Customer Support</strong>
          </div>
          <div className="vehicle-card-list" aria-live="polite">
            {vehicleRates.map((item) => {
              const tax = Math.round(item.estimatedFare * 0.05);
              const total = item.estimatedFare + tax;

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
                        {billableDistance || 0} KMs Included | Post Limit: Rs.{" "}
                        {item.perKm}/KM
                      </li>
                      <li>{selectedPackage.label}</li>
                    </ul>
                    <button type="button" className="link-button">
                      Inclusions and Exclusions
                    </button>
                  </div>
                  <div className="car-price-block">
                    <span className="discount-line">Direct Owner Rate</span>
                    <strong>{formatInr(total)}</strong>
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
                  <strong>{tripType}</strong>
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
              <div className="admin-dashboard">
                <div className="admin-metric">
                  <span>Total Bookings</span>
                  <strong>{dashboard.totalBookings}</strong>
                </div>
                <div className="admin-metric">
                  <span>Total Fare</span>
                  <strong>{formatInr(dashboard.totalFare)}</strong>
                </div>
                <div className="admin-ops-panel">
                  <div>
                    <h3>Driver Onboarding</h3>
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
                        Add Driver
                      </button>
                    </div>
                  </div>
                  <div>
                    <h3>Driver Pool</h3>
                    <div className="driver-list">
                      {drivers.map((driver) => (
                        <span key={`${driver.name}-${driver.mobile}`}>
                          {driver.name} | {driver.mobile} | {driver.vehicle} |{" "}
                          {driver.vehicleNumber || "Vehicle No. Pending"}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="admin-recent">
                  <h3>Booking Details And Operations</h3>
                  {dashboard.recentBookings.length ? (
                    dashboard.recentBookings.map((booking) =>
                      renderPortalBookingCard(booking, true),
                    )
                  ) : (
                    <p>No Bookings Yet.</p>
                  )}
                </div>
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
                  </div>
                  <div className="admin-ops-panel driver-profile-panel">
                    <div>
                      <h3>Driver Profile</h3>
                      {driverProfileForm.name && driverProfileForm.vehicleNumber ? (
                        <div className="driver-profile-summary">
                          <strong>{driverProfileForm.name}</strong>
                          <span>Mobile: {driverProfileForm.mobile}</span>
                          <span>Vehicle: {driverProfileForm.vehicle}</span>
                          <span>Vehicle No: {driverProfileForm.vehicleNumber}</span>
                        </div>
                      ) : (
                        <p className="driver-profile-note">
                          Save Your Driver And Vehicle Details Once To Accept Matching Rides.
                        </p>
                      )}
                      <div className="driver-form">
                        <input
                          value={driverProfileForm.name}
                          onChange={(event) =>
                            setDriverProfileForm((currentForm) => ({
                              ...currentForm,
                              name: event.target.value,
                            }))
                          }
                          placeholder="Driver Name"
                        />
                        <input
                          value={driverProfileForm.mobile}
                          onChange={(event) =>
                            setDriverProfileForm((currentForm) => ({
                              ...currentForm,
                              mobile: event.target.value,
                            }))
                          }
                          placeholder="Driver Mobile"
                          inputMode="tel"
                        />
                        <select
                          value={driverProfileForm.vehicle}
                          onChange={(event) =>
                            setDriverProfileForm((currentForm) => ({
                              ...currentForm,
                              vehicle: event.target.value,
                            }))
                          }
                        >
                          {vehicles.map((item) => (
                            <option key={`driver-${item.name}`} value={item.name}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                        <input
                          value={driverProfileForm.vehicleNumber}
                          onChange={(event) =>
                            setDriverProfileForm((currentForm) => ({
                              ...currentForm,
                              vehicleNumber: event.target.value,
                            }))
                          }
                          placeholder="Vehicle Number"
                        />
                        <button type="button" onClick={() => saveDriverProfile()}>
                          Save Profile
                        </button>
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
                  <b>{customerBooking.refund_status || "None"}</b>
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
