import { createComponent, template } from "solid-js/web";
import { isNotFound } from "@tanstack/router-core";
import { CatchBoundary } from "./CatchBoundary.js";
import { useRouterState } from "./useRouterState.js";
var _tmpl$ = /* @__PURE__ */ template(`<p>Not Found`);
function CatchNotFound(props) {
  const resetKey = useRouterState({
    select: (s) => `not-found-${s.location.pathname}-${s.status}`
  });
  return createComponent(CatchBoundary, {
    getResetKey: () => resetKey(),
    onCatch: (error) => {
      var _a;
      if (isNotFound(error)) {
        (_a = props.onCatch) == null ? void 0 : _a.call(props, error);
      } else {
        throw error;
      }
    },
    errorComponent: ({
      error
    }) => {
      var _a;
      if (isNotFound(error)) {
        return (_a = props.fallback) == null ? void 0 : _a.call(props, error);
      } else {
        throw error;
      }
    },
    get children() {
      return props.children;
    }
  });
}
function DefaultGlobalNotFound() {
  return _tmpl$();
}
export {
  CatchNotFound,
  DefaultGlobalNotFound
};
//# sourceMappingURL=not-found.js.map
