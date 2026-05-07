import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ghostwriter AI | Viral LinkedIn Posts in Seconds",
  description: "Turn your messy brain-dumps into viral LinkedIn posts optimized for engagement.",
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
        </body>
      </html>
    </ClerkProvider>
  );
}