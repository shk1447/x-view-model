import { Change, ObjectObserver, Observable } from "../observer";
import {
  GetDotKeys,
  GetFunctionKeys,
  GetFunctionParams,
  GetFunctionReturn,
} from "../types";
import { EventHandler } from "./EventHandler";
import { NameSpacesHandler } from "./NameSpacesHandler";
import { ServiceHandler } from "./ServiceHandler";

export type PropertyHandlerOptions = {
  name: string;
  // 하위 데이터 변경시 이벤트가 발생됩니다.
  deep: boolean;
};

export class PropertyHandler<R> extends EventHandler<GetDotKeys<R>> {
  private _property: R;
  private _observable: R;
  private _reference: number;
  private _started: boolean;
  private _options?: PropertyHandlerOptions;

  public services: ServiceHandler<R>;

  public namespaces: NameSpacesHandler;
  constructor(init_property: R, options?: PropertyHandlerOptions) {
    super();
    this._property = init_property;
    this._options = options;
    this._reference = 0;
    this._observable = Observable.from({ ...this._property }, { async: true });
    this._started = false;
    this.services = new ServiceHandler<R>(this);
    this.namespaces = NameSpacesHandler.getInstance();
  }

  public get state() {
    return this._observable;
  }

  public get property() {
    return this._property;
  }

  public get reference() {
    return this._reference;
  }

  get name() {
    return this._options && this._options.name ? this._options.name : "unnamed";
  }

  private set reference(val: number) {
    this._reference = val;
    if (this._reference > 0) {
      if (this.name) this.namespaces.addNamespace<R>(this.name, this);
      this.start();
    } else {
      if (this.name) this.namespaces.removeNamespace(this.name);
      this.stop();
    }
  }

  private watch = (changes: Change[]) => {
    changes.forEach((change) => {
      const modifiedArray: Record<any, number> = {};

      const paths = change.path.filter((d) => typeof d != "number");

      if (this._options?.deep) {
        let eventName = "";

        paths.forEach((item) => {
          eventName += item + ".";

          this.emit(
            eventName.substring(0, eventName.length - 1) as GetDotKeys<R>,
            [change.object]
          );
        });
      } else {
        const eventName = paths.join(".");

        this.emit(eventName as GetDotKeys<R>, [change.object]);
      }
    });
  };

  public increaseReference() {
    this.reference++;
  }

  public decreaseReference() {
    this.reference--;
  }

  private start() {
    if (this._started) return;
    Observable.observe(this._observable, this.watch);
    console.log(this.name, "started");
    this._started = true;
  }

  private stop() {
    if (!this._started) return;
    Observable.unobserve(this._observable);
    this._observable = Observable.from({ ...this._property });
    this._started = false;
  }

  private pause() {
    if (!this._started) return;
    Observable.unobserve(this._observable);
  }

  public restart() {
    Observable.unobserve(this._observable);
    this._observable = Observable.from({ ...this._property });
    Observable.observe(this._observable, this.watch);
    console.log(this.name, "started");
    this._started = true;
  }

  public snapshot() {
    this.pause();
    const snapshotJson = JSON.stringify(this._observable);
    this.start();
    return snapshotJson;
  }

  public rebase(json: string) {
    const rebaseObj = JSON.parse(json);
    this._property = { ...this._property, ...rebaseObj };
  }

  public restore(json: string) {
    this.pause();
    const restoreObj = JSON.parse(json);
    this._observable = Observable.from({ ...this._property, ...restoreObj });
    this.start();
  }

  public async send<K extends GetFunctionKeys<R>>(
    name: K,
    payload: GetFunctionParams<R>[K],
    options?: {
      sync: boolean;
      callback: (ret: GetFunctionReturn<R>[K]) => void;
    }
  ) {
    if (options && options.sync) {
      try {
        const res = await (this.property[name] as any).apply(this.state, [
          payload,
        ]);
        if (options.callback) {
          options.callback(res);
        }
        return true;
      } catch (error) {
        return false;
      }
    } else {
      this.services.emit(name, [payload]);
      return false;
    }
  }
}
