import { Building2, Mail, MapPin, MessageCircle, PhoneCall } from "lucide-react";
import { PublicFooter, PublicHeader } from "../components/PublicChrome";

export default function ContactPage() {
  return (
    <main className="stitch-public-page">
      <PublicHeader />
      <section className="stitch-contact-hero"><div className="stitch-shell"><span className="stitch-kicker light">Vishnu Tours Support</span><h1>Get In Touch</h1><p>Our team is ready to help with booking, payment, invoice and journey coordination.</p></div></section>
      <section className="stitch-contact-layout stitch-shell">
        <div className="stitch-contact-info"><span className="stitch-kicker">Contact Information</span><h2>Talk To Our Mumbai Team</h2><p>Share your route, pickup date and preferred cab for faster assistance.</p>
          <div className="stitch-contact-cards">
            <article><MapPin /><div><h3>Office Location</h3><p>28, Lokmanya Bhadekar Sangh, Jai Hind Nagar, Khar East, Mumbai, Maharashtra 400051, India.</p></div></article>
            <article><PhoneCall /><div><h3>Call Us</h3><a href="tel:+917004291529">+91 7004291529</a></div></article>
            <article><MessageCircle /><div><h3>WhatsApp</h3><a href="https://wa.me/917004291529" target="_blank">Chat With Booking Support</a></div></article>
            <article><Mail /><div><h3>Booking Email</h3><p>Available on your booking confirmation and invoice.</p></div></article>
          </div>
        </div>
        <form className="stitch-inquiry-card" action="https://wa.me/917004291529" method="get" target="_blank">
          <span className="stitch-kicker">Send An Inquiry</span><h2>Plan Your Journey</h2>
          <label>Full Name<input name="name" required placeholder="Enter your name" /></label>
          <div className="stitch-form-pair"><label>Mobile Number<input name="phone" required inputMode="tel" placeholder="10-digit number" /></label><label>Trip Type<select name="trip"><option>Outstation</option><option>Airport Transfer</option><option>In-City</option><option>Corporate Travel</option></select></label></div>
          <label>Journey Requirement<textarea name="text" rows={4} placeholder="Pickup, destination, date and preferred cab" /></label>
          <button type="submit">Send On WhatsApp</button>
        </form>
      </section>
      <section className="stitch-business-band"><div className="stitch-shell stitch-business-details"><div><Building2 /><span>Registered Enterprise</span><strong>VISHNU S.TOURS &amp; TRAVELS</strong></div><div><span>Udyam</span><strong>UDYAM-MH-18-0242307</strong></div><div><span>Support</span><strong>Booking, Payment, Refund And Invoice</strong></div></div></section>
      <PublicFooter hideEmail />
    </main>
  );
}
