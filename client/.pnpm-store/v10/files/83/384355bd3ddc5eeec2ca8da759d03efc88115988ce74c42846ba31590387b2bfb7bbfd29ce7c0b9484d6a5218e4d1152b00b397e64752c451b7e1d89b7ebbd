import { useStore } from "@tanstack/solid-store";
import { useRouter } from "./useRouter.js";
function useRouterState(opts) {
  const contextRouter = useRouter({
    warn: (opts == null ? void 0 : opts.router) === void 0
  });
  const router = (opts == null ? void 0 : opts.router) || contextRouter;
  return useStore(router.__store, (state) => {
    if (opts == null ? void 0 : opts.select) return opts.select(state);
    return state;
  });
}
export {
  useRouterState
};
//# sourceMappingURL=useRouterState.js.map
