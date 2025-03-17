"use client";

import { useEffect } from "react";

export default function ThemeProvider() {
  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.body.classList.add("dark");
      console.log("dark");
    } else {
      document.body.classList.add("light");
      console.log("light");
    }
  }, []);

  return null;
}
