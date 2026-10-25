import { describe, expect, it } from 'vitest'
import type { Screen } from './navigation'
import { hashToScreen, screenTitle, screenToHash, START } from './router'

describe('screenToHash / hashToScreen', () => {
  const screens: Screen[] = [
    { name: 'home' },
    { name: 'levels' },
    { name: 'drives' },
    { name: 'drive', levelId: 1, slot: 'A' },
    { name: 'drive', levelId: 3, slot: 'C' },
    { name: 'result', driveId: 'fahrt-1792888299823' },
    { name: 'result', driveId: 'mit Leerzeichen/und#Raute' },
  ]

  it.each(screens)('Hin und zurück: %o', (screen) => {
    expect(hashToScreen(screenToHash(screen))).toEqual(screen)
  })

  it('verwendet sprechende deutsche Adressen', () => {
    expect(screenToHash({ name: 'home' })).toBe('#/')
    expect(screenToHash({ name: 'levels' })).toBe('#/level')
    expect(screenToHash({ name: 'drives' })).toBe('#/fahrten')
    expect(screenToHash({ name: 'drive', levelId: 2, slot: 'A' })).toBe('#/fahrt/2/A')
    expect(screenToHash({ name: 'result', driveId: 'a b' })).toBe('#/auswertung/a%20b')
  })

  it.each(['', '#', '#/', '/'])('leere Adresse %j → Start', (hash) => {
    expect(hashToScreen(hash)).toEqual(START)
  })

  it.each([
    '#/unbekannt',
    '#/fahrten/zu-viel',
    '#/level/2',
    '#/fahrt/9/A', // Level gibt es nicht
    '#/fahrt/4/A', // Level ohne Routen
    '#/fahrt/1/Z', // Route gibt es nicht
    '#/fahrt/1.5/A',
    '#/fahrt/abc/A',
    '#/fahrt/1',
    '#/auswertung/',
    '#/auswertung/%E0%A4%A', // kaputte %-Folge
  ])('ungültige Adresse %j → Start', (hash) => {
    expect(hashToScreen(hash)).toEqual(START)
  })
})

describe('screenTitle', () => {
  it('benennt jeden Screen', () => {
    expect(screenTitle({ name: 'home' })).toBe('Übersicht')
    expect(screenTitle({ name: 'levels' })).toBe('LvL Auswahl')
    expect(screenTitle({ name: 'drives' })).toBe('Fahrten')
    expect(screenTitle({ name: 'drive', levelId: 2, slot: 'A' })).toBe('Fahrt Route A · Level 2 Rechts vor Links')
    expect(screenTitle({ name: 'result', driveId: 'x' })).toBe('Fahrt abgeschlossen')
  })
})
