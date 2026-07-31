import type { Metadata } from "next";
import {
  Inter,
  Lato,
  Manrope,
  Montserrat,
  Nunito_Sans,
  Open_Sans,
  Plus_Jakarta_Sans,
  Poppins,
  Roboto,
} from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

export const metadata: Metadata = {
  title: "Vishnu Tours | Corporate Cab Service Mumbai",
  description:
    "Book Mumbai airport, in-city and outstation corporate cabs with Innova Crysta, Innova Hycross, Ertiga, Rumion and Etios. Live fare, booking and Razorpay payment.",
  icons: {
    icon: "/logo-icon.png",
    shortcut: "/logo-icon.png",
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
        className={`${plusJakartaSans.variable} ${inter.variable} ${poppins.variable} ${manrope.variable} ${montserrat.variable} ${nunitoSans.variable} ${openSans.variable} ${roboto.variable} ${lato.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
