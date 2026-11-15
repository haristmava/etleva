import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  if (mode === 'production') {
    const apiUrl = env.VITE_API_URL?.trim()

    if (!apiUrl) {
      throw new Error(
        'VITE_API_URL is required for production builds and must point to the backend /api URL.'
      )
    }

    let parsedApiUrl: URL

    try {
      parsedApiUrl = new URL(apiUrl)
    } catch {
      throw new Error('VITE_API_URL must be an absolute HTTP(S) API URL.')
    }

    const apiPath = parsedApiUrl.pathname.replace(/\/+$/, '') || '/'

    if (
      !['http:', 'https:'].includes(parsedApiUrl.protocol) ||
      !['/', '/api'].includes(apiPath.toLowerCase()) ||
      parsedApiUrl.search ||
      parsedApiUrl.hash
    ) {
      throw new Error(
        'VITE_API_URL must be an HTTP(S) backend root or a /api URL without query or hash.'
      )
    }
  }

  return {
    plugins: [react(), tailwindcss()],
  }
})
