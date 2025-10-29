/**
 * 事件系统测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { EventEmitter } from '../src/core/events/emitter'

describe('EventEmitter', () => {
  let emitter: EventEmitter

  beforeEach(() => {
    emitter = new EventEmitter()
  })

  describe('基础功能', () => {
    it('应该能够订阅和触发事件', () => {
      const handler = vi.fn()

      emitter.on('test', handler)
      emitter.emit('test', { data: 'value' })

      expect(handler).toHaveBeenCalledWith({ data: 'value' })
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('应该能够取消订阅事件', () => {
      const handler = vi.fn()

      const unsubscribe = emitter.on('test', handler)
      unsubscribe()
      emitter.emit('test', {})

      expect(handler).not.toHaveBeenCalled()
    })

    it('应该支持使用 off 取消订阅', () => {
      const handler = vi.fn()

      emitter.on('test', handler)
      emitter.off('test', handler)
      emitter.emit('test', {})

      expect(handler).not.toHaveBeenCalled()
    })

    it('应该支持一次性事件', () => {
      const handler = vi.fn()

      emitter.once('test', handler)
      emitter.emit('test', { count: 1 })
      emitter.emit('test', { count: 2 })

      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith({ count: 1 })
    })

    it('应该支持多个监听器', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      emitter.on('test', handler1)
      emitter.on('test', handler2)
      emitter.emit('test', {})

      expect(handler1).toHaveBeenCalled()
      expect(handler2).toHaveBeenCalled()
    })
  })

  describe('优先级', () => {
    it('应该按优先级顺序执行监听器', () => {
      const order: number[] = []

      emitter.on('test', () => order.push(1), { priority: 0 })
      emitter.on('test', () => order.push(2), { priority: 100 })
      emitter.on('test', () => order.push(3), { priority: 50 })

      emitter.emit('test', {})

      expect(order).toEqual([2, 3, 1]) // 100 -> 50 -> 0
    })

    it('应该支持负优先级', () => {
      const order: number[] = []

      emitter.on('test', () => order.push(1), { priority: 0 })
      emitter.on('test', () => order.push(2), { priority: -10 })
      emitter.on('test', () => order.push(3), { priority: 10 })

      emitter.emit('test', {})

      expect(order).toEqual([3, 1, 2]) // 10 -> 0 -> -10
    })
  })

  describe('监听器限制', () => {
    it('应该限制最大监听器数量', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })
      const smallEmitter = new EventEmitter(3)

      smallEmitter.on('test', () => { })
      smallEmitter.on('test', () => { })
      smallEmitter.on('test', () => { })
      smallEmitter.on('test', () => { }) // 超过限制

      expect(consoleSpy).toHaveBeenCalled()
      expect(smallEmitter.getListenerCount()).toBe(3)

      consoleSpy.mockRestore()
    })

    it('应该能够设置最大监听器数量', () => {
      emitter.setMaxListeners(5)

      for (let i = 0; i < 5; i++) {
        emitter.on('test', () => { })
      }

      expect(emitter.getListenerCount()).toBe(5)
    })
  })

  describe('错误处理', () => {
    it('应该隔离监听器错误', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => { })
      const handler1 = vi.fn(() => { throw new Error('Error in handler1') })
      const handler2 = vi.fn()

      emitter.on('test', handler1)
      emitter.on('test', handler2)
      emitter.emit('test', {})

      expect(handler1).toHaveBeenCalled()
      expect(handler2).toHaveBeenCalled() // handler2 仍然执行
      expect(consoleError).toHaveBeenCalled()

      consoleError.mockRestore()
    })
  })

  describe('自动清理', () => {
    it('应该在删除所有监听器后清理空事件', () => {
      const handler = vi.fn()

      const unsubscribe = emitter.on('test', handler)
      expect(emitter.listenerCountFor('test')).toBe(1)

      unsubscribe()
      expect(emitter.listenerCountFor('test')).toBe(0)
    })

    it('应该能够清除指定事件的所有监听器', () => {
      emitter.on('test1', () => { })
      emitter.on('test1', () => { })
      emitter.on('test2', () => { })

      emitter.clear('test1')

      expect(emitter.listenerCountFor('test1')).toBe(0)
      expect(emitter.listenerCountFor('test2')).toBe(1)
    })

    it('应该能够清除所有事件', () => {
      emitter.on('test1', () => { })
      emitter.on('test2', () => { })

      emitter.clear()

      expect(emitter.getListenerCount()).toBe(0)
    })
  })

  describe('销毁', () => {
    it('应该清理所有监听器', () => {
      emitter.on('test1', () => { })
      emitter.on('test2', () => { })

      emitter.destroy()

      expect(emitter.getListenerCount()).toBe(0)
    })
  })

  describe('统计', () => {
    it('应该跟踪监听器数量', () => {
      expect(emitter.getListenerCount()).toBe(0)

      emitter.on('test', () => { })
      expect(emitter.getListenerCount()).toBe(1)

      emitter.on('test', () => { })
      expect(emitter.getListenerCount()).toBe(2)
    })

    it('应该跟踪每个事件的监听器数量', () => {
      emitter.on('test1', () => { })
      emitter.on('test1', () => { })
      emitter.on('test2', () => { })

      expect(emitter.listenerCountFor('test1')).toBe(2)
      expect(emitter.listenerCountFor('test2')).toBe(1)
      expect(emitter.listenerCountFor('test3')).toBe(0)
    })
  })
})

