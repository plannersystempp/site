import type { Metadata } from "next";
import { obterUrlBaseDoSite } from "../lib/seo";
import "./globals.css";

const urlBaseDoSite = obterUrlBaseDoSite();
const ambiente = process.env.VERCEL_ENV ?? process.env.NODE_ENV;
const indexavel = ambiente === "production";

export const metadata: Metadata = {
  metadataBase: urlBaseDoSite,
  title: {
    default: "PlannerSystem",
    template: "%s | PlannerSystem",
  },
  description: "Sistema completo para gestão de eventos, controle de pessoal e financeiro.",
  applicationName: "PlannerSystem",
  category: "Software",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: urlBaseDoSite,
    siteName: "PlannerSystem",
    title: "PlannerSystem",
    description: "Sistema completo para gestão de eventos, controle de pessoal e financeiro.",
    images: [
      {
        url: "/icons/logo_plannersystem.png",
        alt: "PlannerSystem",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PlannerSystem",
    description: "Sistema completo para gestão de eventos, controle de pessoal e financeiro.",
    images: ["/icons/logo_plannersystem.png"],
  },
  robots: indexavel
    ? {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
          "max-video-preview": -1,
        },
      }
    : {
        index: false,
        follow: false,
      },
  icons: {
    icon: [
      { url: '/icons/favicon.ico', sizes: 'any' },
      { url: '/icons/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/icons/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/icons/icon-192x192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icons/icon-512x512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png' },
    ],
  },
  manifest: '/icons/site.webmanifest',
};

const schemaWebsite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "PlannerSystem",
  url: urlBaseDoSite.toString(),
};

const schemaOrganizacao = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "PlannerSystem",
  url: urlBaseDoSite.toString(),
  logo: new URL("/icons/logo_plannersystem.png", urlBaseDoSite).toString(),
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: "+55-21-96586-5470",
      email: "contato@plannersystem.com.br",
      availableLanguage: ["pt-BR"],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaWebsite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrganizacao) }}
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
