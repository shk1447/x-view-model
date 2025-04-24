import { PropertyHandler } from "./PropertyHandler";

export type ComponentState = {
  enabled: boolean;
  paths: string[];
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

  public components() {
    return this.state.components;
  }

  // 컴포넌트 등록 - 경로 매개변수 추가
  registerComponent(
    context: PropertyHandler<any>,
    componentName: string,
    componentPaths: string[] = []
  ) {
    if (this.state.components.has(context)) {
      const components = this.state.components.get(context);
      if (components && !components[componentName]) {
        components[componentName] = {
          enabled: false,
          paths: componentPaths,
        };
      }
    } else {
      const compState: Record<string, ComponentState> = {
        [componentName]: {
          enabled: false,
          paths: componentPaths,
        },
      };
      this.state.components.set(context, compState);
    }
  }
}
