import { defineConfig } from "vite";
import unocssPlugin from "unocss/vite";
import solid from "solid-start/vite";

export default defineConfig({
  plugins: [unocssPlugin(), solid()],
  server: {
    port: 4001,
  },
  build: {
    target: "esnext",
  },
});
