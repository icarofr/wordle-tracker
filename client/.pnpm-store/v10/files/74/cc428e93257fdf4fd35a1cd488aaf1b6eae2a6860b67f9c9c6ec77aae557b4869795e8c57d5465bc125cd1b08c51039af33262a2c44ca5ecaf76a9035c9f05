import { useRouterState } from './useRouterState';
export function useLocation(opts) {
    return useRouterState({
        select: (state) => opts?.select ? opts.select(state.location) : state.location,
    });
}
//# sourceMappingURL=useLocation.jsx.map