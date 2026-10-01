import { createSdk } from "@whop/iframe";

const metaAppId = typeof document !== "undefined"
  ? document.querySelector('meta[name="whop-app-id"]')?.getAttribute("content")
  : null;
const appId = import.meta.env.VITE_WHOP_APP_ID || metaAppId || "app_fjarsKpxUSW3Ti";

type ThemeCallback = (theme: "light" | "dark") => void;
const themeListeners = new Set<ThemeCallback>();

export function onWhopThemeChange(callback: ThemeCallback): () => void {
  themeListeners.add(callback);
  return () => {
    themeListeners.delete(callback);
  };
}

// Also listen to the official frosted-ui:set-theme custom event dispatched by @whop/iframe
if (typeof window !== "undefined") {
  document.documentElement.addEventListener("frosted-ui:set-theme", (e: any) => {
    const appearance = e.detail?.appearance;
    if (appearance === "light" || appearance === "dark") {
      themeListeners.forEach((callback) => callback(appearance));
    }
  });
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
