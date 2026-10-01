import { createSdk } from "@whop/iframe";

const appId = import.meta.env.VITE_WHOP_APP_ID;

if (!appId) {
  console.warn("VITE_WHOP_APP_ID environment variable is not set - Whop iframe features disabled");
}

type ThemeCallback = (theme: "light" | "dark") => void;
const themeListeners = new Set<ThemeCallback>();

export function onWhopThemeChange(callback: ThemeCallback): () => void {
  themeListeners.add(callback);
  return () => {
    themeListeners.delete(callback);
  };
}

export const whopIframeSdk = appId
  ? createSdk({
      appId: appId,
      onMessage: {
        onColorThemeChange: (data) => {
          if (data?.appearance === "light" || data?.appearance === "dark") {
            themeListeners.forEach((callback) => callback(data.appearance as "light" | "dark"));
          }
        },
        appPing: () => "app_pong",
      },
    })
  : null;

export async function getWhopTheme(): Promise<"light" | "dark" | null> {
  if (!whopIframeSdk) return null;
  try {
    const themeData = await whopIframeSdk.getColorTheme();
    if (themeData?.appearance === "light" || themeData?.appearance === "dark") {
      return themeData.appearance;
    }
  } catch (err) {
    console.debug("[Whop] Could not get color theme from SDK:", err);
  }
  return null;
}

export const isWhopIframeEnabled = !!appId;
