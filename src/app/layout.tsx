import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Recruitment Platform",
  description: "Smart CV processing and interview management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
