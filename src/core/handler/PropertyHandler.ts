import { Change, ObjectObserver, Observable } from "../observer";
import { GetDotKeys } from "../types";
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
    this._observable = Observable.from({ ...this._property }, {async:true});
    this._started = false;
    this.services = new ServiceHandler<R>(this);
    this.namespaces = NameSpacesHandler.getInstance();
  }

  get state() {
    return this._observable;
  }

  get property() {
    return this._property;
  }

  set property(val: R) {
    this._property = val;
  }

  get reference() {
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

  public reset() {
    Observable.unobserve(this._observable);
    this._observable = Observable.from({ ...this._property });
    Observable.observe(this._observable, this.watch);
  }
}
