import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "flexlayout-react/style/light.css";
import "@app/(platform)/globals.css";

// Aquí importarás tu futuro wrapper de contextos globales
// import { Providers } from "@/providers/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

// Metadatos reforzados para privacidad
export const metadata: Metadata = {
  title: "Red Velvet Platform | Red Velvet Engine",
  description:
    "Fraud decision engine — management console, rule builder, decision console.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        {/* Inyección del contenedor de estado y sesión */}
        {/* <Providers> */}
        {children}
        {/* </Providers> */}
      </body>
    </html>
  );
}
