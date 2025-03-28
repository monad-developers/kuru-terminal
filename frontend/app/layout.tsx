import type { Metadata } from "next";
import QueryProvider from "@/providers/QueryProvider";
import { ThemeProvider } from "next-themes";

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
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <QueryProvider>
          <body className="container mx-auto">{children}</body>
        </QueryProvider>
      </ThemeProvider>
    </html>
  );
}
