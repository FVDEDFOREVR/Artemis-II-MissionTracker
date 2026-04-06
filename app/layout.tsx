import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Mono } from "next/font/google";

import "./globals.css";

const SITE_URL = "https://artemisiimissiontracker.vercel.app";
const OPEN_GRAPH_IMAGE_URL = `${SITE_URL}/opengraph-image`;
const TWITTER_IMAGE_URL = `${SITE_URL}/twitter-image`;

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  variable: "--font-cormorant-garamond",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Artemis II — Live Mission Tracker",
  description: "A precision live mission tracker for the Artemis II free-return lunar flyby.",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "Artemis II — Live Mission Tracker",
    description:
      "A precision live mission tracker for the Artemis II free-return lunar flyby.",
    type: "website",
    url: SITE_URL,
    images: [
      {
        url: OPEN_GRAPH_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "Artemis II social preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Artemis II — Live Mission Tracker",
    description:
      "A precision live mission tracker for the Artemis II free-return lunar flyby.",
    images: [
      {
        url: TWITTER_IMAGE_URL,
        alt: "Artemis II social preview",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmMono.variable} ${cormorantGaramond.variable} bg-space text-ink`}
    >
      <body className="bg-space font-mono antialiased">{children}</body>
    </html>
  );
}
