import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { devApi } from "./api/_lib/devServer.js";

export default defineConfig(({ mode }) => {
  // Carrega o .env inteiro (sem filtro de prefixo) só para o servidor local.
  // Nada daqui vai para o bundle do navegador.
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), tailwindcss(), devApi(env)],
  };
});
