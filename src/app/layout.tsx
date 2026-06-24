import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Runway Career Connect | Nepal's Biggest Event",
  description: "Elevate your skills and dominate the grid. Join the Octave Cluster Crew for an exclusive Esports Tournament and AI Workshop.",
  openGraph: {
    title: "Runway Career Connect",
    description: "Nepal's biggest event featuring a PUBG Mobile Tournament & AI Workshop. Free tickets guaranteed for all participants!",
    url: "https://runwaycareerconnect.com",
    siteName: "Runway Career Connect",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Runway Career Connect",
    description: "Nepal's biggest event featuring a PUBG Mobile Tournament & AI Workshop.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
