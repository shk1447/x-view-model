export const Observable: Readonly<{
    from: (target: any, options: any) => any;
    isObservable: (input: any) => boolean;
    observe: (observable: any, observer: any, options: any) => void;
    unobserve: (observable: any, ...observers: any[]) => void;
}>;
export class ObjectObserver {
    constructor(observer: any);
    observe(target: any, options: any): any;
    unobserve(target: any): void;
    disconnect(): void;
    [observerKey]: any;
    [targetsKey]: Set<any>;
}
declare const observerKey: unique symbol;
declare const targetsKey: unique symbol;
export {};
