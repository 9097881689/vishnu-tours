"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PublicFooter, PublicHeader } from "../components/PublicChrome";

type PublicRate = {
  vehicleName: string;
  rates: {
    perKm: number;
    local4hr: number;
    local8hr: number;
    local10hr: number;
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
    <main className="simple-page simple-page-with-chrome">
      <PublicHeader />
      <section className="simple-page-card price-page-card">
        <span>Live Price Chart</span>
        <h1>Vishnu Tours Cab Fare Chart</h1>
        <p>
          Rates Are Updated Automatically From Admin Pricing. All Fares Below Are
          Base Fare Before GST Unless Mentioned.
        </p>
        {updatedAt ? (
          <small>Price Effective From: {new Date(updatedAt).toLocaleString("en-IN")}</small>
        ) : null}
        <div className="price-table-wrap">
          <table className="price-table">
            <thead>
              <tr>
                <th>Cab</th>
                <th>Per KM</th>
                <th>4 Hr / 45 KM</th>
                <th>8 Hr / 90 KM</th>
                <th>10 Hr / 100 KM</th>
                <th>Per Hour After Package</th>
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
                  <td>{formatInr(item.rates.local10hr)}</td>
                  <td>{formatInr(Math.round(item.rates.local10hr / 10))}</td>
                  <td>{formatInr(item.rates.fullDay)}</td>
                  <td>{formatInr(item.rates.vip)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <section className="hourly-chart" aria-label="Per hour fare chart">
          <h2>Per Hour Charge After Package Time</h2>
          <div className="hourly-chart-grid">
            {vehicles.map((item) => (
              <div className="hourly-chart-item" key={`${item.vehicleName}-hourly`}>
                <span>{item.vehicleName}</span>
                <strong>{formatInr(Math.round(item.rates.local10hr / 10))} / Hour</strong>
              </div>
            ))}
          </div>
        </section>
        <section className="price-conditions" aria-label="Price conditions">
          <h2>Price Related Conditions</h2>
          <ul>
            <li>GST 5% Is Added On The Final Fare During Booking Or Invoice.</li>
            <li>Local And Airport Bookings Have Minimum KM Package Billing. Fare Does Not Reduce If Actual KM Is Lower Than Package KM.</li>
            <li>Extra KM After Package Limit Is Charged At The Selected Cab Per KM Rate.</li>
            <li>Extra Hours After Package Time Are Charged On Per Hour Basis As Shown In The Chart.</li>
            <li>Toll, Parking, Airport Parking, State Tax, Permit, Entry Fee And Driver Night Allowance Are Extra Where Applicable.</li>
            <li>Outstation Round Trip Billing May Use Daily Minimum KM Or Actual KM, Whichever Is Higher.</li>
            <li>Booking Should Be Made At Least 8 Hours Before Pickup Time, Except Manually Confirmed Emergency Bookings.</li>
            <li>Passenger Capacity Is Excluding Driver. Two Suitcases Are Allowed As Standard Luggage.</li>
            <li>Final Fare Can Change If Route, Drop Point, Trip Duration, Odometer Reading Or Customer Requirement Changes.</li>
            <li>Paid Booking Cancellation Amount Is Adjusted After Refund Completion. Unpaid Cancelled Booking Is Removed From Total Booking Amount.</li>
          </ul>
        </section>
        <Link className="simple-page-button" href="/#booking">Book Cab</Link>
      </section>
      <PublicFooter />
    </main>
  );
}
