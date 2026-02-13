import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import preprocess from "svelte-preprocess";

export default defineConfig({
  plugins: [
    svelte({
      preprocess: preprocess({
        typescript: true
      })
    })
  ],
  resolve: {
    alias: {
      "@lib": fileURLToPath(new URL("./src/lib", import.meta.url)),
      "@data": fileURLToPath(new URL("./src/data", import.meta.url)),
      "@types": fileURLToPath(new URL("./src/types", import.meta.url))
    }
  },
  server: {
    open: true
  }
});
