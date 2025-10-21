import { computeDiff, formatDiff, formatPatch } from '@app/index.ts'

const BENCHMARK_CONFIG = {
  iterations: 1000,
  warmup: 100,
  timeout: 30000
}

function averageTime(times: number[]): number {
  return times.reduce((sum, time) => sum + time, 0) / times.length
}

function calcMedianTime(times: number[]): number {
  const sorted = [...times].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

function measureTime<T>(fn: () => T): { result: T; time: number } {
  const start = performance.now()
  const result = fn()
  const end = performance.now()
  return { result, time: end - start }
}

Deno.bench('computeDiff - comprehensive benchmark', () => {
  const testCases = [
    {
      name: 'Small text (100 chars)',
      text1: 'A'.repeat(100),
      text2: 'B'.repeat(100)
    },
    {
      name: 'Medium text (1000 chars)',
      text1: 'A'.repeat(1000),
      text2: 'B'.repeat(1000)
    },
    {
      name: 'Large text (10000 chars)',
      text1: 'A'.repeat(10000),
      text2: 'B'.repeat(10000)
    },
    {
      name: 'Small lines (10 lines)',
      text1: Array.from({ length: 10 }, (_, i) => `Line ${i}`).join('\n'),
      text2: Array.from({ length: 10 }, (_, i) => `Modified Line ${i}`).join('\n')
    },
    {
      name: 'Medium lines (100 lines)',
      text1: Array.from({ length: 100 }, (_, i) => `Line ${i}`).join('\n'),
      text2: Array.from({ length: 100 }, (_, i) => `Modified Line ${i}`).join('\n')
    },
    {
      name: 'Large lines (1000 lines)',
      text1: Array.from({ length: 1000 }, (_, i) => `Line ${i}`).join('\n'),
      text2: Array.from({ length: 1000 }, (_, i) => `Modified Line ${i}`).join('\n')
    }
  ]
  for (const testCase of testCases) {
    const times: number[] = []
    for (let i = 0; i < BENCHMARK_CONFIG.warmup; i++) {
      computeDiff(testCase.text1, testCase.text2)
    }
    for (let i = 0; i < BENCHMARK_CONFIG.iterations; i++) {
      const { time } = measureTime(() => computeDiff(testCase.text1, testCase.text2))
      times.push(time)
    }
    const avgTime = averageTime(times)
    const medianTimeValue = calcMedianTime(times)
    const minTime = Math.min(...times)
    const maxTime = Math.max(...times)
    console.log(`\n${testCase.name}:`)
    console.log(`  Average: ${avgTime.toFixed(3)}ms`)
    console.log(`  Median:  ${medianTimeValue.toFixed(3)}ms`)
    console.log(`  Min:     ${minTime.toFixed(3)}ms`)
    console.log(`  Max:     ${maxTime.toFixed(3)}ms`)
  }
})

Deno.bench('computeDiff - memory usage benchmark', () => {
  const sizes = [100, 500, 1000, 2000, 5000]
  for (const size of sizes) {
    const text1 = Array.from({ length: size }, (_, i) => `Line ${i}: ${'A'.repeat(100)}`).join('\n')
    const text2 = Array.from({ length: size }, (_, i) => `Line ${i}: ${'B'.repeat(100)}`).join('\n')
    const { result, time } = measureTime(() => computeDiff(text1, text2))
    console.log(`\nSize ${size} lines:`)
    console.log(`  Time: ${time.toFixed(3)}ms`)
    console.log(`  Edit distance: ${result.editDistance}`)
    console.log(`  Edit count: ${result.edits.length}`)
  }
})

Deno.bench('formatDiff - comprehensive benchmark', () => {
  const testCases = [
    {
      name: 'Small diff result',
      text1: 'hello',
      text2: 'world'
    },
    {
      name: 'Medium diff result',
      text1: Array.from({ length: 50 }, (_, i) => `Line ${i}`).join('\n'),
      text2: Array.from({ length: 50 }, (_, i) => `Modified Line ${i}`).join('\n')
    },
    {
      name: 'Large diff result',
      text1: Array.from({ length: 500 }, (_, i) => `Line ${i}`).join('\n'),
      text2: Array.from({ length: 500 }, (_, i) => `Modified Line ${i}`).join('\n')
    }
  ]
  for (const testCase of testCases) {
    const result = computeDiff(testCase.text1, testCase.text2)
    const times: number[] = []
    for (let i = 0; i < BENCHMARK_CONFIG.warmup; i++) {
      formatDiff(result)
    }
    for (let i = 0; i < BENCHMARK_CONFIG.iterations; i++) {
      const { time } = measureTime(() => formatDiff(result))
      times.push(time)
    }
    const avgTime = averageTime(times)
    const medianTimeValue = calcMedianTime(times)
    console.log(`\n${testCase.name}:`)
    console.log(`  Average: ${avgTime.toFixed(3)}ms`)
    console.log(`  Median:  ${medianTimeValue.toFixed(3)}ms`)
  }
})

Deno.bench('formatPatch - comprehensive benchmark', () => {
  const testCases = [
    {
      name: 'Small patch result',
      text1: 'hello',
      text2: 'world'
    },
    {
      name: 'Medium patch result',
      text1: Array.from({ length: 50 }, (_, i) => `Line ${i}`).join('\n'),
      text2: Array.from({ length: 50 }, (_, i) => `Modified Line ${i}`).join('\n')
    },
    {
      name: 'Large patch result',
      text1: Array.from({ length: 500 }, (_, i) => `Line ${i}`).join('\n'),
      text2: Array.from({ length: 500 }, (_, i) => `Modified Line ${i}`).join('\n')
    }
  ]
  for (const testCase of testCases) {
    const result = computeDiff(testCase.text1, testCase.text2)
    const times: number[] = []
    for (let i = 0; i < BENCHMARK_CONFIG.warmup; i++) {
      formatPatch(result, 'old.txt', 'new.txt')
    }
    for (let i = 0; i < BENCHMARK_CONFIG.iterations; i++) {
      const { time } = measureTime(() => formatPatch(result, 'old.txt', 'new.txt'))
      times.push(time)
    }
    const avgTime = averageTime(times)
    const medianTimeValue = calcMedianTime(times)
    console.log(`\n${testCase.name}:`)
    console.log(`  Average: ${avgTime.toFixed(3)}ms`)
    console.log(`  Median:  ${medianTimeValue.toFixed(3)}ms`)
  }
})
