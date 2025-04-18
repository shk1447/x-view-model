import { Change } from '../observer';

export interface DevToolsState {
  components: Set<string>;
  history: Array<{ type: string; payload: any }>;
  updates: number;
}

export class DevToolsHandler {
  private state: DevToolsState;

  constructor() {
    this.state = {
      components: new Set(),
      history: [],
      updates: 0
    };
  }

  // 컴포넌트 등록
  registerComponent(componentId: string) {
    this.state.components.add(componentId);
    this.state.history.push({
      type: 'componentRegistered',
      payload: { componentId }
    });
  }

  // 컴포넌트 해제
  unregisterComponent(componentId: string) {
    this.state.components.delete(componentId);
    this.state.history.push({
      type: 'componentUnregistered',
      payload: { componentId }
    });
  }

  // 상태 변경 기록
  recordChange(changes: Change[]) {
    this.state.updates++;
    this.state.history.push({
      type: 'stateChange',
      payload: changes
    });
  }

  // 컴포넌트 목록 가져오기
  getComponents() {
    return Array.from(this.state.components);
  }

  // 히스토리 가져오기
  getHistory() {
    return [...this.state.history];
  }

  // 업데이트 횟수 가져오기
  getUpdates() {
    return this.state.updates;
  }
} 