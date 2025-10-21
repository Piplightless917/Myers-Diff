/**
 * Types of diff operations (equal, delete, insert)
 */
export type DiffOperation = 'equal' | 'delete' | 'insert'

/**
 * State of the Myers diff algorithm at a specific iteration
 */
export interface AlgorithmState {
  /** Array that supports negative indices for Myers diff algorithm */
  readonly v: BipolarArray<number>
  /** Depth of the current iteration */
  readonly d: number
}

/**
 * Array that supports negative indices for Myers diff algorithm
 */
export interface BipolarArray<T> {
  /** Get the value at a specific index */
  get(index: number): T
  /** Set the value at a specific index */
  set(index: number, value: T): void
  /** Copy the array */
  copy(): BipolarArray<T>
}

/**
 * Represents a single edit operation in the diff
 */
export interface DiffEdit {
  /** Type of the edit operation */
  readonly type: DiffOperation
  /** Original line of the edit operation */
  readonly oldLine: DiffLine | undefined
  /** New line of the edit operation */
  readonly newLine: DiffLine | undefined
}

/**
 * Represents a line with its number and text content
 */
export interface DiffLine {
  /** Line number */
  readonly number: number
  /** Line text */
  readonly text: string
}

/**
 * Complete diff output containing all edits and edit distance
 */
export interface DiffOutput {
  /** Edits in the diff */
  readonly edits: DiffEdit[]
  /** Edit distance */
  readonly editDistance: number
}
