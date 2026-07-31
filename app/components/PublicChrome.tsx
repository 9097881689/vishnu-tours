"use client";

import Link from "next/link";
import { useEffect } from "react";

const whatsappUrl = "https://wa.me/917004291529";
const publicFontStacks: Record<string, string> = {
  "Plus Jakarta Sans": "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif",
  Inter: "var(--font-inter), Inter, sans-serif",
  Poppins: "var(--font-poppins), Poppins, sans-serif",
  Manrope: "var(--font-manrope), Manrope, sans-serif",
  Montserrat: "var(--font-montserrat), Montserrat, sans-serif",
  "Nunito Sans": "var(--font-nunito-sans), 'Nunito Sans', sans-serif",
  "Open Sans": "var(--font-open-sans), 'Open Sans', sans-serif",
  Roboto: "var(--font-roboto), Roboto, sans-serif",
  Lato: "var(--font-lato), Lato, sans-serif",
  "System UI": "system-ui, -apple-system, 'Segoe UI', sans-serif",
};

function SiteFontSync() {
  useEffect(() => {
    let isMounted = true;

    fetch("/api/bookings?settings=pricing")
      .then((response) => response.json())
      .then((result: { siteFont?: string }) => {
        if (!isMounted) return;
        const stack = publicFontStacks[result.siteFont || ""] || publicFontStacks["Plus Jakarta Sans"];
        document.documentElement.style.setProperty("--brand-font", stack);
        document.documentElement.style.setProperty("--heading-font", stack);
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, []);

  return null;
}

export function PublicHeader() {
  return (
    <header className="top-strip main-menu public-page-menu">
      <SiteFontSync />
      <Link className="brand" href="/" aria-label="Vishnu Tours home">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="brand-logo" src="/logo.svg?v=wide" alt="Vishnu Tours logo" />
        <span>
          <strong>Vishnu Tours</strong>
        </span>
      </Link>
      <div className="header-actions">
        <a className="call-button" href={whatsappUrl} target="_blank">
          WhatsApp 7004291529
        </a>
        <Link className="login-button header-login-link" href="/">
          Login
        </Link>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="site-footer" id="contact">
      <div className="footer-column footer-brand-column">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="footer-logo" src="/logo.svg?v=wide" alt="Vishnu Tours logo" />
        <span>
          Premium Cab Booking From Mumbai For Corporate Guests, Airport Transfers
          And Outstation Trips.
        </span>
      </div>
      <div className="footer-column">
        <strong>Legal</strong>
        <Link href="/privacy-policy">Privacy Policy</Link>
        <Link href="/terms-and-conditions">Terms And Conditions</Link>
        <Link href="/cancellation-refund">Cancellation And Refund</Link>
        <Link href="/cookie-policy">Cookie Policy</Link>
      </div>
      <div className="footer-column">
        <strong>Company</strong>
        <Link href="/price-chart">Live Price Chart</Link>
        <Link href="/disclaimer">Disclaimer</Link>
        <Link href="/contact">Contact Page</Link>
        <span>Mumbai, Maharashtra, India</span>
      </div>
      <div className="footer-column">
        <strong>Contact</strong>
        <a href="mailto:cricketsikho@gmail.com">cricketsikho@gmail.com</a>
        <a href={whatsappUrl} target="_blank">+91 7004291529</a>
        <a href={whatsappUrl} target="_blank">WhatsApp Booking Help</a>
      </div>
    </footer>
  );
}
