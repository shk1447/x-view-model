type DotPrefix<T extends string> = T extends "" ? "" : `.${T}`;
type GetDotKeys<T> = T extends Date | Array<any> ? "" : (T extends object ? {
    [K in Exclude<keyof T, symbol>]: `${K}` | `${K}${DotPrefix<GetDotKeys<T[K]>>}`;
}[Exclude<keyof T, symbol>] : "") extends infer D ? Extract<D, string> : never;
type GetFunctionKeys<T> = {
    [K in Exclude<keyof T, symbol>]: T[K] extends Function ? `${K}` : "";
}[Exclude<keyof T, symbol>] extends infer D ? Extract<D, string> : never;
type GetFunctionParams<T> = {
    [K in keyof T]: T[K] extends (args: any) => void ? Parameters<T[K]>[0] : any;
};
type GetFunctionReturn<T> = {
    [K in keyof T]: T[K] extends (args: any) => any ? ReturnType<T[K]> : void;
};

declare class EventHandler<K> {
    private handlers;
    constructor();
    on: (event: K, func: (...args: any) => void) => this;
    off: (event: K, func: (...args: any) => void) => this;
    callEmitFromMT: () => void;
    emit: (event: K, args?: any) => this;
    clear: () => void;
}

declare class NameSpacesHandler {
    private static instance;
    private viewModels;
    constructor();
    static getInstance(): NameSpacesHandler;
    getUsedNamespace(): string[];
    addNamespace<T>(name: string, handler: PropertyHandler<T>): void;
    removeNamespace(name: string): void;
    getNameSapce<T>(name: string): PropertyHandler<T>;
}

declare class ServiceHandler<R> extends EventHandler<string> {
    constructor(parent: PropertyHandler<R>);
}

type PropertyHandlerOptions = {
    name: string;
    deep: boolean;
};
declare class PropertyHandler<R> extends EventHandler<GetDotKeys<R>> {
    private _property;
    private _observable;
    private _reference;
    private _started;
    private _options?;
    services: ServiceHandler<R>;
    namespaces: NameSpacesHandler;
    constructor(init_property: R, options?: PropertyHandlerOptions);
    get state(): R;
    get property(): R;
    get reference(): number;
    get name(): string;
    private set reference(value);
    private watch;
    increaseReference(): void;
    decreaseReference(): void;
    private start;
    private stop;
    private pause;
    restart(): this;
    snapshot(): string;
    rebase(json: string | Partial<R>): this;
    restore(json: string | Partial<R>): this;
    send<K extends GetFunctionKeys<R>>(name: K, payload: GetFunctionParams<R>[K], options?: {
        sync: boolean;
        callback: (ret: GetFunctionReturn<R>[K]) => void;
    }): Promise<any>;
}

type DataModel<T> = T extends (...args: never[]) => Promise<infer Response> ? Response : never;
type ViewModel<T, R> = {
    context: PropertyHandler<T>;
    ref: R;
};
declare const registViewModel: <T, R = unknown>(data: T, options?: PropertyHandlerOptions, ref?: R) => ViewModel<T, R>;
declare const useViewModel: <T, R>(vm: ViewModel<T, R>, keys?: GetDotKeys<T>[]) => [T, <K extends GetFunctionKeys<T>>(name: K, payload: GetFunctionParams<T>[K], async?: boolean) => Promise<GetFunctionReturn<T>[K] extends Promise<infer U> ? U : GetFunctionReturn<T>[K]>, R];
type GetDotKeysImpl<T> = T extends object ? {
    [K in keyof T & (string | number)]: T[K] extends object ? K | `${K}.${GetDotKeysImpl<T[K]>}` : K;
}[keyof T & (string | number)] : never;
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
declare const useComputedViewModel: <T, R, S>(vm: ViewModel<T, R>, selector: (state: T) => S, keys?: GetDotKeys<T>[]) => [S, <K extends GetFunctionKeys<T>>(name: K, payload: GetFunctionParams<T>[K], async?: boolean) => Promise<GetFunctionReturn<T>[K] extends Promise<infer U> ? U : GetFunctionReturn<T>[K]>, R];
declare const useMemoizedViewModel: <T, R, K extends GetDotKeysImpl<T>>(vm: ViewModel<T, R>, keys?: K[]) => [UnionToIntersection<{ [P in K & string]: P extends keyof T ? { [Key in P]: T[Key]; } : P extends `${infer A}.${infer B}` ? A extends keyof T ? B extends keyof T[A] ? { [Key_1 in A]: { [SubKey in B]: T[A][SubKey]; }; } : never : never : never; }[K & string]>, <K_1 extends GetFunctionKeys<T>>(name: K_1, payload: GetFunctionParams<T>[K_1], async?: boolean) => Promise<GetFunctionReturn<T>[K_1] extends Promise<infer U> ? U : GetFunctionReturn<T>[K_1]>, R];

export { DataModel, PropertyHandler, PropertyHandlerOptions, ViewModel, registViewModel, useComputedViewModel, useMemoizedViewModel, useViewModel };
