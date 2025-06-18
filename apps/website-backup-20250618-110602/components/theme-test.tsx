"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import React from 'react';

export function ThemeTest() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Current theme: <span className="font-bold">{theme}</span>
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setTheme("light")}
            className={`p-2 rounded-md ${
              theme === "light" 
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" 
                : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            }`}
            aria-label="Set light theme"
          >
            <SunIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`p-2 rounded-md ${
              theme === "dark" 
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" 
                : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            }`}
            aria-label="Set dark theme"
          >
            <MoonIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setTheme("system")}
            className={`p-2 rounded-md ${
              theme === "system" 
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" 
                : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            }`}
            aria-label="Use system theme"
          >
            <span className="text-xs font-medium">System</span>
          </button>
        </div>
      </div>
    </div>
  );
}
