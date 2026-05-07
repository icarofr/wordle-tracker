import { AnyRouter, RegisteredRouter, RouterOptions } from '@tanstack/router-core';
import type * as Solid from 'solid-js';
export declare function RouterContextProvider<TRouter extends AnyRouter = RegisteredRouter, TDehydrated extends Record<string, any> = Record<string, any>>({ router, children, ...rest }: RouterProps<TRouter, TDehydrated> & {
    children: () => Solid.JSX.Element;
}): Solid.JSX.Element;
export declare function RouterProvider<TRouter extends AnyRouter = RegisteredRouter, TDehydrated extends Record<string, any> = Record<string, any>>({ router, ...rest }: RouterProps<TRouter, TDehydrated>): Solid.JSX.Element;
export type RouterProps<TRouter extends AnyRouter = RegisteredRouter, TDehydrated extends Record<string, any> = Record<string, any>> = Omit<RouterOptions<TRouter['routeTree'], NonNullable<TRouter['options']['trailingSlash']>, false, TRouter['history'], TDehydrated>, 'context'> & {
    router: TRouter;
    context?: Partial<RouterOptions<TRouter['routeTree'], NonNullable<TRouter['options']['trailingSlash']>, false, TRouter['history'], TDehydrated>['context']>;
};
