import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "İlanYaz.ai — Yapay Zeka ile Anında İlan Metni",
  description: "Emlakçılar ve araç galerileri için saniyeler içinde profesyonel ilan metni. Sahibinden, Hepsiemlak, WhatsApp ve Instagram için optimize edilmiş içerik.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full" suppressHydrationWarning>
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
