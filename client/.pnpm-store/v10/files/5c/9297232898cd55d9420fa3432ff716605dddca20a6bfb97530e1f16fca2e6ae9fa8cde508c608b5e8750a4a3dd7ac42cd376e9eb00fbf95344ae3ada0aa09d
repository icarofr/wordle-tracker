import { template, use } from "solid-js/web";
import { useRouter, useRouterState } from "@tanstack/solid-router";
import { TanStackRouterDevtoolsPanelCore } from "@tanstack/router-devtools-core";
import { createSignal, createEffect, onMount, onCleanup } from "solid-js";
var _tmpl$ = /* @__PURE__ */ template(`<div>`);
const TanStackRouterDevtoolsPanel = (props) => {
  const activeRouter = props.router ?? useRouter();
  const activeRouterState = useRouterState({
    router: activeRouter
  });
  const usedProps = {
    ...props,
    router: activeRouter,
    routerState: activeRouterState
  };
  let devToolRef;
  const [devtools] = createSignal(new TanStackRouterDevtoolsPanelCore(usedProps));
  createEffect(() => {
    devtools().setRouter(usedProps.router);
  });
  createEffect(() => {
    devtools().setRouterState(usedProps.routerState);
  });
  createEffect(() => {
    devtools().setOptions({
      className: usedProps.className,
      style: usedProps.style,
      shadowDOMTarget: usedProps.shadowDOMTarget
    });
  });
  onMount(() => {
    if (devToolRef) {
      devtools().mount(devToolRef);
      onCleanup(() => {
        devtools().unmount();
      });
    }
  });
  return (() => {
    var _el$ = _tmpl$();
    var _ref$ = devToolRef;
    typeof _ref$ === "function" ? use(_ref$, _el$) : devToolRef = _el$;
    return _el$;
  })();
};
export {
  TanStackRouterDevtoolsPanel
};
//# sourceMappingURL=TanStackRouterDevtoolsPanel.js.map
