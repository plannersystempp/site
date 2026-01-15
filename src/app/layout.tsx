import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PlannerSystem - Gestão de Eventos",
  description: "Sistema completo para gestão de eventos, controle de pessoal e financeiro.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
