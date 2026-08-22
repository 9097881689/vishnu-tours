"use client";

import Link from "next/link";
import { BadgeIndianRupee, CircleCheck, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { PublicFooter, PublicHeader } from "../components/PublicChrome";

type PublicRate = { vehicleName: string; rates: { perKm: number; local4hr: number; local8hr: number; local10hr: number; perHour: number; fullDay: number; halfDay: number; vip: number } };
const formatInr = (amount: number) => new Intl.NumberFormat("en-IN", { currency: "INR", maximumFractionDigits: 0, style: "currency" }).format(amount || 0);

export default function PriceChartPage() {
  const [vehicles, setVehicles] = useState<PublicRate[]>([]);
  const [updatedAt, setUpdatedAt] = useState("");

  useEffect(() => { fetch("/api/bookings?settings=publicRates").then((response) => response.json()).then((result: { vehicles?: PublicRate[]; updatedAt?: string }) => { setVehicles(result.vehicles || []); setUpdatedAt(result.updatedAt || ""); }).catch(() => setVehicles([])); }, []);

  return (
    <main className="stitch-public-page stitch-price-page">
      <PublicHeader />
      <section className="stitch-price-hero"><div className="stitch-shell"><span className="stitch-kicker light">Live Fare Chart</span><h1>Transparent Pricing. <em>Premium Service.</em></h1><p>Compare every cab and package before booking. Admin fare changes are reflected here automatically.</p>{updatedAt && <small>Price Effective From: {new Date(updatedAt).toLocaleString("en-IN")}</small>}</div></section>
      <section className="stitch-section stitch-shell">
        <div className="stitch-section-heading"><span className="stitch-kicker">Current Base Tariffs</span><h2>Cab And Package Pricing</h2><p>Base fare before 5% GST and route-specific statutory charges.</p></div>
        <div className="stitch-price-table-wrap"><table className="stitch-price-table"><thead><tr><th>Vehicle</th><th>Per KM</th><th>4 Hr / 45 KM</th><th>8 Hr / 90 KM</th><th>10 Hr / 100 KM</th><th>Extra Hour</th><th>Full Day</th></tr></thead><tbody>{vehicles.map((item) => <tr key={item.vehicleName}><td data-label="Vehicle"><strong>{item.vehicleName}</strong></td><td data-label="Per KM">{formatInr(item.rates.perKm)}</td><td data-label="4 Hr / 45 KM">{formatInr(item.rates.local4hr)}</td><td data-label="8 Hr / 90 KM">{formatInr(item.rates.local8hr)}</td><td data-label="10 Hr / 100 KM">{formatInr(item.rates.local10hr)}</td><td data-label="Extra Hour">{formatInr(item.rates.perHour)}</td><td data-label="Full Day">{formatInr(item.rates.fullDay)}</td></tr>)}</tbody></table>{!vehicles.length && <div className="stitch-loading-card">Loading Current Fare Chart...</div>}</div>
        <div className="stitch-hour-grid">{vehicles.map((item) => <article key={`${item.vehicleName}-hour`}><BadgeIndianRupee /><div><span>{item.vehicleName}</span><strong>{formatInr(item.rates.perHour)} / Extra Hour</strong></div></article>)}</div>
      </section>
      <section className="stitch-section stitch-muted-band"><div className="stitch-shell stitch-price-conditions"><div><span className="stitch-kicker">Important Fare Information</span><h2>Clear Conditions, No Surprises</h2><p>Package and final fare rules are shown here so the journey can be confirmed with clarity.</p><Link href="/#booking">Check Your Journey Fare</Link></div><ul><li><CircleCheck />5% GST is added on the final fare during booking or invoice.</li><li><CircleCheck />Local and airport fares use the applicable minimum package billing.</li><li><CircleCheck />Extra KM and time are charged at the selected cab&apos;s live rate.</li><li><CircleCheck />Toll, parking, airport parking, state tax, permits and night allowance are extra where applicable.</li><li><CircleCheck />Round-trip billing uses the applicable daily minimum KM or actual KM, whichever is higher.</li><li><Info />Final fare may change when route, trip duration, odometer distance or customer requirement changes.</li></ul></div></section>
      <PublicFooter />
    </main>
  );
}
