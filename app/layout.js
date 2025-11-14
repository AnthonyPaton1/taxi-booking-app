// app/layout.jsx
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import { Toaster } from "sonner";
import AccessibilityToolbar from '@/components/AccessibilityToolbar';


const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata = {
  title: "NEAT Booking App",
  description: "Ethical transport solutions for accessibility",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Navbar />
          <AccessibilityToolbar />
          <Toaster position="top-center" richColors />
          {children}
          <Footer />
        </Providers>
        <CookieConsentBanner />
      </body>
    </html>
  );
}
