"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const web = require("solid-js/web");
const solidRouter = require("@tanstack/solid-router");
const routerDevtoolsCore = require("@tanstack/router-devtools-core");
const solidJs = require("solid-js");
var _tmpl$ = /* @__PURE__ */ web.template(`<div>`);
const TanStackRouterDevtools = (props) => {
  const activeRouter = props.router ?? solidRouter.useRouter();
  const activeRouterState = solidRouter.useRouterState({
    router: activeRouter
  });
  const usedProps = {
    ...props,
    router: activeRouter,
    routerState: activeRouterState
  };
  let devToolRef;
  const [devtools] = solidJs.createSignal(new routerDevtoolsCore.TanStackRouterDevtoolsCore(usedProps));
  solidJs.createEffect(() => {
    devtools().setRouter(usedProps.router);
  });
  solidJs.createEffect(() => {
    devtools().setRouterState(usedProps.routerState);
  });
  solidJs.createEffect(() => {
    devtools().setOptions({
      initialIsOpen: usedProps.initialIsOpen,
      panelProps: usedProps.panelProps,
      closeButtonProps: usedProps.closeButtonProps,
      toggleButtonProps: usedProps.toggleButtonProps,
      position: usedProps.position,
      containerElement: usedProps.containerElement,
      shadowDOMTarget: usedProps.shadowDOMTarget
    });
  });
  solidJs.onMount(() => {
    if (devToolRef) {
      devtools().mount(devToolRef);
      solidJs.onCleanup(() => {
        devtools().unmount();
      });
    }
  });
  return (() => {
    var _el$ = _tmpl$();
    var _ref$ = devToolRef;
    typeof _ref$ === "function" ? web.use(_ref$, _el$) : devToolRef = _el$;
    return _el$;
  })();
};
exports.TanStackRouterDevtools = TanStackRouterDevtools;
//# sourceMappingURL=TanStackRouterDevtools.cjs.map
