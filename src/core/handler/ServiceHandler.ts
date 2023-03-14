import { GetFunctionKeys } from "../types";
import { EventHandler } from "./EventHandler";
import { PropertyHandler } from "./PropertyHandler";

export class ServiceHandler<R> extends EventHandler<string> {
  constructor(parent: PropertyHandler<R>) {
    super();
    Object.keys(parent.state).forEach((key) => {
      this.on(key, (payload) => {
        try {
          parent.state[key].apply(parent.state, [payload]);
        } catch (error) {
          console.log(error);
        }
      });
    });
  }
}
