import { Geist, Geist_Mono, Sora } from "next/font/google";
import "./globals.css";
import NotificationPermissionDialog from "@/components/NotificationPermissionDialog";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Deal Swipe",
  description: "Deal Swipe is a platform for managing your homeboy business.",
};

export default function RootLayout({
  children
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${sora.variable} antialiased`}
      >
        {children}
        <NotificationPermissionDialog />
      </body>
    </html>
  );
}
