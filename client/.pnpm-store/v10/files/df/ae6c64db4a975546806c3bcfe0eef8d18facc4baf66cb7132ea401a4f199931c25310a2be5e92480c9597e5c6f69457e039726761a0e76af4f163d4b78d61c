import { useMatch } from './useMatch';
export function useParams(opts) {
    return useMatch({
        from: opts.from,
        strict: opts.strict,
        shouldThrow: opts.shouldThrow,
        select: (match) => {
            return opts.select ? opts.select(match.params) : match.params;
        },
    });
}
//# sourceMappingURL=useParams.jsx.map