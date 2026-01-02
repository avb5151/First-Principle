import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "First Principle Portfolio Challenge",
  description: "Build a portfolio in 90 seconds. Survive three market regimes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

