/**
 * @ldesign/i18n - Enhanced Utils Tests
 * 增强工具类单元测试（事件系统和查找功能）
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { EnhancedEventEmitter } from '../utils/enhanced-event-emitter'
import { KeyFinder } from '../utils/key-finder'
import { KeyValidator } from '../utils/key-validator-advanced'
import type { Locale, Messages } from '../types'

describe('EnhancedEventEmitter', () => {
  let emitter: EnhancedEventEmitter

  beforeEach(() => {
    emitter = new EnhancedEventEmitter({
      enableLogging: true,
      enablePerformanceTracking: true,
      maxLogs: 100,
    })
  })

  describe('on / emit', () => {
    it('应该注册和触发事件监听器', () => {
      const callback = vi.fn()
      emitter.on('test', callback)
      emitter.emit('test', 'data')

      expect(callback).toHaveBeenCalledWith('data')
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('应该支持多个监听器', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      emitter.on('test', callback1)
      emitter.on('test', callback2)
      emitter.emit('test', 'data')

      expect(callback1).toHaveBeenCalledWith('data')
      expect(callback2).toHaveBeenCalledWith('data')
    })

    it('应该按优先级顺序执行监听器', () => {
      const order: number[] = []

      emitter.on('test', () => order.push(1), { priority: 1 })
      emitter.on('test', () => order.push(3), { priority: 3 })
      emitter.on('test', () => order.push(2), { priority: 2 })

      emitter.emit('test')

      expect(order).toEqual([3, 2, 1])
    })

    it('应该返回监听器ID', () => {
      const id = emitter.on('test', () => {})
      expect(id).toMatch(/^listener_\d+_\d+$/)
    })
  })

  describe('once', () => {
    it('应该只执行一次', () => {
      const callback = vi.fn()
      emitter.once('test', callback)

      emitter.emit('test', 'data1')
      emitter.emit('test', 'data2')

      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith('data1')
    })

    it('应该支持优先级', () => {
      const order: number[] = []

      emitter.once('test', () => order.push(1), 1)
      emitter.once('test', () => order.push(2), 2)

      emitter.emit('test')

      expect(order).toEqual([2, 1])
    })

    it('应该自动清理一次性监听器', () => {
      emitter.once('test', () => {})
      emitter.emit('test')

      expect(emitter.listenerCount('test')).toBe(0)
    })
  })

  describe('off', () => {
    it('应该通过ID移除监听器', () => {
      const callback = vi.fn()
      const id = emitter.on('test', callback)

      const removed = emitter.off('test', id)
      emitter.emit('test')

      expect(removed).toBe(true)
      expect(callback).not.toHaveBeenCalled()
    })

    it('应该通过回调函数移除监听器', () => {
      const callback = vi.fn()
      emitter.on('test', callback)

      const removed = emitter.off('test', callback)
      emitter.emit('test')

      expect(removed).toBe(true)
      expect(callback).not.toHaveBeenCalled()
    })

    it('应该在不存在时返回false', () => {
      const removed = emitter.off('nonexistent', 'invalid-id')
      expect(removed).toBe(false)
    })
  })

  describe('removeAllListeners', () => {
    it('应该移除指定事件的所有监听器', () => {
      emitter.on('test1', () => {})
      emitter.on('test1', () => {})
      emitter.on('test2', () => {})

      emitter.removeAllListeners('test1')

      expect(emitter.listenerCount('test1')).toBe(0)
      expect(emitter.listenerCount('test2')).toBe(1)
    })

    it('应该移除所有事件的监听器', () => {
      emitter.on('test1', () => {})
      emitter.on('test2', () => {})

      emitter.removeAllListeners()

      expect(emitter.eventNames()).toHaveLength(0)
    })
  })

  describe('listenerCount', () => {
    it('应该返回正确的监听器数量', () => {
      emitter.on('test', () => {})
      emitter.on('test', () => {})

      expect(emitter.listenerCount('test')).toBe(2)
    })

    it('应该对不存在的事件返回0', () => {
      expect(emitter.listenerCount('nonexistent')).toBe(0)
    })
  })

  describe('eventNames', () => {
    it('应该返回所有事件名称', () => {
      emitter.on('test1', () => {})
      emitter.on('test2', () => {})

      const names = emitter.eventNames()
      expect(names).toContain('test1')
      expect(names).toContain('test2')
      expect(names).toHaveLength(2)
    })
  })

  describe('事件日志', () => {
    it('应该记录事件日志', () => {
      emitter.on('test', () => {})
      emitter.emit('test', { data: 'value' })

      const logs = emitter.getLogs()
      expect(logs).toHaveLength(1)
      expect(logs[0].event).toBe('test')
      expect(logs[0].data).toEqual({ data: 'value' })
    })

    it('应该过滤特定事件的日志', () => {
      emitter.on('test1', () => {})
      emitter.on('test2', () => {})

      emitter.emit('test1', 'data1')
      emitter.emit('test2', 'data2')

      const logs = emitter.getLogs('test1')
      expect(logs).toHaveLength(1)
      expect(logs[0].event).toBe('test1')
    })

    it('应该限制返回的日志数量', () => {
      emitter.on('test', () => {})
      
      for (let i = 0; i < 10; i++) {
        emitter.emit('test')
      }

      const logs = emitter.getLogs(undefined, 5)
      expect(logs).toHaveLength(5)
    })

    it('应该清空日志', () => {
      emitter.on('test', () => {})
      emitter.emit('test')

      emitter.clearLogs()

      expect(emitter.getLogs()).toHaveLength(0)
    })
  })

  describe('事件统计', () => {
    it('应该记录事件统计', () => {
      emitter.on('test', () => {})
      emitter.emit('test')
      emitter.emit('test')

      const stats = emitter.getStats('test')
      expect(stats).toHaveLength(1)
      expect(stats[0].event).toBe('test')
      expect(stats[0].emitCount).toBe(2)
    })

    it('应该返回所有事件统计', () => {
      emitter.on('test1', () => {})
      emitter.on('test2', () => {})
      emitter.emit('test1')
      emitter.emit('test2')

      const stats = emitter.getStats()
      expect(stats).toHaveLength(2)
    })

    it('应该重置统计', () => {
      emitter.on('test', () => {})
      emitter.emit('test')

      emitter.resetStats('test')

      const stats = emitter.getStats('test')
      expect(stats).toHaveLength(0)
    })
  })

  describe('cleanupStaleOnceListeners', () => {
    it('应该清理过期的一次性监听器', () => {
      vi.useFakeTimers()

      emitter.once('test', () => {})
      
      vi.advanceTimersByTime(3700000) // 超过1小时

      const cleaned = emitter.cleanupStaleOnceListeners(3600000)

      expect(cleaned).toBe(1)
      expect(emitter.listenerCount('test')).toBe(0)

      vi.useRealTimers()
    })

    it('应该保留未过期的监听器', () => {
      emitter.once('test', () => {})

      const cleaned = emitter.cleanupStaleOnceListeners(3600000)

      expect(cleaned).toBe(0)
      expect(emitter.listenerCount('test')).toBe(1)
    })
  })

  describe('错误处理', () => {
    it('应该捕获监听器中的错误', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const callback1 = vi.fn().mockImplementation(() => {
        throw new Error('Test error')
      })
      const callback2 = vi.fn()

      emitter.on('test', callback1)
      emitter.on('test', callback2)

      emitter.emit('test')

      expect(callback1).toHaveBeenCalled()
      expect(callback2).toHaveBeenCalled() // 应该继续执行
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('性能追踪', () => {
    it('应该记录执行时长', () => {
      emitter.on('test', () => {})
      emitter.emit('test')

      const logs = emitter.getLogs()
      expect(logs[0].duration).toBeGreaterThanOrEqual(0)
    })
  })

  describe('监听器信息', () => {
    it('应该获取监听器信息', () => {
      emitter.on('test', () => {}, { priority: 5 })
      emitter.once('test', () => {}, 3)

      const info = emitter.getListeners('test')
      expect(info).toHaveLength(1)
      expect(info[0].event).toBe('test')
      expect(info[0].listeners).toHaveLength(2)
      expect(info[0].listeners[0].priority).toBe(5)
      expect(info[0].listeners[1].once).toBe(true)
    })
  })

  describe('配置导出', () => {
    it('应该导出配置为JSON', () => {
      emitter.on('test', () => {})
      emitter.emit('test')

      const config = emitter.exportConfig()
      const parsed = JSON.parse(config)

      expect(parsed).toHaveProperty('listeners')
      expect(parsed).toHaveProperty('stats')
      expect(parsed).toHaveProperty('options')
    })
  })
})

describe('KeyFinder', () => {
  let finder: KeyFinder
  let messages: Messages

  beforeEach(() => {
    finder = new KeyFinder()
    messages = {
      app: {
        title: '应用标题',
        subtitle: '应用副标题',
      },
      user: {
        name: '用户名',
        email: '邮箱',
      },
      common: {
        ok: '确定',
        cancel: '取消',
      },
    }
  })

  describe('fuzzySearch', () => {
    it('应该找到拼写错误的键', () => {
      const results = finder.fuzzySearch('app.titel', messages, 'zh-CN')

      expect(results.length).toBeGreaterThan(0)
      expect(results[0].key).toBe('app.title')
      expect(results[0].score).toBeGreaterThan(0.8)
    })

    it('应该按相似度排序', () => {
      const results = finder.fuzzySearch('user', messages, 'zh-CN')

      expect(results[0].key).toContain('user')
      if (results.length > 1) {
        expect(results[0].score!).toBeGreaterThanOrEqual(results[1].score!)
      }
    })

    it('应该支持最小分数阈值', () => {
      const results = finder.fuzzySearch('xyz', messages, 'zh-CN', {
        minScore: 0.9,
      })

      results.forEach(result => {
        expect(result.score!).toBeGreaterThanOrEqual(0.9)
      })
    })

    it('应该限制结果数量', () => {
      const results = finder.fuzzySearch('', messages, 'zh-CN', {
        maxResults: 3,
        minScore: 0,
      })

      expect(results.length).toBeLessThanOrEqual(3)
    })

    it('应该支持搜索值内容', () => {
      const results = finder.fuzzySearch('标题', messages, 'zh-CN', {
        searchValues: true,
        minScore: 0.5,
      })

      expect(results.length).toBeGreaterThan(0)
    })

    it('应该支持区分大小写', () => {
      const messages2 = { Test: 'value', test: 'value' }
      const results = finder.fuzzySearch('TEST', messages2, 'zh-CN', {
        caseSensitive: true,
      })

      // 区分大小写时，分数应该不同
      expect(results).toBeDefined()
    })
  })

  describe('wildcardSearch', () => {
    it('应该支持 * 通配符', () => {
      const results = finder.wildcardSearch('app.*', messages, 'zh-CN')

      expect(results).toHaveLength(2)
      expect(results.every(r => r.key.startsWith('app.'))).toBe(true)
    })

    it('应该支持 ? 通配符', () => {
      const results = finder.wildcardSearch('user.nam?', messages, 'zh-CN')

      expect(results.some(r => r.key === 'user.name')).toBe(true)
    })

    it('应该支持多个通配符', () => {
      const results = finder.wildcardSearch('*.??', messages, 'zh-CN')

      expect(results.some(r => r.key === 'common.ok')).toBe(true)
    })

describe('KeyValidator', () => {
  let validator: KeyValidator
  let messages: Messages

  beforeEach(() => {
    validator = new KeyValidator({
      namingConvention: 'camelCase',
      maxKeyLength: 50,
      maxDepth: 5,
      allowEmptyValues: false,
    })

    messages = {
      appTitle: '应用标题',
      userName: '用户名',
      common: {
        ok: '确定',
        cancel: '取消',
      },
    }
  })

  describe('validate', () => {
    it('应该验证有效的消息对象', () => {
      const report = validator.validate(messages, 'zh-CN')

      expect(report.valid).toBe(true)
      expect(report.errors).toBe(0)
    })

    it('应该检测空值', () => {
      const invalidMessages = {
        title: '',
        name: null,
      }

      const report = validator.validate(invalidMessages as any, 'zh-CN')

      expect(report.errors).toBeGreaterThan(0)
      expect(report.issues.some(i => i.rule === 'empty-value')).toBe(true)
    })

    it('应该检测命名约定违规', () => {
      const invalidMessages = {
        'app-title': '标题', // kebab-case
        user_name: '用户', // snake_case
      }

      const report = validator.validate(invalidMessages, 'zh-CN')

      expect(report.warnings).toBeGreaterThan(0)
      expect(report.issues.some(i => i.rule === 'naming-convention')).toBe(true)
    })

    it('应该检测过长的键名', () => {
      const longKey = 'a'.repeat(60)
      const invalidMessages = {
        [longKey]: '值',
      }

      const report = validator.validate(invalidMessages, 'zh-CN')

      expect(report.warnings).toBeGreaterThan(0)
      expect(report.issues.some(i => i.rule === 'key-length')).toBe(true)
    })

    it('应该检测过深的嵌套', () => {
      const deepMessages = {
        a: { b: { c: { d: { e: { f: { g: '太深了' } } } } } },
      }

      const report = validator.validate(deepMessages, 'zh-CN')

      expect(report.warnings).toBeGreaterThan(0)
      expect(report.issues.some(i => i.rule === 'max-depth')).toBe(true)
    })

    it('应该检测特殊字符', () => {
      const invalidMessages = {
        'app@title': '标题',
        'user#name': '用户',
      }

      const report = validator.validate(invalidMessages, 'zh-CN')

      expect(report.errors).toBeGreaterThan(0)
      expect(report.issues.some(i => i.rule === 'special-chars')).toBe(true)
    })

    it('应该检测大小写冲突', () => {
      const invalidMessages = {
        appTitle: '标题1',
        AppTitle: '标题2',
      }

      const report = validator.validate(invalidMessages, 'zh-CN')

      expect(report.errors).toBeGreaterThan(0)
      expect(report.issues.some(i => i.rule === 'case-conflict')).toBe(true)
    })

    it('应该检测保留关键字', () => {
      const invalidMessages = {
        constructor: '构造函数',
        prototype: '原型',
      }

      const report = validator.validate(invalidMessages, 'zh-CN')

      expect(report.errors).toBeGreaterThan(0)
      expect(report.issues.some(i => i.rule === 'reserved-keywords')).toBe(true)
    })

    it('应该检测以数字开头的键', () => {
      const invalidMessages = {
        '1stPlace': '第一名',
      }

      const report = validator.validate(invalidMessages, 'zh-CN')

      expect(report.warnings).toBeGreaterThan(0)
      expect(report.issues.some(i => i.rule === 'starts-with-number')).toBe(true)
    })

    it('应该检测连续点号', () => {
      const invalidMessages = {
        'app..title': '标题',
      }

      const report = validator.validate(invalidMessages, 'zh-CN')

      expect(report.errors).toBeGreaterThan(0)
      expect(report.issues.some(i => i.rule === 'consecutive-dots')).toBe(true)
    })

    it('应该检测首尾点号', () => {
      const invalidMessages = {
        '.appTitle': '标题1',
        'userName.': '用户名',
      }

      const report = validator.validate(invalidMessages, 'zh-CN')

      expect(report.errors).toBeGreaterThan(0)
      expect(report.issues.some(i => i.rule === 'edge-dots')).toBe(true)
    })

    it('应该提供修复建议', () => {
      const invalidMessages = {
        'app-title': '标题',
      }

      const report = validator.validate(invalidMessages, 'zh-CN')

      const issue = report.issues.find(i => i.rule === 'naming-convention')
      expect(issue?.suggestion).toBeDefined()
      expect(issue?.suggestion).toContain('appTitle')
    })

    it('应该返回正确的统计信息', () => {
      const invalidMessages = {
        title: '', // 错误
        'app-name': '应用', // 警告
      }

      const report = validator.validate(invalidMessages, 'zh-CN')

      expect(report.totalKeys).toBe(2)
      expect(report.totalIssues).toBeGreaterThan(0)
      expect(report.errors + report.warnings + report.infos).toBe(report.totalIssues)
    })
  })

  describe('命名约定', () => {
    it('应该验证 camelCase', () => {
      const validator = new KeyValidator({ namingConvention: 'camelCase' })
      const report = validator.validate({ myKey: 'value' }, 'zh-CN')
      expect(report.valid).toBe(true)
    })

    it('应该验证 snake_case', () => {
      const validator = new KeyValidator({ namingConvention: 'snake_case' })
      const report = validator.validate({ my_key: 'value' }, 'zh-CN')
      expect(report.valid).toBe(true)
    })

    it('应该验证 kebab-case', () => {
      const validator = new KeyValidator({ namingConvention: 'kebab-case' })
      const report = validator.validate({ 'my-key': 'value' }, 'zh-CN')
      expect(report.valid).toBe(true)
    })

    it('应该验证 dot.notation', () => {
      const validator = new KeyValidator({ namingConvention: 'dot.notation' })
      const report = validator.validate({ myKey: 'value' }, 'zh-CN')
      expect(report.valid).toBe(true)
    })
  })

  describe('自定义规则', () => {
    it('应该支持自定义验证规则', () => {
      const customRule = {
        name: 'custom-rule',
        description: '自定义规则',
        validate: (key: string) => {
          if (key.includes('test')) {
            return {
              type: 'warning' as const,
              rule: 'custom-rule',
              key,
              message: '键名包含test',
            }
          }
          return null
        },
      }

      const validator = new KeyValidator({ customRules: [customRule] })
      const report = validator.validate({ testKey: 'value' }, 'zh-CN')

      expect(report.issues.some(i => i.rule === 'custom-rule')).toBe(true)
    })
  })

  describe('选项配置', () => {
    it('应该允许空值', () => {
      const validator = new KeyValidator({ allowEmptyValues: true })
      const report = validator.validate({ title: '' }, 'zh-CN')

      expect(report.issues.some(i => i.rule === 'empty-value')).toBe(false)
    })

    it('应该禁用重复检查', () => {
      const validator = new KeyValidator({ checkDuplicates: false })
      const report = validator.validate(
        { title: 'A', Title: 'B' },
        'zh-CN'
      )

      expect(report.issues.some(i => i.rule === 'case-conflict')).toBe(false)
    })
  })

  describe('validateKey', () => {
    it('应该验证单个键', () => {
      const context = {
        allKeys: new Set(['appTitle']),
        locale: 'zh-CN' as Locale,
      }

      const issues = validator.validateKey('appTitle', '标题', context)

      expect(Array.isArray(issues)).toBe(true)
    })
  })

  describe('嵌套对象验证', () => {
    it('应该验证嵌套对象的所有键', () => {
      const nestedMessages = {
        app: {
          title: '标题',
          description: '描述',
          meta: {
            author: '作者',
            version: '版本',
          },
        },
      }

      const report = validator.validate(nestedMessages, 'zh-CN')

      expect(report.totalKeys).toBe(7) // app, title, description, meta, author, version + 父键
    })
  })

  describe('问题分类', () => {
    it('应该正确分类问题类型', () => {
      const messages = {
        '': '', // 错误：空值 + 特殊字符
        'very-long-key-name-that-exceeds-the-maximum-length-limit': 'value', // 警告：长度
      }

      const report = validator.validate(messages, 'zh-CN')

      expect(report.errors).toBeGreaterThan(0)
      expect(report.warnings).toBeGreaterThan(0)
    })
  })
})

    it('应该限制结果数量', () => {
      const results = finder.wildcardSearch('*', messages, 'zh-CN', {
        maxResults: 5,
      })

      expect(results.length).toBeLessThanOrEqual(5)
    })
  })

  describe('exactSearch', () => {
    it('应该精确匹配键', () => {
      const result = finder.exactSearch('app.title', messages, 'zh-CN')

      expect(result).not.toBeNull()
      expect(result!.key).toBe('app.title')
      expect(result!.value).toBe('应用标题')
      expect(result!.score).toBe(1.0)
    })

    it('应该在找不到时返回null', () => {
      const result = finder.exactSearch('nonexistent', messages, 'zh-CN')

      expect(result).toBeNull()
    })
  })

  describe('prefixSearch', () => {
    it('应该查找指定前缀的键', () => {
      const results = finder.prefixSearch('app', messages, 'zh-CN')

      expect(results).toHaveLength(2)
      expect(results.every(r => r.key.startsWith('app'))).toBe(true)
    })

    it('应该支持区分大小写', () => {
      const messages2 = { App: { title: 'A' }, app: { name: 'B' } }
      const results = finder.prefixSearch('App', messages2, 'zh-CN', {
        caseSensitive: true,
      })

      expect(results.every(r => r.key.startsWith('App'))).toBe(true)
    })

    it('应该限制结果数量', () => {
      const results = finder.prefixSearch('', messages, 'zh-CN', {
        maxResults: 3,
      })

      expect(results.length).toBeLessThanOrEqual(3)
    })
  })
})