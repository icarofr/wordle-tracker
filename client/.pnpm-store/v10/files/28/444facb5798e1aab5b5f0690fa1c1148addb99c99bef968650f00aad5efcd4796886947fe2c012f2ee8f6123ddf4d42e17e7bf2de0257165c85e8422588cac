import { useMatch } from './useMatch';
export function useSearch(opts) {
    return useMatch({
        from: opts.from,
        strict: opts.strict,
        shouldThrow: opts.shouldThrow,
        select: (match) => {
            return opts.select ? opts.select(match.search) : match.search;
        },
    });
}
//# sourceMappingURL=useSearch.jsx.map