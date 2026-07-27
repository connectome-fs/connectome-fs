import { defineConfig } from "@solidjs/start/config";

const base = process.env.BASE_PATH || "/connectome-fs/";

export default defineConfig({
  server: {
    preset: "static",
    baseURL: base,
    prerender: {
      crawlLinks: false,
      routes: ["/", "/news", "/about", "/docs"],
    },
  },
  vite: {
    base,
  },
});
