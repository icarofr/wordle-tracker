import * as Solid from 'solid-js';
export const useLayoutEffect = typeof window !== 'undefined' ? Solid.createRenderEffect : Solid.createEffect;
export const usePrevious = (fn) => {
    return Solid.createMemo((prev = {
        current: null,
        previous: null,
    }) => {
        const current = fn();
        if (prev.current !== current) {
            prev.previous = prev.current;
            prev.current = current;
        }
        return prev;
    });
};
/**
 * React hook to wrap `IntersectionObserver`.
 *
 * This hook will create an `IntersectionObserver` and observe the ref passed to it.
 *
 * When the intersection changes, the callback will be called with the `IntersectionObserverEntry`.
 *
 * @param ref - The ref to observe
 * @param intersectionObserverOptions - The options to pass to the IntersectionObserver
 * @param options - The options to pass to the hook
 * @param callback - The callback to call when the intersection changes
 * @returns The IntersectionObserver instance
 * @example
 * ```tsx
 * const MyComponent = () => {
 * const ref = React.useRef<HTMLDivElement>(null)
 * useIntersectionObserver(
 *  ref,
 *  (entry) => { doSomething(entry) },
 *  { rootMargin: '10px' },
 *  { disabled: false }
 * )
 * return <div ref={ref} />
 * ```
 */
export function useIntersectionObserver(ref, callback, intersectionObserverOptions = {}, options = {}) {
    const isIntersectionObserverAvailable = typeof IntersectionObserver === 'function';
    let observerRef = null;
    Solid.createEffect(() => {
        const r = ref();
        if (!r || !isIntersectionObserverAvailable || options.disabled) {
            return;
        }
        observerRef = new IntersectionObserver(([entry]) => {
            callback(entry);
        }, intersectionObserverOptions);
        observerRef.observe(r);
        Solid.onCleanup(() => {
            observerRef?.disconnect();
        });
    });
    return () => observerRef;
}
//# sourceMappingURL=utils.js.map