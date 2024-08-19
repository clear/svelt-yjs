import * as Y from 'yjs';
import { readableMap, YReadableMap } from '../lib/main';
import { get } from 'svelte/store';
import { describe, beforeEach, it, expect } from 'vitest';

describe('map', () => {
  let ydoc: Y.Doc;
  let ymap: Y.Map<string>;
  let store: YReadableMap<string>;

  beforeEach(() => {
    ydoc = new Y.Doc();
    ymap = ydoc.getMap('dict');
    store = readableMap(ymap);
  });

  it('has an initial value', () => {
    expect(get(store)).toEqual(new Map());
  });

  it('has a Y type', () => {
    expect(store.y).toBeDefined();
  });

  it('subscribes', (done) => {
    const values: Map<string, string>[] = [];
    store.subscribe((value) => {
      values.push(value);
    });

    expect(values).toHaveLength(1);
    expect(values[0]).toEqual(new Map());
  });

  it('subscribes and gets change', (done) => {
    const values: Map<string, string>[] = [];
    store.subscribe((value) => {
      values.push(value);
    });

    store.y.set('greeting', 'hello');
    expect(values).toHaveLength(2);
    expect(values[1]).toEqual(new Map([['greeting', 'hello']]));
  });

  it('unsubscribes', (done) => {
    const values: Map<string, string>[] = [];
    const unsubscribe = store.subscribe((value) => {
      values.push(value);
    });

    unsubscribe();

    store.y.set('hello', 'there');

    expect(values).toHaveLength(1);
  });

  it('can set a key/value via y', (done) => {
    store.y.set('one', '1');

    const values: Map<string, string>[] = [];
    store.subscribe((value) => {
      values.push(value);
    });

    store.y.set('two', '2');

    expect(values.at(-1)).toEqual(
      new Map([
        ['one', '1'],
        ['two', '2'],
      ]),
    );
  });

  it('can delete a key/value via y', (done) => {
    store.y.set('one', '1');
    store.y.set('two', '2');

    const values: Map<string, string>[] = [];
    store.subscribe((value) => {
      values.push(value);
    });

    store.y.delete('two');

    expect(values.at(-1)).toEqual(new Map([['one', '1']]));
  });
});
