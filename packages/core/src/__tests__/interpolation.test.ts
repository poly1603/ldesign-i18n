import { describe, expect, it } from 'vitest'
import { InterpolationEngine } from '../core/interpolation'

describe('InterpolationEngine', () => {
  it('should interpolate simple values', () => {
    const engine = new InterpolationEngine()
    const result = engine.interpolate('Hello {{name}}', { name: 'World' })

    expect(result).toBe('Hello World')
  })

  it('should interpolate multiple values', () => {
    const engine = new InterpolationEngine()
    const result = engine.interpolate('Hello {{firstName}} {{lastName}}', {
      firstName: 'John',
      lastName: 'Doe',
    })

    expect(result).toBe('Hello John Doe')
  })

  it('should handle missing values', () => {
    const engine = new InterpolationEngine()
    const result = engine.interpolate('Hello {{name}}', {})

    expect(result).toBe('Hello {{name}}')
  })

  it('should handle nested values', () => {
    const engine = new InterpolationEngine()
    const result = engine.interpolate('Hello {{user.name}}', {
      user: { name: 'Alice' },
    })

    expect(result).toBe('Hello Alice')
  })

  it('should handle array indices', () => {
    const engine = new InterpolationEngine()
    const result = engine.interpolate('First item: {{items.0}}', {
      items: ['apple', 'banana'],
    })

    expect(result).toBe('First item: apple')
  })

  it('should handle numeric values', () => {
    const engine = new InterpolationEngine()
    const result = engine.interpolate('Count: {{count}}', { count: 42 })

    expect(result).toBe('Count: 42')
  })

  it('should handle boolean values', () => {
    const engine = new InterpolationEngine()
    const result = engine.interpolate('Active: {{active}}', { active: true })

    expect(result).toBe('Active: true')
  })

  it('should handle special characters in values', () => {
    const engine = new InterpolationEngine()
    const result = engine.interpolate('Message: {{msg}}', {
      msg: 'Hello world',
    })

    expect(result).toBe('Message: Hello world')
  })

  it('should handle empty template', () => {
    const engine = new InterpolationEngine()
    const result = engine.interpolate('', { name: 'World' })

    expect(result).toBe('')
  })

  it('should handle template without placeholders', () => {
    const engine = new InterpolationEngine()
    const result = engine.interpolate('Hello World', { name: 'Alice' })

    expect(result).toBe('Hello World')
  })
})
