import { readStorage, writeStorage } from "../lib/storage";

type ThemePreference = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

const THEME_KEY = "medical-question-bank:theme";
const THEMES: ThemePreference[] = ["light", "dark", "system"];

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

function getPreference(): ThemePreference {
  const stored = readStorage(THEME_KEY);
  return isThemePreference(stored) ? stored : "system";
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  return preference === "system" ? getSystemTheme() : preference;
}

function updateControls(preference: ThemePreference, resolved: ResolvedTheme): void {
  document.querySelectorAll<HTMLElement>("[data-theme-set]").forEach((control) => {
    control.setAttribute("aria-pressed", String(control.dataset.themeSet === preference));
  });

  document.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]").forEach((button) => {
    button.setAttribute("aria-pressed", String(resolved === "dark"));
    button.dataset.themePreference = preference;
    button.dataset.themeResolved = resolved;
  });
}

function applyTheme(preference: ThemePreference, persist: boolean): void {
  const resolved = resolveTheme(preference);
  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.themePreference = preference;
  if (persist) writeStorage(THEME_KEY, preference);
  updateControls(preference, resolved);
}

function nextTheme(preference: ThemePreference): ThemePreference {
  const index = THEMES.indexOf(preference);
  return THEMES[(index + 1) % THEMES.length] ?? "system";
}

function init(): void {
  applyTheme(getPreference(), false);

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const themeSet = target.closest<HTMLElement>("[data-theme-set]");
    if (themeSet) {
      const preference = themeSet.dataset.themeSet ?? null;
      if (isThemePreference(preference)) applyTheme(preference, true);
      return;
    }

    if (target.closest("[data-theme-toggle]")) {
      applyTheme(nextTheme(getPreference()), true);
    }
  });

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (getPreference() === "system") applyTheme("system", false);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
