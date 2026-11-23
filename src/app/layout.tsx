import { AppShell } from "@/components/layout/AppShell";
import { WardrobeProvider } from "@/context/WardrobeContext";
import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sagu's Wardrobe — Smart Digital Closet & Outfit Planner",
  description:
    "Organize your wardrobe, match shirts and trousers, and plan daily outfits.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sagu's Wardrobe",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0288d1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="font-sans antialiased">
        <WardrobeProvider>
          <AppShell>{children}</AppShell>
        </WardrobeProvider>
      </body>
    </html>
  );
}
