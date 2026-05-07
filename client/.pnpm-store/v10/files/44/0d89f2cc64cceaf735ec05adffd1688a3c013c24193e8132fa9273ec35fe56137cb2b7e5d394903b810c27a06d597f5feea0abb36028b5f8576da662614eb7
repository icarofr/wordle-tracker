import { useRouter, useRouterState } from '@tanstack/solid-router';
import { TanStackRouterDevtoolsCore } from '@tanstack/router-devtools-core';
import { createEffect, createSignal, onCleanup, onMount } from 'solid-js';
export const TanStackRouterDevtools = (props) => {
    const activeRouter = props.router ?? useRouter();
    const activeRouterState = useRouterState({ router: activeRouter });
    const usedProps = {
        ...props,
        router: activeRouter,
        routerState: activeRouterState,
    };
    let devToolRef;
    const [devtools] = createSignal(new TanStackRouterDevtoolsCore(usedProps));
    // Update devtools when props change
    createEffect(() => {
        devtools().setRouter(usedProps.router);
    });
    createEffect(() => {
        devtools().setRouterState(usedProps.routerState);
    });
    createEffect(() => {
        devtools().setOptions({
            initialIsOpen: usedProps.initialIsOpen,
            panelProps: usedProps.panelProps,
            closeButtonProps: usedProps.closeButtonProps,
            toggleButtonProps: usedProps.toggleButtonProps,
            position: usedProps.position,
            containerElement: usedProps.containerElement,
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
//# sourceMappingURL=TanStackRouterDevtools.jsx.map