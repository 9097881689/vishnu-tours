"use client";

import Link from "next/link";
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
  iconUrl: "/logo-wide.png?v=20260731",
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
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    branding,
    style: {
      "--site-header-logo-size": `${branding.headerLogoSize}px`,
      "--site-footer-logo-size": `${branding.footerLogoSize}px`,
    } as CSSProperties,
  };
}

export function PublicHeader() {
  const { branding, style } = useSiteBrandSync();

  return (
    <header className="top-strip main-menu public-page-menu" style={style}>
      <Link className="brand" href="/" aria-label="Vishnu Tours home">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="brand-logo" src={branding.iconUrl} alt="Vishnu Tours logo" />
        <span>
          <strong>Vishnu Tours</strong>
        </span>
      </Link>
      <nav className="main-nav" aria-label="Primary navigation">
        <Link href="/#home">Home</Link>
        <Link href="/#fleet">Our Fleet</Link>
        <Link href="/#services">Services</Link>
        <Link href="/price-chart">Price Chart</Link>
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
  const { branding, style } = useSiteBrandSync();

  return (
    <footer className="site-footer" id="contact" style={style}>
      <div className="footer-column footer-brand-column">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="footer-logo" src={branding.iconUrl} alt="Vishnu Tours logo" />
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
