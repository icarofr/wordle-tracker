"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const Solid = require("solid-js");
const routerCore = require("@tanstack/router-core");
const useRouter = require("./useRouter.cjs");
const useRouterState = require("./useRouterState.cjs");
const utils = require("./utils.cjs");
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
function Transitioner() {
  const router = useRouter.useRouter();
  let mountLoadForRouter = {
    router,
    mounted: false
  };
  const isLoading = useRouterState.useRouterState({
    select: ({
      isLoading: isLoading2
    }) => isLoading2
  });
  const [isTransitioning, setIsTransitioning] = Solid__namespace.createSignal(false);
  const hasPendingMatches = useRouterState.useRouterState({
    select: (s) => s.matches.some((d) => d.status === "pending")
  });
  const previousIsLoading = utils.usePrevious(isLoading);
  const isAnyPending = () => isLoading() || isTransitioning() || hasPendingMatches();
  const previousIsAnyPending = utils.usePrevious(isAnyPending);
  const isPagePending = () => isLoading() || hasPendingMatches();
  const previousIsPagePending = utils.usePrevious(isPagePending);
  if (!router.isServer) {
    router.startTransition = async (fn) => {
      setIsTransitioning(true);
      await fn();
      setIsTransitioning(false);
    };
  }
  Solid__namespace.onMount(() => {
    const unsub = router.history.subscribe(router.load);
    const nextLocation = router.buildLocation({
      to: router.latestLocation.pathname,
      search: true,
      params: true,
      hash: true,
      state: true,
      _includeValidateSearch: true
    });
    if (routerCore.trimPathRight(router.latestLocation.href) !== routerCore.trimPathRight(nextLocation.href)) {
      router.commitLocation({
        ...nextLocation,
        replace: true
      });
    }
    Solid__namespace.onCleanup(() => {
      unsub();
    });
  });
  Solid__namespace.createRenderEffect(() => {
    Solid__namespace.untrack(() => {
      if (typeof window !== "undefined" && router.clientSsr || mountLoadForRouter.router === router && mountLoadForRouter.mounted) {
        return;
      }
      mountLoadForRouter = {
        router,
        mounted: true
      };
      const tryLoad = async () => {
        try {
          await router.load();
        } catch (err) {
          console.error(err);
        }
      };
      tryLoad();
    });
  });
  Solid__namespace.createRenderEffect(Solid__namespace.on([previousIsLoading, isLoading], ([previousIsLoading2, isLoading2]) => {
    if (previousIsLoading2.previous && !isLoading2) {
      router.emit({
        type: "onLoad",
        ...routerCore.getLocationChangeInfo(router.state)
      });
    }
  }));
  Solid__namespace.createRenderEffect(Solid__namespace.on([isPagePending, previousIsPagePending], ([isPagePending2, previousIsPagePending2]) => {
    if (previousIsPagePending2.previous && !isPagePending2) {
      router.emit({
        type: "onBeforeRouteMount",
        ...routerCore.getLocationChangeInfo(router.state)
      });
    }
  }));
  Solid__namespace.createRenderEffect(Solid__namespace.on([isAnyPending, previousIsAnyPending], ([isAnyPending2, previousIsAnyPending2]) => {
    if (previousIsAnyPending2.previous && !isAnyPending2) {
      router.emit({
        type: "onResolved",
        ...routerCore.getLocationChangeInfo(router.state)
      });
      router.__store.setState((s) => ({
        ...s,
        status: "idle",
        resolvedLocation: s.location
      }));
      routerCore.handleHashScroll(router);
    }
  }));
  return null;
}
exports.Transitioner = Transitioner;
//# sourceMappingURL=Transitioner.cjs.map
