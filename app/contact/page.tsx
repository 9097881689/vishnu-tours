import { PublicFooter, PublicHeader } from "../components/PublicChrome";

export default function ContactPage() {
  return (
    <main className="simple-page simple-page-with-chrome">
      <PublicHeader />
      <section className="simple-page-card">
        <h1>Contact Vishnu Tours</h1>
        <p>Head Office: Mumbai, Maharashtra, India</p>
        <p>Email: cricketsikho@gmail.com</p>
        <p>Phone And WhatsApp: +91 7004291529</p>
        <a className="simple-page-button" href="https://wa.me/917004291529" target="_blank">Open WhatsApp</a>
      </section>
      <PublicFooter />
    </main>
  );
}
