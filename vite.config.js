import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  esbuild: {
    // Elimina console.* y debugger en el build de producción
    drop: ['console', 'debugger']
  }
})
