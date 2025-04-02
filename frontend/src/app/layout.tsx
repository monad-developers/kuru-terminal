import type { Metadata } from "next";
import QueryProvider from "@/src/providers/QueryProvider";
import { AppProvider } from "@/src/providers/AppProvider";
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
          <AppProvider>
            <body className="container mx-auto">{children}</body>
          </AppProvider>
        </QueryProvider>
      </ThemeProvider>
    </html>
  );
}
