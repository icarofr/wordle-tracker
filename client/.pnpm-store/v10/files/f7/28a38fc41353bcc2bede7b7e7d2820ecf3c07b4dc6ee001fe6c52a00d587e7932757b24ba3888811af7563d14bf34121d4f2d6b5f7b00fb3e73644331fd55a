"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const solidJs = require("solid-js");
const store$1 = require("solid-js/store");
const store = require("@tanstack/store");
function useStore(store2, selector = (d) => d) {
  const [slice, setSlice] = store$1.createStore({
    value: selector(store2.state)
  });
  const unsub = store2.subscribe(() => {
    const newValue = selector(store2.state);
    setSlice("value", store$1.reconcile(newValue));
  });
  solidJs.onCleanup(() => {
    unsub();
  });
  return () => slice.value;
}
exports.useStore = useStore;
Object.keys(store).forEach((k) => {
  if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
    enumerable: true,
    get: () => store[k]
  });
});
//# sourceMappingURL=index.cjs.map
