/**
 * @ldesign/i18n - Pipeline Formatter Tests
 */

import { describe, expect, it } from 'vitest';
import { PipelineFormatter, createPipelineFormatter } from '../src/core/pipeline-formatter';

describe('PipelineFormatter', () => {
  const formatter = new PipelineFormatter();

  describe('String Pipes', () => {
    it('should apply uppercase pipe', () => {
      const result = formatter.format('hello', 'uppercase');
      expect(result).toBe('HELLO');
    });

    it('should apply lowercase pipe', () => {
      const result = formatter.format('HELLO', 'lowercase');
      expect(result).toBe('hello');
    });

    it('should apply capitalize pipe', () => {
      const result = formatter.format('hello', 'capitalize');
      expect(result).toBe('Hello');
    });

    it('should apply title pipe', () => {
      const result = formatter.format('hello world', 'title');
      expect(result).toBe('Hello World');
    });

    it('should apply trim pipe', () => {
      const result = formatter.format('  hello  ', 'trim');
      expect(result).toBe('hello');
    });

    it('should apply truncate pipe', () => {
      const result = formatter.format('This is a long text', 'truncate:10');
      expect(result).toBe('This is a ...');
    });

    it('should apply truncate with custom suffix', () => {
      const result = formatter.format('This is a long text', 'truncate:10:---');
      expect(result).toBe('This is a ---');
    });
  });

  describe('Number Pipes', () => {
    it('should format number', () => {
      const result = formatter.format(1234.56, 'number', 'en');
      expect(result).toContain('1,234');
    });

    it('should format currency', () => {
      const result = formatter.format(99.99, 'currency:USD', 'en');
      expect(result).toContain('$');
      expect(result).toContain('99.99');
    });

    it('should format percent', () => {
      const result = formatter.format(0.85, 'percent', 'en');
      expect(result).toContain('85');
      expect(result).toContain('%');
    });
  });

  describe('Array Pipes', () => {
    it('should join array', () => {
      const result = formatter.format(['a', 'b', 'c'], 'join:', ');
      expect(result).toBe('a, b, c');
    });

    it('should join with custom separator', () => {
      const result = formatter.format(['a', 'b', 'c'], 'join: | ');
      expect(result).toBe('a | b | c');
    });

    it('should get first element', () => {
      const result = formatter.format(['a', 'b', 'c'], 'first');
      expect(result).toBe('a');
    });

    it('should get last element', () => {
      const result = formatter.format(['a', 'b', 'c'], 'last');
      expect(result).toBe('c');
    });

    it('should limit array', () => {
      const result = formatter.format(['a', 'b', 'c', 'd', 'e'], 'limit:3');
      expect(result).toEqual(['a', 'b', 'c']);
    });
  });

  describe('Utility Pipes', () => {
    it('should provide default value', () => {
      expect(formatter.format(null, 'default:N/A')).toBe('N/A');
      expect(formatter.format('', 'default:Empty')).toBe('Empty');
      expect(formatter.format('Value', 'default:N/A')).toBe('Value');
    });

    it('should stringify to JSON', () => {
      const obj = { name: 'John', age: 30 };
      const result = formatter.format(obj, 'json');
      expect(result).toBe(JSON.stringify(obj));
    });
  });

  describe('Pipeline Chaining', () => {
    it('should chain multiple pipes', () => {
      const result = formatter.format('hello world', 'capitalize | truncate:10');
      expect(result).toBe('Hello worl...');
    });

    it('should handle complex pipelines', () => {
      const result = formatter.format('  HELLO  ', 'trim | lowercase | capitalize');
      expect(result).toBe('Hello');
    });

    it('should work with array pipelines', () => {
      const result = formatter.format(
        ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'],
        'limit:3 | join:, '
      );
      expect(result).toBe('Apple, Banana, Cherry');
    });
  });

  describe('Custom Pipes', () => {
    it('should register custom pipe', () => {
      formatter.registerPipe('reverse', (value: string) =>
        String(value).split('').reverse().join('')
      );

      const result = formatter.format('hello', 'reverse');
      expect(result).toBe('olleh');
    });

    it('should unregister pipe', () => {
      formatter.registerPipe('test', () => 'test');
      expect(formatter.hasPipe('test')).toBe(true);

      formatter.unregisterPipe('test');
      expect(formatter.hasPipe('test')).toBe(false);
    });

    it('should list all pipe names', () => {
      const names = formatter.getPipeNames();
      expect(names).toContain('uppercase');
      expect(names).toContain('lowercase');
      expect(names).toContain('capitalize');
    });
  });

  describe('Performance', () => {
    it('should cache compiled pipelines', () => {
      const pipeline = 'uppercase | truncate:10';

      formatter.format('test', pipeline);
      const stats1 = formatter.getCacheStats();

      formatter.format('test2', pipeline);
      const stats2 = formatter.getCacheStats();

      // Should use cached pipeline
      expect(stats2.size).toBe(stats1.size);
    });

    it('should be fast for simple pipes', () => {
      const start = performance.now();

      for (let i = 0; i < 10000; i++) {
        formatter.format('test', 'uppercase');
      }

      const time = performance.now() - start;
      expect(time).toBeLessThan(50); // Should be < 50ms for 10K operations
    });
  });
});

