import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eaf2ff" },
    { media: "(prefers-color-scheme: dark)", color: "#07142e" },
  ],
};

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://chemistrybykk.vercel.app";

export const metadata: Metadata = {
  title: "ChemistryByKK — Chemistry Simplified for Every Student",
  description:
    "A learning hub for Class 9–12 students by Khyati Kaushik (M.Sc. Chemistry). Notes, chapter-wise resources, and concept clarity for board exams.",
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "/" },
  openGraph: {
    title: "ChemistryByKK — Chemistry Simplified for Every Student",
    description:
      "Notes, chapter-wise resources, and concept clarity for Class 9–12.",
    url: siteUrl,
    siteName: "ChemistryByKK",
    type: "website",
    images: [
      {
        url: "/images/banner-1.png",
        width: 1983,
        height: 793,
        alt: "ChemistryByKK — Chemistry Simplified for Every Student",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ChemistryByKK — Chemistry Simplified for Every Student",
    description: "Chemistry Simplified for Every Student · Class 9–12 notes & walkthroughs.",
    images: [
      {
        url: "/images/banner-1.png",
        width: 1983,
        height: 793,
        alt: "ChemistryByKK banner",
      },
    ],
  },
  icons: {
    icon: [
      { url: "/images/logo.png", type: "image/png" },
    ],
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
