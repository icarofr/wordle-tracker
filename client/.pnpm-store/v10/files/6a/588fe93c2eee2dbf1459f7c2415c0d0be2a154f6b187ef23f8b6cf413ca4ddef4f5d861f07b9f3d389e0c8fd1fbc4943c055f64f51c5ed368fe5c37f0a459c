import { onCleanup } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';
export * from '@tanstack/store';
export function useStore(store, selector = (d) => d) {
    const [slice, setSlice] = createStore({
        value: selector(store.state),
    });
    const unsub = store.subscribe(() => {
        const newValue = selector(store.state);
        setSlice('value', reconcile(newValue));
    });
    onCleanup(() => {
        unsub();
    });
    return () => slice.value;
}
//# sourceMappingURL=index.jsx.map