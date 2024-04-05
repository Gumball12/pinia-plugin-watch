import { watch, install } from 'vue-demi';
import { PiniaPluginContext, Store } from 'pinia';

type WatchHandler<Store, T> = (
  newValue: T,
  oldValue: T,
  onCleanup: (cleanupFn: () => void) => void,
  store: Store,
) => unknown;
type WatchHandlerObject<Store, T> = T extends object
  ? {
      handler: WatchHandler<Store, T>;
      children?: WatchOptions<Store, T>;
      deep?: boolean;
    }
  : {
      handler: WatchHandler<Store, T>;
    };

type Watcher<Store, T> = WatchHandler<Store, T> | WatchHandlerObject<Store, T>;

type WatchOptions<Store, S extends object> = {
  [K in keyof S]?: S[K] extends object
    ? WatchOptions<Store, S[K]> | Watcher<Store, S[K]>
    : Watcher<Store, S[K]>;
};

declare module 'pinia' {
  export interface DefineStoreOptionsBase<S, Store> {
    watch?: WatchOptions<Store, S>;
  }

  export interface PiniaCustomProperties {
    // NOTE: I'm not sure how to type this properly
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $watch: any;
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
  watchState($state, watchMap, store);
};

const watchState = <S extends object>(
  state: S,
  watchMap: WatchOptions<Store, S>,
  store: Store,
) => {
  const keys = Object.keys(watchMap) as (keyof S)[];

  keys.forEach(key => {
    const value = state[key];
    const maybeWatcher = watchMap[key];

    if (!value || !maybeWatcher) {
      return;
    }

    if (isWatchHandler(maybeWatcher)) {
      watch(
        () => state[key],
        (newValue, oldValue, onCleanup) => {
          (maybeWatcher as WatchHandler<Store, S[keyof S]>)(
            newValue,
            oldValue,
            onCleanup,
            store,
          );
        },
        {
          deep: true,
        },
      );
      return;
    }

    if (isWatchHandlerObject<typeof value>(maybeWatcher)) {
      watch(
        () => state[key],
        (newValue, oldValue, onCleanup) => {
          (maybeWatcher.handler as WatchHandler<Store, S[keyof S]>)(
            newValue,
            oldValue,
            onCleanup,
            store,
          );
        },
        {
          deep: maybeWatcher.deep ?? true,
        },
      );

      if (isObject(value) && maybeWatcher.children) {
        watchState(value, maybeWatcher.children, store);
      }

      return;
    }

    watchState(value, maybeWatcher, store);
  });
};

const isObject = (value: unknown): value is object =>
  typeof value === 'object' && value !== null;

const isWatchHandler = <T>(
  maybeWatcher: NonNullable<unknown>,
): maybeWatcher is WatchHandler<Store, T> => typeof maybeWatcher === 'function';

const isWatchHandlerObject = <T>(
  maybeWatcher: NonNullable<unknown>,
): maybeWatcher is WatchHandlerObject<Store, T> =>
  typeof maybeWatcher === 'object' && 'handler' in maybeWatcher;

const watchState2 = <S extends object, W extends WatchOptions<Store, S>>(
  state: S,
  watchMap: W,
) => {
  //
};
