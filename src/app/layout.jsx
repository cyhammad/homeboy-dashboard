import { Geist, Geist_Mono, Sora } from "next/font/google";
import "./globals.css";
import { ModalProvider } from "@/context/ModalContext";

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
  title: "Homeboy",
  description: "Homeboy is a platform for managing your homeboy business.",
};

export default function RootLayout({
  children
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${sora.variable} antialiased`}
      >
        <ModalProvider>{children}</ModalProvider>
      </body>
    </html>
  );
}
