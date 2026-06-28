import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Runway Career Connect | Nepal's Biggest Event — PUBG Tournament & AI Workshop",
  description: "Join Runway Career Connect at NCMT College Campus — featuring a PUBG Mobile Esports Tournament (Rs. 10,000 prize pool) and a Digital Marketing with AI Workshop. Free tickets for all participants! 2083/03/26.",
  keywords: ["Runway Career Connect", "PUBG Tournament Nepal", "AI Workshop Nepal", "NCMT College", "Octave Alliance", "Esports Nepal", "Digital Marketing AI"],
  robots: "index, follow",
  icons: {
    icon: "/favicon.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Runway Career Connect — PUBG Tournament & AI Workshop",
    description: "Nepal's biggest event: PUBG Mobile Esports Tournament (Rs. 10,000 prize pool) + AI Marketing Workshop. Free tickets for all participants!",
    url: "https://runwaycareerconnect.com",
    siteName: "Runway Career Connect",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Runway Career Connect",
    description: "Nepal's biggest event featuring a PUBG Mobile Tournament & AI Workshop. Free tickets guaranteed!",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="antialiased font-sans bg-[#0A0A0A] text-white selection:bg-purple-500/30 overflow-x-hidden" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
