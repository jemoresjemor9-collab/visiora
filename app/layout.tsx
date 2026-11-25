import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Visiora — Faites grandir votre visibilité",
  description:
    "Lancez des campagnes de visibilité pour vos contenus TikTok, YouTube et Facebook. Touchez votre audience et développez votre présence.",
  applicationName: "Visiora",
  icons: { icon: "/icon.svg", shortcut: "/icon.svg" },
  openGraph: {
    title: "Visiora — Votre visibilité mérite mieux que le hasard",
    description:
      "Des campagnes simples pour faire découvrir vos contenus aux bonnes personnes.",
    siteName: "Visiora",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#080d1b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
