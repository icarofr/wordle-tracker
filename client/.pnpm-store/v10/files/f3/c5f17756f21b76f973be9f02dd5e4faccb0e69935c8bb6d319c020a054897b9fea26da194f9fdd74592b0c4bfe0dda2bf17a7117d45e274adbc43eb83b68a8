import * as Solid from 'solid-js';
import type { DeferredPromise } from '@tanstack/router-core';
import type { SolidNode } from './route';
export type AwaitOptions<T> = {
    promise: Promise<T>;
};
export declare function useAwaited<T>({ promise: _promise, }: AwaitOptions<T>): [T, DeferredPromise<T>];
export declare function Await<T>(props: AwaitOptions<T> & {
    fallback?: SolidNode;
    children: (result: T) => SolidNode;
}): Solid.JSX.Element;
