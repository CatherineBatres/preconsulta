import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "PreConsulta",
  description: "Prepara tu ficha médica antes de la consulta, con tu voz.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full bg-slate-50 antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
