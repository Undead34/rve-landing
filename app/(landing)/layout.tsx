import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/landing/theme-provider";
import "@/app/(landing)/globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#050505" },
  ],
};

// Metadatos de Marketing (SEO + Social)
export const metadata: Metadata = {
  metadataBase: new URL("https://rve.org"),
  title: "Red Velvet Engine | Black Cherry Edition",
  description:
    "El motor de decisiones anti-fraude diseñado como infraestructura premium. Sin memoria emocional. Sin latencia. Sin excepciones.",
  keywords: [
    "anti-fraude",
    "motor de decisiones",
    "ciberseguridad",
    "prevención de fraude",
    "SaaS",
  ],
  authors: [{ name: "Red Velvet Engine" }],
  openGraph: {
    type: "website",
    title: "Red Velvet Engine | Black Cherry Edition",
    description: "Infraestructura premium de decisiones anti-fraude.",
    siteName: "Red Velvet Engine",
    images: [
      {
        url: "/og-image.webp",
        width: 1200,
        height: 630,
        alt: "Red Velvet Engine Dashboard Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Red Velvet Engine",
    description: "Infraestructura premium de decisiones anti-fraude.",
    images: ["/og-image.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetBrainsMono.variable} font-sans antialiased selection:bg-cherry selection:text-white flex flex-col min-h-screen bg-paper text-ink dark:bg-void dark:text-cream transition-colors duration-500`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
