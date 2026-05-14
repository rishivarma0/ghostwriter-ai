import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://ghostwriterai.me"),
  title: "Ghostwriter AI",
  description: "Turn your messy brain-dumps into viral LinkedIn posts optimized for engagement.",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{ variables: { colorPrimary: '#34d399' } }}>
      <html lang="en">
        <body className={`${inter.className} bg-[#040706] text-zinc-50`}>
          <NextTopLoader color="#34d399" showSpinner={false} />
          {children}
          {/* This script is required for the Razorpay popup to work */}
          <Script
            src="https://checkout.razorpay.com/v1/checkout.js"
            strategy="beforeInteractive"
          />
          {/* Simple Analytics Script */}
          <Script src="https://scripts.simpleanalyticscdn.com/latest.js" />
        </body>
      </html>
    </ClerkProvider>
  );
}