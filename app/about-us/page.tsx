import Image from "next/image";
import Link from "next/link";
import { BadgeIndianRupee, Clock3, ShieldCheck, UserRoundCheck } from "lucide-react";
import { PublicFooter, PublicHeader } from "../components/PublicChrome";

const values = [
  { icon: ShieldCheck, title: "Safety First", copy: "Clean vehicles, verified drivers and coordinated pickup for every confirmed journey." },
  { icon: UserRoundCheck, title: "Professional Chauffeurs", copy: "Courteous, experienced drivers prepared for corporate, family and VIP travel." },
  { icon: BadgeIndianRupee, title: "Transparent Pricing", copy: "Clear package and per KM pricing with fare details shown before confirmation." },
  { icon: Clock3, title: "24/7 Support", copy: "Direct booking and journey coordination on call and WhatsApp whenever you need us." },
];

export default function AboutUsPage() {
  return (
    <main className="stitch-public-page">
      <PublicHeader />
      <section className="stitch-about-hero stitch-shell">
        <div className="stitch-about-copy">
          <span className="stitch-kicker">Our Mission</span>
          <h1>Professional Travel, Delivered With Care.</h1>
          <p>Vishnu Tours provides dependable corporate cabs, airport transfers, Mumbai local duty and outstation travel with direct coordination and a premium owner-fleet experience.</p>
          <div className="stitch-credential"><strong>Registered Mumbai Enterprise</strong><span>Serving guests since 2016</span></div>
        </div>
        <div className="stitch-photo-frame stitch-about-main-photo">
          <Image src="/stitch/about-corporate.png" alt="Vishnu Tours corporate transfer service" fill sizes="(max-width: 800px) 100vw, 50vw" priority />
        </div>
      </section>

      <section className="stitch-section stitch-shell">
        <div className="stitch-section-heading">
          <span className="stitch-kicker">What Guides Us</span><h2>Our Core Values</h2>
          <p>Every ride is managed around safety, punctuality and clear communication.</p>
        </div>
        <div className="stitch-value-grid">
          {values.map(({ icon: Icon, title, copy }) => (
            <article className="stitch-icon-card" key={title}><span className="stitch-icon-box"><Icon aria-hidden="true" /></span><h3>{title}</h3><p>{copy}</p></article>
          ))}
        </div>
      </section>

      <section className="stitch-section stitch-muted-band">
        <div className="stitch-shell stitch-split-section">
          <div className="stitch-photo-frame stitch-interior-photo"><Image src="/stitch/about-interior.jpg" alt="Premium clean cab interior" fill sizes="(max-width: 800px) 100vw, 48vw" /></div>
          <div><span className="stitch-kicker">The Fleet Experience</span><h2>Comfort For Business And Family Travel</h2><p>Our fleet includes Toyota Innova Crysta, Toyota Innova Hycross, Toyota Rumion, Maruti Ertiga and Toyota Etios for different passenger and journey needs.</p><ul className="stitch-check-list"><li>Owner-side vehicle coordination</li><li>Mumbai pickup for local and outstation rides</li><li>Corporate guest and airport movement support</li><li>Booking ticket, invoice and online payment options</li></ul></div>
        </div>
      </section>

      <section className="stitch-business-band"><div className="stitch-shell stitch-business-details"><div><span>Registered Enterprise</span><strong>VISHNU S.TOURS &amp; TRAVELS</strong></div><div><span>Proprietor</span><strong>Munna Kumar Singh</strong></div><div><span>Udyam Registration</span><strong>UDYAM-MH-18-0242307</strong></div><div><span>Registered Office</span><strong>Khar East, Mumbai 400051</strong></div></div></section>
      <section className="stitch-page-cta"><div className="stitch-shell"><div><h2>Ready To Experience Professional Travel?</h2><p>Choose your journey and get a clear fare before you confirm.</p></div><Link href="/#booking">Book Your Cab</Link></div></section>
      <PublicFooter hideEmail />
    </main>
  );
}
