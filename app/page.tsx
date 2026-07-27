"use client";

import { useMemo, useState } from "react";

const whatsappNumber = "917004291529";
const headOffice = "Mumbai Head Office";
const perKmRate = 16;
const fromSuggestions = [
  "Mumbai Head Office",
  "Mumbai Airport",
  "Mumbai Central",
  "Dadar Mumbai",
  "Andheri Mumbai",
  "Navi Mumbai",
  "Thane Mumbai",
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
  }
}

const vehicles = [
  {
    name: "Toyota Innova Crysta",
    type: "Premium MUV",
    seats: "6-7 seats",
    bestFor: "VIP, family, airport and highway travel",
    image:
      "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Toyota Hycross",
    type: "Luxury Hybrid",
    seats: "6-7 seats",
    bestFor: "Executive guests, weddings and long routes",
    image:
      "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Maruti Ertiga",
    type: "Comfort MUV",
    seats: "6-7 seats",
    bestFor: "Round trip, family tour and station pickup",
    image:
      "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Maruti Rumion",
    type: "Spacious MUV",
    seats: "6-7 seats",
    bestFor: "Local booking, outstation and group travel",
    image:
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Toyota Etios",
    type: "Sedan",
    seats: "4 seats",
    bestFor: "City rides, business visits and one day travel",
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80",
  },
];

const serviceTypes = [
  "Outstation Cab",
  "Round Trip",
  "Local Rental",
  "VIP Luxury Cab",
  "Airport / Railway Pickup",
  "Wedding / Corporate Booking",
];

type PackageId = (typeof packageOptions)[number]["id"];

function getDestinationDistance(destination: string) {
  return destinationDistances[destination.trim().toLowerCase()];
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

export default function Home() {
  const [tripType, setTripType] = useState("Outstation Cab");
  const [vehicle, setVehicle] = useState("Toyota Innova Crysta");
  const [startPoint, setStartPoint] = useState(headOffice);
  const [drop, setDrop] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [packageType, setPackageType] = useState<PackageId>("perKm");
  const [paymentMode, setPaymentMode] = useState("Pay advance after fare confirmation");
  const [advanceAmount, setAdvanceAmount] = useState("500");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [bookingStatus, setBookingStatus] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<{
    bookingId: string;
    estimatedFare: number;
    billableKm: number;
    ratePerKm: number;
  } | null>(null);
  const numericDistance = Math.max(0, Number(distanceKm) || 0);
  const billableDistance =
    tripType === "Round Trip" ? numericDistance * 2 : numericDistance;
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
  const formattedFare = formatInr(fareTotal);

  const bookingText = useMemo(() => {
    return [
      "Namaste Vishnu Tours, mujhe cab booking karni hai.",
      `Trip: ${tripType}`,
      `Cab: ${vehicle}`,
      `Start Point: ${startPoint}`,
      `Destination: ${drop || "Please confirm"}`,
      `One-side Distance: ${numericDistance || "Please confirm"} km`,
      `Billable Distance: ${billableDistance || "Please confirm"} km`,
      `Rate: ${selectedVehicleRate?.fareLabel || `Rs. ${perKmRate}/km`}`,
      `Estimated Fare: ${fareTotal ? formattedFare : "Please confirm"}`,
      `Date/Time: ${date || "Please confirm"}`,
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
    date,
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
    const distance = getDestinationDistance(value);

    if (distance) {
      setDistanceKm(String(distance));
    }
  }

  async function submitBooking(selectedCab = vehicle) {
    if (!drop || !numericDistance || !date || !name || !mobile) {
      setBookingStatus("Please From/To, KM, date, name aur mobile fill karein.");
      return;
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
          date,
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
        return;
      }

      setConfirmedBooking(result.booking);
      setAdvanceAmount(String(result.booking.estimatedFare));
      setBookingStatus(`${selectedCab} booking site par live save ho gayi.`);
    } catch {
      setBookingStatus("Network issue ki wajah se booking save nahi ho payi.");
    } finally {
      setIsBooking(false);
    }
  }

  async function startPayment() {
    const amount = Number(advanceAmount);

    if (!amount || amount < 1) {
      setPaymentStatus("Please enter a valid advance amount.");
      return;
    }

    if (!confirmedBooking) {
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
            bookingId: confirmedBooking.bookingId,
            name,
            mobile,
            pickup: startPoint,
            drop,
            vehicle,
            tripType,
            distanceKm: String(numericDistance),
            packageType,
            estimatedFare: String(confirmedBooking.estimatedFare),
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
      description: `${confirmedBooking.bookingId} ${tripType} booking`,
      prefill: {
        name,
        contact: mobile,
      },
      notes: {
        bookingId: confirmedBooking.bookingId,
        pickup: startPoint,
        drop,
        vehicle,
        tripType,
        distanceKm: String(numericDistance),
        packageType,
        estimatedFare: String(confirmedBooking.estimatedFare),
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
          <img
            src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80"
            alt=""
          />
        </div>
        <div className="hero-content">
          <div className="hero-copy">
            <p className="eyebrow">Visnu S Tours & Travels</p>
            <h1>Book Taxi Online With Vishnu Tours</h1>
              <p>
            Local, outstation, round trip aur VIP luxury cab service ke liye
                direct site booking. From/To select karke distance, package,
                cab-wise fare aur Razorpay payment ek hi flow me milega.
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
            className="booking-panel"
            id="booking"
            onSubmit={(event) => {
              event.preventDefault();
              submitBooking(vehicle);
            }}
          >
            <div className="panel-head">
              <span>Mumbai se all India booking</span>
              <strong>Book Your Ride</strong>
            </div>
            <datalist id="from-suggestions">
              {fromSuggestions.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
            <datalist id="destination-suggestions">
              {destinationSuggestions.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
            <div className="trip-tabs" role="tablist" aria-label="Trip type">
              {["Outstation Cab", "Round Trip", "Local Rental", "VIP Luxury Cab"].map(
                (type) => (
                  <button
                    key={type}
                    type="button"
                    className={tripType === type ? "active" : ""}
                    onClick={() => setTripType(type)}
                  >
                    {type}
                  </button>
                ),
              )}
            </div>
            <label>
              From
              <input
                value={startPoint}
                onChange={(event) => setStartPoint(event.target.value)}
                list="from-suggestions"
                placeholder="Mumbai Head Office"
                required
              />
            </label>
            <label>
              To
              <input
                value={drop}
                onChange={(event) => updateDestination(event.target.value)}
                list="destination-suggestions"
                placeholder="City select karein, example Pune"
                required
              />
            </label>
            <div className="form-grid">
              <label>
                Distance from Mumbai (KM)
                <input
                  value={distanceKm}
                  onChange={(event) => setDistanceKm(event.target.value)}
                  placeholder="Example: 250"
                  inputMode="numeric"
                  required
                />
              </label>
              <label>
                Pickup date and time
                <input
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  type="datetime-local"
                  required
                />
              </label>
            </div>
            <div className="package-grid" aria-label="Select package">
              {packageOptions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={packageType === item.id ? "package-card active" : "package-card"}
                  onClick={() => {
                    setPackageType(item.id);
                    if (item.id === "vip") {
                      setTripType("VIP Luxury Cab");
                    }
                  }}
                >
                  <strong>{item.label}</strong>
                  <span>{item.description}</span>
                </button>
              ))}
            </div>
            <div className="fare-box" aria-live="polite">
              <span>Selected estimate</span>
              <strong>{formattedFare}</strong>
              <small>
                {packageType === "perKm"
                  ? `${billableDistance || 0} km x ${selectedVehicleRate?.fareLabel || `Rs. ${perKmRate}/km`}`
                  : `${selectedPackage.label} | ${selectedVehicleRate?.name}`}
              </small>
              <small>
                Distance Mumbai se approximate hai. Unknown city ke liye KM
                manually edit karein.
              </small>
            </div>
            <div className="form-grid">
              <label>
                Your name
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Guest name"
                  required
                />
              </label>
              <label>
                Mobile number
                <input
                  value={mobile}
                  onChange={(event) => setMobile(event.target.value)}
                  placeholder="Your phone number"
                  inputMode="tel"
                  required
                />
              </label>
            </div>
            <label>
              Payment preference
              <select
                value={paymentMode}
                onChange={(event) => setPaymentMode(event.target.value)}
              >
                <option>Pay advance after fare confirmation</option>
                <option>UPI payment link required</option>
                <option>Cash after trip</option>
                <option>Corporate billing</option>
              </select>
            </label>
            <div className="vehicle-rate-list" aria-live="polite">
              {vehicleRates.map((item) => (
                <article
                  key={item.name}
                  className={vehicle === item.name ? "vehicle-rate-card active" : "vehicle-rate-card"}
                >
                  <div>
                    <span className="vehicle-tag">{item.tag}</span>
                    <strong>{item.name}</strong>
                    <small>{item.seats} | {item.type}</small>
                  </div>
                  <div className="vehicle-rate-meta">
                    <span>{item.fareLabel}</span>
                    <strong>{formatInr(item.estimatedFare)}</strong>
                  </div>
                  <button
                    className="book-cab-button"
                    type="button"
                    onClick={() => submitBooking(item.name)}
                    disabled={isBooking}
                  >
                    {isBooking && vehicle === item.name ? "Saving..." : "Book This Cab"}
                  </button>
                </article>
              ))}
            </div>
            {bookingStatus ? (
              <p className={confirmedBooking ? "booking-success" : "booking-error"}>
                {bookingStatus}
              </p>
            ) : null}
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
            {confirmedBooking ? (
              <div className="post-booking-payment">
                <div>
                  <span>Payment option</span>
                  <strong>Pay after booking</strong>
                  <small>Use Razorpay for advance or full fare.</small>
                </div>
                <div className="payment-choice-row">
                  <button
                    type="button"
                    onClick={() =>
                      setAdvanceAmount(
                        String(Math.max(500, Math.round(confirmedBooking.estimatedFare * 0.2))),
                      )
                    }
                  >
                    20% Advance
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdvanceAmount(String(confirmedBooking.estimatedFare))}
                  >
                    Full Fare
                  </button>
                </div>
                <label>
                  Payment amount
                  <input
                    value={advanceAmount}
                    onChange={(event) => setAdvanceAmount(event.target.value)}
                    inputMode="numeric"
                  />
                </label>
                <button
                  className="submit-button"
                  type="button"
                  onClick={startPayment}
                  disabled={isPaying}
                >
                  {isPaying ? "Opening Razorpay..." : "Pay with Razorpay"}
                </button>
                {paymentStatus ? <p className="payment-status">{paymentStatus}</p> : null}
              </div>
            ) : null}
            <p className="microcopy">
              Booking site par live save hoti hai. Etios Rs. 16/km se start,
              baaki cab ka rate card ke hisab se calculate hota hai.
            </p>
          </form>
        </div>
      </section>

      <section className="trust-strip" aria-label="Service highlights">
        <div>
          <strong>Best Rate Options</strong>
          <span>Direct fare confirmation</span>
        </div>
        <div>
          <strong>Save Commission</strong>
          <span>Owner-side booking</span>
        </div>
        <div>
          <strong>24x7 Support</strong>
          <span>Call and WhatsApp help</span>
        </div>
        <div>
          <strong>Secure Payment</strong>
          <span>UPI gateway ready</span>
        </div>
      </section>

      <section className="section" id="services">
        <div className="section-heading">
          <p className="eyebrow">Cab services</p>
          <h2>Book for any route, any purpose</h2>
        </div>
        <div className="service-grid">
          {serviceTypes.map((service) => (
            <article key={service} className="service-card">
              <span className="service-icon" aria-hidden="true" />
              <h3>{service}</h3>
              <p>
                Clean cab, trained driver, transparent fare discussion and
                direct owner-side booking without extra commission pressure.
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="section fleet-section" id="fleet">
        <div className="section-heading">
          <p className="eyebrow">Our fleet</p>
          <h2>Comfortable cars for family, business and VIP guests</h2>
        </div>
        <div className="fleet-grid">
          {vehicles.map((item) => (
            <article className="fleet-card" key={item.name}>
              <img src={item.image} alt={`${item.name} cab service`} />
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
          <li>Outstation, round trip and local packages</li>
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
