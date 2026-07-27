import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { ThemeProvider } from "~/lib/theme";
import { SiteChrome } from "~/components/SiteChrome";
import "./app.css";

/** Vite/SolidStart BASE_URL is `/connectome-fs/`; Solid Router wants no trailing slash. */
function routerBase(): string {
  const raw = import.meta.env.BASE_URL || "/";
  if (raw === "/") return "";
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

export default function App() {
  const base = routerBase();

  return (
    <MetaProvider>
      <Title>connectome-fs</Title>
      <ThemeProvider>
        <Router
          base={base}
          root={(props) => (
            <SiteChrome>
              <Suspense fallback={null}>{props.children}</Suspense>
            </SiteChrome>
          )}
        >
          <FileRoutes />
        </Router>
      </ThemeProvider>
    </MetaProvider>
  );
}
