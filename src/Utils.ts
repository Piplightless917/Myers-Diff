import type { AlgorithmState, DiffEdit, DiffLine, DiffOperation } from '@app/Types.ts'

/**
 * Array implementation that supports negative indices.
 * @description Used by Myers diff algorithm to store diagonal values with negative indices.
 * @template T - The type of elements stored in the array
 */
export class BipolarArray<T> {
  private readonly array: T[]
  private readonly capacity: number

  /**
   * Creates a new bipolar array.
   * @param capacity - The maximum capacity of the array
   * @param defaultValue - The default value to fill the array with
   */
  constructor(capacity: number, defaultValue: T) {
    this.capacity = capacity
    this.array = new Array(capacity).fill(defaultValue)
  }

  /**
   * Creates a copy of the bipolar array.
   * @returns A new BipolarArray instance
   * @throws {Error} When the default value is undefined
   */
  copy(): BipolarArray<T> {
    const defaultValue = this.array[0]
    if (defaultValue === undefined) {
      throw new Error('Cannot copy BPArray with undefined default value')
    }
    const newArray = new BipolarArray<T>(this.capacity, defaultValue)
    for (let i = 0; i < this.capacity; i++) {
      const value = this.array[i]
      if (value !== undefined) {
        newArray.array[i] = value
      }
    }
    return newArray
  }

  /**
   * Gets the value at the specified index.
   * @param index - The index to retrieve (can be negative)
   * @returns The value at the specified index
   * @throws {Error} When the index is out of bounds
   */
  get(index: number): T {
    if (index < 0) {
      const value = this.array[this.capacity + index]
      if (value === undefined) {
        throw new Error(`Index ${index} is out of bounds`)
      }
      return value
    }
    const value = this.array[index]
    if (value === undefined) {
      throw new Error(`Index ${index} is out of bounds`)
    }
    return value
  }

  /**
   * Sets the value at the specified index.
   * @param index - The index to set (can be negative)
   * @param value - The value to store at the index
   */
  set(index: number, value: T): void {
    if (index < 0) {
      this.array[this.capacity + index] = value
    } else {
      this.array[index] = value
    }
  }
}

/**
 * Creates a diff edit object.
 * @param type - The type of diff operation
 * @param oldLine - The original line (undefined for insert operations)
 * @param newLine - The new line (undefined for delete operations)
 * @returns A new DiffEdit object
 */
export function createEdit(
  type: DiffOperation,
  oldLine: DiffLine | undefined,
  newLine: DiffLine | undefined
): DiffEdit {
  return { type, oldLine, newLine }
}

/**
 * Creates a diff line object.
 * @param number - The line number
 * @param text - The text content of the line
 * @returns A new DiffLine object
 */
export function createLine(number: number, text: string): DiffLine {
  return { number, text }
}

/**
 * Backtracks through the algorithm trace to reconstruct the edit sequence.
 * @param oldLines - Array of original lines
 * @param newLines - Array of new lines
 * @param trace - Array of algorithm states from findShortestEdit
 * @returns Array of diff edits representing the shortest edit sequence
 */
export function findBacktrack(
  oldLines: readonly DiffLine[],
  newLines: readonly DiffLine[],
  trace: AlgorithmState[]
): DiffEdit[] {
  let x = oldLines.length
  let y = newLines.length
  const edits: DiffEdit[] = []
  for (let i = trace.length - 1; i >= 0; i--) {
    const traceEntry = trace[i]
    if (!traceEntry) {
      continue
    }
    const { v, d } = traceEntry
    const k = x - y
    let prevK: number
    if (k === -d || (k !== d && v.get(k - 1) < v.get(k + 1))) {
      prevK = k + 1
    } else {
      prevK = k - 1
    }
    const prevX = v.get(prevK)
    const prevY = prevX - prevK
    while (x > prevX && y > prevY) {
      x -= 1
      y -= 1
      edits.push(createEdit('equal', oldLines[x], newLines[y]))
    }
    if (d > 0) {
      if (x === prevX) {
        edits.push(createEdit('insert', undefined, newLines[prevY]))
      } else if (y === prevY) {
        edits.push(createEdit('delete', oldLines[prevX], undefined))
      }
      x = prevX
      y = prevY
    }
  }
  return edits.reverse()
}

/**
 * Finds the shortest edit sequence using Myers' diff algorithm.
 * @param oldLines - Array of original lines
 * @param newLines - Array of new lines
 * @returns Array of algorithm states representing the trace
 * @throws {Error} When no path is found (should not happen in normal operation)
 */
export function findShortestEdit(
  oldLines: readonly DiffLine[],
  newLines: readonly DiffLine[]
): AlgorithmState[] {
  const n = oldLines.length
  const m = newLines.length
  if (n === 0 && m === 0) {
    return []
  }
  const max = n + m
  const v = new BipolarArray<number>(2 * max + 1, 0)
  const trace: AlgorithmState[] = []
  for (let d = 0; d <= max; d++) {
    trace.push({ v: v.copy(), d })
    for (let k = -d; k <= d; k += 2) {
      let x: number
      if (k === -d || (k !== d && v.get(k - 1) < v.get(k + 1))) {
        x = v.get(k + 1)
      } else {
        x = v.get(k - 1) + 1
      }
      let y = x - k
      while (x < n && y < m && oldLines[x]?.text === newLines[y]?.text) {
        x += 1
        y += 1
      }
      v.set(k, x)
      if (x >= n && y >= m) {
        return trace
      }
    }
  }
  throw new Error('Impossible: no path found')
}

/**
 * Splits a string into an array of diff lines.
 * @param str - The string to split into lines
 * @returns Array of DiffLine objects
 * @throws {Error} When the input is not a string
 */
export function splitLines(str: string): DiffLine[] {
  if (typeof str !== 'string') {
    throw new Error(`Expected string input, got ${typeof str}`)
  }
  const lineArray: DiffLine[] = []
  if (str === '') {
    return lineArray
  }
  let lineNumber = 0
  for (const line of str.split('\n')) {
    lineNumber += 1
    lineArray.push(createLine(lineNumber, line))
  }
  return lineArray
}
