import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import eslintPlugin from "@nabla/vite-plugin-eslint";
 
export default defineConfig({
  plugins: [react(), eslintPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
