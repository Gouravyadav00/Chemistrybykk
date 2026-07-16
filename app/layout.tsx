import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { thumbUrl, VIDEOS, watchUrl } from "@/data/videos";

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
    "Free NCERT chemistry notes, one-shot video lectures, cheatsheets, question banks and chapter-wise quizzes for Class 9, 10, 11 and 12. Built by Khyati Kaushik (M.Sc. Chemistry, PGT).",
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
    "Chemical Reactions and Equations Class 10",
    "Chemical Reactions and Equations one shot",
    "Class 10 Chemistry one shot",
    "Class 10 Science Chapter 1",
    "Chemistry video lectures",
    "CBSE Class 10 Chemistry",
    "Chemistry one shot",
  ],
  authors: [{ name: "Khyati Kaushik" }],
  creator: "Khyati Kaushik",
  publisher: "ChemistryByKK",
  openGraph: {
    title: "ChemistryByKK — Chemistry Simplified for Class 9–12",
    description:
      "Free NCERT notes, one-shot video lectures, cheatsheets, question banks and quizzes for Class 9–12 chemistry, built by Khyati Kaushik (M.Sc. Chemistry).",
    url: siteUrl,
    siteName: "ChemistryByKK",
    type: "website",
    locale: "en_IN",
    // og:image is auto-generated at /opengraph-image (1200×630) — see app/opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: "ChemistryByKK — Chemistry Simplified for Class 9–12",
    description:
      "Free NCERT notes, cheatsheets, past papers and quizzes for Class 9–12.",
    // twitter:image is auto-generated at /twitter-image (1200×630) — see app/twitter-image.tsx
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
  verification: {
    google: "BUZ7SXpTuJmDGzkBr4NdX7_L5ePUu-rBoDptWhZrKKg",
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
    ...VIDEOS.map((v) => ({
      "@type": "VideoObject",
      "@id": `${siteUrl}#video-${v.id}`,
      name: v.title,
      description: v.description,
      thumbnailUrl: [thumbUrl(v.id), thumbUrl(v.id, "hqdefault")],
      uploadDate: v.uploadDate,
      embedUrl: `https://www.youtube-nocookie.com/embed/${v.id}`,
      contentUrl: watchUrl(v),
      publisher: { "@id": `${siteUrl}#org` },
      author: { "@id": `${siteUrl}#kk` },
    })),
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
