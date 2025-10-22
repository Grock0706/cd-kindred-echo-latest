import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Break out large vendor libraries into separate chunks to reduce the main chunk size
export default defineConfig(({ mode }) => {
  // Default base for GH Pages; you can override when building for native with --base './'
  const base = process.env.VITE_BASE || '/cd-kindred-echo-latest/'

  return {
    base,
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) return 'vendor-react'
              if (id.includes('framer-motion')) return 'vendor-framer-motion'
              if (id.includes('lucide-react')) return 'vendor-lucide'
              if (id.includes('html2canvas')) return 'vendor-html2canvas'
              if (id.includes('dexie')) return 'vendor-dexie'
              if (id.includes('jszip') || id.includes('jspdf')) return 'vendor-pdf'
              return 'vendor'
            }
          }
        }
      }
    }
  }
})
