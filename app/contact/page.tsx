import { PublicFooter, PublicHeader } from "../components/PublicChrome";

export default function ContactPage() {
  return (
    <main className="simple-page simple-page-with-chrome">
      <PublicHeader />
      <section className="simple-page-card">
        <h1>Contact Vishnu Tours</h1>
        <p>Legal Name: Visnu S Tours &amp; Travels</p>
        <p>Trade Name: Munni Devi</p>
        <p>Business Location: Mumbai, Maharashtra, India</p>
        <p>Email: cricketsikho@gmail.com</p>
        <p>Phone And WhatsApp: +91 7004291529</p>
        <p>Support Is Available For Booking, Payment, Cancellation, Refund, Invoice And Privacy Requests. Please Share Your Booking Number When Contacting Us About An Existing Ride.</p>
        <a className="simple-page-button" href="https://wa.me/917004291529" target="_blank">Open WhatsApp</a>
      </section>
      <PublicFooter />
    </main>
  );
}
