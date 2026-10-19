import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Static site. `site` is used for canonical links and the sitemap.
export default defineConfig({
  site: "https://freelancedesk.lygenexlabs.com",
  integrations: [sitemap({ filter: (page) => !page.includes("/404") && !page.includes("/reset-password") })],
  build: { format: "directory" },
});
