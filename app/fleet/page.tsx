"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { BriefcaseBusiness, Luggage, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import { PublicFooter, PublicHeader } from "../components/PublicChrome";

type FleetRate = {
  vehicleName: string;
  type?: string;
  seats?: string;
  luggage?: string;
  bestFor?: string;
  photo?: string;
  rates: { perKm: number; local8hr: number; fullDay: number };
};

const formatInr = (amount: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount || 0);

export default function FleetPage() {
  const [vehicles, setVehicles] = useState<FleetRate[]>([]);

  useEffect(() => {
    fetch("/api/bookings?settings=publicRates").then((response) => response.json()).then((result: { vehicles?: FleetRate[] }) => setVehicles(result.vehicles || [])).catch(() => setVehicles([]));
  }, []);

  return (
    <main className="stitch-public-page">
      <PublicHeader />
      <section className="stitch-fleet-hero"><div className="stitch-shell"><span className="stitch-kicker light">Owner Fleet From Mumbai</span><h1>Our Premium Fleet</h1><p>Choose a clean, comfortable cab for corporate guests, airport transfers, local duty and long-route travel.</p></div></section>
      <section className="stitch-section stitch-shell">
        <div className="stitch-section-heading"><span className="stitch-kicker">Choose Your Cab</span><h2>Vehicles For Every Journey</h2><p>Live fares and vehicles are updated directly from Vishnu Tours admin.</p></div>
        <div className="stitch-fleet-grid">
          {vehicles.map((vehicle) => (
            <article className="stitch-fleet-card" key={vehicle.vehicleName}>
              <div className="stitch-fleet-image">
                <img src={vehicle.photo || "/fleet/innova-crysta.png"} alt={`${vehicle.vehicleName} cab`} />
                <span>{vehicle.type || "Premium Cab"}</span>
              </div>
              <div className="stitch-fleet-card-body"><h3>{vehicle.vehicleName}</h3><p>{vehicle.bestFor || "Corporate, airport and outstation travel"}</p>
                <div className="stitch-fleet-meta"><span><UsersRound />{vehicle.seats || "4-7 Seats"}</span><span><Luggage />{vehicle.luggage || "2 Bags"}</span></div>
                <div className="stitch-fleet-rate"><div><small>Starting From</small><strong>{formatInr(vehicle.rates.perKm)} / KM</strong></div><div><small>8 Hr Package</small><strong>{formatInr(vehicle.rates.local8hr)}</strong></div></div>
                <div className="stitch-card-actions"><Link href="/#booking">Book This Cab</Link><Link href="/price-chart">View Fare</Link></div>
              </div>
            </article>
          ))}
          {!vehicles.length && <div className="stitch-loading-card">Loading The Latest Fleet...</div>}
        </div>
      </section>
      <section className="stitch-page-cta"><div className="stitch-shell"><div><BriefcaseBusiness /><h2>Need Multiple Cabs For Corporate Travel?</h2><p>Get coordinated vehicle movement and direct booking support.</p></div><Link href="/corporate-travel">Corporate Solutions</Link></div></section>
      <PublicFooter />
    </main>
  );
}
