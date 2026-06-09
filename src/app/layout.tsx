import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spyne Pricing Calculator",
  description: "Configure your Spyne plan and see real-time cost breakdown.",
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
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.19.0/dist/tabler-icons.min.css" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
