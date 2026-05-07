import { DeferredPromise } from '@tanstack/router-core';
import { SolidNode } from './route.cjs';
import * as Solid from 'solid-js';
export type AwaitOptions<T> = {
    promise: Promise<T>;
};
export declare function useAwaited<T>({ promise: _promise, }: AwaitOptions<T>): [T, DeferredPromise<T>];
export declare function Await<T>(props: AwaitOptions<T> & {
    fallback?: SolidNode;
    children: (result: T) => SolidNode;
}): Solid.JSX.Element;
