import { Change } from '../observer';
export interface DevToolsState {
    components: Set<string>;
    history: Array<{
        type: string;
        payload: any;
    }>;
    updates: number;
}
export declare class DevToolsHandler {
    private state;
    constructor();
    registerComponent(componentId: string): void;
    unregisterComponent(componentId: string): void;
    recordChange(changes: Change[]): void;
    getComponents(): string[];
    getHistory(): {
        type: string;
        payload: any;
    }[];
    getUpdates(): number;
}
