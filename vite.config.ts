import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import netlifyPlugin from "@netlify/vite-plugin-react-router";
import { iconsSpritesheet } from "vite-plugin-icons-spritesheet";

export default defineConfig({
  plugins: [
    iconsSpritesheet({
      inputDir: "app/icons/svgs",
      outputDir: "app/icons",
      withTypes: true,
    }),
    reactRouter(),
    tsconfigPaths(),
    netlifyPlugin(),
  ],
  test: {
    include: ["./app/**/*.test.{ts,tsx}"],
  },
});
