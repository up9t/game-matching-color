import vue from "@vitejs/plugin-vue";
import { type ConfigEnv, defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig((env: ConfigEnv) => ({
  plugins: [vue()],
  base: env.mode === "github" ? "/game-matching-color" : "/",
}));
