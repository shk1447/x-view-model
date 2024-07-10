import { GetDotKeys, GetFunctionKeys, GetFunctionParams, GetFunctionReturn } from "../types";
import { EventHandler } from "./EventHandler";
import { NameSpacesHandler } from "./NameSpacesHandler";
import { ServiceHandler } from "./ServiceHandler";
export type PropertyHandlerOptions = {
    name: string;
    deep: boolean;
};
export declare class PropertyHandler<R> extends EventHandler<GetDotKeys<R>> {
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
    restart(): void;
    snapshot(): string;
    restore(json: string): void;
    send<K extends GetFunctionKeys<R>>(name: K, payload: GetFunctionParams<R>[K], options?: {
        sync: boolean;
        callback: (ret: GetFunctionReturn<R>[K]) => void;
    }): Promise<boolean>;
}
