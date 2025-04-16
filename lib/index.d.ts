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

declare class FlowHanlder<F, T> extends EventHandler<F> {
    private _flow;
    private _handler;
    private _current;
    private _fns;
    constructor(flow: Record<GetDotKeys<F>, FlowDecision<T, F>>, handler: PropertyHandler<T>);
    private get current();
    private set current(value);
    onCurrentChange: (fn: (current: GetDotKeys<F>) => void) => void;
    offCurrentChange: (fn: (current: GetDotKeys<F>) => void) => void;
    send: (target: PrefixCode<GetDotKeys<F>>, prev?: PrefixCode<GetDotKeys<F>>, err?: any) => Promise<boolean>;
}

type DataModel<T> = T extends (...args: never[]) => Promise<infer Response> ? Response : never;
type ViewModel<T, R> = {
    context: PropertyHandler<T>;
    ref: R;
};
type ViewFlow<T, F, R> = ViewModel<T, R> & {
    flow: FlowHanlder<F, T>;
};
type PrefixCode<T> = T extends string ? `#${T}` : never;
type FlowDecision<T, F> = {
    invoke: (context: PropertyHandler<T>["state"], prev?: PrefixCode<GetDotKeys<F>>, err?: any) => void;
    onDone?: PrefixCode<GetDotKeys<F>> | ((context: PropertyHandler<T>["state"], prev?: PrefixCode<GetDotKeys<F>>, err?: any) => Promise<PrefixCode<GetDotKeys<F>>> | PrefixCode<GetDotKeys<F>> | undefined);
    onError?: PrefixCode<GetDotKeys<F>> | ((context: PropertyHandler<T>["state"], prev?: PrefixCode<GetDotKeys<F>>, err?: any) => Promise<PrefixCode<GetDotKeys<F>>> | PrefixCode<GetDotKeys<F>> | undefined);
};
declare const registViewFlow: <T, F, R = unknown>(data: T, flow: Record<GetDotKeys<F>, FlowDecision<T, F>>, options?: PropertyHandlerOptions, ref?: R) => ViewFlow<T, F, R>;
declare const registViewModel: <T, R = unknown>(data: T, options?: PropertyHandlerOptions, ref?: R) => ViewModel<T, R>;
declare const useViewFlow: <T, F, R>(vf: ViewFlow<T, F, R>, keys?: GetDotKeys<T>[]) => [T, <K extends GetFunctionKeys<T>>(name: K, payload: GetFunctionParams<T>[K], options?: {
    sync: boolean;
    callback?: (ret: GetFunctionReturn<T>[K]) => void;
}) => Promise<GetFunctionReturn<T>[K]>, (current: PrefixCode<GetDotKeys<F>>) => Promise<boolean>, R];
declare const useViewModel: <T, R>(vm: ViewModel<T, R>, keys?: GetDotKeys<T>[]) => [T, <K extends GetFunctionKeys<T>>(name: K, payload: GetFunctionParams<T>[K], options?: {
    sync: boolean;
    callback?: (ret: GetFunctionReturn<T>[K]) => void;
}) => Promise<GetFunctionReturn<T>[K]>, R];

export { DataModel, FlowDecision, PrefixCode, PropertyHandler, PropertyHandlerOptions, ViewFlow, ViewModel, registViewFlow, registViewModel, useViewFlow, useViewModel };
