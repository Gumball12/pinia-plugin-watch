import { setActivePinia, createPinia, defineStore } from 'pinia';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WatchPiniaPlugin } from '@/index';
import { createApp, reactive, ref, nextTick } from 'vue';

describe('Option Store (Deep watch)', () => {
  beforeEach(() => {
    const app = createApp({});
    const pinia = createPinia();
    pinia.use(WatchPiniaPlugin);
    app.use(pinia);
    setActivePinia(pinia);
  });

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
  beforeEach(() => {
    const app = createApp({});
    const pinia = createPinia();
    pinia.use(WatchPiniaPlugin);
    app.use(pinia);
    setActivePinia(pinia);
  });

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
  beforeEach(() => {
    const app = createApp({});
    const pinia = createPinia();
    pinia.use(WatchPiniaPlugin);
    app.use(pinia);
    setActivePinia(pinia);
  });

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
