import Image from "next/image";
import Link from "next/link";
import { Building2, CalendarCheck2, Crown, MapPinned, Plane, Route } from "lucide-react";
import { PublicFooter, PublicHeader } from "../components/PublicChrome";

const services = [
  { icon: Plane, title: "Airport Transfers", copy: "Mumbai Airport T1 and T2 pickup or drop with timely cab coordination.", link: "/#booking" },
  { icon: Building2, title: "Corporate Travel", copy: "Reliable guest movement for meetings, site visits, hotels and executive schedules.", link: "/corporate-travel" },
  { icon: MapPinned, title: "Mumbai Local Duty", copy: "Flexible 4, 8 and 10 hour packages for appointments, visits and city movement.", link: "/#booking" },
];

export default function ServicesPage() {
  return (
    <main className="stitch-public-page stitch-services-page">
      <PublicHeader />
      <section className="stitch-services-intro stitch-shell"><span className="stitch-kicker">Travel Solutions</span><h1>Executive Travel Services</h1><p>Purpose-built cab services for business guests, airport movement, Mumbai travel and outstation journeys.</p></section>
      <section className="stitch-services-grid stitch-shell">
        {services.map(({ icon: Icon, title, copy, link }) => <article className="stitch-service-card" key={title}><span className="stitch-icon-box"><Icon /></span><h2>{title}</h2><p>{copy}</p><Link href={link}>Explore Service</Link></article>)}
        <article className="stitch-service-card stitch-service-wide"><div><span className="stitch-icon-box"><Route /></span><h2>All India Outstation</h2><p>Comfortable one-way and round-trip travel from Mumbai for business tours, family journeys and long routes across India.</p><div className="stitch-service-tags"><span>One Way</span><span>Round Trip</span><span>Per KM Fare</span></div><Link href="/#booking">Plan An Outstation Trip</Link></div><div className="stitch-service-photo"><Image src="/stitch/services-outstation.jpg" alt="Outstation cab on an open highway" fill sizes="(max-width: 800px) 100vw, 35vw" /></div></article>
        <article className="stitch-service-card stitch-vip-card"><span className="stitch-icon-box"><Crown /></span><div><h2>VIP Event Movement</h2><p>Premium cab coordination for weddings, events, executives and special guest movement.</p></div><Link href="https://wa.me/917004291529" target="_blank">Request Coordination</Link></article>
      </section>
      <section className="stitch-business-band"><div className="stitch-shell stitch-business-details"><div><CalendarCheck2 /><span>Direct Booking</span><strong>Clear Confirmation And Journey Updates</strong></div><div><span>Registered Enterprise</span><strong>VISHNU S.TOURS &amp; TRAVELS</strong></div><div><span>Service Base</span><strong>Mumbai, Maharashtra</strong></div></div></section>
      <PublicFooter />
    </main>
  );
}
