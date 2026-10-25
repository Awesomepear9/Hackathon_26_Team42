import { defineConfig } from '@playwright/test'

// Ende-zu-Ende-Tests im installierten Google Chrome (channel 'chrome', kein Browser-Download).
// Der Dev-Server startet bei Bedarf auf einem eigenen Port; ein laufender wird wiederverwendet.
const PORT = 5192

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel: 'chrome',
    viewport: { width: 412, height: 915 },
    isMobile: true,
    hasTouch: true,
    locale: 'de-DE',
    // WebGL ohne GPU (headless)
    launchOptions: { args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] },
  },
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
  },
})
