import { NodeType, type Solid } from '@solid-devtools/debugger/types';
export type NodeState = {
    type: NodeType;
    typeName: string;
    name: string;
};
export type NodeStateWithValue = NodeState & {
    value: unknown;
};
export declare const UNUSED: unique symbol;
export type ComputationState = {
    owned: Solid.Computation[];
    owner: Solid.Owner | NodeState | null | typeof UNUSED;
    prev: unknown | typeof UNUSED;
    value: unknown | typeof UNUSED;
    sources: (Solid.Computation | Solid.Signal)[];
    causedBy: NodeStateWithValue[] | null;
};
export declare const STYLES: {
    bold: string;
    ownerName: string;
    grayBackground: string;
    signalUnderline: string;
    new: string;
};
export declare const inGray: (text: unknown) => string;
export declare const styleTime: (time: number) => string;
export declare const getNameStyle: (type: NodeType) => string;
export declare function getValueSpecifier(v: unknown): string;
export declare function getNodeState(owner: Solid.Owner | Solid.Signal | NodeState): NodeState;
export declare function getNodeStateWithValue(owner: Solid.Computation | Solid.Signal | NodeStateWithValue): NodeStateWithValue;
export declare function createAlignedTextWidth<T extends string>(): [
    getPaddedText: (text: string) => T,
    updateWidth: (text: string) => number
];
export declare function paddedForEach<T, I extends string>(list: readonly T[], getPaddedValue: (item: T, index: number) => I, callback: (paddedValue: I, item: T, index: number) => void): void;
export declare const getComputationCreatedLabel: (type: string, name: string, timeElapsed: number) => string[];
export declare const getComputationRerunLabel: (name: string, timeElapsed: number) => string[];
export declare const getOwnerDisposedLabel: (name: string) => string[];
export declare function logPrevValue(prev: unknown): void;
export declare const logComputationDetails: ({ causedBy, owner, owned, sources, prev, value, }: Readonly<ComputationState>) => void;
export declare const logComputation: (groupLabel: string[], state: Readonly<ComputationState>) => void;
export declare function logOwned(ownerState: NodeState, owned: Readonly<Solid.Computation[]>, prevOwned: Readonly<Solid.Computation[]>): void;
export declare function logSignalsInitialValues(signals: Solid.Signal[]): void;
export declare function logInitialValue(node: Solid.Signal | NodeStateWithValue): void;
export declare function logSignalValue(signal: Solid.Signal | NodeStateWithValue): void;
export declare function logSignalValueUpdate({ name, type }: NodeState, value: unknown, prev: unknown, observers?: Solid.Computation[]): void;
export declare function logObservers(signalName: string, observers: Solid.Computation[], prevObservers: Solid.Computation[]): void;
export declare function logOwnerList<T extends Solid.Owner>(owners: readonly T[], logGroup?: (owner: T) => void): void;
export declare function getPropsInitLabel(state: NodeState, proxy: boolean, empty: boolean): string[];
export declare function getPropsKeyUpdateLabel({ name, type }: NodeState, empty: boolean): any[];
export declare function getPropLabel(type: 'Getter' | 'Value', name: string, value: unknown, occurrence: 'added' | 'removed' | null): any[];
//# sourceMappingURL=log.d.ts.map