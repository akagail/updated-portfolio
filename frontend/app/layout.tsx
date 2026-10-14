import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import SiteRain from "../components/SiteRain";
import ScrollCalm from "../components/ScrollCalm";
import SmoothScroll from "../components/SmoothScroll";
import { getProfile } from "../lib/api";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-mono",
});

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

const FALLBACK_TITLE = "Portfolio — Projects, Skills, and Experience";
const FALLBACK_DESCRIPTION =
  "Personal portfolio showcasing selected projects, skills, experience, and contact details.";

function toOneLine(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function truncate(value: string, max = 155): string {
  const clean = toOneLine(value);
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

export async function generateMetadata(): Promise<Metadata> {
  let title = FALLBACK_TITLE;
  let description = FALLBACK_DESCRIPTION;
  let authorName: string | undefined;

  try {
    const profile = await getProfile();
    if (profile) {
      const name = toOneLine(profile.name || "Portfolio");
      const role = toOneLine(profile.title || "");
      authorName = name;
      title = role ? `${name} — ${role}` : name;
      const raw = profile.bio || profile.intro || FALLBACK_DESCRIPTION;
      description = truncate(raw);
    }
  } catch {
    // Build must succeed even when the API is down — use fallback copy.
  }

  const ogImage = `${SITE_URL}/og.svg`;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    applicationName: authorName ?? "Portfolio",
    authors: authorName ? [{ name: authorName }] : undefined,
    creator: authorName,
    publisher: authorName,
    keywords: ["portfolio", "projects", "skills", "experience", "contact"],
    alternates: {
      canonical: "/",
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
      icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
      apple: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    },
    openGraph: {
      type: "website",
      url: SITE_URL,
      siteName: authorName ?? "Portfolio",
      locale: "en_US",
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#f5fbff" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${display.variable} ${mono.variable}`}
    >
      <body className="antialiased">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
        <SiteRain />
        <ScrollCalm />
        <SmoothScroll />
      </body>
    </html>
  );
}
