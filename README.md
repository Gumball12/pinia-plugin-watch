# 🍍 pinia-plugin-watch

[![npm bundle size](https://img.shields.io/bundlephobia/minzip/pinia-plugin-watch)](https://www.npmjs.com/package/pinia-plugin-watch) ![npm](https://img.shields.io/npm/dm/pinia-plugin-watch) ![npm](https://img.shields.io/npm/v/pinia-plugin-watch) [![changelog](https://img.shields.io/badge/CHANGELOG-gray)](./CHANGELOG.md)

[![ci](https://github.com/Gumball12/pinia-plugin-watch/actions/workflows/ci.yaml/badge.svg)](https://github.com/Gumball12/pinia-plugin-watch/actions/workflows/ci.yaml) [![publish](https://github.com/Gumball12/pinia-plugin-watch/actions/workflows/publish.yaml/badge.svg)](https://github.com/Gumball12/pinia-plugin-watch/actions/workflows/publish.yaml) [![codecov](https://codecov.io/gh/Gumball12/pinia-plugin-watch/branch/main/graph/badge.svg?token=NW28cSN2A2)](https://codecov.io/gh/Gumball12/pinia-plugin-watch)

![logo](./docs/logo-extended.png)

A plugin that allows you to monitor and react to changes in your store's state deeply.

Supports Pinia v2. (Vue 2 and 3)

## 🚀 Quick Start

### 1. Install the plugin

```bash
npm i pinia-plugin-watch
yarn add pinia-plugin-watch # yarn
pnpm add pinia-plugin-watch # pnpm
```

### 2. Using the plugin in Pinia

```ts
import { createPinia } from 'pinia';
import { WatchPiniaPlugin } from 'pinia-plugin-watch';

const pinia = createPinia();
pinia.use(WatchPiniaPlugin);
```

### 3. Watch the state

```ts
import { defineStore } from 'pinia';

const useStore = defineStore('store', {
  state: () => ({
    count: 0,
    user: {
      name: 'John',
      age: 20,
    },
  }),

  // PiniaPluginWatch
  watch: {
    // Watch `count`
    count: (newValue, oldValue, onCleanup, store) => {
      console.log('count changed', newValue, oldValue);
    },

    // Watch `user` and `user.name`
    user: {
      handler: (newValue, oldValue, onCleanup, store) => {
        console.log('user changed', newValue, oldValue);
      },
      children: {
        name: (newValue, oldValue, onCleanup, store) => {
          console.log('user.name changed', newValue, oldValue);
        },
      },
    },
  },
});
```

For usage examples, see the [Usage](./USAGE.md) documentation.

## 🌮 API

### `options.watch`

- Type: `Record<string, WatchHandler | WatchOptions>`

### `WatchHandler`

- Type: `<T>(newValue: T, oldValue: T) => void`

### `WatchOptions`

- Type: `Record<string, WatchHandler | WatchOptions>`
- Properties:
  - `handler`: `WatchHandler`
  - `children?`: `Record<string, WatchHandler | WatchOptions>`
  - `deep?`: `boolean` (default: `true`)

### `store.$watch`

- Type: `typeof options.watch`

The `watch` option is copied to the `$watch` property of the store.

## License

[MIT](./LICENSE)
