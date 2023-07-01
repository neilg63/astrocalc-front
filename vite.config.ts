import { defineConfig } from "vite";
import unocssPlugin from "unocss/vite";
import solid from "solid-start/vite";
import suidPlugin from "@suid/vite-plugin";

export default defineConfig({
  plugins: [unocssPlugin(), suidPlugin(), solid()],
  server: {
    port: 4001,
  },
  build: {
    target: "esnext",
  },
});
