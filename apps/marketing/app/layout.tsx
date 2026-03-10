import type { Metadata } from "next";
import { Outfit, DM_Sans } from "next/font/google";
import CtaTracker from "./components/CtaTracker";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "xiriOS — Janitorial Bidding & Business Management Software",
  description:
    "Win more cleaning contracts, protect your margins, and run your crew — all in one place. Professional bidding, scheduling, timekeeping, and CRM for janitorial businesses.",
  keywords: [
    "janitorial bidding software",
    "cleaning business management",
    "janitorial proposal software",
    "cleaning company CRM",
    "janitorial scheduling software",
    "cleaning bid calculator",
    "free janitorial calculator",
    "how to price janitorial cleaning",
    "janitorial bid calculator",
    "janitorial pricing per square foot",
    "cleaning company software",
  ],
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "xiriOS — Win More Bids. Protect Your Margins.",
    description:
      "The modern platform for janitorial and cleaning businesses. Bidding, scheduling, CRM, and more — at half the cost of CleanGuru.",
    siteName: "xiriOS",
    type: "website",
    url: "https://os.xiri.ai",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "xiriOS — Janitorial Business Management",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "xiriOS — Win More Bids. Protect Your Margins.",
    description:
      "Professional bidding, scheduling, and CRM for janitorial businesses — at half the price.",
    images: ["/og-image.png"],
  },
  metadataBase: new URL("https://os.xiri.ai"),
  alternates: { canonical: "https://os.xiri.ai" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* GA4 */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-Y8V0GR4ESS" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-Y8V0GR4ESS');`,
          }}
        />
      </head>
      <body className={`${outfit.variable} ${dmSans.variable}`}>
        <CtaTracker />
        {children}
      </body>
    </html>
  );
}

