import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// import ConditionalCursor from "@/components/shared/ConditionalCursor";
import { Toaster } from "sonner";
import { UserProvider } from "@/context/UserContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "BITFONIZ",
  description:
    "Your gateway to secure, code-driven trades and real earning potential.",
  keywords: [
    "trading platform",
    "automated trading",
    "crypto trading",
    "secure trading",
    "bitfoniz trading",
    "code-driven trading",
  ],
  authors: [{ name: "BITFONIZ" }],
      metadataBase: new URL("https://bitfoniz.vercel.app"),
  openGraph: {
    type: "website",
    title: "BITFONIZ - Advanced Trading Platform",
    description:
      "Your gateway to secure, code-driven trades and real earning potential.",
    siteName: "BITFONIZ",
    url: "https://bitfoniz.vercel.app",
    images: [
      {
        url: "/assets/qtex-logo.png",
        width: 1200,
        height: 630,
        alt: "BITFONIZ Platform Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BITFONIZ - Advanced Trading Platform",
    description:
      "Your gateway to secure, code-driven trades and real earning potential.",
    images: ["/assets/qtex-logo.png"],
    creator: "@bitfoniz",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    other: {
      "ccpayment-site-verification": "414cb71ec2809a5fda79a2463125ddee",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        {/* <ConditionalCursor /> */}
        <UserProvider>
          {children}
          <Toaster position="top-right" richColors />
        </UserProvider>
      </body>
    </html>
  );
}
