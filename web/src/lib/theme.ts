export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "zaincodes-theme";

export function resolveTheme(pref: ThemePreference, systemDark: boolean): ResolvedTheme {
  if (pref === "light") return "light";
  if (pref === "dark") return "dark";
  return systemDark ? "dark" : "light";
}

/**
 * Blocking boot script — must run before first paint.
 * Keep storage key in sync with ThemeProvider.
 */
export const THEME_BOOT_SCRIPT = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var p=localStorage.getItem(k)||'system';var d=p==='dark'||(p!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var t=d?'dark':'light';var el=document.documentElement;el.setAttribute('data-theme',t);el.style.colorScheme=t;el.style.backgroundColor=t==='light'?'#f8fafc':'#070a12';}catch(e){}})();`;
