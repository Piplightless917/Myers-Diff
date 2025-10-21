import { assertEquals } from '@std/assert'
import { computeDiff, formatDiff, formatPatch } from '@app/index.ts'

const EXPECTED_TRUE = true

Deno.test('advanced mixed content transformation', () => {
  const oldContent = `# Project Documentation

## Overview
This project implements a simple calculator with basic operations.

### Features
- Addition
- Subtraction
- Multiplication
- Division`
  const newContent = `# Advanced Calculator Documentation

## Overview
This project implements an advanced calculator with scientific operations, history tracking, and plugin support.

### Core Features
- Basic arithmetic operations
- Scientific functions (sin, cos, tan, log, sqrt)
- Memory operations
- History tracking with export/import
- Plugin architecture for custom operations`
  const result = computeDiff(oldContent, newContent)
  assertEquals(result.editDistance > 10, EXPECTED_TRUE)
  assertEquals(result.edits.length > 15, EXPECTED_TRUE)
  const formatted = formatDiff(result)
  const hasTitleChange = formatted.includes('- # Project Documentation') &&
    formatted.includes('+ # Advanced Calculator Documentation')
  const hasFeaturesExpansion = formatted.includes('- - Addition') &&
    formatted.includes('+ - Basic arithmetic operations')
  const hasNewScientificFeatures = formatted.includes(
    '+ - Scientific functions (sin, cos, tan, log, sqrt)'
  )
  const hasNewMemoryFeatures = formatted.includes('+ - Memory operations')
  const hasNewPluginFeatures = formatted.includes('+ - Plugin architecture for custom operations')
  assertEquals(hasTitleChange, EXPECTED_TRUE)
  assertEquals(hasFeaturesExpansion, EXPECTED_TRUE)
  assertEquals(hasNewScientificFeatures, EXPECTED_TRUE)
  assertEquals(hasNewMemoryFeatures, EXPECTED_TRUE)
  assertEquals(hasNewPluginFeatures, EXPECTED_TRUE)
})

Deno.test('complex code refactoring', () => {
  const oldCode = `class UserService {
  constructor() {
    this.users = []
  }

  addUser(user) {
    this.users.push(user)
  }

  findUser(id) {
    return this.users.find(u => u.id === id)
  }
}`
  const newCode = `class UserService {
  constructor(database) {
    this.db = database
    this.cache = new Map()
  }

  async addUser(user) {
    const savedUser = await this.db.save(user)
    this.cache.set(savedUser.id, savedUser)
    return savedUser
  }

  async findUser(id) {
    if (this.cache.has(id)) {
      return this.cache.get(id)
    }

    const user = await this.db.findById(id)
    if (user) {
      this.cache.set(id, user)
    }
    return user
  }

  clearCache() {
    this.cache.clear()
  }
}`
  const result = computeDiff(oldCode, newCode)
  assertEquals(result.editDistance > 10, EXPECTED_TRUE)
  assertEquals(result.edits.length > 15, EXPECTED_TRUE)
  const patch = formatPatch(result, 'old-service.js', 'new-service.js')
  const patchLines = patch.split('\n')
  assertEquals(patchLines[0], '--- old-service.js')
  assertEquals(patchLines[1], '+++ new-service.js')
  assertEquals(
    patchLines.some((line) => line.startsWith('@@')),
    EXPECTED_TRUE
  )
})

Deno.test('complex multiline changes', () => {
  const oldText = `function calculateTotal(items) {
  let total = 0
  for (const item of items) {
    if (item.price > 0) {
      total += item.price * item.quantity
    }
  }
  return total
}`
  const newText = `function calculateTotal(items, taxRate = 0.1) {
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
  const result = computeDiff(oldText, newText)
  assertEquals(result.editDistance > 0, EXPECTED_TRUE)
  assertEquals(result.edits.length > 5, EXPECTED_TRUE)
  const formatted = formatDiff(result)
  const hasFunctionSignatureChange = formatted.includes('- function calculateTotal(items) {') &&
    formatted.includes('+ function calculateTotal(items, taxRate = 0.1) {')
  const hasReturnTypeChange = formatted.includes('-   return total') &&
    formatted.includes('+   return {')
  const hasTaxVariable = formatted.includes('+   let tax = 0')
  assertEquals(hasFunctionSignatureChange, EXPECTED_TRUE)
  assertEquals(hasReturnTypeChange, EXPECTED_TRUE)
  assertEquals(hasTaxVariable, EXPECTED_TRUE)
})

Deno.test('complex text transformation', () => {
  const oldText = `The quick brown fox jumps over the lazy dog.
This is a sample text for testing purposes.
We need to make several changes here.
The algorithm should handle this gracefully.
Multiple lines will be modified in this test.`
  const newText = `The quick brown fox jumps over the lazy dog.
This is a SAMPLE TEXT for testing purposes.
We need to make several IMPORTANT changes here.
The algorithm should handle this gracefully and efficiently.
Multiple lines will be modified in this comprehensive test.
Additional content has been added at the end.`
  const result = computeDiff(oldText, newText)
  assertEquals(result.editDistance > 5, EXPECTED_TRUE)
  assertEquals(result.edits.length > 8, EXPECTED_TRUE)
  const formatted = formatDiff(result)
  const hasSampleChange = formatted.includes('- This is a sample text') &&
    formatted.includes('+ This is a SAMPLE TEXT')
  const hasImportantChange = formatted.includes('- We need to make several changes') &&
    formatted.includes('+ We need to make several IMPORTANT changes')
  const hasAdditionalContent = formatted.includes('+ Additional content has been added')
  assertEquals(hasSampleChange, EXPECTED_TRUE)
  assertEquals(hasImportantChange, EXPECTED_TRUE)
  assertEquals(hasAdditionalContent, EXPECTED_TRUE)
})

Deno.test('extreme codebase refactoring', () => {
  const oldCodebase = `// Simple Todo App
class TodoApp {
  constructor() {
    this.todos = []
    this.filter = 'all'
  }
}`
  const newCodebase = `// Advanced Todo Management System
import { EventEmitter } from './utils/EventEmitter.js'
import { StorageManager } from './utils/StorageManager.js'

class AdvancedTodoSystem extends EventEmitter {
  constructor(options = {}) {
    super()
    this.projects = new Map()
  }
}`
  const result = computeDiff(oldCodebase, newCodebase)
  assertEquals(result.editDistance > 10, EXPECTED_TRUE)
  assertEquals(result.edits.length > 12, EXPECTED_TRUE)
  const formatted = formatDiff(result)
  const hasClassRename = formatted.includes('- class TodoApp {') &&
    formatted.includes('+ class AdvancedTodoSystem extends EventEmitter {')
  const hasImportStatements = formatted.includes('+ import { EventEmitter } from') ||
    formatted.includes('+ import { StorageManager } from')
  const hasConstructorEnhancement = formatted.includes('-   constructor() {') &&
    formatted.includes('+   constructor(options = {}) {')
  assertEquals(hasClassRename, EXPECTED_TRUE)
  assertEquals(hasImportStatements, EXPECTED_TRUE)
  assertEquals(hasConstructorEnhancement, EXPECTED_TRUE)
})
