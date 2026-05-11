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
  title: {
    default: "ChemistryByKK — Chemistry Simplified for Class 9–12",
    template: "%s · ChemistryByKK",
  },
  description:
    "Free NCERT chemistry notes, cheatsheets, past papers and chapter-wise quizzes for Class 9, 10, 11 and 12. Built by Khyati Kaushik (M.Sc. Chemistry, PGT).",
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "/" },
  keywords: [
    "Class 9 Chemistry notes",
    "Class 10 Chemistry notes",
    "Class 11 Chemistry notes",
    "Class 12 Chemistry notes",
    "NCERT Chemistry",
    "CBSE Chemistry",
    "Chemistry cheatsheet",
    "Chemistry MCQ",
    "Chemistry quiz",
    "Khyati Kaushik",
    "ChemistryByKK",
    "Matter in our surroundings MCQ",
    "Chemistry past papers",
    "Chemistry PYQ",
    "Board exam chemistry",
  ],
  authors: [{ name: "Khyati Kaushik" }],
  creator: "Khyati Kaushik",
  publisher: "ChemistryByKK",
  openGraph: {
    title: "ChemistryByKK — Chemistry Simplified for Class 9–12",
    description:
      "Free NCERT notes, cheatsheets, past papers and quizzes for Class 9–12 chemistry, built by Khyati Kaushik (M.Sc. Chemistry).",
    url: siteUrl,
    siteName: "ChemistryByKK",
    type: "website",
    locale: "en_IN",
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
    title: "ChemistryByKK — Chemistry Simplified for Class 9–12",
    description:
      "Free NCERT notes, cheatsheets, past papers and quizzes for Class 9–12.",
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
    icon: [{ url: "/images/logo.png", type: "image/png" }],
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
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
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": `${siteUrl}#org`,
      name: "ChemistryByKK",
      url: siteUrl,
      logo: `${siteUrl}/images/logo.png`,
      description:
        "Chemistry learning hub for Class 9–12 — NCERT-aligned notes, cheatsheets, past papers and chapter MCQ quizzes.",
      sameAs: [
        "https://www.youtube.com/@chemistrybykk",
        "https://www.instagram.com/chemistrybykk/",
        "https://www.linkedin.com/in/khyati-kaushik-8849bb205/",
      ],
    },
    {
      "@type": "Person",
      "@id": `${siteUrl}#kk`,
      name: "Khyati Kaushik",
      jobTitle: "PGT Chemistry",
      alumniOf: "M.Sc. Chemistry",
      worksFor: { "@id": `${siteUrl}#org` },
      sameAs: [
        "https://www.youtube.com/@chemistrybykk",
        "https://www.instagram.com/chemistrybykk/",
        "https://www.linkedin.com/in/khyati-kaushik-8849bb205/",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}#website`,
      url: siteUrl,
      name: "ChemistryByKK",
      inLanguage: "en-IN",
      publisher: { "@id": `${siteUrl}#org` },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
