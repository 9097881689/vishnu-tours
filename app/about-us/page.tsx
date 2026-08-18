import { PublicFooter, PublicHeader } from "../components/PublicChrome";

export default function AboutUsPage() {
  return (
    <main className="simple-page simple-page-with-chrome">
      <PublicHeader />
      <section className="simple-page-card about-business-page">
        <span>Registered Mumbai Travel Service</span>
        <h1>About Vishnu Tours</h1>
        <p>
          Vishnu Tours Is The Customer-Facing Brand Of VISHNU S.TOURS &amp;
          TRAVELS, A Mumbai-Based Proprietorship Providing Corporate Cab,
          Airport Transfer, In-City Rental And Outstation Travel Services.
        </p>
        <p>
          The Enterprise Has Been Operating Since September 2016 And Focuses On
          Confirmed Vehicle Assignment, Clear Fare Information And Coordinated
          Travel From Mumbai For Business Guests, Families And VIP Movement.
        </p>

        <h2>Registered Business Details</h2>
        <dl className="about-business-details">
          <div>
            <dt>Registered Enterprise Name</dt>
            <dd>VISHNU S.TOURS &amp; TRAVELS</dd>
          </div>
          <div>
            <dt>Brand Name</dt>
            <dd>Vishnu Tours</dd>
          </div>
          <div>
            <dt>Constitution</dt>
            <dd>Proprietorship</dd>
          </div>
          <div>
            <dt>Proprietor</dt>
            <dd>Munna Kumar Singh</dd>
          </div>
          <div>
            <dt>Enterprise Classification</dt>
            <dd>Micro Enterprise</dd>
          </div>
          <div>
            <dt>Major Activity</dt>
            <dd>Services</dd>
          </div>
          <div>
            <dt>Business Activity</dt>
            <dd>Travel Agency, Tour Operator And Reservation Services</dd>
          </div>
          <div>
            <dt>Business Commencement</dt>
            <dd>10 September 2016</dd>
          </div>
          <div>
            <dt>Udyam Registration</dt>
            <dd>UDYAM-MH-18-0242307</dd>
          </div>
          <div>
            <dt>Udyam Registration Date</dt>
            <dd>29 May 2023</dd>
          </div>
        </dl>

        <h2>Registered Office</h2>
        <p>
          28, Lokmanya Bhadekar Sangh, Jai Hind Nagar, Khar East, Mumbai,
          Mumbai Suburban, Maharashtra 400051, India.
        </p>

        <h2>Booking Support</h2>
        <p>
          For Cab Booking, Payment, Invoice Or Ride Support, Call Or WhatsApp
          +91 7004291529.
        </p>
      </section>
      <PublicFooter hideEmail />
    </main>
  );
}
