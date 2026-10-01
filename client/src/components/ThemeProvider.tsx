import { createContext, useContext, useEffect, useRef, useState } from "react";
import { getWhopTheme, onWhopThemeChange, isWhopIframeEnabled } from "@/lib/whop-iframe";

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
  const themeRef = useRef(theme);

  // Keep ref in sync so the polling interval can read latest without re-creating
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    // 1. Fetch initial theme from Whop iframe SDK
    getWhopTheme().then((whopTheme) => {
      if (whopTheme) {
        setTheme(whopTheme);
      }
    });

    // 2. Listen to real-time theme changes from Whop via onMessage
    const unsubscribeWhop = onWhopThemeChange((newTheme) => {
      setTheme(newTheme);
    });

    // 3. Poll getColorTheme() every 1s as a reliable fallback
    //    The onMessage event may not fire in all Whop environments,
    //    so this ensures theme stays synced regardless.
    let pollInterval: ReturnType<typeof setInterval> | null = null;
    if (isWhopIframeEnabled) {
      pollInterval = setInterval(async () => {
        const polledTheme = await getWhopTheme();
        if (polledTheme && polledTheme !== themeRef.current) {
          setTheme(polledTheme);
        }
      }, 1000);
    }

    // 4. Listen to OS preference changes as fallback when outside Whop
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = (e: MediaQueryListEvent) => {
      if (!isWhopIframeEnabled) {
        setTheme(e.matches ? "dark" : "light");
      }
    };
    mediaQuery.addEventListener("change", handleSystemChange);

    return () => {
      unsubscribeWhop();
      if (pollInterval) clearInterval(pollInterval);
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
