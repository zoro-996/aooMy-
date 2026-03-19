import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PrismDay",
  description: "Tasks, calendar, notes, files, and AI — in one place.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full text-slate-900 overflow-x-hidden">
        <Providers>
          {/* MAIN APP WRAPPER */}
          <div className="min-h-screen w-full flex flex-col">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
