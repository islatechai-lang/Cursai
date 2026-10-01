import { createContext, useContext, useEffect, useState } from "react";
import { getWhopTheme, onWhopThemeChange } from "@/lib/whop-iframe";

function getSystemPreference(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

interface ThemeContextType {
  theme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">(() => getSystemPreference());

  useEffect(() => {
    let isWhopControlled = false;

    // 1. Fetch initial theme from Whop iframe SDK
    getWhopTheme().then((whopTheme) => {
      if (whopTheme) {
        isWhopControlled = true;
        setTheme(whopTheme);
      }
    });

    // 2. Listen to real-time theme changes from Whop
    const unsubscribeWhop = onWhopThemeChange((newTheme) => {
      isWhopControlled = true;
      setTheme(newTheme);
    });

    // 3. Listen to system preference changes as fallback outside Whop
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = (e: MediaQueryListEvent) => {
      if (!isWhopControlled) {
        setTheme(e.matches ? "dark" : "light");
      }
    };
    mediaQuery.addEventListener("change", handleSystemChange);

    return () => {
      unsubscribeWhop();
      mediaQuery.removeEventListener("change", handleSystemChange);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
}
