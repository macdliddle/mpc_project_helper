import react from '@vitejs/plugin-react-swc'
import fs from 'node:fs/promises'
import { defineConfig } from 'vite'
import webExtension, { readJsonFile } from 'vite-plugin-web-extension'

// https://vitejs.dev/config/
const firefox = process.env.MPC_FIREFOX_BUILD === '1'

export default defineConfig({
  define: { __FIREFOX__: JSON.stringify(firefox) },
  build: {
    outDir: firefox ? 'dist-firefox' : 'dist',
  },
  plugins: [
    react(),
    {
      name: 'include-license',
      async generateBundle() {
        this.emitFile({ type: 'asset', fileName: 'LICENSE', source: await fs.readFile('LICENSE', 'utf8') })
      },
    },
    webExtension({
      browser: firefox ? 'firefox' : 'chrome',
      manifest: () => {
        const manifest = readJsonFile('manifest.json')
        if (!firefox) return manifest
        return {
          ...manifest,
          permissions: [],
          background: { scripts: ['src/background.ts'] },
          browser_specific_settings: {
            gecko: {
              id: 'mpc-project-helper@macdliddle.github.io',
              data_collection_permissions: { required: ['none'] },
            },
          },
        }
      },
      transformManifest: (manifest) => {
        const pkg = readJsonFile('package.json')
        return {
          name: pkg.name,
          description: pkg.description,
          version: pkg.version,
          ...manifest,
        }
      },
    }),
  ],
})
