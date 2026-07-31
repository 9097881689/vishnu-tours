import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Vishnu Tours | Corporate Cab Service Mumbai",
  description:
    "Book Mumbai airport, in-city and outstation corporate cabs with Innova Crysta, Innova Hycross, Ertiga, Rumion and Etios. Live fare, booking and Razorpay payment.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Vishnu Tours | Corporate Cab Service Mumbai",
    description:
      "Premium cab booking from Mumbai for corporate travel, VIP guests, airport transfers and all India outstation trips.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN">
      <body
        className={`${plusJakartaSans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
