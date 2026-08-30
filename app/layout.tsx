import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ACI Sindilojas Três de Maio",
  description: "Representatividade, conexões e soluções para fortalecer quem empreende em Três de Maio e região.",
  icons: {
    icon: [{url:"/icone-aci.png",type:"image/png"}],
    shortcut: "/icone-aci.png",
    apple:"/icone-aci.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
