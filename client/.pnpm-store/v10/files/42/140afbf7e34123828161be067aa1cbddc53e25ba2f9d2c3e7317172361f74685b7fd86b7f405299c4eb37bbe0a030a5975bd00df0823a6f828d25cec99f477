import { createComponent, mergeProps } from "solid-js/web";
import { Matches } from "./Matches.js";
import { getRouterContext } from "./routerContext.js";
function RouterContextProvider({
  router,
  children,
  ...rest
}) {
  router.update({
    ...router.options,
    ...rest,
    context: {
      ...router.options.context,
      ...rest.context
    }
  });
  const routerContext = getRouterContext();
  const provider = createComponent(routerContext.Provider, {
    value: router,
    get children() {
      return children();
    }
  });
  if (router.options.Wrap) {
    return createComponent(router.options.Wrap, {
      children: provider
    });
  }
  return provider;
}
function RouterProvider({
  router,
  ...rest
}) {
  return createComponent(RouterContextProvider, mergeProps({
    router
  }, rest, {
    children: () => createComponent(Matches, {})
  }));
}
export {
  RouterContextProvider,
  RouterProvider
};
//# sourceMappingURL=RouterProvider.js.map
