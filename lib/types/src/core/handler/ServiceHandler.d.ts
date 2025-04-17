import { EventHandler } from "./EventHandler";
import { PropertyHandler } from "./PropertyHandler";
export declare class ServiceHandler<R> extends EventHandler<string> {
    constructor(parent: PropertyHandler<R>);
}
