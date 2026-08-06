"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      aria-label="Toggle theme"
      className="btn btn-ghost"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <span className="hidden dark:inline">
        <Sun size={18} />
      </span>
      <span className="dark:hidden">
        <Moon size={18} />
      </span>
    </button>
  );
}
