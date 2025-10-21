import { computeDiff } from '@app/index.ts'

Deno.bench('computeDiff - average case scenario (mixed changes)', () => {
  const original = Array.from({ length: 100 }, (_, i) => `Line ${i}: content`).join('\n')
  const modified = original
    .split('\n')
    .map((line, i) => (i % 3 === 0 ? `Modified Line ${i}: new content` : line))
    .join('\n')
  computeDiff(original, modified)
})

Deno.bench('computeDiff - best case scenario (identical)', () => {
  const text = 'A'.repeat(1000)
  computeDiff(text, text)
})

Deno.bench('computeDiff - few large changes', () => {
  const text1 = Array.from({ length: 100 }, (_, i) => `Line ${i}: ${'A'.repeat(1000)}`).join('\n')
  const text2 = text1
    .split('\n')
    .map((line, i) => (i % 20 === 0 ? `Completely different line ${i}: ${'B'.repeat(1000)}` : line))
    .join('\n')
  computeDiff(text1, text2)
})

Deno.bench('computeDiff - many small changes', () => {
  const lines1 = Array.from({ length: 1000 }, (_, i) => `Line ${i}`)
  const lines2 = lines1.map((line, i) => (i % 2 === 0 ? `Modified ${line}` : line))
  computeDiff(lines1.join('\n'), lines2.join('\n'))
})

Deno.bench('computeDiff - memory usage with large inputs', () => {
  const text1 = Array.from({ length: 2000 }, (_, i) => `Line ${i}: ${'x'.repeat(100)}`).join('\n')
  const text2 = Array.from({ length: 2000 }, (_, i) => `Line ${i}: ${'y'.repeat(100)}`).join('\n')
  const result = computeDiff(text1, text2)
  if (result.editDistance < 0 || result.edits.length < 0) {
    throw new Error('Invalid result')
  }
})

Deno.bench('computeDiff - O(ND) complexity verification', () => {
  const baseText = Array.from({ length: 100 }, (_, i) => `Line ${i}`).join('\n')
  const similarText = baseText
    .split('\n')
    .map((line, i) => (i % 10 === 0 ? `Modified ${line}` : line))
    .join('\n')
  const differentText = Array.from({ length: 100 }, (_, i) => `Different ${i}`).join('\n')
  computeDiff(baseText, similarText)
  computeDiff(baseText, differentText)
})

Deno.bench('computeDiff - performance scaling test', () => {
  const sizes = [10, 50, 100, 500, 1000]
  for (const size of sizes) {
    const text1 = 'A'.repeat(size)
    const text2 = 'B'.repeat(size)
    computeDiff(text1, text2)
  }
})

Deno.bench('computeDiff - single line changes', () => {
  const text1 = 'Single line of text'
  const text2 = 'Single line of modified text'
  computeDiff(text1, text2)
})

Deno.bench('computeDiff - stress test', () => {
  const iterations = 100
  for (let i = 0; i < iterations; i++) {
    const text1 = Array.from({ length: 50 }, (_, j) => `Line ${j}: ${Math.random()}`).join('\n')
    const text2 = Array.from({ length: 50 }, (_, j) => `Line ${j}: ${Math.random()}`).join('\n')
    const result = computeDiff(text1, text2)
    if (result.editDistance < 0 || result.edits.length < 0) {
      throw new Error(`Invalid result at iteration ${i}`)
    }
  }
})

Deno.bench('computeDiff - worst case scenario (completely different)', () => {
  const text1 = 'A'.repeat(1000)
  const text2 = 'B'.repeat(1000)
  computeDiff(text1, text2)
})
