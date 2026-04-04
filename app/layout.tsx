import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Mono } from "next/font/google";

import "./globals.css";

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
  title: "Artemis II — Live Mission Tracker",
  description: "A precision live mission tracker for the Artemis II free-return lunar flyby.",
  openGraph: {
    title: "Artemis II — Live Mission Tracker",
    description:
      "A precision live mission tracker for the Artemis II free-return lunar flyby.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Artemis II — Live Mission Tracker",
    description:
      "A precision live mission tracker for the Artemis II free-return lunar flyby.",
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
