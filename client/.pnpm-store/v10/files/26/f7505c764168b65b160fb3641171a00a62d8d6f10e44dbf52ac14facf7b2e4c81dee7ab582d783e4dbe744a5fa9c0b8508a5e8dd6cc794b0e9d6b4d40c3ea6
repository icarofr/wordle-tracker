import * as Solid from 'solid-js';
import { TSR_DEFERRED_PROMISE, defer } from '@tanstack/router-core';
export function useAwaited({ promise: _promise, }) {
    const promise = defer(_promise);
    if (promise[TSR_DEFERRED_PROMISE].status === 'pending') {
        throw promise;
    }
    if (promise[TSR_DEFERRED_PROMISE].status === 'error') {
        throw promise[TSR_DEFERRED_PROMISE].error;
    }
    return [promise[TSR_DEFERRED_PROMISE].data, promise];
}
export function Await(props) {
    const [resource] = Solid.createResource(() => props.promise);
    return (<Solid.Show fallback={props.fallback} when={resource()}>
      {(data) => props.children(data())}
    </Solid.Show>);
}
//# sourceMappingURL=awaited.jsx.map