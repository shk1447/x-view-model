import { PropertyHandler } from "./PropertyHandler";
export declare class NameSpacesHandler {
    private static instance;
    private viewModels;
    constructor();
    static getInstance(): NameSpacesHandler;
    getUsedNamespace(): string[];
    addNamespace<T>(name: string, handler: PropertyHandler<T>): void;
    removeNamespace(name: string): void;
    getNameSapce<T>(name: string): PropertyHandler<T>;
}
