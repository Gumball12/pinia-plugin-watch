# 📖 Usage

## Watch for non-nested states

Define an object with the name of the state property you want to watch as a key and the handler as a value in the `watch` option:

```ts
const useStore = defineStore('store', {
  state: () => ({
    count: 0,
  }),

  watch: {
    // Watch `count`
    count: (newValue, oldValue) => {
      console.log('count changed', newValue, oldValue);
    },
  },
});
```

## Watch for nested states

Define an object with the name of the state property you want to watch as a key and the handler as a value in the `watch` option:

```ts
const useStore = defineStore('store', {
  state: () => ({
    user: {
      name: 'John',
      age: 20,
    },
  }),

  watch: {
    // Watch `user`
    user: (newValue, oldValue) => {
      console.log('user changed', newValue, oldValue);
    },
  },
});

const store = useStore();

// "user changed"
store.user = {
  name: 'Jane',
  age: 20,
};

// "user changed"
store.user.name = 'Jane';
```

The `user` Watch handler tracks changes to `user` and the properties below it(`user.name`, `user.age`) by default. If you don't want to track changes to child properties, pass the `deep` option to `false`:

```ts
const useStore = defineStore('store', {
  state: () => ({
    user: {
      name: 'John',
      age: 20,
    },
  }),

  watch: {
    // Watch `user`
    user: {
      // Not tracking child property changes
      deep: false,

      // This watch handler will not be executed
      // when the child property changes.
      handler: (newValue, oldValue) => {
        console.log('user changed', newValue, oldValue);
      },
    },
  },
});

const store = useStore();

// "user changed"
store.user = {
  name: 'Jane',
  age: 20,
};

// nothing
store.user.name = 'Jane';
```

If you want to define Watch handlers for some of the child properties, use the `handler` and `children` properties:

```ts
const useStore = defineStore('store', {
  state: () => ({
    user: {
      name: 'John',
      age: 20,
    },
  }),

  watch: {
    user: {
      // If you don't pass the `deep` attribute to false,
      // the handlers for `user` and `user.name` are executed
      // when `user.name` changes.
      deep: false,

      // Watch `user`
      handler: (newValue, oldValue) => {
        console.log('user changed', newValue, oldValue);
      },

      children: {
        // Watch `user.name`
        name: (newValue, oldValue) => {
          console.log('user.name changed', newValue, oldValue);
        },
      },
    },
  },
});

const store = useStore();

// "user changed"
store.user = {
  name: 'Jane',
  age: 20,
};

// "user.name changed"
store.user.name = 'Jane';
```

Note that the `children` and `handler` properties are not available for non-nested state.

## Used in the Setup store

You can use it in the Setup store in the same way.

```ts
const useStore = defineStore(
  'store',
  () => {
    const count = ref(0);
    const user = ref(
      reactive({
        name: 'John',
        age: 20,
      }),
    );

    return {
      count,
      user,
    };
  },
  {
    watch: {
      // Watch `count`
      count: (newValue, oldValue) => {
        console.log('count changed', newValue, oldValue);
      },

      user: {
        // Watch `user`
        handler: (newValue, oldValue) => {
          console.log('user changed', newValue, oldValue);
        },
        children: {
          // Watch `user.name`
          name: (newValue, oldValue) => {
            console.log('user.name changed', newValue, oldValue);
          },
        },
      },
    },
  },
);
```

## Using the Vue watch's `onCleanup` function

You can use the `onCleanup` function to clean up the Watch handler. This behavior is same as [Vue `watch` function](https://vuejs.org/api/reactivity-core.html#watch).

```ts
const useStore = defineStore('store', {
  state: () => ({
    count: 0,
  }),

  watch: {
    count: (newValue, oldValue, onCleanup) => {
      console.log('count changed', newValue, oldValue);

      onCleanup(() => {
        console.log('cleanup');
      });
    },
  },
});
```

## Accessing the Original store object

You can access the original store object through the `store` parameter in the Watch handler.

```ts
const useStore = defineStore('store', {
  state: () => ({
    count: 0,
  }),

  watch: {
    count: (newValue, oldValue, onCleanup, store) => {
      console.log(store.count);
    },
  },
});

const store = useStore();

store.count = 1; // "1"
```

## `$watch` Store property

You can reference the Watch handler defined through the `store.$watch` property.

```ts
const store = useStore();

store.$watch.count; // Watch handler for the `count` state
store.$watch.user.name; // Watch handler for the `user.name` state
```
