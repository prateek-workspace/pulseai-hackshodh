import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pulse AI - Continuous Clinical Surveillance",
  description: "Early health warning through continuous clinical surveillance. Detect change, not disease.",
  keywords: ["health monitoring", "AI", "clinical surveillance", "wearables", "health analytics"],
  authors: [{ name: "Pulse AI" }],
  openGraph: {
    title: "Pulse AI - Early Health Warning",
    description: "Continuous clinical surveillance platform for early health warning",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
