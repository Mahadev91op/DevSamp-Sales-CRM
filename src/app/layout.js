import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "DevSamp Sales CRM - Manage Leads. Close More Deals. Grow Faster.",
  description: "A premium, lightning-fast SaaS dashboard designed for medical shop lead tracking, CRM, sales visit scheduling, and subscription renewal operations.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DevSamp CRM",
  },
};

export const viewport = {
  themeColor: "#0071e3",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
