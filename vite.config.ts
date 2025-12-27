import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import netlifyPlugin from "@netlify/vite-plugin-react-router";
import { iconsSpritesheet } from "vite-plugin-icons-spritesheet";
import devToolsJson from "vite-plugin-devtools-json";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    devToolsJson(),
    iconsSpritesheet({
      inputDir: "app/icons/svgs",
      outputDir: "app/icons",
      withTypes: true,
    }),
    reactRouter(),
    tsconfigPaths(),
    netlifyPlugin(),
    visualizer({
      template: "treemap",
      gzipSize: true,
      // Emit one file for each bundle
      // `/build/server/stats.html` and `/build/client/stats.html`
      emitFile: true,
    }),
  ],
  test: {
    include: ["./app/**/*.test.{ts,tsx}"],
    setupFiles: ["./tests/vitest-setup.ts"],
  },
});
