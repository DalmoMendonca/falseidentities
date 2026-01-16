import type { Metadata, Viewport } from "next";
import Image from "next/image";
import "./globals.css";
import logo from "../logo.png";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "False Identities",
    template: "%s | False Identities"
  },
  description: "A guided identity exercise to uncover false identities and reconnect with your truth.",
  applicationName: "False Identities",
  keywords: [
    "false identity",
    "identity exercise",
    "emotional awareness",
    "relationship triggers",
    "self inquiry",
    "inner work"
  ],
  category: "Wellness",
  alternates: {
    canonical: "/"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  },
  openGraph: {
    title: "False Identities",
    description: "A guided identity exercise to uncover false identities and reconnect with your truth.",
    url: "/",
    siteName: "False Identities",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "False Identities"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "False Identities",
    description: "A guided identity exercise to uncover false identities and reconnect with your truth.",
    images: ["/twitter-image"]
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon-32.png"
  },
  appleWebApp: {
    capable: true,
    title: "False Identities",
    statusBarStyle: "black-translucent"
  },
  formatDetection: {
    telephone: false
  },
  manifest: "/manifest.webmanifest"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f7e3ea"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <header className="topbar">
            <div className="brand">
              <Image
                src={logo}
                alt="False Identities logo"
                width={32}
                height={32}
                className="brandLogo"
                priority
              />
              <span className="brandText">False Identities</span>
            </div>
            <nav className="nav" aria-label="Primary">
              <a className="navCta" href="/#exercise">Uncovering Your False Identity</a>
              <a href="/#library">Identity Library</a>
            </nav>
          </header>
          <main className="main">{children}</main>
          <footer className="footer">
            <span>Built with ❤️ | <a href="https://hiredalmo.com" target="_blank">hiredalmo.com</a></span>
          </footer>
        </div>
      </body>
    </html>
  );
}
