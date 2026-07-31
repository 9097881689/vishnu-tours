import { PublicFooter, PublicHeader } from "../components/PublicChrome";

export default function TermsPage() {
  return (
    <main className="simple-page simple-page-with-chrome">
      <PublicHeader />
      <section className="simple-page-card">
        <h1>Terms And Conditions</h1>
        <p>All Bookings Are Subject To Cab Availability, Route Feasibility, Driver Assignment And Fare Confirmation.</p>
        <p>Mumbai Pickup Is Required For Regular Website Bookings. Toll, Parking, State Tax, Permit, Night Charges, Waiting And Extra KM May Apply Where Applicable.</p>
        <p>Customers Must Provide Correct Journey Details. Vishnu Tours May Contact The Customer To Confirm Route, Timing, Cab Type And Payment Before Travel.</p>
        <p>Driver And Vehicle Details May Be Shared After Booking Confirmation And Assignment.</p>
      </section>
      <PublicFooter />
    </main>
  );
}
