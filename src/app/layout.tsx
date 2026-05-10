import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OPAYS HQ",
  description: "Système de gestion interne OPAYS TECH",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
