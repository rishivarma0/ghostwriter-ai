import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://ghostwriterai.me"),
  title: "Ghostwriter AI",
  description: "Turn your messy brain-dumps into viral LinkedIn posts optimized for engagement.",
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
          {children}
          {/* This script is required for the Razorpay popup to work */}
          <Script
            src="https://checkout.razorpay.com/v1/checkout.js"
            strategy="beforeInteractive"
          />
        </body>
      </html>
    </ClerkProvider>
  );
}