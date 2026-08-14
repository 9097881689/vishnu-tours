import { PublicFooter, PublicHeader } from "../components/PublicChrome";

export default function ContactPage() {
  return (
    <main className="simple-page simple-page-with-chrome">
      <PublicHeader />
      <section className="simple-page-card">
        <h1>Contact Vishnu Tours</h1>
        <p>Registered Enterprise: VISHNU S.TOURS &amp; TRAVELS</p>
        <p>Brand Name: Vishnu Tours</p>
        <p>Proprietor: Munna Kumar Singh</p>
        <p>Udyam Registration: UDYAM-MH-18-0242307</p>
        <p>Registered Office: 28, Lokmanya Bhadekar Sangh, Jai Hind Nagar, Khar East, Mumbai, Mumbai Suburban, Maharashtra 400051, India</p>
        <p>Email: cricketsikho@gmail.com</p>
        <p>Phone And WhatsApp: +91 7004291529</p>
        <p>Support Is Available For Booking, Payment, Cancellation, Refund, Invoice And Privacy Requests. Please Share Your Booking Number When Contacting Us About An Existing Ride.</p>
        <a className="simple-page-button" href="https://wa.me/917004291529" target="_blank">Open WhatsApp</a>
      </section>
      <PublicFooter />
    </main>
  );
}
