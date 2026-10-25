import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import license from 'rollup-plugin-license'
import type { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

const notices = fileURLToPath(new URL('./THIRD-PARTY-NOTICES.md', import.meta.url))

// Lizenzen aller gebündelten Bibliotheken + eigene Hinweise (Zeichen, Schrift, Daten) als
// dist/licenses.txt; die App verlinkt die Datei. Weitergabe ohne diese Hinweise wäre nicht zulässig.
const licenses = license({
  thirdParty: {
    includePrivate: false,
    output: {
      file: fileURLToPath(new URL('./dist/licenses.txt', import.meta.url)),
      template: (dependencies) =>
        [
          'DigiFL – Lizenzen und Quellen',
          '',
          readFileSync(notices, 'utf8'),
          '',
          '# Gebündelte Bibliotheken',
          '',
          ...dependencies.map((d) =>
            [`## ${d.name} ${d.version ?? ''} (${d.license ?? 'Lizenz unbekannt'})`, d.licenseText ?? ''].join('\n\n'),
          ),
        ].join('\n'),
    },
  },
})

// Im Dev-Server dieselbe Adresse mit den eigenen Hinweisen (die Bibliotheksliste entsteht erst beim Build)
const devLicenses: Plugin = {
  name: 'digifl-dev-licenses',
  configureServer(server) {
    server.middlewares.use('/licenses.txt', (_req, res) => {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.end(`${readFileSync(notices, 'utf8')}\n\n(Die Lizenzen der Bibliotheken stehen in der gebauten Fassung.)\n`)
    })
  },
}

export default defineConfig({
  plugins: [react(), tailwindcss(), devLicenses],
  build: {
    rollupOptions: { plugins: [licenses] },
  },
  // Unit-Tests der Fachlogik in Node; Ende-zu-Ende-Tests mit Playwright in e2e/
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
})
