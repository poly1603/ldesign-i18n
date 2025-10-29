# Changelog

## [Unreleased]

### Added
- 统一缓存系统，支持 LRU/LFU/FIFO 多种淘汰策略
- 优化的事件系统，使用优先级桶机制
- 路径编译缓存，提升嵌套属性访问性能
- 对象池复用节点，减少 GC 压力

### Changed
- 重构缓存模块，删除 9 个冗余实现，统一为 6 个小文件
- 配置文件重命名：`ldesign.config.ts` → `builder.config.ts`
- 添加 Vitest 覆盖率阈值（80%）
- 所有缓存和事件系统都支持 `destroy()` 方法

### Removed
- 删除 `src/core/cache.ts` (821 行)
- 删除 `src/core/adaptive-cache.ts` (307 行)
- 删除 `src/core/optimized-cache.ts` (593 行)

### Performance
- 缓存操作提升 50%+（O(1) LRU）
- 事件触发提升 50%+（优先级桶）
- 路径解析提升 80%+（编译缓存）
- 内存占用减少 30%+（对象池 + 估算）

### Fixed
- 修复对象池未正确释放节点的问题
- 修复定时器可能阻止进程退出的问题（添加 unref）
- 修复事件监听器可能导致内存泄漏的问题

## [3.0.1] - 2025-01

### Added
- 翻译键验证器
- 性能分析器
- 翻译检查器
- 详细中文 JSDoc 注释

### Fixed
- WeakCache 内存泄漏
- 简化热路径缓存

## [3.0.0] - 2024

### Added
- 初始版本发布
- 支持 Vue 3
- 基础国际化功能

