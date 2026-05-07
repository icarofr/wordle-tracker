import { memo, createComponent, Dynamic, mergeProps } from "solid-js/web";
import { createResource } from "solid-js";
import { Outlet } from "./Match.js";
import { ClientOnly } from "./ClientOnly.js";
function isModuleNotFoundError(error) {
  return typeof (error == null ? void 0 : error.message) === "string" && /Failed to fetch dynamically imported module/.test(error.message);
}
function lazyRouteComponent(importer, exportName, ssr) {
  let loadPromise;
  let comp;
  let error;
  const load = () => {
    if (typeof document === "undefined" && (ssr == null ? void 0 : ssr()) === false) {
      comp = () => null;
      return Promise.resolve(comp);
    }
    if (!loadPromise) {
      loadPromise = importer().then((res) => {
        loadPromise = void 0;
        comp = res[exportName ?? "default"];
        return comp;
      }).catch((err) => {
        error = err;
      });
    }
    return loadPromise;
  };
  const lazyComp = function Lazy(props) {
    if (error) {
      if (isModuleNotFoundError(error)) {
        if (error instanceof Error && typeof window !== "undefined" && typeof sessionStorage !== "undefined") {
          const storageKey = `tanstack_router_reload:${error.message}`;
          if (!sessionStorage.getItem(storageKey)) {
            sessionStorage.setItem(storageKey, "1");
            window.location.reload();
            return {
              default: () => null
            };
          }
        }
      }
      throw error;
    }
    if (!comp) {
      const [compResource] = createResource(load, {
        initialValue: comp,
        ssrLoadFrom: "initial"
      });
      return memo(compResource);
    }
    if ((ssr == null ? void 0 : ssr()) === false) {
      return createComponent(ClientOnly, {
        get fallback() {
          return createComponent(Outlet, {});
        },
        get children() {
          return createComponent(Dynamic, mergeProps({
            component: comp
          }, props));
        }
      });
    }
    return createComponent(Dynamic, mergeProps({
      component: comp
    }, props));
  };
  lazyComp.preload = load;
  return lazyComp;
}
export {
  lazyRouteComponent
};
//# sourceMappingURL=lazyRouteComponent.js.map
