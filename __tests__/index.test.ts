import { describe, it, expect } from 'vitest';
import { hello } from '@/index';

describe('index', () => {
  it('hello', () => {
    expect(hello).toBe('hello');
  });
});
