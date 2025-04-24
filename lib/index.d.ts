type ChangeType = "insert" | "update" | "delete" | "reverse" | "shuffle";

/**
 * `Observable` allows to observe any (deep) changes on its underlying object graph
 *
 * - created by `from` static method, via cloning the target
 * - important: the type `T` is not preserved, beside its shape
 */
declare abstract class Observable {
  /**
   * create Observable from the target
   * - target is cloned, remaining unchanged in itself
   * - important: the type `T` is NOT preserved, beside its shape
   *
   * @param target source, to create `Observable` from
   * @param options observable options
   */
  static from<T>(target: T, options?: ObservableOptions): Observable & T;

  /**
   * check input for being `Observable`
   *
   * @param input any object to be checked as `Observable`
   */
  static isObservable(input: unknown): boolean;

  /**
   * add observer to handle the observable's changes
   *
   * @param observable observable to set observer on
   * @param observer observer function / logic
   * @param options observation options
   */
  static observe(
    observable: Observable,
    observer: Observer,
    options?: ObserverOptions
  ): void;

  /**
   * remove observer/s from observable
   *
   * @param observable observable to remove observer/s from
   * @param observers 0 to many observers to remove; if none supplied, ALL observers will be removed
   */
  static unobserve(observable: Observable, ...observers: Observer[]): void;
}

interface ObservableOptions {
  async: boolean;
}

interface Observer {
  (changes: Change[]): void;
}

interface ObserverOptions {
  path?: string;
  pathsOf?: string;
  pathsFrom?: string;
}

interface Change {
  type: ChangeType;
  path: string[];
  value?: any;
  oldValue?: any;
  object: object;
}

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

type ComponentState = {
    enabled: boolean;
    paths: string[];
};
interface DevToolsState {
    components: Map<PropertyHandler<any>, Record<string, ComponentState>>;
}
declare class DevToolsHandler {
    private state;
    constructor();
    components(): Map<PropertyHandler<any>, Record<string, ComponentState>>;
    registerComponent(context: PropertyHandler<any>, componentName: string, componentPaths?: string[]): void;
}

declare class EventHandler<K> {
    private handlers;
    constructor();
    on: (event: K, func: (...args: any) => void) => this;
    off: (event: K, func: (...args: any) => void) => this;
    callEmitFromMT: (this: {
        func: Function;
        args: any[];
    }) => void;
    emit: (event: K, args?: any) => this;
    clear: () => void;
}

declare class ServiceHandler<R> extends EventHandler<string> {
    constructor(parent: PropertyHandler<R>);
}

type SendHistory = {
    name: string;
    componentName: string;
    payload: any;
    timestamp: number;
    result?: any;
    error?: Error;
};
type Middleware<T> = (changes: Change[], next: () => void, state: T) => void | Promise<void>;
type HistoryHandler<T> = (history: SendHistory, state: T) => void | Promise<void>;
type HistoryOptions<T> = {
    handler?: HistoryHandler<T>;
    maxSize?: number;
};
type PropertyHandlerOptions<T> = {
    name: string;
    deep: boolean;
    middlewares?: Middleware<T>[];
    history?: HistoryOptions<T>;
};
declare class PropertyHandler<R> extends EventHandler<GetDotKeys<R>> {
    private _property;
    private _observable;
    private _reference;
    private _started;
    private _options?;
    private middlewares;
    private _sendHistory;
    private _historyHandler;
    private _historyMaxSize;
    private _componentName;
    services: ServiceHandler<R>;
    private devTools?;
    constructor(init_property: R, options?: PropertyHandlerOptions<R>, devTools?: DevToolsHandler);
    use(middleware: Middleware<R>): this;
    private executeMiddlewares;
    get state(): Observable & R;
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
    private addHistory;
    send<K extends GetFunctionKeys<R>>(name: K, payload: GetFunctionParams<R>[K], async?: boolean): Promise<GetFunctionReturn<R>[K] extends Promise<infer U> ? U : GetFunctionReturn<R>[K]>;
    getSendHistory(): SendHistory[];
    clearSendHistory(): void;
}

type DataModel<T> = T extends (...args: never[]) => Promise<infer Response> ? Response : never;
type ViewModel<T, R> = {
    context: PropertyHandler<T>;
    ref: R;
};
declare const devTools: DevToolsHandler;
declare const registViewModel: <T, R = undefined>(data: T, options?: PropertyHandlerOptions<T> | undefined, ref?: R | undefined) => ViewModel<T, R>;
declare const useViewModel: <T, R>(vm: ViewModel<T, R>, keys?: GetDotKeys<T>[] | undefined, componentInfo?: {
    name: string;
    paths: string[];
}) => [T, <K extends GetFunctionKeys<T>>(name: K, payload: GetFunctionParams<T>[K], async?: boolean) => Promise<GetFunctionReturn<T>[K] extends Promise<infer U> ? U : GetFunctionReturn<T>[K]>, R];
type GetDotKeysImpl<T> = T extends object ? {
    [K in keyof T & (string | number)]: T[K] extends object ? K | `${K}.${GetDotKeysImpl<T[K]>}` : K;
}[keyof T & (string | number)] : never;
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
declare const useComputedViewModel: <T, R, S>(vm: ViewModel<T, R>, selector: (state: T) => S, keys?: GetDotKeys<T>[] | undefined) => [S, <K extends GetFunctionKeys<T>>(name: K, payload: GetFunctionParams<T>[K], async?: boolean) => Promise<GetFunctionReturn<T>[K] extends Promise<infer U> ? U : GetFunctionReturn<T>[K]>, R];
declare const useMemoizedViewModel: <T, R, K extends GetDotKeysImpl<T>>(vm: ViewModel<T, R>, keys?: K[] | undefined) => [UnionToIntersection<{ [P in K & string]: P extends keyof T ? { [Key in P]: T[Key]; } : P extends `${infer A}.${infer B}` ? A extends keyof T ? B extends keyof T[A] ? { [Key_1 in A]: { [SubKey in B]: T[A][SubKey]; }; } : never : never : never; }[K & string]>, <K_1 extends GetFunctionKeys<T>>(name: K_1, payload: GetFunctionParams<T>[K_1], async?: boolean) => Promise<GetFunctionReturn<T>[K_1] extends Promise<infer U> ? U : GetFunctionReturn<T>[K_1]>, R];

export { ComponentState, DataModel, DevToolsHandler, DevToolsState, ViewModel, devTools, registViewModel, useComputedViewModel, useMemoizedViewModel, useViewModel };
