import { PropertyHandler } from "./PropertyHandler";
export type ComponentState = {
    enabled: boolean;
    paths: string[];
};
export interface DevToolsState {
    components: Map<PropertyHandler<any>, Record<string, ComponentState>>;
}
export declare class DevToolsHandler {
    private state;
    constructor();
    components(): Map<PropertyHandler<any>, Record<string, ComponentState>>;
    registerComponent(context: PropertyHandler<any>, componentName: string, componentPaths?: string[]): void;
}
