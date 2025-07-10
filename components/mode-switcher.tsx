"use client";

import * as React from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ModeSwitcher() {
  const { setTheme, resolvedTheme } = useTheme();

  const toggleTheme = React.useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  return (
    <Button
      variant="ghost"
      onClick={toggleTheme}
      className="relative h-10 w-10 rounded-full flex items-center justify-center transition-all hover:bg-gray-100 dark:hover:bg-gray-800 group cursor-pointer shadow-sm hover:shadow-md dark:shadow-sm dark:hover:shadow-md"
    >
      {/* Sun Icon */}
      <SunIcon className="absolute h-5 w-5 text-yellow-500 transition-all duration-500 ease-in-out rotate-0 scale-100 opacity-100 group-[.dark]:-rotate-90 group-[.dark]:scale-0 group-[.dark]:opacity-0" />

      {/* Moon Icon */}
      <MoonIcon className="absolute h-5 w-5 text-gray-700 dark:text-gray-200 transition-all duration-500 ease-in-out rotate-90 scale-0 opacity-0 group-[.dark]:rotate-0 group-[.dark]:scale-100 group-[.dark]:opacity-100" />

      <span className="sr-only">Toggle theme</span>
        
    </Button>
  );
}
