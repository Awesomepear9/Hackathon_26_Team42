import { expect, test, type Page } from '@playwright/test'

const heading = (page: Page) => page.locator('main h1')

/** Antwort auf den n-ten Prüfpunkt des aktuellen Punkts */
const rate = (page: Page, index: number, answer: 'gemacht' | 'nicht gemacht' | 'nicht gesehen') =>
  page.getByRole('group', { name: /\?$/ }).nth(index).getByRole('button', { name: answer, exact: true }).click()

test('Übersicht → Level → Fahrt → Auswertung → Fahrten', async ({ page }) => {
  await page.goto('/')
  await expect(heading(page)).toHaveText('Hallo Alex!')
  await expect(page.getByRole('heading', { name: 'Rechts vor Links' })).toBeVisible() // aktuelles Level
  await expect(page.getByText('12', { exact: true })).toBeVisible() // Beispielfahrten
  await page.getByRole('button', { name: 'LvL Auswahl' }).click()
  await expect(page).toHaveURL(/#\/level$/)
  await expect(heading(page)).toHaveText('LvL Auswahl')
  await page.getByRole('button', { name: 'Route A starten' }).click()

  await expect(page).toHaveURL(/#\/fahrt\/2\/A$/)
  await expect(heading(page)).toBeFocused()
  await expect(page).toHaveTitle(/^Fahrt Route A · Level 2/)
  await rate(page, 0, 'gemacht')
  await rate(page, 1, 'nicht gemacht')
  await page
    .getByRole('group', { name: 'Schwerer Fehler bei dieser Aktion?' })
    .getByRole('button', { name: 'Ja' })
    .click()
  await page.getByRole('button', { name: 'Fahrt beenden' }).click()

  // allgemeines Fahrverhalten: erst vollständig beantwortet auswertbar, das Tempo bewertet die App
  const general = page.getByRole('dialog', { name: 'Allgemeines Fahrverhalten' })
  await expect(general).toBeVisible()
  const submit = general.getByRole('button', { name: 'Auswerten' })
  await expect(submit).toBeDisabled()
  for (const criterion of [
    'Spurhaltung und Fahrzeugpositionierung',
    'Korrektes Einordnen',
    'Spiegel- und Schulterblick',
    'Auf andere Verkehrsteilnehmer achten',
    'Sicherheitsabstand nach vorne',
    'Ausreichender Seitenabstand',
  ]) {
    await general.getByRole('group', { name: criterion }).getByRole('button', { name: 'gemacht', exact: true }).click()
  }
  await general.getByRole('button', { name: '4 von 5 Sternen' }).click()
  await general
    .getByRole('group', { name: 'Schwerer Fehler im Fahrverhalten?' })
    .getByRole('button', { name: 'Nein' })
    .click()
  await submit.click()

  await expect(page).toHaveURL(/#\/auswertung\/fahrt-\d+$/)
  await expect(heading(page)).toHaveText('Fahrt abgeschlossen')
  await expect(page.getByRole('heading', { name: 'Hier nochmal üben' })).toBeVisible()
  await expect(page.getByText('1 schwerer Fehler')).toBeVisible()
  await expect(page.getByText('Nicht bestanden: schwerer Fehler')).toBeVisible()
  const resultUrl = page.url()

  await page.getByRole('navigation', { name: 'Hauptnavigation' }).getByRole('button', { name: 'Fahrten' }).click()
  await expect(heading(page)).toHaveText('Fahrten')
  const drives = page.locator('main ul li')
  await expect(drives).toHaveCount(13) // 12 Beispielfahrten + die neue
  await page.goBack()
  await expect(page).toHaveURL(resultUrl)
  await page.goForward()
  await drives.first().getByRole('button').click()
  await expect(heading(page)).toHaveText('Fahrt abgeschlossen')
})

test('Zurück-Taste bleibt in der App, Abbrechen fragt nach', async ({ page }) => {
  await page.goto('/#/level')
  await page.getByRole('button', { name: 'Route A starten' }).click()
  await expect(page).toHaveURL(/#\/fahrt\/2\/A$/)

  await page.goBack()
  await expect(heading(page)).toHaveText('LvL Auswahl')
  await page.goForward()
  await expect(page).toHaveURL(/#\/fahrt\/2\/A$/)

  await rate(page, 0, 'gemacht')
  await page.getByRole('button', { name: 'Zurück' }).click()
  const dialog = page.getByRole('dialog', { name: 'Fahrt abbrechen?' })
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText('Deine Bewertungen gehen verloren.')
  await dialog.getByRole('button', { name: 'Weiterfahren' }).click()
  await expect(dialog).toBeHidden()
  await expect(page).toHaveURL(/#\/fahrt\/2\/A$/)

  await page.getByRole('button', { name: 'Zurück' }).click()
  await dialog.getByRole('button', { name: 'Fahrt abbrechen' }).click()
  await expect(heading(page)).toHaveText('LvL Auswahl')
  expect(await page.evaluate(() => sessionStorage.getItem('digifl.activeDrive'))).toBeNull()
})

test('Deep Link und Neuladen setzen die Fahrt fort', async ({ page }) => {
  await page.goto('/#/fahrt/2/A')
  await expect(page.getByText('Verkehrsberuhigter Bereich').first()).toBeVisible()
  await rate(page, 0, 'nicht gesehen')
  await page.getByRole('button', { name: 'Pause' }).click()

  await page.reload()
  await expect(page).toHaveURL(/#\/fahrt\/2\/A$/)
  await expect(page.getByRole('button', { name: 'Weiter' })).toBeVisible()
  await expect(page.getByRole('status')).toContainText('Deine Fahrt geht hier weiter')
  await expect(
    page.getByRole('group', { name: /\?$/ }).first().getByRole('button', { name: 'nicht gesehen' }),
  ).toHaveAttribute('aria-pressed', 'true')
})

test('Ungültige Adressen führen zur Startseite', async ({ page }) => {
  await page.goto('/#/fahrt/9/Z')
  await expect(heading(page)).toHaveText('Hallo Alex!')
  await expect(page).toHaveURL(/#\/$/)
})

test.describe('Speicher-Robustheit', () => {
  test('kaputte Daten: Hinweis, Sicherung, Beispielfahrten', async ({ page }) => {
    await page.addInitScript(() => {
      if (!sessionStorage.getItem('seeded')) localStorage.setItem('digifl.drives', '{kaputt')
      sessionStorage.setItem('seeded', '1')
    })
    await page.goto('/#/fahrten')
    await expect(page.getByRole('status')).toContainText('konnten nicht gelesen werden')
    await expect(page.locator('main ul li')).toHaveCount(12)
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('digifl.drives.backup') ?? '{}').raw)).toBe(
      '{kaputt',
    )
  })

  test('Fahrt mit unbekannter Strecke wird übersprungen', async ({ page }) => {
    await page.addInitScript(() => {
      const record = (id: string, routeId: string) => ({
        id,
        date: '2026-10-20T16:30:00.000Z',
        levelId: 1,
        slot: 'A',
        routeId,
        answers: {},
        driverSeed: 1,
      })
      localStorage.setItem(
        'digifl.drives',
        JSON.stringify({ version: 2, records: [record('gut', 'bronnzell'), record('alt', 'gibt-es-nicht')] }),
      )
    })
    await page.goto('/#/fahrten')
    await expect(page.getByRole('status')).toContainText('passen nicht mehr')
    await expect(page.locator('main ul li')).toHaveCount(1)
    await page.goto('/#/auswertung/alt')
    await expect(page.getByText('Diese Fahrt gibt es nicht mehr.')).toBeVisible()
  })
})

test('Karte ohne Kacheln: Hinweis und erneut versuchen', async ({ page }) => {
  await page.route('**/tiles.openfreemap.org/**', (route) => route.abort('internetdisconnected'))
  await page.goto('/#/fahrt/1/A')
  const alert = page.getByRole('alert').filter({ hasText: 'Die Karte konnte nicht geladen werden' })
  await expect(alert).toBeVisible()

  await page.unrouteAll()
  await alert.getByRole('button', { name: 'Erneut versuchen' }).click()
  await expect(alert).toBeHidden()
})
