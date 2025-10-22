/**
 * @ldesign/i18n - Template Compiler Tests
 */

import { describe, expect, it } from 'vitest';
import { TemplateCompiler, CompiledTemplate } from '../src/core/template-compiler';

describe('TemplateCompiler', () => {
  const compiler = new TemplateCompiler();

  it('should compile static template', () => {
    const compiled = compiler.compile('Hello World');
    const result = compiled.render({});

    expect(result).toBe('Hello World');
  });

  it('should compile template with single variable', () => {
    const compiled = compiler.compile('Hello {{name}}');
    const result = compiled.render({ name: 'John' });

    expect(result).toBe('Hello John');
  });

  it('should compile template with multiple variables', () => {
    const compiled = compiler.compile('Hello {{first}} {{last}}');
    const result = compiled.render({ first: 'John', last: 'Doe' });

    expect(result).toBe('Hello John Doe');
  });

  it('should handle missing variables', () => {
    const compiled = compiler.compile('Hello {{name}}');
    const result = compiled.render({});

    expect(result).toBe('Hello {{name}}');
  });

  it('should support format specification', () => {
    const compiled = compiler.compile('Hello {{name, uppercase}}');
    const formatter = (value: any, format: string) => {
      if (format === 'uppercase') return String(value).toUpperCase();
      return String(value);
    };

    const result = compiled.render({ name: 'john' }, undefined, formatter);

    expect(result).toBe('Hello JOHN');
  });

  it('should cache compiled templates', () => {
    const compiled1 = compiler.compile('Hello {{name}}');
    const compiled2 = compiler.compile('Hello {{name}}');

    expect(compiled1).toBe(compiled2);
  });

  it('should detect variable presence', () => {
    const compiled1 = compiler.compile('Static text');
    const compiled2 = compiler.compile('Hello {{name}}');

    expect(compiled1.hasInterpolation()).toBe(false);
    expect(compiled2.hasInterpolation()).toBe(true);
  });

  it('should extract variable keys', () => {
    const compiled = compiler.compile('Hello {{first}} {{last}}!');
    const keys = compiled.getVariableKeys();

    expect(keys).toEqual(['first', 'last']);
  });

  it('should handle nested variable paths', () => {
    const compiled = compiler.compile('Hello {{user.name}}');
    const result = compiled.render({ user: { name: 'John' } });

    expect(result).toBe('Hello John');
  });

  it('should be faster than regex-based interpolation', () => {
    const template = 'Hello {{name}}, you have {{count}} messages';
    const compiled = compiler.compile(template);
    const params = { name: 'John', count: 5 };

    // Pre-compiled should be fast
    const start = performance.now();
    for (let i = 0; i < 10000; i++) {
      compiled.render(params);
    }
    const compiledTime = performance.now() - start;

    // Regex-based (simulated)
    const regexStart = performance.now();
    for (let i = 0; i < 10000; i++) {
      let result = template;
      result = result.replace(/\{\{name\}\}/g, String(params.name));
      result = result.replace(/\{\{count\}\}/g, String(params.count));
    }
    const regexTime = performance.now() - regexStart;

    // Compiled should be at least 20% faster
    expect(compiledTime).toBeLessThan(regexTime * 0.8);
  });
});

describe('CompiledTemplate', () => {
  const compiler = new TemplateCompiler();

  it('should handle HTML escaping', () => {
    const compiled = compiler.compile('Hello {{name}}');
    const result = compiled.render({ name: '<script>alert("xss")</script>' });

    expect(result).toContain('&lt;script&gt;');
    expect(result).not.toContain('<script>');
  });

  it('should optimize static-only templates', () => {
    const compiled = compiler.compile('Static text only');

    expect(compiled.hasInterpolation()).toBe(false);

    // Should be very fast
    const start = performance.now();
    for (let i = 0; i < 100000; i++) {
      compiled.render({});
    }
    const time = performance.now() - start;

    expect(time).toBeLessThan(10); // Should be < 10ms for 100K renders
  });
});

