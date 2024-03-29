import { Children } from "react";
import { FlowDecision, PrefixCode } from "../..";
import { Change, Observable } from "../observer";
import { GetDotKeys } from "../types";
import { EventHandler } from "./EventHandler";
import { PropertyHandler } from "./PropertyHandler";

export class FlowHanlder<F, T> extends EventHandler<F> {
  private _flow: Record<GetDotKeys<F>, FlowDecision<T, F>>;
  private _handler: PropertyHandler<T>;
  private _current: GetDotKeys<F>;
  private _fns: ((current: GetDotKeys<F>) => void)[];

  constructor(
    flow: Record<GetDotKeys<F>, FlowDecision<T, F>>,
    handler: PropertyHandler<T>
  ) {
    super();
    this._flow = flow;
    this._handler = handler;
    this._fns = [];
  }

  private get current() {
    return this._current;
  }

  private set current(val) {
    this._current = val;
    this._fns.forEach((d) => {
      d(val);
    });
  }

  public onCurrentChange = (fn: (current: GetDotKeys<F>) => void) => {
    this._fns.push(fn);
  };

  public offCurrentChange = (fn: (current: GetDotKeys<F>) => void) => {
    this._fns.splice(this._fns.indexOf(fn), 1);
  };

  public send = async (
    target: PrefixCode<GetDotKeys<F>>,
    prev?: PrefixCode<GetDotKeys<F>>,
    err?: any
  ) => {
    const pick = this._flow[target.replace("#", "")] as FlowDecision<T, F>;
    if (pick) {
      try {
        await pick.invoke(this._handler.state, prev, err);
        this.current = target.replace("#", "") as GetDotKeys<F>;
        if (pick.onDone) {
          if (typeof pick.onDone == "string") {
            await this.send(pick.onDone);
          } else {
            const _target = await pick.onDone(this._handler.state, prev, err);
            if (_target) {
              await this.send(_target, target);
            }
          }
        }
      } catch (error) {
        if (pick.onError) {
          if (typeof pick.onError == "string") {
            await this.send(pick.onError, error);
          } else {
            const _target = await pick.onError(this._handler.state, prev, err);
            if (_target) {
              await this.send(_target, prev, error);
            }
          }
        }
        return false;
      }
    }
    return true;
  };
}
