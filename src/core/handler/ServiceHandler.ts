import { GetFunctionKeys } from "../types";
import { EventHandler } from "./EventHandler";
import { PropertyHandler } from "./PropertyHandler";

export class ServiceHandler<R> extends EventHandler<string> {
  constructor(parent: PropertyHandler<R>) {
    super();
    Object.keys(parent.property as object).forEach((key) => {
      this.on(key, (payload) => {
        try {
          (parent.property as any)[key].apply(parent.state, [payload]);
        } catch (error) {
          console.log(error);
        }
      });
    });
  }
}
