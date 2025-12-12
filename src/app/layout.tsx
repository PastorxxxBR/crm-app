import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/providers/ToastProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CRM Toca da Onça | Sistema de Gestão Completo",
  description: "Sistema CRM completo com análise competitiva, integração com Mercado Livre, Google Shopping e muito mais",
  keywords: "CRM, gestão, vendas, análise competitiva, mercado livre, google shopping",
  authors: [{ name: "Toca da Onça Modas" }],
  openGraph: {
    title: "CRM Toca da Onça",
    description: "Sistema de gestão completo para sua loja",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} antialiased`}>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
