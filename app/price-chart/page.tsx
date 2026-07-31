"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type PublicRate = {
  vehicleName: string;
  rates: {
    perKm: number;
    local4hr: number;
    local8hr: number;
    fullDay: number;
    halfDay: number;
    vip: number;
  };
};

const formatInr = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    currency: "INR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(amount || 0);

export default function PriceChartPage() {
  const [vehicles, setVehicles] = useState<PublicRate[]>([]);
  const [updatedAt, setUpdatedAt] = useState("");

  useEffect(() => {
    fetch("/api/bookings?settings=publicRates")
      .then((response) => response.json())
      .then((result: { vehicles?: PublicRate[]; updatedAt?: string }) => {
        setVehicles(result.vehicles || []);
        setUpdatedAt(result.updatedAt || "");
      })
      .catch(() => {
        setVehicles([]);
      });
  }, []);

  return (
    <main className="simple-page">
      <Link className="simple-page-logo" href="/">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg?v=borderless" alt="Vishnu Tours logo" />
      </Link>
      <section className="simple-page-card price-page-card">
        <span>Live Price Chart</span>
        <h1>Vishnu Tours Cab Fare Chart</h1>
        <p>
          Rates Are Updated Automatically From Admin Pricing. Final Fare May Vary By Toll,
          Parking, Night Charges, Extra KM, Waiting Or Route Conditions.
        </p>
        {updatedAt ? <small>Last Synced: {new Date(updatedAt).toLocaleString("en-IN")}</small> : null}
        <div className="price-table-wrap">
          <table className="price-table">
            <thead>
              <tr>
                <th>Cab</th>
                <th>Per KM</th>
                <th>4 Hr / 45 KM</th>
                <th>8 Hr / 90 KM</th>
                <th>Full Day</th>
                <th>VIP Pack</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((item) => (
                <tr key={item.vehicleName}>
                  <td>{item.vehicleName}</td>
                  <td>{formatInr(item.rates.perKm)}</td>
                  <td>{formatInr(item.rates.local4hr)}</td>
                  <td>{formatInr(item.rates.local8hr)}</td>
                  <td>{formatInr(item.rates.fullDay)}</td>
                  <td>{formatInr(item.rates.vip)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Link className="simple-page-button" href="/#booking">Book Cab</Link>
      </section>
    </main>
  );
}
