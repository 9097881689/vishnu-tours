"use client";

import { FormEvent, useMemo, useState } from "react";

const whatsappNumber = "917004291529";

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
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [paymentMode, setPaymentMode] = useState("Pay advance after fare confirmation");

  const bookingText = useMemo(() => {
    return [
      "Namaste Vishnu Tours, mujhe cab booking karni hai.",
      `Trip: ${tripType}`,
      `Cab: ${vehicle}`,
      `Pickup: ${pickup || "Please confirm"}`,
      `Destination: ${drop || "Please confirm"}`,
      `Date/Time: ${date || "Please confirm"}`,
      `Name: ${name || "Guest"}`,
      `Mobile: ${mobile || "Please confirm"}`,
      `Payment: ${paymentMode}`,
    ].join("\n");
  }, [tripType, vehicle, pickup, drop, date, name, mobile, paymentMode]);

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    bookingText,
  )}`;

  function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#home" aria-label="Vishnu Tours home">
          <span className="brand-mark">VT</span>
          <span>
            <strong>Vishnu Tours</strong>
            <small>Visnu S Tours & Travels</small>
          </span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#services">Services</a>
          <a href="#fleet">Fleet</a>
          <a href="#payment">Payment</a>
          <a href="#contact">Contact</a>
        </nav>
        <a className="call-button" href="tel:+917004291529">
          Call 7004291529
        </a>
      </header>

      <section className="hero" id="home">
        <div className="hero-media" aria-hidden="true">
          <img
            src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=85"
            alt=""
          />
        </div>
        <div className="hero-content">
          <div className="hero-copy">
            <p className="eyebrow">Ready to book cab service</p>
            <h1>Vishnu Tours</h1>
            <p>
              Innova Crysta, Hycross, Ertiga, Rumion aur Etios ke saath local,
              outstation, round trip aur VIP luxury cab booking.
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
              <span>Quick Booking</span>
              <strong>Direct WhatsApp Confirm</strong>
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
              Pickup location
              <input
                value={pickup}
                onChange={(event) => setPickup(event.target.value)}
                placeholder="City, hotel, station or address"
                required
              />
            </label>
            <label>
              Destination
              <input
                value={drop}
                onChange={(event) => setDrop(event.target.value)}
                placeholder="Where do you want to go?"
                required
              />
            </label>
            <div className="form-grid">
              <label>
                Date and time
                <input
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  type="datetime-local"
                  required
                />
              </label>
              <label>
                Cab type
                <select
                  value={vehicle}
                  onChange={(event) => setVehicle(event.target.value)}
                >
                  {vehicles.map((item) => (
                    <option key={item.name}>{item.name}</option>
                  ))}
                </select>
              </label>
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
            <button className="submit-button" type="submit">
              Continue on WhatsApp
            </button>
            <p className="microcopy">
              Fare, driver details and payment link are confirmed by Vishnu
              Tours before final booking.
            </p>
          </form>
        </div>
      </section>

      <section className="trust-strip" aria-label="Service highlights">
        <div>
          <strong>24x7</strong>
          <span>Booking support</span>
        </div>
        <div>
          <strong>5+</strong>
          <span>Cab options</span>
        </div>
        <div>
          <strong>VIP</strong>
          <span>Luxury service</span>
        </div>
        <div>
          <strong>Local + Outstation</strong>
          <span>Flexible trips</span>
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
          <p className="eyebrow">Payment gateway ready</p>
          <h2>Advance payment link can be connected</h2>
          <p>
            Abhi booking WhatsApp par confirm hoti hai. Razorpay, PhonePe,
            PayU, Cashfree ya UPI QR details milte hi isi section se online
            advance payment live kiya ja sakta hai.
          </p>
        </div>
        <div className="payment-options">
          <span>UPI</span>
          <span>Card</span>
          <span>Netbanking</span>
          <span>Wallet</span>
        </div>
        <a className="primary-action" href={whatsappUrl} target="_blank">
          Request Payment Link
        </a>
      </section>

      <section className="section split-section">
        <div>
          <p className="eyebrow">Why Vishnu Tours</p>
          <h2>Direct booking means better control and better fare</h2>
          <p>
            Commission khane wale middlemen se bachne ke liye customer direct
            Vishnu Tours se trip details share karta hai. Aap route, cab,
            timing, fare aur payment ko seedha confirm kar sakte hain.
          </p>
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
            Site payment gateway ke liye ready hai. Merchant account keys ya UPI
            QR milte hi advance payment button live ho jayega.
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
