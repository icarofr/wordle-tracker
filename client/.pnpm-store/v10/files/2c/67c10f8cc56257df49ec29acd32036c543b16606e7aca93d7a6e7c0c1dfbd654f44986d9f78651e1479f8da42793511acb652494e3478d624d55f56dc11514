"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const Solid = require("solid-js");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const Solid__namespace = /* @__PURE__ */ _interopNamespaceDefault(Solid);
const useLayoutEffect = typeof window !== "undefined" ? Solid__namespace.createRenderEffect : Solid__namespace.createEffect;
const usePrevious = (fn) => {
  return Solid__namespace.createMemo(
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
  Solid__namespace.createEffect(() => {
    const r = ref();
    if (!r || !isIntersectionObserverAvailable || options.disabled) {
      return;
    }
    observerRef = new IntersectionObserver(([entry]) => {
      callback(entry);
    }, intersectionObserverOptions);
    observerRef.observe(r);
    Solid__namespace.onCleanup(() => {
      observerRef == null ? void 0 : observerRef.disconnect();
    });
  });
  return () => observerRef;
}
exports.useIntersectionObserver = useIntersectionObserver;
exports.useLayoutEffect = useLayoutEffect;
exports.usePrevious = usePrevious;
//# sourceMappingURL=utils.cjs.map
