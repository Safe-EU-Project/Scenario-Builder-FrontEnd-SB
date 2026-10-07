import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import flowbiteReact from "flowbite-react/plugin/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // In production everything goes through nginx on the server.
  // For local dev we proxy /api → nginx so we don't need to know
  // the internal port of each service.
  const serverBase = env.VITE_SERVER_BASE || "https://10.240.138.254";

  return {
    plugins: [react(), flowbiteReact()],

    server: {
      https: false,
      host: true,
      port: 5173,
      proxy: {
        // LLM service — SAFE LLM on port 9002
        "/llm": {
          target: "http://10.240.138.254:9002",
          changeOrigin: true,
          secure: false,
          timeout: 300000,
          proxyTimeout: 300000,
          rewrite: (path) => path.replace(/^\/llm/, ""),
          configure: (proxy) => {
            proxy.on("error", (err, req) => {
              console.error(`[proxy error] ${req.method} ${req.url} →`, err.message);
            });
            proxy.on("proxyReq", (_, req) => {
              console.log(`[proxy] ${req.method} ${req.url}`);
            });
            proxy.on("proxyRes", (proxyRes, req, res) => {
              if ((req.url || "").includes("grade_step_stream")) {
                res.setHeader("Cache-Control", "no-cache");
                res.setHeader("X-Accel-Buffering", "no");
              }
              if (proxyRes.statusCode >= 400) {
                console.warn(`[proxy] ${proxyRes.statusCode} ${req.url}`);
              }
            });
          },
        },
        // Backend API — SAFE Backend on port 9000
        "/api": {
          target: "http://10.240.138.254:9000",
          changeOrigin: true,
          secure: false,
          followRedirects: true,
          // Scenario generation / policy draft can take 1–3 minutes on the GPU LLM.
          timeout: 300000,
          proxyTimeout: 300000,
          rewrite: (path) => path.replace(/^\/api/, ""),
          configure: (proxy) => {
            proxy.on("error", (err, req) => {
              console.error(`[proxy error] ${req.method} ${req.url} →`, err.message);
            });
            proxy.on("proxyReq", (_, req) => {
              console.log(`[proxy] ${req.method} ${req.url}`);
            });
            proxy.on("proxyRes", (res, req) => {
              if (res.statusCode >= 400) {
                console.warn(`[proxy] ${res.statusCode} ${req.url}`);
              }
            });
          },
        },
      },
    },
  };
});
