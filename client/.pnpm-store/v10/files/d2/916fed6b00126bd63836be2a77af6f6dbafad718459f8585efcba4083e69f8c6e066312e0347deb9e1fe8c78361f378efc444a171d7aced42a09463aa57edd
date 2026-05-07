"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const solidStore = require("@tanstack/solid-store");
const useRouter = require("./useRouter.cjs");
function useRouterState(opts) {
  const contextRouter = useRouter.useRouter({
    warn: (opts == null ? void 0 : opts.router) === void 0
  });
  const router = (opts == null ? void 0 : opts.router) || contextRouter;
  return solidStore.useStore(router.__store, (state) => {
    if (opts == null ? void 0 : opts.select) return opts.select(state);
    return state;
  });
}
exports.useRouterState = useRouterState;
//# sourceMappingURL=useRouterState.cjs.map
