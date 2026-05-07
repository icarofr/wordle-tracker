import * as Solid from "solid-js";
const useLayoutEffect = typeof window !== "undefined" ? Solid.createRenderEffect : Solid.createEffect;
const usePrevious = (fn) => {
  return Solid.createMemo(
    (prev = {
      current: null,
      previous: null
    }) => {
      const current = fn();
      if (prev.current !== current) {
        prev.previous = prev.current;
        prev.current = current;
      }
      return prev;
    }
  );
};
function useIntersectionObserver(ref, callback, intersectionObserverOptions = {}, options = {}) {
  const isIntersectionObserverAvailable = typeof IntersectionObserver === "function";
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
      observerRef == null ? void 0 : observerRef.disconnect();
    });
  });
  return () => observerRef;
}
export {
  useIntersectionObserver,
  useLayoutEffect,
  usePrevious
};
//# sourceMappingURL=utils.js.map
