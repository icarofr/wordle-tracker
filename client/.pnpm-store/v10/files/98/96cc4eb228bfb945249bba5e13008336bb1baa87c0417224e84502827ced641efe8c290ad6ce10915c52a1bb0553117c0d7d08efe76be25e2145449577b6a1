import * as Solid from 'solid-js';
import warning from 'tiny-warning';
import { getRouterContext } from './routerContext';
export function useRouter(opts) {
    const value = Solid.useContext(getRouterContext());
    warning(!((opts?.warn ?? true) && !value), 'useRouter must be used inside a <RouterProvider> component!');
    return value;
}
//# sourceMappingURL=useRouter.jsx.map