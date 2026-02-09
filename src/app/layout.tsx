import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { AuthGuard } from "@/components/auth/AuthGuard";

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
  userScalable: false,
  themeColor: "#3B82F6",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "ContApp - Controle de Gastos",
  description: "Aplicativo de controle financeiro pessoal com foco em cartão de crédito e gerenciamento de parcelas",
  keywords: ["finanças", "gastos", "orçamento", "parcelas", "cartão de crédito"],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ContApp",
  },
  icons: {
    apple: [
      { url: "/180.png", sizes: "180x180", type: "image/png" },
      { url: "/152.png", sizes: "152x152", type: "image/png" },
      { url: "/167.png", sizes: "167x167", type: "image/png" },
      { url: "/120.png", sizes: "120x120", type: "image/png" },
      { url: "/114.png", sizes: "114x114", type: "image/png" },
      { url: "/76.png", sizes: "76x76", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-[#001861] pb-20 md:pb-0 overflow-x-hidden`}
      >
        <Providers>
          <AuthGuard>
            {/* Mobile Logo Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-auto min-h-[56px] bg-[#001861]/95 backdrop-blur-md border-b border-white/10 pt-safe">
              <div className="h-14 flex items-center justify-center px-4">
                <Link href="/">
                  <img
                    src="/logo.png"
                    alt="ContApp"
                    className="h-8 w-auto rounded-lg"
                  />
                </Link>
              </div>
            </div>
            {/* Desktop Header */}
            <div className="hidden md:block">
              <Header />
            </div>
            <main className="min-h-[calc(100vh-64px)] pt-header-safe md:pt-0">
              {children}
            </main>
            {/* Mobile Bottom Navigation */}
            <BottomNav />
          </AuthGuard>
        </Providers>
      </body>
    </html>
  );
}

