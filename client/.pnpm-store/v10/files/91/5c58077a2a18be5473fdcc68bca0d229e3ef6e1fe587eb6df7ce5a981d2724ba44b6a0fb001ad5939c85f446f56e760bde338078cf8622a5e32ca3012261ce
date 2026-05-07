import { memo, isServer } from "solid-js/web";
import * as Solid from "solid-js";
function ClientOnly(props) {
  return useHydrated() ? memo(() => props.children) : memo(() => props.fallback);
}
function useHydrated() {
  const [hydrated, setHydrated] = Solid.createSignal(!isServer);
  if (!isServer) {
    Solid.createEffect(() => {
      setHydrated(true);
    });
  }
  return hydrated;
}
export {
  ClientOnly,
  useHydrated
};
//# sourceMappingURL=ClientOnly.js.map
