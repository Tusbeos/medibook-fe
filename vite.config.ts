import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      src: path.resolve(__dirname, "src"),
      // Support bare imports like `import X from "containers/..."` (baseUrl: "src")
      containers: path.resolve(__dirname, "src/containers"),
      components: path.resolve(__dirname, "src/components"),
      services: path.resolve(__dirname, "src/services"),
      store: path.resolve(__dirname, "src/store"),
      utils: path.resolve(__dirname, "src/utils"),
      hoc: path.resolve(__dirname, "src/hoc"),
      assets: path.resolve(__dirname, "src/assets"),
      styles: path.resolve(__dirname, "src/styles"),
      translations: path.resolve(__dirname, "src/translations"),
      types: path.resolve(__dirname, "src/types"),
      routes: path.resolve(__dirname, "src/routes"),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Silence deprecation warnings from dependencies
        silenceDeprecations: ["legacy-js-api"],
      },
    },
  },
});
