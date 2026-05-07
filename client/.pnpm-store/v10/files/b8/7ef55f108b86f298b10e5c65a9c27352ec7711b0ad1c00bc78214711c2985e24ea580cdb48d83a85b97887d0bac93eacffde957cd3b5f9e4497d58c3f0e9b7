import * as Solid from 'solid-js';
const routerContext = Solid.createContext(null);
export function getRouterContext() {
    if (typeof document === 'undefined') {
        return routerContext;
    }
    if (window.__TSR_ROUTER_CONTEXT__) {
        return window.__TSR_ROUTER_CONTEXT__;
    }
    window.__TSR_ROUTER_CONTEXT__ = routerContext;
    return routerContext;
}
//# sourceMappingURL=routerContext.jsx.map