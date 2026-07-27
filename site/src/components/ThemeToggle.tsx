import { useTheme } from "~/lib/theme";

function SunIcon(props: { class?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      class={props.class}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <g stroke="currentColor" stroke-width="1.75" stroke-linecap="round">
        <path d="M12 2.5v2.25M12 19.25V21.5M2.5 12h2.25M19.25 12H21.5" />
        <path d="M5.05 5.05l1.6 1.6M17.35 17.35l1.6 1.6M5.05 18.95l1.6-1.6M17.35 6.65l1.6-1.6" />
      </g>
    </svg>
  );
}

function MoonIcon(props: { class?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      class={props.class}
      aria-hidden="true"
    >
      <path d="M20.2 14.35A8.2 8.2 0 0 1 9.65 3.8a8.25 8.25 0 1 0 10.55 10.55Z" />
    </svg>
  );
}

export function ThemeToggle() {
  const theme = useTheme();
  const isDark = () => theme.theme() === "dark";

  return (
    <button
      type="button"
      class="theme-toggle"
      onClick={() => theme.toggle()}
      aria-label={isDark() ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={theme.isOverride()}
      title={
        theme.isOverride()
          ? "Manual override — resets on next system theme change"
          : "Following system theme — click to override"
      }
    >
      <SunIcon class="theme-icon theme-icon-sun" />
      <MoonIcon class="theme-icon theme-icon-moon" />
    </button>
  );
}
