import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  base: "./",
  build: {
    sourcemap: true,
  },
  resolve: {
    alias: {
      jsts: resolve(__dirname, "node_modules/jsts/dist/jsts.min.js"),
    },
  },
  optimizeDeps: {
    include: ["jsts"],
  },
});
