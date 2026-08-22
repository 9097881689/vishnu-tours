import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, BriefcaseBusiness, Building2, CalendarRange, Clock3, Headphones, UsersRound } from "lucide-react";
import { PublicFooter, PublicHeader } from "../components/PublicChrome";

const solutions = [
  { icon: BriefcaseBusiness, title: "Priority VIP Movement", copy: "Dedicated executive cabs for leadership teams, corporate guests and airport arrivals." },
  { icon: CalendarRange, title: "Monthly Retainers", copy: "Planned vehicle requirements with direct coordination for recurring business travel." },
  { icon: UsersRound, title: "Employee Pickup And Drop", copy: "Custom cab movement for teams, shifts, meetings and scheduled office duties." },
];

export default function CorporateTravelPage() {
  return (
    <main className="stitch-public-page stitch-corporate-page">
      <PublicHeader />
      <section className="stitch-corporate-hero"><Image src="/stitch/about-corporate.png" alt="Corporate cab service in Mumbai" fill priority sizes="100vw" /><div className="stitch-corporate-overlay" /><div className="stitch-shell stitch-corporate-hero-copy"><span className="stitch-kicker light">Corporate Mobility From Mumbai</span><h1>Elevate Your Corporate Travel Experience.</h1><p>Professional chauffeurs, premium vehicles and direct journey coordination for every important guest.</p><div><Link href="#proposal">Request A Proposal</Link><Link href="tel:+917004291529">Speak To Our Team</Link></div></div></section>
      <section className="stitch-section stitch-shell"><div className="stitch-section-heading"><span className="stitch-kicker">Business Solutions</span><h2>Tailored Corporate Services</h2><p>Flexible travel support for individual executives, departments and multi-cab events.</p></div><div className="stitch-corporate-solutions">{solutions.map(({ icon: Icon, title, copy }) => <article key={title}><span className="stitch-icon-box"><Icon /></span><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
      <section className="stitch-corporate-dark"><div className="stitch-shell"><div><span className="stitch-kicker light">Why Partner With Us</span><h2>Travel Coordination Your Team Can Depend On</h2><p>One booking partner for airport movement, local duties, intercity travel and VIP schedules.</p><ul className="stitch-check-list light"><li>Direct owner-side coordination</li><li>Transparent fare and invoice support</li><li>Confirmed driver and vehicle details</li><li>Live journey status for each booking</li></ul></div><div className="stitch-corporate-stats"><article><Clock3 /><strong>24/7</strong><span>Booking Support</span></article><article><Building2 /><strong>Mumbai</strong><span>Pickup Base</span></article><article><BadgeCheck /><strong>Registered</strong><span>MSME Enterprise</span></article><article><Headphones /><strong>Direct</strong><span>Journey Coordination</span></article></div></div></section>
      <section className="stitch-proposal-section stitch-shell" id="proposal"><div><span className="stitch-kicker">Corporate Enquiry</span><h2>Request A Proposal</h2><p>Tell us your travel requirement. Our team will coordinate a clear vehicle and fare plan.</p><div className="stitch-photo-frame"><Image src="/home/corporate-transfer.png" alt="Corporate guest cab transfer" fill sizes="(max-width: 800px) 100vw, 45vw" /></div></div><form className="stitch-inquiry-card" action="https://wa.me/917004291529" method="get" target="_blank"><label>Company Name<input name="company" required placeholder="Enter company name" /></label><div className="stitch-form-pair"><label>Contact Person<input name="name" required placeholder="Full name" /></label><label>Mobile Number<input name="phone" inputMode="tel" required placeholder="10-digit number" /></label></div><label>Travel Requirement<select name="service"><option>Executive Movement</option><option>Airport Transfers</option><option>Monthly Retainer</option><option>Employee Pickup And Drop</option><option>Event Logistics</option></select></label><label>Requirement Details<textarea name="text" rows={5} placeholder="Number of cabs, dates, route and preferred vehicle" /></label><button type="submit">Send Corporate Enquiry</button></form></section>
      <PublicFooter />
    </main>
  );
}
