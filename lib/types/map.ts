import type * as Y from 'yjs';

import { Readable, Subscriber, Unsubscriber } from './Readable';

export type YReadableMap<T> = Readable<Map<string, T>> & { y: Y.Map<T> };

export function readableMap<T>(map: Y.Map<T>): YReadableMap<T> {
  let value: Map<string, T> = new Map(Object.entries(map.toJSON()));
  const subs: Subscriber<Map<string, T>>[] = [];

  const setValue = (newValue: Map<string, T>) => {
    if (value === newValue) return;

    // update stored value so new subscribers can get the initial value
    value = newValue;

    // call all handlers to notify of new value
    subs.forEach((sub) => sub(value));
  };

  const observer = (event: Y.YMapEvent<T>, _transaction: Y.Transaction) => {
    const target = event.target as Y.Map<T>;
    setValue(new Map(Object.entries(target.toJSON())));
  };

  const subscribe = (handler: Subscriber<Map<string, T>>): Unsubscriber => {
    const subscriberIndex = subs.push(handler) - 1;

    if (subs.length === 1) {
      // update current value to latest that yjs has since we haven't been observing
      value = new Map(Object.entries(map.toJSON()));
      // set an observer to call all handlers whenever there is a change
      map.observe(observer);
    }

    // call just this handler once when it first subscribes
    handler(value);

    // return unsubscribe function
    return () => {
      subs.splice(subscriberIndex, 1);
      if (subs.length === 0) {
        map.unobserve(observer);
      }
    };
  };

  return { subscribe, y: map };
}
