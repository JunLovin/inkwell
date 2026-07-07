import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Host_Grotesk } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/shared/providers/convex-client-provider";
import { Toast } from "@/shared/ui";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const hostGrotesk = Host_Grotesk({
  variable: "--font-host",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://inkwell.app";
const siteName = "Inkwell";
const siteDescription =
  "The open, paywall-free note-taking app with a fast editor, cloud sync, and AI writing help.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: "%s · Inkwell",
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    "notes",
    "note-taking",
    "markdown",
    "AI writing",
    "Inkwell",
    "open source notes",
  ],
  authors: [{ name: "Inkwell" }],
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName,
    title: siteName,
    description: siteDescription,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${hostGrotesk.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full flex flex-col">
        <ConvexClientProvider>
          {children}
          <Toast />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
