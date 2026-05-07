import { createComponent } from "solid-js/web";
import * as Solid from "solid-js";
import { defer, TSR_DEFERRED_PROMISE } from "@tanstack/router-core";
function useAwaited({
  promise: _promise
}) {
  const promise = defer(_promise);
  if (promise[TSR_DEFERRED_PROMISE].status === "pending") {
    throw promise;
  }
  if (promise[TSR_DEFERRED_PROMISE].status === "error") {
    throw promise[TSR_DEFERRED_PROMISE].error;
  }
  return [promise[TSR_DEFERRED_PROMISE].data, promise];
}
function Await(props) {
  const [resource] = Solid.createResource(() => props.promise);
  return createComponent(Solid.Show, {
    get fallback() {
      return props.fallback;
    },
    get when() {
      return resource();
    },
    children: (data) => props.children(data())
  });
}
export {
  Await,
  useAwaited
};
//# sourceMappingURL=awaited.js.map
