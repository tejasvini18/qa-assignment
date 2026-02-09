import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

const MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024; // 1MB per log file
const TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6); // Trim to 60% to avoid constant re-trimming

const plugins = [react(), tailwindcss(), jsxLocPlugin()];

export default defineConfig({
	plugins,
	resolve: {
		alias: {
			"@": path.resolve(import.meta.dirname, "client", "src"),
			"@shared": path.resolve(import.meta.dirname, "shared"),
			"@assets": path.resolve(import.meta.dirname, "attached_assets"),
		},
	},
	envDir: path.resolve(import.meta.dirname),
	root: path.resolve(import.meta.dirname, "client"),
	publicDir: path.resolve(import.meta.dirname, "client", "public"),
	build: {
		outDir: path.resolve(import.meta.dirname, "dist/public"),
		emptyOutDir: true,
	},
	server: {
		host: true,
		allowedHosts: ["localhost", "127.0.0.1"],
		fs: {
			strict: true,
			deny: ["**/.*"],
		},
		port: 3000,
		proxy: {
			"/api": {
				target: "http://localhost:3001",
				changeOrigin: true,
			},
			"/uploads": {
				target: "http://localhost:3001",
				changeOrigin: true,
			},
			"/socket.io": {
				target: "http://localhost:3001",
				ws: true,
			},
		},
	},
});
