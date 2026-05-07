import { Asset } from './Asset';
import { useRouterState } from './useRouterState';
import { useRouter } from './useRouter';
export const Scripts = () => {
    const router = useRouter();
    const assetScripts = useRouterState({
        select: (state) => {
            const assetScripts = [];
            const manifest = router.ssr?.manifest;
            if (!manifest) {
                return [];
            }
            state.matches
                .map((match) => router.looseRoutesById[match.routeId])
                .forEach((route) => manifest.routes[route.id]?.assets
                ?.filter((d) => d.tag === 'script')
                .forEach((asset) => {
                assetScripts.push({
                    tag: 'script',
                    attrs: asset.attrs,
                    children: asset.children,
                });
            }));
            return assetScripts;
        },
    });
    const scripts = useRouterState({
        select: (state) => ({
            scripts: state.matches
                .map((match) => match.scripts)
                .flat(1)
                .filter(Boolean).map(({ children, ...script }) => ({
                tag: 'script',
                attrs: {
                    ...script,
                },
                children,
            })),
        }),
    });
    const allScripts = [
        ...scripts().scripts,
        ...assetScripts(),
    ];
    return (<>
      {allScripts.map((asset, i) => (<Asset {...asset}/>))}
    </>);
};
//# sourceMappingURL=Scripts.jsx.map