import { watch, install } from 'vue-demi';
import { PiniaPluginContext } from 'pinia';

type WatchHandler<T> = (payload: T) => unknown;
type WatchHandlerObject<T> = T extends object
  ? {
      handler: WatchHandler<T>;
      children?: WatchOptions<T>;
      deep?: boolean;
    }
  : {
      handler: WatchHandler<T>;
    };

type Watcher<T> = WatchHandler<T> | WatchHandlerObject<T>;

type WatchOptions<S extends object> = {
  [K in keyof S]?: S[K] extends object
    ? WatchOptions<S[K]> | Watcher<S[K]>
    : Watcher<S[K]>;
};

declare module 'pinia' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export interface DefineStoreOptionsBase<S, Store> {
    watch?: WatchOptions<S>;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export interface PiniaCustomProperties<Id, S> {
    $watch: Readonly<WatchOptions<S>>;
  }
}

install();

export const WatchPiniaPlugin = ({
  store,
  options: { watch: watchMap },
}: PiniaPluginContext) => {
  if (!watchMap) {
    return;
  }

  const { $state } = store;

  store.$watch = watchMap;
  watchState($state, watchMap);
};

const watchState = <S extends object>(state: S, watchMap: WatchOptions<S>) => {
  const keys = Object.keys(watchMap) as (keyof S)[];

  keys.forEach(key => {
    const value = state[key];
    const maybeWatcher = watchMap[key];

    if (!value || !maybeWatcher) {
      return;
    }

    if (isWatchHandler(maybeWatcher)) {
      watch(() => state[key], maybeWatcher as WatchHandler<S[keyof S]>, {
        deep: true,
      });
      return;
    }

    if (isWatchHandlerObject<typeof value>(maybeWatcher)) {
      watch(() => state[key], maybeWatcher.handler, {
        deep: maybeWatcher.deep ?? true,
      });

      if (isObject(value) && maybeWatcher.children) {
        watchState(value, maybeWatcher.children);
      }

      return;
    }

    watchState(value, maybeWatcher);
  });
};

const isObject = (value: unknown): value is object =>
  typeof value === 'object' && value !== null;

const isWatchHandler = <T>(
  maybeWatcher: NonNullable<unknown>,
): maybeWatcher is WatchHandler<T> => typeof maybeWatcher === 'function';

const isWatchHandlerObject = <T>(
  maybeWatcher: NonNullable<unknown>,
): maybeWatcher is WatchHandlerObject<T> =>
  typeof maybeWatcher === 'object' && 'handler' in maybeWatcher;
