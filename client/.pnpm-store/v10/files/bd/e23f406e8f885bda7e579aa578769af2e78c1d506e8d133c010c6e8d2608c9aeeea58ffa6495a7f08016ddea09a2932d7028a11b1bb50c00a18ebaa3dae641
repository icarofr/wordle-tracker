import { useMatch } from './useMatch';
export function useLoaderDeps(opts) {
    const { select, ...rest } = opts;
    return useMatch({
        ...rest,
        select: (s) => {
            return select ? select(s.loaderDeps) : s.loaderDeps;
        },
    });
}
//# sourceMappingURL=useLoaderDeps.jsx.map