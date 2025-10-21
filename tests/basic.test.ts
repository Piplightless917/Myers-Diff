import { assertEquals } from '@std/assert'
import { computeDiff, type DiffLine, diffLines, formatDiff, formatPatch } from '@app/index.ts'

const EXPECTED_TRUE = true

Deno.test('computeDiff - basic functionality', () => {
  const result = computeDiff('hello', 'world')
  assertEquals(typeof result.editDistance, 'number')
  assertEquals(Array.isArray(result.edits), EXPECTED_TRUE)
  assertEquals(result.editDistance, 2)
  assertEquals(result.edits.length, 2)
})

Deno.test('computeDiff - identical strings', () => {
  const result = computeDiff('hello', 'hello')
  assertEquals(result.editDistance, 0)
  assertEquals(result.edits.length, 1)
  assertEquals(result.edits[0].type, 'equal')
})

Deno.test('computeDiff - Myers algorithm example', () => {
  const result = computeDiff('ABCABBA', 'CBABAC')
  assertEquals(result.editDistance, 2)
  assertEquals(result.edits.length, 2)
  assertEquals(result.edits[0].type, 'delete')
  assertEquals(result.edits[1].type, 'insert')
})

Deno.test('diffLines - line array comparison', () => {
  const oldLines: DiffLine[] = [
    { number: 1, text: 'line1' },
    { number: 2, text: 'line2' }
  ]
  const newLines: DiffLine[] = [
    { number: 1, text: 'line1' },
    { number: 2, text: 'modified' }
  ]
  const result = diffLines(oldLines, newLines)
  assertEquals(result.editDistance, 2)
  assertEquals(result.edits.length, 3)
})

Deno.test('empty input handling', () => {
  const result = computeDiff('', '')
  assertEquals(result.editDistance, 0)
  assertEquals(result.edits.length, 0)
})

Deno.test('formatDiff - basic formatting', () => {
  const result = computeDiff('hello', 'world')
  const formatted = formatDiff(result)
  const lines = formatted.split('\n')
  assertEquals(lines.length, 2)
  assertEquals(lines[0], '- hello')
  assertEquals(lines[1], '+ world')
})

Deno.test('formatPatch - basic patch format', () => {
  const result = computeDiff('hello', 'world')
  const patch = formatPatch(result)
  const lines = patch.split('\n')
  assertEquals(lines[0], '--- old')
  assertEquals(lines[1], '+++ new')
  assertEquals(lines[2], '@@ -1,1 +1,1 @@')
  assertEquals(lines[3], '-hello')
  assertEquals(lines[4], '+world')
})

Deno.test('unicode support', () => {
  const result = computeDiff('hello 🌍', 'hello 🌟')
  assertEquals(result.editDistance, 2)
  assertEquals(result.edits.length, 2)
  const formatted = formatDiff(result)
  assertEquals(formatted.includes('🌍'), EXPECTED_TRUE)
  assertEquals(formatted.includes('🌟'), EXPECTED_TRUE)
})
