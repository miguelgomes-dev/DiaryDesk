import type { Metadata } from "next";
import { Karla, IBM_Plex_Mono, Petrona } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const petrona = Petrona({
  variable: "--font-petrona",
  subsets: ["latin"],
  style: ["italic"],
});

export const metadata: Metadata = {
  title: "DiaryDesk",
  description: "Organização pessoal: tarefas, financeiro, saúde, faculdade e trabalho num só lugar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${karla.variable} ${ibmPlexMono.variable} ${petrona.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
