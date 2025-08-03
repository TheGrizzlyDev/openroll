import { describe, it, expect } from 'vitest';
import { loadNameData } from '../vite-plugin-name-bundle';

describe('name tag index', () => {
  it('has expected tag keys and values', () => {
    const { tagIndex } = loadNameData();
    expect(tagIndex.class).toEqual(['first', 'last']);
    expect(tagIndex.ethnicity).toEqual(['general', 'spanish']);
  });
});
