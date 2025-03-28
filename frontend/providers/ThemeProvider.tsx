"use client";

import * as React from "react";
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";

const ThemeProvider = ({ children }: ThemeProviderProps) => {
  return (
    <NextThemesProvider attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}

export default ThemeProvider;
