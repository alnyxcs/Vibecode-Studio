import path from "node:path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, "/");

          if (!normalizedId.includes("node_modules")) {
            return undefined;
          }

          if (
            normalizedId.includes("/node_modules/react/") ||
            normalizedId.includes("/node_modules/react-dom/") ||
            normalizedId.includes("/node_modules/scheduler/") ||
            normalizedId.includes("/node_modules/zustand/")
          ) {
            return "react-core";
          }

          if (normalizedId.includes("/node_modules/framer-motion/")) {
            return "motion";
          }

          if (normalizedId.includes("/node_modules/@radix-ui/")) {
            return "radix-ui";
          }

          if (normalizedId.includes("/node_modules/lucide-react/") || normalizedId.includes("/node_modules/sonner/")) {
            return "ui-extras";
          }

          if (normalizedId.includes("/node_modules/jszip/") || normalizedId.includes("/node_modules/gray-matter/") || normalizedId.includes("/node_modules/yaml/")) {
            return "import-export";
          }

          if (normalizedId.includes("/node_modules/@uiw/react-md-editor/") || normalizedId.includes("/node_modules/@uiw/react-markdown-preview/")) {
            return "markdown-uiw";
          }

          if (normalizedId.includes("/node_modules/@codemirror/") || normalizedId.includes("/node_modules/codemirror/")) {
            return "markdown-codemirror";
          }

          if (normalizedId.includes("/node_modules/react-markdown/")) {
            return "markdown-react";
          }

          if (normalizedId.includes("/node_modules/unified/") || normalizedId.includes("/node_modules/bail/") || normalizedId.includes("/node_modules/trough/")) {
            return "markdown-unified-core";
          }

          if (normalizedId.includes("/node_modules/remark-")) {
            return "markdown-remark";
          }

          if (normalizedId.includes("/node_modules/rehype-")) {
            return "markdown-rehype";
          }

          if (
            normalizedId.includes("/node_modules/mdast-util-to-hast/") ||
            normalizedId.includes("/node_modules/hast-util-to-jsx-runtime/") ||
            normalizedId.includes("/node_modules/hast-util-to-html/") ||
            normalizedId.includes("/node_modules/remark-rehype/") ||
            normalizedId.includes("/node_modules/rehype-stringify/")
          ) {
            return "markdown-render";
          }

          if (
            normalizedId.includes("/node_modules/remark-parse/") ||
            normalizedId.includes("/node_modules/remark-gfm/") ||
            normalizedId.includes("/node_modules/remark-breaks/") ||
            normalizedId.includes("/node_modules/remark-directive/")
          ) {
            return "markdown-remark";
          }

          if (
            normalizedId.includes("/node_modules/rehype-raw/") ||
            normalizedId.includes("/node_modules/rehype-sanitize/") ||
            normalizedId.includes("/node_modules/rehype-slug/") ||
            normalizedId.includes("/node_modules/rehype-prism-plus/")
          ) {
            return "markdown-rehype";
          }

          if (
            normalizedId.includes("/node_modules/micromark") ||
            normalizedId.includes("/node_modules/decode-named-character-reference/") ||
            normalizedId.includes("/node_modules/character-entities/") ||
            normalizedId.includes("/node_modules/parse-entities/")
          ) {
            return "markdown-micromark";
          }

          if (
            normalizedId.includes("/node_modules/mdast") ||
            normalizedId.includes("/node_modules/hast") ||
            normalizedId.includes("/node_modules/unist") ||
            normalizedId.includes("/node_modules/vfile") ||
            normalizedId.includes("/node_modules/property-information/") ||
            normalizedId.includes("/node_modules/comma-separated-tokens/") ||
            normalizedId.includes("/node_modules/space-separated-tokens/")
          ) {
            return "markdown-ast";
          }

          return undefined;
        },
      },
    },
  },
});
