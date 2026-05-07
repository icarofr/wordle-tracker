import { type Solid } from '@solid-devtools/debugger/types';
export declare function getFunctionSources(fn: () => unknown): Solid.Signal[];
/**
 * For measuring the time elapsed. Returns a function that will return the time elapsed since it's last call.
 * */
export declare function makeTimeMeter(): () => number;
export declare function getDiffMap<T extends object>(from: readonly T[], to: readonly T[], mapConstructor?: WeakMapConstructor): [(item: T) => 'added' | 'removed' | null, T[]];
export declare function getDiffMap<T>(from: readonly T[], to: readonly T[], mapConstructor: MapConstructor): [(item: T) => 'added' | 'removed' | null, T[]];
export declare function getStackDiffMap<T extends object>(from: readonly T[], to: readonly T[], mapConstructor?: WeakMapConstructor): [(item: T) => 'added' | null, T[]];
export declare function getStackDiffMap<T>(from: readonly T[], to: readonly T[], mapConstructor: MapConstructor): [(item: T) => 'added' | null, T[]];
//# sourceMappingURL=utils.d.ts.map