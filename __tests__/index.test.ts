import { setActivePinia, createPinia, defineStore } from 'pinia';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WatchPiniaPlugin } from '@/index';
import { createApp, reactive, ref, nextTick } from 'vue';

beforeEach(() => {
  const app = createApp({});
  const pinia = createPinia();
  pinia.use(WatchPiniaPlugin);
  app.use(pinia);
  setActivePinia(pinia);
});

describe('Option Store (Deep watch)', () => {
  it('update baz', async () => {
    const { fooSpy, barSpy, bazSpy, store } = useStore();

    expect(fooSpy).not.toBeCalled();
    expect(barSpy).not.toBeCalled();
    expect(bazSpy).not.toBeCalled();

    store.foo.bar.baz = 10; // #1
    expect(store.foo.bar.baz).toBe(10);

    // Watch function should be called, so use nextTick()
    await nextTick();

    expect(fooSpy).toHaveBeenCalledOnce(); // from #1
    expect(barSpy).toHaveBeenCalledOnce(); // from #1
    expect(bazSpy).toHaveBeenCalledOnce(); // from #1
  });

  it('update bar', async () => {
    const { fooSpy, barSpy, bazSpy, store } = useStore();

    // #1
    store.foo.bar = {
      baz: 10,
    };

    await nextTick();
    expect(fooSpy).toHaveBeenCalledOnce(); // from #1
    expect(barSpy).toHaveBeenCalledOnce(); // from #1
    expect(bazSpy).not.toBeCalled();
  });

  it('update foo', async () => {
    const { store, fooSpy, barSpy, bazSpy } = useStore();

    // #1
    store.foo = {
      bar: {
        baz: 10,
      },
    };

    await nextTick();
    expect(fooSpy).toHaveBeenCalledOnce(); // from #1
    expect(barSpy).not.toBeCalled();
    expect(bazSpy).not.toBeCalled();
  });

  it('$patch object', async () => {
    const { store, fooSpy, barSpy, bazSpy } = useStore();

    store.foo.bar.baz = 10; // #1

    expect(store.foo.bar.baz).toBe(10);

    // Avoid batch update
    await nextTick();
    expect(fooSpy).toHaveBeenCalledOnce(); // from #1
    expect(barSpy).toHaveBeenCalledOnce(); // from #1
    expect(bazSpy).toHaveBeenCalledOnce(); // from #1

    // #2
    store.$patch({
      foo: {
        bar: {
          baz: 20,
        },
      },
    });

    expect(store.foo.bar.baz).toBe(20);

    await nextTick();
    expect(fooSpy).toBeCalledTimes(2); // from #1, #2
    expect(barSpy).toBeCalledTimes(2); // from #1, #2
    expect(bazSpy).toBeCalledTimes(2); // from #1, #2
  });

  it('$patch callback', async () => {
    const { store, fooSpy, barSpy, bazSpy } = useStore();

    store.foo.bar.baz = 10; // #1

    expect(store.foo.bar.baz).toBe(10);

    await nextTick();
    expect(fooSpy).toHaveBeenCalledOnce(); // from #1
    expect(barSpy).toHaveBeenCalledOnce(); // from #1
    expect(bazSpy).toHaveBeenCalledOnce(); // from #1

    store.$patch(state => {
      // #2 (Batched mutation)
      state.foo.bar = {
        baz: 20,
      };

      // Does not call the Watch handler (Pinia feature)
      state.foo.bar.baz = 30;
    });

    expect(store.foo.bar.baz).toBe(30);

    await nextTick();
    expect(fooSpy).toBeCalledTimes(2); // from #1, #2
    expect(barSpy).toBeCalledTimes(2); // from #1, #2
    expect(bazSpy).toHaveBeenCalledOnce(); // from #1
  });

  it('$reset', async () => {
    const { store, fooSpy, barSpy, bazSpy } = useStore();

    store.foo.bar.baz = 10; // #1
    expect(store.foo.bar.baz).toBe(10);

    await nextTick();
    expect(fooSpy).toHaveBeenCalledOnce(); // from #1
    expect(barSpy).toHaveBeenCalledOnce(); // from #1
    expect(bazSpy).toHaveBeenCalledOnce(); // from #1

    store.$reset(); // #2
    expect(store.foo.bar.baz).toBe(1);

    await nextTick();
    expect(fooSpy).toBeCalledTimes(2); // from #1, #2
    expect(barSpy).toHaveBeenCalledOnce(); // from #1
    expect(bazSpy).toHaveBeenCalledOnce(); // from #1
  });
});

const useStore = () => {
  const watch = {
    foo: {
      handler: vi.fn(() => {}),
      children: {
        bar: {
          handler: vi.fn(() => {}),
          children: {
            baz: vi.fn(() => {}),
          },
        },
      },
    },
  };

  const useStore = defineStore('store', {
    state: () => ({
      foo: {
        bar: {
          baz: 1,
        },
      },
    }),
    watch,
  });

  return {
    store: useStore(),
    fooSpy: watch.foo.handler,
    barSpy: watch.foo.children.bar.handler,
    bazSpy: watch.foo.children.bar.children.baz,
  };
};

describe('Setup Store (Deep watch)', () => {
  it('update baz', async () => {
    const { fooSpy, barSpy, bazSpy, store } = useSetupStore();

    expect(fooSpy).not.toBeCalled();
    expect(barSpy).not.toBeCalled();
    expect(bazSpy).not.toBeCalled();

    store.foo.bar.baz = 10; // #1
    expect(store.foo.bar.baz).toBe(10);

    await nextTick();
    expect(fooSpy).toHaveBeenCalledOnce(); // from #1
    expect(barSpy).toHaveBeenCalledOnce(); // from #1
    expect(bazSpy).toHaveBeenCalledOnce(); // from #1
  });

  it('update bar', async () => {
    const { fooSpy, barSpy, bazSpy, store } = useSetupStore();

    // #1
    store.foo.bar = {
      baz: 10,
    };

    await nextTick();
    expect(fooSpy).toHaveBeenCalledOnce(); // from #1
    expect(barSpy).toHaveBeenCalledOnce(); // from #1
    expect(bazSpy).not.toBeCalled();
  });

  it('update foo', async () => {
    const { store, fooSpy, barSpy, bazSpy } = useSetupStore();

    // #1
    store.foo = {
      bar: {
        baz: 10,
      },
    };

    await nextTick();
    expect(fooSpy).toHaveBeenCalledOnce(); // from #1
    expect(barSpy).not.toBeCalled();
    expect(bazSpy).not.toBeCalled();
  });

  it('$patch object', async () => {
    const { store, fooSpy, barSpy, bazSpy } = useSetupStore();

    store.foo.bar.baz = 10; // #1

    expect(store.foo.bar.baz).toBe(10);

    await nextTick();
    expect(fooSpy).toHaveBeenCalledOnce(); // from #1
    expect(barSpy).toHaveBeenCalledOnce(); // from #1
    expect(bazSpy).toHaveBeenCalledOnce(); // from #1

    // #2
    store.$patch({
      foo: {
        bar: {
          baz: 20,
        },
      },
    });

    expect(store.foo.bar.baz).toBe(20);

    await nextTick();
    expect(fooSpy).toBeCalledTimes(2); // from #1, #2
    expect(barSpy).toBeCalledTimes(2); // from #1, #2
    expect(bazSpy).toBeCalledTimes(2); // from #1, #2
  });

  it('$patch callback', async () => {
    const { store, fooSpy, barSpy, bazSpy } = useSetupStore();

    store.foo.bar.baz = 10; // #1

    expect(store.foo.bar.baz).toBe(10);

    await nextTick();
    expect(fooSpy).toHaveBeenCalledOnce(); // from #1
    expect(barSpy).toHaveBeenCalledOnce(); // from #1
    expect(bazSpy).toHaveBeenCalledOnce(); // from #1

    store.$patch(state => {
      // #2 (Batched mutation)
      state.foo.bar = {
        baz: 20,
      };

      // Does not call the Watch handler (Pinia feature)
      state.foo.bar.baz = 30;
    });

    expect(store.foo.bar.baz).toBe(30);

    await nextTick();
    expect(fooSpy).toBeCalledTimes(2); // from #1, #2
    expect(barSpy).toBeCalledTimes(2); // from #1, #2
    expect(bazSpy).toHaveBeenCalledOnce(); // from #1
  });

  it('$reset', async () => {
    const { store, fooSpy, barSpy, bazSpy } = useSetupStore();

    store.foo.bar.baz = 10; // #1
    expect(store.foo.bar.baz).toBe(10);

    await nextTick();
    expect(fooSpy).toHaveBeenCalledOnce(); // from #1
    expect(barSpy).toHaveBeenCalledOnce(); // from #1
    expect(bazSpy).toHaveBeenCalledOnce(); // from #1

    store.$reset(); // #2
    expect(store.foo.bar.baz).toBe(1);

    await nextTick();
    expect(fooSpy).toBeCalledTimes(2); // from #1, #2
    expect(barSpy).toHaveBeenCalledOnce(); // from #1
    expect(bazSpy).toHaveBeenCalledOnce(); // from #1
  });
});

const useSetupStore = () => {
  const watch = {
    foo: {
      handler: vi.fn(() => {}),
      children: {
        bar: {
          handler: vi.fn(() => {}),
          children: {
            baz: vi.fn(() => {}),
          },
        },
      },
    },
  };

  const useStore = defineStore(
    'setupStore',
    () => {
      const foo = ref(
        reactive({
          bar: {
            baz: 1,
          },
        }),
      );

      const $reset = () => {
        foo.value = {
          bar: {
            baz: 1,
          },
        };
      };

      return {
        foo,
        $reset,
      };
    },
    { watch },
  );

  return {
    store: useStore(),
    fooSpy: watch.foo.handler,
    barSpy: watch.foo.children.bar.handler,
    bazSpy: watch.foo.children.bar.children.baz,
  };
};

describe('Option Store (Non-deep watch)', () => {
  it('update baz', async () => {
    const { fooSpy, barSpy, bazSpy, store } = useNonDeepWatchStore();

    expect(fooSpy).not.toBeCalled();
    expect(barSpy).not.toBeCalled();
    expect(bazSpy).not.toBeCalled();

    store.foo.bar.baz = 10; // #1
    expect(store.foo.bar.baz).toBe(10);

    await nextTick();

    expect(fooSpy).not.toBeCalled();
    expect(barSpy).not.toBeCalled();
    expect(bazSpy).toHaveBeenCalledOnce(); // from #1
  });

  it('update bar', async () => {
    const { fooSpy, barSpy, bazSpy, store } = useNonDeepWatchStore();

    // #1
    store.foo.bar = {
      baz: 10,
    };

    await nextTick();
    expect(fooSpy).not.toBeCalled();
    expect(barSpy).toHaveBeenCalledOnce(); // from #1
    expect(bazSpy).not.toBeCalled();
  });

  it('update foo', async () => {
    const { store, fooSpy, barSpy, bazSpy } = useNonDeepWatchStore();

    // #1
    store.foo = {
      bar: {
        baz: 10,
      },
    };

    await nextTick();
    expect(fooSpy).toHaveBeenCalledOnce(); // from #1
    expect(barSpy).not.toBeCalled();
    expect(bazSpy).not.toBeCalled();
  });

  it('$patch object', async () => {
    const { store, fooSpy, barSpy, bazSpy } = useNonDeepWatchStore();

    store.foo.bar.baz = 10; // #1

    expect(store.foo.bar.baz).toBe(10);
    await nextTick();

    // #2
    store.$patch({
      foo: {
        bar: {
          baz: 20,
        },
      },
    });

    expect(store.foo.bar.baz).toBe(20);

    await nextTick();
    expect(fooSpy).not.toBeCalled();
    expect(barSpy).not.toBeCalled();
    expect(bazSpy).toHaveBeenCalledTimes(2); // from #1, #2
  });

  it('$patch callback', async () => {
    const { store, fooSpy, barSpy, bazSpy } = useNonDeepWatchStore();

    store.foo.bar.baz = 10; // #1

    expect(store.foo.bar.baz).toBe(10);

    await nextTick();
    expect(fooSpy).not.toBeCalled();
    expect(barSpy).not.toBeCalled();
    expect(bazSpy).toHaveBeenCalledOnce(); // from #1

    // #2
    store.$patch(state => {
      state.foo.bar.baz = 20;
    });

    expect(store.foo.bar.baz).toBe(20);

    await nextTick();
    expect(fooSpy).not.toBeCalled();
    expect(barSpy).not.toBeCalled();
    expect(bazSpy).toHaveBeenCalledTimes(2); // from #1, #2
  });

  it('$reset', async () => {
    const { store, fooSpy, barSpy, bazSpy } = useNonDeepWatchStore();

    store.foo.bar.baz = 10; // #1
    expect(store.foo.bar.baz).toBe(10);

    await nextTick();
    expect(fooSpy).not.toBeCalled();
    expect(barSpy).not.toBeCalled();
    expect(bazSpy).toHaveBeenCalledOnce(); // from #1

    store.$reset(); // #2
    expect(store.foo.bar.baz).toBe(1);

    await nextTick();
    expect(fooSpy).toHaveBeenCalledOnce(); // from #2
    expect(barSpy).not.toBeCalled();
    expect(bazSpy).toHaveBeenCalledOnce(); // from #1
  });
});

const useNonDeepWatchStore = () => {
  const watch = {
    foo: {
      deep: false,
      handler: vi.fn(() => {}),
      children: {
        bar: {
          deep: false,
          handler: vi.fn(() => {}),
          children: {
            baz: vi.fn(() => {}),
          },
        },
      },
    },
  };

  const useStore = defineStore('nonDeepWatchStore', {
    state: () => ({
      foo: {
        bar: {
          baz: 1,
        },
      },
    }),
    watch,
  });

  return {
    store: useStore(),
    fooSpy: watch.foo.handler,
    barSpy: watch.foo.children.bar.handler,
    bazSpy: watch.foo.children.bar.children.baz,
  };
};

describe('Watch only some properties', () => {
  it('Value exists but no watch handler is defined', async () => {
    const watch = {
      countA: vi.fn(() => {}),
    };

    const useStore = defineStore('noWatchHandlerStore', {
      state: () => ({
        countA: 1,
        countB: 1,
      }),
      watch,
    });

    const store = useStore();
    expect(store.$watch).toEqual(watch);

    store.countA = 2;

    await nextTick();
    expect(watch.countA).toHaveBeenCalledOnce();
  });

  it('Watch handler exists but value is undefined', async () => {
    const watch = {
      countA: vi.fn(() => {}),
    };

    // @ts-ignore
    const useStore = defineStore('noWatchValueStore', {
      state: () => ({
        countB: 1,
      }),
      watch,
    });

    const store = useStore();
    store.countB = 2;

    await nextTick();
    expect(watch.countA).not.toBeCalled();
  });

  it('WatchObject with undefined handler', async () => {
    const watch = {
      user: {
        name: vi.fn(() => {}),
      },
    };

    // @ts-ignore
    const useStore = defineStore('undefinedWatchHandlerStore', {
      state: () => ({
        user: {
          name: 'John',
        },
      }),
      watch,
    });

    const store = useStore();
    store.user.name = 'Jane';

    await nextTick();

    expect(watch.user.name).toHaveBeenCalledOnce();
  });
});

describe('Not passing the watch property', () => {
  it('Verify that the value of the $watch property is undefined', () => {
    const useStore = defineStore('noWatchStore', {
      state: () => ({
        foo: {
          bar: {
            baz: 1,
          },
        },
      }),
    });

    const store = useStore();
    expect(store.$watch).toBeUndefined();
  });
});

describe('Reference the store inside the watch handler', () => {
  it('Setup store', async () => {
    const doSomethingSpy = vi.fn(() => {});

    const useStore = defineStore(
      'thisStore',
      () => {
        const foo = ref('foo');

        return {
          foo,
          doSomething: doSomethingSpy,
        };
      },
      {
        watch: {
          foo: (newValue, _2, _3, store) => {
            store.doSomething();
            expect(store.foo).toBe(newValue);
          },
        },
      },
    );

    const store = useStore();
    store.foo = 'bar';

    await nextTick();
    expect(doSomethingSpy).toHaveBeenCalledOnce();
  });

  it('Options store', async () => {
    const doSomethingSpy = vi.fn(() => {});

    const useStore = defineStore('thisStore', {
      state: () => ({
        foo: 'foo',
      }),
      actions: {
        doSomething: doSomethingSpy,
      },
      watch: {
        foo: (newValue, _2, _3, store) => {
          store.doSomething();
          expect(store.foo).toBe(newValue);
        },
      },
    });

    const store = useStore();
    store.foo = 'bar';

    await nextTick();
    expect(doSomethingSpy).toHaveBeenCalledOnce();
  });
});

it('oldValue, newValue, onCleanup', async () => {
  const useStore = defineStore('oldValueStore', {
    state: () => ({
      foo: 'foo',
      bar: 'bar',
    }),
    watch: {
      foo: {
        handler: (newValue, oldValue, onCleanup) => {
          expect(newValue).toBe('bar');
          expect(oldValue).toBe('foo');
          expect(typeof onCleanup).toBe('function');
        },
      },
      bar(newValue, oldValue, onCleanup) {
        expect(newValue).toBe('baz');
        expect(oldValue).toBe('bar');
        expect(typeof onCleanup).toBe('function');
      },
    },
  });

  const store = useStore();
  store.foo = 'bar';
  store.bar = 'baz';
});
