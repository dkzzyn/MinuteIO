import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/** Dev + preview: pedidos /api/* → Express (porta 3001). */
const apiProxy = {
  "/api": {
    target: "http://localhost:3001",
    changeOrigin: true,
  },
} as const;

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { ...apiProxy },
  },
  /** `vite preview` também precisa disto — senão /api devolve o index.html e o JSON falha. */
  preview: {
    port: 4173,
    proxy: { ...apiProxy },
  },
});
