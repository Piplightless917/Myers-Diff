import type { DiffLine, DiffOutput } from '@app/Types.ts'
import { findBacktrack, findShortestEdit, splitLines } from '@app/Utils.ts'

/**
 * Computes the difference between two text strings.
 * @param oldText - The original text to compare
 * @param newText - The modified text to compare
 * @returns DiffOutput containing the edit sequence and edit distance
 */
export function computeDiff(oldText: string, newText: string): DiffOutput {
  const oldLines = splitLines(oldText)
  const newLines = splitLines(newText)
  if (oldLines.length === 0 && newLines.length === 0) {
    return { edits: [], editDistance: 0 }
  }
  const trace = findShortestEdit(oldLines, newLines)
  const edits = findBacktrack(oldLines, newLines, trace)
  return {
    edits,
    editDistance: trace.length - 1
  }
}

/**
 * Computes the difference between two arrays of diff lines.
 * @param oldLines - Array of original diff lines
 * @param newLines - Array of modified diff lines
 * @returns DiffOutput containing the edit sequence and edit distance
 */
export function diffLines(
  oldLines: readonly DiffLine[],
  newLines: readonly DiffLine[]
): DiffOutput {
  if (oldLines.length === 0 && newLines.length === 0) {
    return { edits: [], editDistance: 0 }
  }
  const trace = findShortestEdit(oldLines, newLines)
  const edits = findBacktrack(oldLines, newLines, trace)
  return {
    edits,
    editDistance: trace.length - 1
  }
}

/**
 * Formats diff output as a readable string.
 * @param result - The diff output to format
 * @returns Formatted string representation of the diff
 */
export function formatDiff(result: DiffOutput): string {
  const lines: string[] = []
  for (const edit of result.edits) {
    switch (edit.type) {
      case 'equal':
        lines.push(`  ${edit.oldLine?.text ?? ''}`)
        break
      case 'delete':
        lines.push(`- ${edit.oldLine?.text ?? ''}`)
        break
      case 'insert':
        lines.push(`+ ${edit.newLine?.text ?? ''}`)
        break
    }
  }
  return lines.join('\n')
}

/**
 * Formats diff output as a unified patch format.
 * @param result - The diff output to format
 * @param oldFileName - Name of the original file (default: 'old')
 * @param newFileName - Name of the modified file (default: 'new')
 * @param oldTimestamp - Timestamp for the original file (default: empty)
 * @param newTimestamp - Timestamp for the modified file (default: empty)
 * @returns Unified patch format string
 */
export function formatPatch(
  result: DiffOutput,
  oldFileName = 'old',
  newFileName = 'new',
  oldTimestamp = '',
  newTimestamp = ''
): string {
  const lines: string[] = []
  lines.push(`--- ${oldFileName}${oldTimestamp ? '\t' + oldTimestamp : ''}`)
  lines.push(`+++ ${newFileName}${newTimestamp ? '\t' + newTimestamp : ''}`)
  const oldLines: string[] = []
  const newLines: string[] = []
  for (const edit of result.edits) {
    switch (edit.type) {
      case 'equal':
        oldLines.push(edit.oldLine?.text ?? '')
        newLines.push(edit.newLine?.text ?? '')
        break
      case 'delete':
        oldLines.push(edit.oldLine?.text ?? '')
        break
      case 'insert':
        newLines.push(edit.newLine?.text ?? '')
        break
    }
  }
  const changeRegions: { start: number; end: number }[] = []
  let regionStart = -1
  for (let i = 0; i < Math.max(oldLines.length, newLines.length); i++) {
    const oldLine = oldLines[i] ?? ''
    const newLine = newLines[i] ?? ''
    if (oldLine !== newLine) {
      if (regionStart === -1) {
        regionStart = i
      }
    } else {
      if (regionStart !== -1) {
        changeRegions.push({ start: regionStart, end: i - 1 })
        regionStart = -1
      }
    }
  }
  if (regionStart !== -1) {
    changeRegions.push({ start: regionStart, end: Math.max(oldLines.length, newLines.length) - 1 })
  }
  for (const region of changeRegions) {
    const contextBefore = 3
    const contextAfter = 3
    const hunkStart = Math.max(0, region.start - contextBefore)
    const hunkEnd = Math.min(
      Math.max(oldLines.length, newLines.length) - 1,
      region.end + contextAfter
    )
    let oldStart = 1
    let newStart = 1
    for (let i = 0; i < hunkStart; i++) {
      if (oldLines[i] !== undefined) {
        oldStart++
      }
      if (newLines[i] !== undefined) {
        newStart++
      }
    }
    let oldCount = 0
    let newCount = 0
    for (let i = hunkStart; i <= hunkEnd; i++) {
      if (oldLines[i] !== undefined) {
        oldCount++
      }
      if (newLines[i] !== undefined) {
        newCount++
      }
    }
    lines.push(`@@ -${oldStart},${oldCount} +${newStart},${newCount} @@`)
    for (let i = hunkStart; i <= hunkEnd; i++) {
      const oldLine = oldLines[i] ?? ''
      const newLine = newLines[i] ?? ''
      if (oldLine === newLine) {
        lines.push(` ${oldLine}`)
      } else if (oldLine === '') {
        lines.push(`+${newLine}`)
      } else if (newLine === '') {
        lines.push(`-${oldLine}`)
      } else {
        lines.push(`-${oldLine}`)
        lines.push(`+${newLine}`)
      }
    }
  }
  return lines.join('\n')
}
