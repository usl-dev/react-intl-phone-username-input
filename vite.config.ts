/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { visualizer } from "rollup-plugin-visualizer";
import path from "path";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    dts({
      tsconfigPath: "./tsconfig.build.json",
      outDir: "dist/types",
      entryRoot: "src",
      strictOutput: true,
      include: ["src"],
      exclude: [
        "src/**/*.test.ts",
        "src/**/*.test.tsx",
        "src/**/*.spec.ts",
        "src/**/*.spec.tsx",
        "vitest.setup.ts",
      ],
      insertTypesEntry: true,
    }),
    ...(mode === "analyze"
      ? [
          visualizer({
            filename: "dist/stats.html",
            gzipSize: true,
            brotliSize: true,
            open: false,
          }),
        ]
      : []),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "react-intl-phone-username-input",
      cssFileName: "react-intl-phone-username-input",
      fileName: (format) => (format === "es" ? "index.esm.js" : "index.cjs"),
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: (id) => {
        if (id === "react" || id === "react/jsx-runtime") return true;
        if (id === "libphonenumber-js" || id.startsWith("libphonenumber-js/"))
          return true;
        return false;
      },
      output: {
        globals: {
          react: "React",
          "react/jsx-runtime": "jsxRuntime",
          "libphonenumber-js": "libphonenumberJs",
          "libphonenumber-js/mobile/examples": "libphonenumberJsExamples",
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
}));
