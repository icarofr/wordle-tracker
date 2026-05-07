import { useRouter, useRouterState } from '@tanstack/solid-router';
import { TanStackRouterDevtoolsPanelCore } from '@tanstack/router-devtools-core';
import { createEffect, createSignal, onCleanup, onMount } from 'solid-js';
export const TanStackRouterDevtoolsPanel = (props) => {
    const activeRouter = props.router ?? useRouter();
    const activeRouterState = useRouterState({ router: activeRouter });
    const usedProps = {
        ...props,
        router: activeRouter,
        routerState: activeRouterState,
    };
    let devToolRef;
    const [devtools] = createSignal(new TanStackRouterDevtoolsPanelCore(usedProps));
    // Update devtools when props change
    createEffect(() => {
        devtools().setRouter(usedProps.router);
    });
    createEffect(() => {
        devtools().setRouterState(usedProps.routerState);
    });
    createEffect(() => {
        devtools().setOptions({
            className: usedProps.className,
            style: usedProps.style,
            shadowDOMTarget: usedProps.shadowDOMTarget,
        });
    });
    onMount(() => {
        if (devToolRef) {
            devtools().mount(devToolRef);
            onCleanup(() => {
                devtools().unmount();
            });
        }
    });
    return (<>
      <div ref={devToolRef}/>
    </>);
};
//# sourceMappingURL=TanStackRouterDevtoolsPanel.jsx.map