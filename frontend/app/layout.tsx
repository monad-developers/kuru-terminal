import type { Metadata } from "next";
import QueryProvider from "@/providers/QueryProvider";
import ThemeProvider from "@/providers/ThemeProvider";

import "./globals.css";

export const metadata: Metadata = {
  title: "Kuru Indexer Example App",
  description: "Kuru Indexer Example App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <QueryProvider>
        <ThemeProvider>
          <body className="container mx-auto">{children}</body>
        </ThemeProvider>
      </QueryProvider>
    </html>
  );
}
