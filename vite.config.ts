import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/cd-kindred-echo-latest/',
  plugins: [react()],
})
