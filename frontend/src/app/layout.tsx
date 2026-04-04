import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope, Bodoni_Moda } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Vaibhav Verma Photography | Beyond the Frame",
  description: "A Quiet Archive of Light, Weather, and Narrative Storytelling.",
  openGraph: {
    title: "Vaibhav Verma | Beyond the Frame",
    description: "A professional photography archive exploring the intersection of light and narrative.",
    url: "https://beyond-the-frame-sigma.vercel.app",
    siteName: "Vaibhav Verma Photography",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Beyond the Frame Photography Archive",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vaibhav Verma Photography",
    description: "A Quiet Archive of Light and Weather.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

import { AuthContextProvider } from "../lib/authContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${manrope.variable} ${bodoni.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthContextProvider>
          {children}
        </AuthContextProvider>
      </body>
    </html>
  );
}
