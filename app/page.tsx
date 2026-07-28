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
    description: "Mumbai se all India per km fare",
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
    description: "Premium car, priority driver, executive service",
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
    seats: "6-7 seats",
    bestFor: "VIP, family, airport and highway travel",
    photo: "/fleet/innova-crysta.svg",
  },
  {
    name: "Toyota Hycross",
    type: "Luxury Hybrid",
    seats: "6-7 seats",
    bestFor: "Executive guests, weddings and long routes",
    photo: "/fleet/hycross.svg",
  },
  {
    name: "Maruti Ertiga",
    type: "Comfort MUV",
    seats: "6-7 seats",
    bestFor: "Round trip, family tour and station pickup",
    photo: "/fleet/ertiga.svg",
  },
  {
    name: "Maruti Rumion",
    type: "Spacious MUV",
    seats: "6-7 seats",
    bestFor: "Local booking, outstation and group travel",
    photo: "/fleet/rumion.svg",
  },
  {
    name: "Toyota Etios",
    type: "Sedan",
    seats: "4 seats",
    bestFor: "City rides, business visits and one day travel",
    photo: "/fleet/etios.svg",
  },
];

const serviceTypes = [
  "Airport",
  "In-City",
  "Outstation",
  "Corporate Booking",
  "Executive Transfers",
  "All India Trips",
];

type PackageId = (typeof packageOptions)[number]["id"];
type PlaceSuggestion = {
  label: string;
  secondary?: string;
};

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
    return "Please select";
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
  const [paymentMode, setPaymentMode] = useState("Pay advance after fare confirmation");
  const [paymentChoice, setPaymentChoice] = useState<"zero" | "part" | "full">(
    "part",
  );
  const [advanceAmount, setAdvanceAmount] = useState("500");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [bookingStatus, setBookingStatus] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [, setShowVehicleStep] = useState(false);
  const [activeSuggestionField, setActiveSuggestionField] = useState<
    "from" | "to" | null
  >(null);
  const [googleFromSuggestions, setGoogleFromSuggestions] = useState<
    PlaceSuggestion[]
  >([]);
  const [googleDestinationSuggestions, setGoogleDestinationSuggestions] =
    useState<PlaceSuggestion[]>([]);
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
                ? `Rs. ${rates.perKm}/km`
                : packageType === "fullDay"
                  ? "8 hr / 80 km"
                  : packageType === "halfDay"
                    ? "4 hr / 40 km"
                    : "VIP package",
          };
        })
        .sort((first, second) => first.estimatedFare - second.estimatedFare),
    [billableDistance, packageType],
  );
  const selectedVehicleRate =
    vehicleRates.find((item) => item.name === vehicle) || vehicleRates[0];
  const fareTotal = selectedVehicleRate?.estimatedFare || 0;
  const chargesAndTaxes = fareTotal ? Math.max(250, Math.round(fareTotal * 0.18)) : 0;
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
  const visibleFromSuggestions =
    googleFromSuggestions.length > 0
      ? googleFromSuggestions.slice(0, 5)
      : getPlaceSuggestions(startPoint, fromSuggestions, 5).map((item) => ({
          label: item,
          secondary: "Mumbai pickup",
        }));
  const visibleDestinationSuggestions =
    googleDestinationSuggestions.length > 0
      ? googleDestinationSuggestions.slice(0, 5)
      : getPlaceSuggestions(drop, destinationSuggestions, 5).map((item) => ({
          label: item,
          secondary: "Popular destination",
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
          setGoogleFromSuggestions(result.suggestions || []);
        }
      } catch {
        if (mounted) {
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
          setGoogleDestinationSuggestions(result.suggestions || []);
        }
      } catch {
        if (mounted) {
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
      "Namaste Vishnu Tours, mujhe cab booking karni hai.",
      `Trip: ${tripType}`,
      `Cab: ${vehicle}`,
      `Start Point: ${startPoint}`,
      `Destination: ${drop || "Please confirm"}`,
      `Estimated Distance: ${numericDistance || "Please confirm"} km`,
      `Billable Distance: ${billableDistance || "Please confirm"} km`,
      `Rate: ${selectedVehicleRate?.fareLabel || `Rs. ${perKmRate}/km`}`,
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
    setShowVehicleStep(false);
    setBookingView("home");
    const distance = getDestinationDistance(value);

    if (distance) {
      setDistanceKm(String(distance));
    }
  }

  function updateStartPoint(value: string) {
    setStartPoint(value);
    setShowVehicleStep(false);
    setBookingView("home");
    setConfirmedBooking(null);
    setBookingStatus("");
  }

  function useCurrentLocation() {
    setBookingStatus("");

    if (!navigator.geolocation) {
      setBookingStatus("Current location browser me available nahi hai.");
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
        setBookingStatus("Current location permission allow karein ya pickup type karein.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  function continueToRates() {
    setBookingStatus("");
    setConfirmedBooking(null);

    if (!pickupAllowed) {
      setPickupFieldTouched(true);
      setBookingStatus(
        "Sorry, hum Mumbai se bahar pickup nahi karte. Pickup location Mumbai area me dalein.",
      );
      return;
    }

    if (!startPoint || !drop || !numericDistance || !date || !pickupTime) {
      setBookingStatus("From, To, date, time aur distance fill karein.");
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
    setBookingView("review");
  }

  async function submitBooking(selectedCab = vehicle) {
    if (!pickupAllowed) {
      setPickupFieldTouched(true);
      setBookingStatus(
        "Sorry, hum Mumbai se bahar pickup nahi karte. Pickup location Mumbai area me dalein.",
      );
      return;
    }

    if (!drop || !numericDistance || !pickupDateTime || !name || !mobile) {
      setBookingStatus("Please From/To, KM, date, name aur mobile fill karein.");
      return null;
    }

    setVehicle(selectedCab);
    setIsBooking(true);
    setBookingStatus("");
    setConfirmedBooking(null);

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
        setBookingStatus(result.error || "Booking save nahi ho payi.");
        return null;
      }

      setConfirmedBooking(result.booking);
      setAdvanceAmount(String(selectedPaymentAmount || result.booking.estimatedFare));
      setBookingStatus(`${selectedCab} booking site par live save ho gayi.`);
      return result.booking;
    } catch {
      setBookingStatus("Network issue ki wajah se booking save nahi ho payi.");
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
      setPaymentStatus("Booking saved. Customer can pay later after confirmation.");
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
          receipt: `vishnu-${Date.now()}`,
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
      order = { error: "Payment gateway could not be reached." };
    }

    if (!order.keyId) {
      setIsPaying(false);
      setPaymentStatus(
        order.error ||
          "Payment gateway is ready. Add Razorpay credentials to activate online payment.",
      );
      window.open(
        `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
          `Namaste Vishnu Tours, mujhe Rs. ${advanceAmount} advance payment link chahiye.\nBooking: ${name || "Guest"}\nMobile: ${mobile || "Please confirm"}\nTrip: ${tripType}\nCab: ${vehicle}`,
        )}`,
        "_blank",
        "noopener,noreferrer",
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
        setPaymentStatus("Payment gateway could not load. Please try WhatsApp.");
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
      handler: () => {
        setIsPaying(false);
        setPaymentStatus("Payment received. Please share screenshot on WhatsApp.");
      },
      modal: {
        ondismiss: () => {
          setIsPaying(false);
          setPaymentStatus("Payment was closed before completion.");
        },
      },
    };

    if (order.orderId) {
      checkoutOptions.order_id = order.orderId;
    }

    const checkout = new window.Razorpay(checkoutOptions);

    checkout.open();
  }

  return (
    <main>
      <div className="top-strip">
        <span>Welcome Guest</span>
        <a href="tel:+917004291529">Call: +91 7004291529</a>
        <a href={whatsappUrl} target="_blank">
          Request Help
        </a>
      </div>
      <header className="site-header">
        <a className="brand" href="#home" aria-label="Vishnu Tours home">
          <span className="brand-mark">VT</span>
          <span>
            <strong>Vishnu Tours</strong>
            <small>Visnu S Tours & Travels</small>
          </span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#home">Home</a>
          <a href="#services">Services</a>
          <a href="#booking">Book Taxi</a>
          <a href="#fleet">Fleet</a>
          <a href="#payment">Payment</a>
          <a href="#contact">Contact</a>
        </nav>
        <a className="call-button" href="tel:+917004291529">
          Call 7004291529
        </a>
      </header>

      <section className="hero" id="home">
        <div className="taxi-visual" aria-hidden="true">
          <span className="road-line" />
          <div className="vip-visual-card">
            <span>VIP</span>
            <strong>Luxury Cab Service</strong>
            <small>Mumbai corporate pickup | All India trips</small>
          </div>
        </div>
        <div className="hero-content">
          <div className="hero-copy">
            <p className="eyebrow">Visnu S Tours & Travels</p>
            <h1>VIP Luxury Cab Service by Vishnu Tours</h1>
              <p>
                Corporate guests, airport transfers, in-city movement aur
                outstation trips ke liye Mumbai se premium cab booking. Clean
                journey detail, cab selection aur payment direct site par.
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
                    Hum Mumbai se bahar pickup nahi karte.
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
                  onChange={(event) => updateDestination(event.target.value)}
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
              24x7 support | Free cancellation before assignment | Mumbai pickup only
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
              <span>Pick up</span>
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
            <strong>₹ Book now at zero cost</strong>
            <strong>Free cancellations up to 1 hour</strong>
            <strong>24/7 customer support</strong>
          </div>
          <div className="vehicle-card-list" aria-live="polite">
            {vehicleRates.map((item) => {
              const tax = Math.max(250, Math.round(item.estimatedFare * 0.18));
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
                      <li>Driver allowance included</li>
                      <li>
                        {billableDistance || 0} kms included | Post limit: Rs.{" "}
                        {item.perKm}/km
                      </li>
                      <li>{selectedPackage.label}</li>
                    </ul>
                    <button type="button" className="link-button">
                      Inclusions and Exclusions
                    </button>
                  </div>
                  <div className="car-price-block">
                    <span className="discount-line">Direct owner rate</span>
                    <strong>{formatInr(total)}</strong>
                    <small>+ {formatInr(tax)} charges and taxes</small>
                    <button
                      className="book-cab-button select-car-button"
                      type="button"
                      onClick={() => reviewSelectedCab(item.name)}
                    >
                      Select Car
                    </button>
                  </div>
                  <div className="promise-line">
                    New Car Promise - actual owner fleet, clean VIP service
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {bookingView === "review" ? (
        <section className="review-page" ref={reviewRef}>
          <div className="review-main">
            <div className="review-titlebar">Review Your Booking</div>
            <article className="review-card">
              <h2>
                {startPoint} → {drop} <span>({tripType})</span>
              </h2>
              <p>
                Car Type: <strong>{vehicle}</strong>
              </p>
              <p>
                Package: <strong>{selectedPackage.label}</strong>
              </p>
              <p>
                Pickup Date: <strong>{formatDisplayDate(date)}, {pickupTime}</strong> · Kms
                included: <strong>{billableDistance} kms</strong>
              </p>
            </article>
            <article className="review-card">
              <h3>Contact & Pickup Details</h3>
              <div className="review-form-grid">
                <label>
                  Full Name
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Guest name"
                    required
                  />
                </label>
                <label>
                  Mobile No.
                  <input
                    value={mobile}
                    onChange={(event) => setMobile(event.target.value)}
                    placeholder="Mobile number"
                    inputMode="tel"
                    required
                  />
                </label>
                <label className="wide-field">
                  Email ID
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Email optional"
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
            {confirmedBooking ? (
              <div className="booking-confirmation" aria-live="polite">
                <span>Booking ID</span>
                <strong>{confirmedBooking.bookingId}</strong>
                <small>
                  {confirmedBooking.billableKm} km billable | Fare Rs.{" "}
                  {confirmedBooking.estimatedFare.toLocaleString("en-IN")}
                </small>
              </div>
            ) : null}
            {bookingStatus ? (
              <p className={confirmedBooking ? "booking-success" : "booking-error"}>
                {bookingStatus}
              </p>
            ) : null}
          </div>
          <aside className="payment-sidebar">
            <div className="free-cancel-note">Free cancellation till 1 hr of departure</div>
            <div className="payment-options-card">
              <h2>Payment Options</h2>
              {[
                { id: "zero", label: "Book at zero", note: `Pay ${formatInr(payableFare)} later`, amount: 0 },
                { id: "part", label: "Part Pay", note: "Pay 25% now and rest to the driver", amount: partPayAmount },
                { id: "full", label: "Full Pay", note: "Full amount", amount: payableFare },
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
                <input placeholder="Enter a coupon" />
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
                View Fare Break up
              </button>
              {paymentStatus ? <p className="payment-status">{paymentStatus}</p> : null}
            </div>
          </aside>
        </section>
      ) : null}
      <section className="trust-strip" aria-label="Service highlights">
        <div>
          <strong>Best Rate Options</strong>
          <span>Corporate-friendly pricing</span>
        </div>
        <div>
          <strong>Direct Owner Fleet</strong>
          <span>No middle commission</span>
        </div>
        <div>
          <strong>VIP Coordination</strong>
          <span>Guest movement support</span>
        </div>
        <div>
          <strong>Online Payment</strong>
          <span>Razorpay after booking</span>
        </div>
      </section>

      <section className="section" id="services">
        <div className="section-heading">
          <p className="eyebrow">Cab services</p>
          <h2>Corporate travel, airport movement and outstation trips</h2>
        </div>
        <div className="service-grid">
          {serviceTypes.map((service) => (
            <article key={service} className="service-card">
              <span className="service-icon" aria-hidden="true" />
              <h3>{service}</h3>
              <p>
                Corporate guest pickup, airport movement, in-city duty and
                outstation travel with direct owner-side booking.
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="section fleet-section" id="fleet">
        <div className="section-heading">
          <p className="eyebrow">Our fleet</p>
          <h2>Owner fleet for family, business and VIP guests</h2>
        </div>
        <div className="fleet-grid">
          {vehicles.map((item) => (
            <article className="fleet-card" key={item.name}>
              <div className="fleet-photo-placeholder" aria-hidden="true">
                <span>VT</span>
                <strong>Actual Owner Fleet</strong>
              </div>
              <div>
                <span>{item.type}</span>
                <h3>{item.name}</h3>
                <p>{item.bestFor}</p>
                <strong>{item.seats}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="payment-band" id="payment">
        <div>
          <p className="eyebrow">Payment gateway</p>
          <h2>Booking ke turant baad Razorpay payment</h2>
          <p>
            Customer pehle site par booking save karega. Booking ID milte hi
            same form me advance ya full fare Razorpay se pay kar sakta hai.
          </p>
        </div>
        <div className="payment-options">
          <span>UPI</span>
          <span>Card</span>
          <span>Netbanking</span>
          <span>Wallet</span>
        </div>
        <div className="payment-card">
          <strong>Step 1</strong>
          <span>Book cab on site</span>
          <strong>Step 2</strong>
          <span>Pay with Razorpay</span>
        </div>
      </section>

      <section className="section split-section">
        <div>
          <p className="eyebrow">Traveling in group?</p>
          <h2>Need multiple cabs or corporate booking?</h2>
          <p>
            Commission khane wale middlemen se bachne ke liye customer direct
            Vishnu Tours se trip details share karta hai. Aap route, cab,
            timing, fare aur payment ko seedha confirm kar sakte hain.
          </p>
          <a className="primary-action inline-action" href={whatsappUrl} target="_blank">
            Contact Us Now
          </a>
        </div>
        <ul className="check-list">
          <li>Airport, in-city and outstation bookings</li>
          <li>Luxury cab service for VIP and corporate guests</li>
          <li>Innova Crysta, Hycross, Ertiga, Rumion and Etios available</li>
          <li>Site booking ke baad Razorpay payment option</li>
        </ul>
      </section>

      <section className="section faq-section">
        <div className="section-heading">
          <p className="eyebrow">FAQs</p>
          <h2>Booking questions</h2>
        </div>
        <details>
          <summary>Cab booking kaise confirm hogi?</summary>
          <p>
            From/To, package aur cab select karne ke baad Book This Cab dabate
            hi booking site database me save hoti hai aur Booking ID milti hai.
          </p>
        </details>
        <details>
          <summary>Online payment gateway live hai?</summary>
          <p>
            Haan, booking save hone ke baad same form me Razorpay advance ya
            full fare payment button dikhta hai.
          </p>
        </details>
        <details>
          <summary>VIP luxury cab mil sakti hai?</summary>
          <p>
            Haan, Innova Crysta aur Hycross VIP, executive aur wedding guest
            travel ke liye priority fleet me rakhi gayi hai.
          </p>
        </details>
      </section>

      <footer className="site-footer" id="contact">
        <div>
          <strong>Vishnu Tours</strong>
          <span>Visnu S Tours & Travels</span>
        </div>
        <div>
          <a href="tel:+917004291529">Call: 7004291529</a>
          <a href={whatsappUrl} target="_blank">
            WhatsApp Help
          </a>
        </div>
      </footer>
    </main>
  );
}
