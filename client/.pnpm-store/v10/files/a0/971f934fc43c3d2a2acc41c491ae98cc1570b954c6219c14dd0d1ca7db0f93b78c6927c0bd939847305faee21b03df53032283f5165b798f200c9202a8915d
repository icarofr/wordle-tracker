import { createComponent } from "solid-js/web";
import warning from "tiny-warning";
import { DefaultGlobalNotFound } from "./not-found.js";
function renderRouteNotFound(router, route, data) {
  if (!route.options.notFoundComponent) {
    if (router.options.defaultNotFoundComponent) {
      return createComponent(router.options.defaultNotFoundComponent, {
        data
      });
    }
    if (process.env.NODE_ENV === "development") {
      warning(route.options.notFoundComponent, `A notFoundError was encountered on the route with ID "${route.id}", but a notFoundComponent option was not configured, nor was a router level defaultNotFoundComponent configured. Consider configuring at least one of these to avoid TanStack Router's overly generic defaultNotFoundComponent (<div>Not Found<div>)`);
    }
    return createComponent(DefaultGlobalNotFound, {});
  }
  return createComponent(route.options.notFoundComponent, {
    data
  });
}
export {
  renderRouteNotFound
};
//# sourceMappingURL=renderRouteNotFound.js.map
