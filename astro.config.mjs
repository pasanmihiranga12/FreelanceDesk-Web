import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Static site. `site` is used for canonical links and the sitemap.
export default defineConfig({
  site: "https://freelancedesk.lygenexlabs.com",
  integrations: [sitemap()],
  build: { format: "directory" },
});
