import { useMatch } from './useMatch';
export function useLoaderData(opts) {
    return useMatch({
        from: opts.from,
        strict: opts.strict,
        select: (s) => {
            return opts.select ? opts.select(s.loaderData) : s.loaderData;
        },
    });
}
//# sourceMappingURL=useLoaderData.jsx.map