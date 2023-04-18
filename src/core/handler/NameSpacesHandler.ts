import { ViewModel } from "../..";
import { PropertyHandler } from "./PropertyHandler";

export class NameSpacesHandler {
  private static instance: NameSpacesHandler;

  private viewModels: Record<string, PropertyHandler<unknown>>;
  constructor() {
    this.viewModels = {};
  }

  public static getInstance() {
    if (!NameSpacesHandler.instance) {
      NameSpacesHandler.instance = new NameSpacesHandler();
    }

    return NameSpacesHandler.instance;
  }

  getUsedNamespace() {
    return Object.keys(this.viewModels);
  }

  addNamespace<T>(name: string, handler: PropertyHandler<T>) {
    this.viewModels[name] = handler;
  }

  removeNamespace(name: string) {
    delete this.viewModels[name];
  }

  getNameSapce<T>(name: string) {
    return this.viewModels[name]
      ? (this.viewModels[name] as PropertyHandler<T>)
      : undefined;
  }
}
