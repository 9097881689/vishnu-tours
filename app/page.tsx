"use client";

import { FormEvent, useMemo, useState } from "react";

const whatsappNumber = "917004291529";
const headOffice = "Mumbai Head Office";
const perKmRate = 16;

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

export default function Home() {
  const [tripType, setTripType] = useState("Outstation Cab");
  const [vehicle, setVehicle] = useState("Toyota Innova Crysta");
  const [drop, setDrop] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [packageType, setPackageType] = useState("Rs. 16/km Mumbai start");
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
  } | null>(null);
  const numericDistance = Math.max(0, Number(distanceKm) || 0);
  const billableDistance =
    tripType === "Round Trip" ? numericDistance * 2 : numericDistance;
  const fareTotal = billableDistance * perKmRate;
  const formattedFare = fareTotal
    ? new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(fareTotal)
    : "Enter KM";

  const bookingText = useMemo(() => {
    return [
      "Namaste Vishnu Tours, mujhe cab booking karni hai.",
      `Trip: ${tripType}`,
      `Cab: ${vehicle}`,
      `Start Point: ${headOffice}`,
      `Destination: ${drop || "Please confirm"}`,
      `One-side Distance: ${numericDistance || "Please confirm"} km`,
      `Billable Distance: ${billableDistance || "Please confirm"} km`,
      `Rate: Rs. ${perKmRate}/km`,
      `Estimated Fare: ${fareTotal ? formattedFare : "Please confirm"}`,
      `Date/Time: ${date || "Please confirm"}`,
      `Name: ${name || "Guest"}`,
      `Mobile: ${mobile || "Please confirm"}`,
      `Package: ${packageType}`,
      `Payment: ${paymentMode}`,
    ].join("\n");
  }, [
    tripType,
    vehicle,
    drop,
    numericDistance,
    billableDistance,
    fareTotal,
    formattedFare,
    date,
    name,
    mobile,
    packageType,
    paymentMode,
  ]);

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    bookingText,
  )}`;

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsBooking(true);
    setBookingStatus("");
    setConfirmedBooking(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripType,
          vehicle,
          destination: drop,
          distanceKm: numericDistance,
          date,
          name,
          mobile,
          paymentMode,
        }),
      });
      const result = (await response.json()) as {
        booking?: {
          bookingId: string;
          estimatedFare: number;
          billableKm: number;
        };
        error?: string;
      };

      if (!response.ok || !result.booking) {
        setBookingStatus(result.error || "Booking save nahi ho payi.");
        return;
      }

      setConfirmedBooking(result.booking);
      setAdvanceAmount(String(result.booking.estimatedFare));
      setBookingStatus("Booking site par live save ho gayi.");
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
            pickup: headOffice,
            drop,
            vehicle,
            tripType,
            distanceKm: String(numericDistance),
            estimatedFare: String(fareTotal),
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
        pickup: headOffice,
        drop,
        vehicle,
        tripType,
        distanceKm: String(numericDistance),
        estimatedFare: String(fareTotal),
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
                direct booking. Start point Mumbai Head Office rahega aur fare
                Rs. 16/km ke hisab se calculate hoga.
              </p>
            <div className="hero-actions">
              <a className="primary-action" href="#booking">
                Book Cab Now
              </a>
              <a className="secondary-action" href={whatsappUrl} target="_blank">
                WhatsApp Booking
              </a>
            </div>
          </div>

          <form className="booking-panel" id="booking" onSubmit={submitBooking}>
            <div className="panel-head">
              <span>Mumbai se all India booking</span>
              <strong>Book Your Ride</strong>
            </div>
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
              Start Location
              <input value={headOffice} readOnly aria-readonly="true" />
            </label>
            <label>
              Enter Destination
              <input
                value={drop}
                onChange={(event) => setDrop(event.target.value)}
                placeholder="Business, place or city name"
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
            <div className="form-grid">
              <label>
                Select Cab
                <select
                  value={vehicle}
                  onChange={(event) => setVehicle(event.target.value)}
                >
                  {vehicles.map((item) => (
                    <option key={item.name}>{item.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Select Package
                <select
                  value={packageType}
                  onChange={(event) => setPackageType(event.target.value)}
                >
                  <option>Rs. 16/km Mumbai start</option>
                  <option>Full day local rental</option>
                  <option>Half day local rental</option>
                  <option>VIP / corporate package</option>
                </select>
              </label>
            </div>
            <div className="fare-box" aria-live="polite">
              <span>Estimated fare</span>
              <strong>{formattedFare}</strong>
              <small>
                {tripType === "Round Trip"
                  ? `${numericDistance || 0} km x 2 x Rs. ${perKmRate}/km`
                  : `${numericDistance || 0} km x Rs. ${perKmRate}/km`}
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
            <button className="submit-button" type="submit" disabled={isBooking}>
              {isBooking ? "Saving Booking..." : "Book Now"}
            </button>
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
              Booking site par live save hoti hai. Fare Rs. 16/km Mumbai start
              point se calculate hota hai.
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
          <li>Direct WhatsApp booking with payment link request</li>
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
            Form submit karte hi WhatsApp par complete trip details jayengi.
            Vishnu Tours fare, driver aur payment confirm karega.
          </p>
        </details>
        <details>
          <summary>Online payment gateway live hai?</summary>
          <p>
            Razorpay checkout code add hai. Aapki Razorpay Merchant Key ID add
            karte hi advance payment button live charge accept karega.
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
            WhatsApp Booking
          </a>
        </div>
      </footer>
    </main>
  );
}
