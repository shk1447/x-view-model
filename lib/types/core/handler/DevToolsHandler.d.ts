import { PropertyHandler } from "./PropertyHandler";
export type ComponentState = {
    enabled: boolean;
};
export interface DevToolsState {
    components: Map<PropertyHandler<any>, Record<string, ComponentState>>;
}
export declare class DevToolsHandler {
    private state;
    constructor();
    registerComponent(context: PropertyHandler<any>, componentName: string): void;
}
