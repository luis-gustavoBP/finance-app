import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/layout/Header";
import { AuthGuard } from "@/components/auth/AuthGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ContApp - Controle de Gastos",
  description: "Aplicativo de controle financeiro pessoal com foco em cartão de crédito e gerenciamento de parcelas",
  keywords: ["finanças", "gastos", "orçamento", "parcelas", "cartão de crédito"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-[#001861]`}
      >
        <Providers>
          <AuthGuard>
            <Header />
            <main className="min-h-[calc(100vh-64px)]">
              {children}
            </main>
          </AuthGuard>
        </Providers>
      </body>
    </html>
  );
}
