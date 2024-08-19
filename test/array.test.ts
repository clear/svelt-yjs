import * as Y from 'yjs';
import { readableArray, YReadableArray } from '../lib/main';
import { get } from 'svelte/store';
import { describe, beforeEach, it, expect } from 'vitest';

describe('array', () => {
  let ydoc: Y.Doc;
  let yarray: Y.Array<string>;
  let store: YReadableArray<string>;

  beforeEach(() => {
    ydoc = new Y.Doc();
    yarray = ydoc.getArray('list');
    store = readableArray(yarray);
  });

  it('has an initial value', () => {
    expect(get(store)).toEqual([]);
  });

  it('has a Y type', () => {
    expect(store.y).toBeDefined();
  });

  it('subscribes', () => {
    const values: string[][] = [];

    store.subscribe((value) => {
      values.push(value);
    });

    expect(values).toHaveLength(1);
    expect(values[0]) == [];
  });

  it('subscribes and gets change', (done) => {
    const values: string[][] = [];

    store.subscribe((value) => {
      values.push(value);
    });

    yarray.push(['hello']);

    expect(values).toHaveLength(2);
    expect(values[1]) == 'hello';
  });

  it('unsubscribes', (done) => {
    const values: string[][] = [];

    const unsubscribe = store.subscribe((value) => {
      values.push(value);
    });

    unsubscribe();
    yarray.push(['hello']);

    expect(values).toHaveLength(1);
  });

  it('can insert via y', (done) => {
    // Insert before subscribe
    store.y.insert(0, ['one', 'four']);

    const values: string[][] = [];
    store.subscribe((value) => {
      values.push(value);
    });

    // Insert after subscribe
    store.y.insert(1, ['two', 'three']);

    expect(values.at(-1)).toEqual(['one', 'two', 'three', 'four']);
  });

  it('can delete via y', (done) => {
    store.y.insert(0, ['one', 'two', 'three']);

    const values: string[][] = [];
    store.subscribe((value) => {
      values.push(value);
    });

    store.y.delete(1);

    expect(values.at(-1)).toEqual(['one', 'three']);
  });
});
