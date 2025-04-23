import { Change, Observable } from "../observer";
import { GetDotKeys, GetFunctionKeys, GetFunctionParams, GetFunctionReturn } from "../types";
import { EventHandler } from "./EventHandler";
import { ServiceHandler } from "./ServiceHandler";
export type SendHistory = {
    name: string;
    payload: any;
    timestamp: number;
    result?: any;
    error?: Error;
};
export type Middleware<T> = (changes: Change[], next: () => void, state: T) => void | Promise<void>;
export type HistoryHandler<T> = (history: SendHistory, state: T) => void | Promise<void>;
export type HistoryOptions<T> = {
    handler?: HistoryHandler<T>;
    maxSize?: number;
};
export type PropertyHandlerOptions<T> = {
    name: string;
    deep: boolean;
    middlewares?: Middleware<T>[];
    history?: HistoryOptions<T>;
};
export declare class PropertyHandler<R> extends EventHandler<GetDotKeys<R>> {
    private _property;
    private _observable;
    private _reference;
    private _started;
    private _options?;
    private middlewares;
    private _sendHistory;
    private _historyHandler;
    private _historyMaxSize;
    services: ServiceHandler<R>;
    constructor(init_property: R, options?: PropertyHandlerOptions<R>);
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
