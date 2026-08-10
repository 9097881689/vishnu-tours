"use client";

import Link from "next/link";
import { MessageCircle, PhoneCall } from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

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
const defaultSiteBranding = {
  iconUrl: "/logo-mark-v2.png?v=20260801",
  headerLogoSize: 42,
  footerLogoSize: 62,
  faviconSize: 32,
};

function normalizeSiteBranding(value?: Partial<typeof defaultSiteBranding> | null) {
  return {
    iconUrl: value?.iconUrl || defaultSiteBranding.iconUrl,
    headerLogoSize: Number.isFinite(Number(value?.headerLogoSize))
      ? Math.min(120, Math.max(38, Math.round(Number(value?.headerLogoSize))))
      : defaultSiteBranding.headerLogoSize,
    footerLogoSize: Number.isFinite(Number(value?.footerLogoSize))
      ? Math.min(180, Math.max(48, Math.round(Number(value?.footerLogoSize))))
      : defaultSiteBranding.footerLogoSize,
    faviconSize: Number.isFinite(Number(value?.faviconSize))
      ? Math.min(96, Math.max(16, Math.round(Number(value?.faviconSize))))
      : defaultSiteBranding.faviconSize,
  };
}

function useSiteBrandSync() {
  const [branding, setBranding] = useState(defaultSiteBranding);
  const [isBrandingReady, setIsBrandingReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/bookings?settings=pricing")
      .then((response) => response.json())
      .then((result: { siteFont?: string; siteBranding?: typeof defaultSiteBranding }) => {
        if (!isMounted) return;
        const stack = publicFontStacks[result.siteFont || ""] || publicFontStacks["Plus Jakarta Sans"];
        const nextBranding = normalizeSiteBranding(result.siteBranding);

        document.documentElement.style.setProperty("--brand-font", stack);
        document.documentElement.style.setProperty("--heading-font", stack);
        document.body.style.setProperty("--brand-font", stack);
        document.body.style.setProperty("--heading-font", stack);
        document.documentElement.style.setProperty(
          "--site-header-logo-size",
          `${nextBranding.headerLogoSize}px`,
        );
        document.documentElement.style.setProperty(
          "--site-footer-logo-size",
          `${nextBranding.footerLogoSize}px`,
        );

        const existingIcon = document.querySelector<HTMLLinkElement>("link[rel='icon']");
        const iconLink = existingIcon || document.createElement("link");
        iconLink.rel = "icon";
        iconLink.href = nextBranding.iconUrl;
        iconLink.sizes = `${nextBranding.faviconSize}x${nextBranding.faviconSize}`;
        if (!existingIcon) {
          document.head.appendChild(iconLink);
        }

        setBranding(nextBranding);
      })
      .catch(() => undefined)
      .finally(() => {
        if (isMounted) setIsBrandingReady(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    branding,
    isBrandingReady,
    style: {
      "--site-header-logo-size": `${branding.headerLogoSize}px`,
      "--site-footer-logo-size": `${branding.footerLogoSize}px`,
    } as CSSProperties,
  };
}

export function PublicHeader() {
  const { branding, isBrandingReady, style } = useSiteBrandSync();

  return (
    <header className="top-strip main-menu public-page-menu" style={style}>
      <Link className="brand" href="/" aria-label="Vishnu Tours home">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={`brand-logo ${isBrandingReady ? "branding-ready" : "branding-loading"}`}
          src={branding.iconUrl}
          alt="Vishnu Tours logo"
        />
        <span>
          <strong>Vishnu Tours</strong>
        </span>
      </Link>
      <nav className="main-nav" aria-label="Primary navigation">
        <Link href="/#home">Home</Link>
        <Link href="/#why-us">About Us</Link>
        <Link href="/#fleet">Our Fleet</Link>
        <Link href="/#booking">Outstation</Link>
        <Link href="/#booking">Airport Transfer</Link>
        <Link href="/#booking">Local Rental</Link>
        <Link href="/#contact">Contact Us</Link>
      </nav>
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
  const { branding, isBrandingReady, style } = useSiteBrandSync();

  return (
    <footer className="site-footer" id="contact" style={style}>
      <div className="footer-column footer-brand-column">
        <Link className="footer-brand-lockup" href="/" aria-label="Vishnu Tours home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={`footer-logo ${isBrandingReady ? "branding-ready" : "branding-loading"}`}
            src={branding.iconUrl}
            alt="Vishnu Tours icon"
          />
          <span className="footer-brand-copy">
            <strong><b>Vishnu</b> <em>Tours</em></strong>
            <small>Corporate Cabs From Mumbai</small>
          </span>
        </Link>
        <span className="footer-legal-name">
          <b>Legal Name:</b> Visnu S Tours &amp; Travels
        </span>
        <span className="footer-legal-name">
          <b>Trade Name:</b> Munni Devi
        </span>
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
        <a className="footer-phone-link" href="tel:+917004291529">
          <PhoneCall aria-hidden="true" />
          <span>+91 7004291529</span>
        </a>
        <a className="footer-whatsapp-link" href={whatsappUrl} target="_blank">
          <MessageCircle aria-hidden="true" />
          <span>WhatsApp Booking</span>
        </a>
      </div>
    </footer>
  );
}
