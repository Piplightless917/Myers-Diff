import { computeDiff, formatDiff, formatPatch } from '@app/index.ts'

function createModifiedText(original: string, changePercent: number): string {
  const lines = original.split('\n')
  const modifiedLines = [...lines]
  const changesCount = Math.floor(lines.length * changePercent)
  for (let i = 0; i < changesCount; i++) {
    const randomIndex = Math.floor(Math.random() * lines.length)
    modifiedLines[randomIndex] = `Modified: ${generateText(50)}`
  }
  return modifiedLines.join('\n')
}

function generateLines(count: number): string {
  const lines: string[] = []
  for (let i = 0; i < count; i++) {
    lines.push(`Line ${i + 1}: ${generateText(50)}`)
  }
  return lines.join('\n')
}

function generateText(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

Deno.bench('computeDiff - code refactoring scenario', () => {
  const oldCode = `function calculateTotal(items) {
  let total = 0
  for (const item of items) {
    if (item.price > 0) {
      total += item.price * item.quantity
    }
  }
  return total
}`
  const newCode = `function calculateTotal(items, taxRate = 0.1) {
  let total = 0
  let tax = 0

  for (const item of items) {
    if (item.price > 0) {
      const subtotal = item.price * item.quantity
      total += subtotal
      tax += subtotal * taxRate
    }
  }

  return {
    subtotal: total,
    tax: tax,
    total: total + tax
  }
}`
  computeDiff(oldCode, newCode)
})

Deno.bench('computeDiff - completely different', () => {
  const text1 = generateText(1000)
  const text2 = generateText(1000)
  computeDiff(text1, text2)
})

Deno.bench('computeDiff - documentation update scenario', () => {
  const oldDoc = `# Project Documentation

## Overview
This project implements a simple calculator with basic operations.

### Features
- Addition
- Subtraction
- Multiplication
- Division`
  const newDoc = `# Advanced Calculator Documentation

## Overview
This project implements an advanced calculator with scientific operations, history tracking, and plugin support.

### Core Features
- Basic arithmetic operations
- Scientific functions (sin, cos, tan, log, sqrt)
- Memory operations
- History tracking with export/import
- Plugin architecture for custom operations`
  computeDiff(oldDoc, newDoc)
})

Deno.bench('computeDiff - empty strings', () => {
  computeDiff('', '')
})

Deno.bench('computeDiff - identical content', () => {
  const text = generateText(1000)
  computeDiff(text, text)
})

Deno.bench('computeDiff - large changes (90% modified)', () => {
  const original = generateLines(100)
  const modified = createModifiedText(original, 0.9)
  computeDiff(original, modified)
})

Deno.bench('computeDiff - large lines (1000 lines)', () => {
  const text1 = generateLines(1000)
  const text2 = generateLines(1000)
  computeDiff(text1, text2)
})

Deno.bench('computeDiff - large text (10000 chars)', () => {
  const text1 = generateText(10000)
  const text2 = generateText(10000)
  computeDiff(text1, text2)
})

Deno.bench('computeDiff - medium changes (50% modified)', () => {
  const original = generateLines(100)
  const modified = createModifiedText(original, 0.5)
  computeDiff(original, modified)
})

Deno.bench('computeDiff - medium lines (100 lines)', () => {
  const text1 = generateLines(100)
  const text2 = generateLines(100)
  computeDiff(text1, text2)
})

Deno.bench('computeDiff - medium text (1000 chars)', () => {
  const text1 = generateText(1000)
  const text2 = generateText(1000)
  computeDiff(text1, text2)
})

Deno.bench('computeDiff - Myers algorithm example', () => {
  computeDiff('ABCABBA', 'CBABAC')
})

Deno.bench('computeDiff - single character', () => {
  computeDiff('A', 'B')
})

Deno.bench('computeDiff - small changes (10% modified)', () => {
  const original = generateLines(100)
  const modified = createModifiedText(original, 0.1)
  computeDiff(original, modified)
})

Deno.bench('computeDiff - small lines (10 lines)', () => {
  const text1 = generateLines(10)
  const text2 = generateLines(10)
  computeDiff(text1, text2)
})

Deno.bench('computeDiff - small text (100 chars)', () => {
  const text1 = generateText(100)
  const text2 = generateText(100)
  computeDiff(text1, text2)
})

Deno.bench('computeDiff - unicode content', () => {
  const text1 = 'Hello 🌍 World! This is a test with unicode characters: ñáéíóú'
  const text2 = 'Hello 🌟 Universe! This is a test with unicode characters: ñáéíóú'
  computeDiff(text1, text2)
})

Deno.bench('formatDiff - large result', () => {
  const text1 = generateLines(1000)
  const text2 = generateLines(1000)
  const result = computeDiff(text1, text2)
  formatDiff(result)
})

Deno.bench('formatDiff - medium result', () => {
  const text1 = generateLines(100)
  const text2 = generateLines(100)
  const result = computeDiff(text1, text2)
  formatDiff(result)
})

Deno.bench('formatDiff - small result', () => {
  const text1 = generateText(100)
  const text2 = generateText(100)
  const result = computeDiff(text1, text2)
  formatDiff(result)
})

Deno.bench('formatPatch - large result', () => {
  const text1 = generateLines(1000)
  const text2 = generateLines(1000)
  const result = computeDiff(text1, text2)
  formatPatch(result, 'old.txt', 'new.txt')
})

Deno.bench('formatPatch - medium result', () => {
  const text1 = generateLines(100)
  const text2 = generateLines(100)
  const result = computeDiff(text1, text2)
  formatPatch(result, 'old.txt', 'new.txt')
})

Deno.bench('formatPatch - small result', () => {
  const text1 = generateText(100)
  const text2 = generateText(100)
  const result = computeDiff(text1, text2)
  formatPatch(result, 'old.txt', 'new.txt')
})
