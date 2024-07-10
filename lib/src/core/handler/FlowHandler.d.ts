import { FlowDecision, PrefixCode } from "../..";
import { GetDotKeys } from "../types";
import { EventHandler } from "./EventHandler";
import { PropertyHandler } from "./PropertyHandler";
export declare class FlowHanlder<F, T> extends EventHandler<F> {
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
