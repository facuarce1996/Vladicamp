import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carga las variables de entorno desde el archivo .env ubicado en la raíz
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Inyecta la API KEY de forma segura. Si no existe, usa una cadena vacía para evitar crash en runtime.
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
    }
  }
})