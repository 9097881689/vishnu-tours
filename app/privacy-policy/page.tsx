import { PublicFooter, PublicHeader } from "../components/PublicChrome";

export default function PrivacyPolicyPage() {
  return (
    <main className="simple-page simple-page-with-chrome">
      <PublicHeader />
      <section className="simple-page-card">
        <h1>Privacy Policy</h1>
        <p>Vishnu Tours Collects Booking Details Such As Name, Mobile Number, Email, Pickup Location, Drop Location, Travel Date, Cab Choice And Payment Status To Manage Cab Bookings.</p>
        <p>Customer Information Is Used For Booking Confirmation, Driver Coordination, Payment Updates, Invoice Support And Customer Service.</p>
        <p>We Do Not Sell Customer Data. Information May Be Shared Only With Assigned Drivers, Payment Providers Or Service Partners Required To Complete The Booking.</p>
        <p>For Privacy Requests, Contact Us At cricketsikho@gmail.com Or WhatsApp +91 7004291529.</p>
      </section>
      <PublicFooter />
    </main>
  );
}
