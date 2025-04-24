import { Change } from "../observer";
import { PropertyHandler } from "./PropertyHandler";

export type ComponentState = {
  enabled: boolean;
};

export interface DevToolsState {
  components: Map<PropertyHandler<any>, Record<string, ComponentState>>;
}

export class DevToolsHandler {
  private state: DevToolsState;

  constructor() {
    this.state = {
      components: new Map(),
    };
  }

  // 컴포넌트 등록
  registerComponent(context: PropertyHandler<any>, componentName: string) {
    if (this.state.components.has(context)) {
      const components = this.state.components.get(context);
      if (components && !components[componentName]) {
        components[componentName] = {
          enabled: false,
        };
      }
    } else {
      const compState: Record<string, ComponentState> = {
        [componentName]: {
          enabled: false,
        },
      };
      this.state.components.set(context, compState);
    }
  }
}
