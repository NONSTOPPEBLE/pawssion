import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const repositoryName = loadEnv(mode, ".", "").GITHUB_REPOSITORY?.split("/")[1];
  const base =
    repositoryName && !repositoryName.endsWith(".github.io")
      ? `/${repositoryName}/`
      : "/";

  return {
    base,
    plugins: [react()],
    server: {
      watch: {
        ignored: ["**/*.crdownload"],
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("/node_modules/three/")) return "three-core";
            if (id.includes("/node_modules/@react-three/") || id.includes("/node_modules/three-stdlib/")) return "react-three";
          },
        },
      },
    },
  };
});
