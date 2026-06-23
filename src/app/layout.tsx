import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ADDI SMB GTM",
  description: "MVP para planeacion territorial y visitas de ventas SMB"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
