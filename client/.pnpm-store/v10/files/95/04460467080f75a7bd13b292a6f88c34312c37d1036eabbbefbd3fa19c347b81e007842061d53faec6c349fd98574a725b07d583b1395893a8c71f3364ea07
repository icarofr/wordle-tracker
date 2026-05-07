import { Matches } from './Matches';
import { getRouterContext } from './routerContext';
export function RouterContextProvider({ router, children, ...rest }) {
    // Allow the router to update options on the router instance
    router.update({
        ...router.options,
        ...rest,
        context: {
            ...router.options.context,
            ...rest.context,
        },
    });
    const routerContext = getRouterContext();
    const provider = (<routerContext.Provider value={router}>
      {children()}
    </routerContext.Provider>);
    if (router.options.Wrap) {
        return <router.options.Wrap>{provider}</router.options.Wrap>;
    }
    return provider;
}
export function RouterProvider({ router, ...rest }) {
    return (<RouterContextProvider router={router} {...rest}>
      {() => <Matches />}
    </RouterContextProvider>);
}
//# sourceMappingURL=RouterProvider.jsx.map