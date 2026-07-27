import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { ThemeProvider } from "~/lib/theme";
import { SiteChrome } from "~/components/SiteChrome";
import "./app.css";

export default function App() {
  return (
    <MetaProvider>
      <Title>connectome-fs</Title>
      <ThemeProvider>
        <Router
          root={(props) => (
            <SiteChrome>
              <Suspense>{props.children}</Suspense>
            </SiteChrome>
          )}
        >
          <FileRoutes />
        </Router>
      </ThemeProvider>
    </MetaProvider>
  );
}
