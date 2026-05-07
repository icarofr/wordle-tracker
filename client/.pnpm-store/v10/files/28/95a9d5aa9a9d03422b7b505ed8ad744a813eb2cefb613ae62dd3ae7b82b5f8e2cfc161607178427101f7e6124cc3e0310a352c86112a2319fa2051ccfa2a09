import * as Solid from 'solid-js';
export declare const useLayoutEffect: typeof Solid.createRenderEffect;
export declare const usePrevious: (fn: () => boolean) => Solid.Accessor<{
    current: boolean | null;
    previous: boolean | null;
}>;
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
export declare function useIntersectionObserver<T extends Element>(ref: Solid.Accessor<T | null>, callback: (entry: IntersectionObserverEntry | undefined) => void, intersectionObserverOptions?: IntersectionObserverInit, options?: {
    disabled?: boolean;
}): Solid.Accessor<IntersectionObserver | null>;
