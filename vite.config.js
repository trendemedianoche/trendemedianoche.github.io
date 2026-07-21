import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  esbuild: {
    // Elimina console.* y debugger en el build de producción
    drop: ['console', 'debugger']
  }
})
