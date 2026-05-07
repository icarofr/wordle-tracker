import { useStore } from '@tanstack/solid-store';
import { useRouter } from './useRouter';
export function useRouterState(opts) {
    const contextRouter = useRouter({
        warn: opts?.router === undefined,
    });
    const router = opts?.router || contextRouter;
    return useStore(router.__store, (state) => {
        if (opts?.select)
            return opts.select(state);
        return state;
    });
}
//# sourceMappingURL=useRouterState.jsx.map