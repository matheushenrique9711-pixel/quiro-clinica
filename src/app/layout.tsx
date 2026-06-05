import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quiro Clínica",
  description: "Sistema de gestão — Quiropraxia Pinheiros",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className={`${inter.className} min-h-full bg-gray-50`}>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
