import {
  createContext,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  useContext,
  type ParentComponent,
  type Accessor,
} from "solid-js";
import { isServer } from "solid-js/web";

type Theme = "light" | "dark";

type ThemeApi = {
  theme: Accessor<Theme>;
  /** User override; cleared automatically on next system theme change. */
  toggle: () => void;
  isOverride: Accessor<boolean>;
};

const ThemeCtx = createContext<ThemeApi>();

function systemTheme(): Theme {
  if (isServer || typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function apply(theme: Theme) {
  if (isServer || typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.theme = theme;
  // CSS on `html` / `body` cross-fades via --theme-fade; force a paint tick for stubborn UAs.
  root.style.setProperty("color-scheme", theme);
}

export const ThemeProvider: ParentComponent = (props) => {
  const [theme, setTheme] = createSignal<Theme>("light");
  const [override, setOverride] = createSignal(false);

  onMount(() => {
    const initial = systemTheme();
    setTheme(initial);
    apply(initial);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => {
      // System change clears manual override and follows the new preference.
      setOverride(false);
      const next = mq.matches ? "dark" : "light";
      setTheme(next);
      apply(next);
    };
    mq.addEventListener("change", onSystemChange);
    onCleanup(() => mq.removeEventListener("change", onSystemChange));
  });

  createEffect(() => {
    apply(theme());
  });

  const api: ThemeApi = {
    theme,
    isOverride: override,
    toggle: () => {
      setOverride(true);
      const next: Theme = theme() === "dark" ? "light" : "dark";
      setTheme(next);
      apply(next);
    },
  };

  return <ThemeCtx.Provider value={api}>{props.children}</ThemeCtx.Provider>;
};

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme requires ThemeProvider");
  return ctx;
}
