export declare class EventHandler<K> {
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
