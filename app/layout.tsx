import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Visiora — Développez vos abonnés",
  description:
    "Lancez une campagne pour développer les abonnés de votre compte TikTok, YouTube ou Facebook grâce à la découverte et aux abonnements volontaires.",
  applicationName: "Visiora",
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }], shortcut: "/favicon.svg" },
  openGraph: {
    title: "Visiora — Faites grandir votre communauté",
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
