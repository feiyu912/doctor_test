import { defineConfig } from "astro/config";

const site = process.env.SITE_URL || "https://example.github.io";
const rawBase = process.env.BASE_PATH || "/doctor_test/";
const base = rawBase === "/" ? "/" : `/${rawBase.replace(/^\/|\/$/g, "")}/`;

export default defineConfig({
  site,
  base,
  trailingSlash: "always",
  output: "static",
  build: {
    format: "directory",
    sourcemap: false
  },
  vite: {
    define: {
      __BASE_PATH__: JSON.stringify(base)
    }
  }
});
