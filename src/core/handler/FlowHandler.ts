import { Children } from "react";
import { FlowDecision, PrefixCode } from "../..";
import { Change, Observable } from "../observer";
import { GetDotKeys } from "../types";
import { EventHandler } from "./EventHandler";
import { PropertyHandler } from "./PropertyHandler";

export class FlowHanlder<F, T> extends EventHandler<F> {
  _flow: Record<GetDotKeys<F>, FlowDecision<T, F>>;
  _handler: PropertyHandler<T>;
  _current: GetDotKeys<F>;
  _fn: Function;

  constructor(
    flow: Record<GetDotKeys<F>, FlowDecision<T, F>>,
    handler: PropertyHandler<T>
  ) {
    super();
    this._flow = flow;
    this._handler = handler;
  }

  get current() {
    return this._current;
  }

  set current(val) {
    this._current = val;
    this._fn(val);
  }

  public onChangeCurrent = (fn) => {
    this._fn = fn;
  };

  send = async (target: PrefixCode<GetDotKeys<F>>) => {
    const pick = this._flow[target.replace("#", "")] as FlowDecision<T, F>;
    if (pick) {
      try {
        await pick.invoke(this._handler.state);
        this.current = target.replace("#", "") as GetDotKeys<F>;
        if (pick.onDone) {
          if (typeof pick.onDone == "string") {
            await this.send(pick.onDone);
          } else {
            target = await pick.onDone(this._handler.state);
          }
        }
      } catch (error) {
        if (pick.onError) {
          if (typeof pick.onError == "string") {
            await this.send(pick.onError);
          } else {
            target = await pick.onError(this._handler.state);
          }
        }
      }
    }
  };
}
