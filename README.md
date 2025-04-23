# x-view-model

<div align="center">

[![npm version](https://img.shields.io/npm/v/x-view-model.svg?style=flat)](https://www.npmjs.com/package/x-view-model)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/x-view-model)](https://bundlephobia.com/package/x-view-model)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#contributing)

React 애플리케이션을 위한 가벼우면서 타입 안전한 MVVM 상태 관리 솔루션

</div>

## x-view-model을 선택하는 이유

x-view-model은 React 애플리케이션에 간단하면서도 강력한 상태 관리 솔루션을 제공하기 위해 설계되었습니다. MVVM 패턴의 모범 사례를 현대적인 React 기능과 결합합니다:

- 🚀 **높은 성능**: 최소한의 리렌더링과 효율적인 업데이트에 최적화
- 💪 **타입 안전성**: 포괄적인 타입 추론을 통한 완벽한 TypeScript 지원
- 🎯 **MVVM 패턴**: 뷰와 비즈니스 로직 간의 명확한 관심사 분리
- 🔄 **반응형**: 상태 변경 시 자동 업데이트
- 🎨 **계산된 속성**: 자동 업데이트와 함께 상태에서 값을 파생
- 🔍 **깊은 경로 선택**: 중첩된 상태 변경에 효율적으로 구독
- 📦 **경량**: 최소 번들 크기 (~13.5KB 압축, ~5KB gzipped)
- 🛠 **개발자 경험**: 포괄적인 도구와 직관적인 API
- 🔄 **스마트 메모리 관리**: 참조 카운팅을 통한 자동 처리

## 다른 솔루션 대신 x-view-model을 선택하는 이유

### 🏆 우수한 TypeScript 지원

TypeScript 지원을 사후 고려로 추가하는 다른 상태 관리 라이브러리와 달리, x-view-model은 처음부터 TypeScript로 구축되었습니다:

```typescript
// 상태와 메서드에 대한 완전한 타입 추론
const [state, send] = useViewModel(userVM, ["name", "email"]);

// 타입 안전한 경로 선택
const [state] = useMemoizedViewModel(userVM, [
  "profile.avatar",
  "settings.theme",
] as const);

// 타입 안전한 계산된 값
const [state] = useComputedViewModel(
  userVM,
  (state) => ({
    fullName: `${state.firstName} ${state.lastName}`,
  }),
  ["firstName", "lastName"]
);
```

### ⚡️ 뛰어난 성능

x-view-model은 최고의 성능을 위해 설계되었습니다:

- **제로 의존성**: 외부 의존성이 없어 더 빠른 로딩과 작은 번들 크기
- **스마트 업데이트**: 구독된 상태가 변경될 때만 컴포넌트 리렌더링
- **효율적인 경로 선택**: 리렌더링을 최소화하기 위해 특정 상태 경로 구독
- **최적화된 계산**: 계산된 값은 캐시되며 의존성이 변경될 때만 재계산
- **트리 쉐이킹 가능**: 최종 번들에 사용하는 코드만 포함
- **스마트 리소스 관리**: 참조 카운팅을 통한 미사용 뷰 모델의 자동 처리

### 🎯 깔끔한 아키텍처

MVVM 패턴은 관심사의 명확한 분리를 제공합니다:

```typescript
// 뷰 모델 (비즈니스 로직)
const userVM = registViewModel<UserContext>({
  name: "",
  email: "",
  updateProfile(data) {
    if (data.name) this.state.name = data.name;
    if (data.email) this.state.email = data.email;
  },
});

// 뷰 (UI)
function UserProfile() {
  const [state, send] = useViewModel(userVM, ["name", "email"]);
  return (
    <div>
      <p>Name: {state.name}</p>
      <p>Email: {state.email}</p>
      <button onClick={() => send("updateProfile", { name: "John" })}>
        Update
      </button>
    </div>
  );
}
```

### 🔄 원활한 비동기 지원

비동기 작업을 쉽게 처리할 수 있습니다:

```typescript
const [state, send] = useViewModel(userVM, ["loading", "data"]);

// 이벤트 기반 호출
send("fetchData");

// 반환 값이 있는 비동기 호출
const result = await send("fetchData", {}, true);

// 타입 안전한 오류 처리
try {
  const data = await send("fetchData", {}, true);
} catch (error) {
  // 오류 처리
}
```

### 📊 성능 비교

| 기능            | x-view-model | Redux  | MobX     | Zustand  |
| -------------- | ------------ | ------ | -------- | -------- |
| 번들 크기        | ~13.5KB      | ~7KB   | ~16KB    | ~1KB     |
| TypeScript 지원 | ⭐⭐⭐⭐⭐   | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 학습 곡선        | ⭐⭐⭐⭐     | ⭐⭐   | ⭐⭐⭐   | ⭐⭐⭐⭐ |
| 성능            | ⭐⭐⭐⭐⭐   | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 코드 복잡성      | ⭐⭐⭐⭐⭐   | ⭐⭐   | ⭐⭐⭐   | ⭐⭐⭐⭐ |
| 비동기 지원      | ⭐⭐⭐⭐⭐   | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

## 설치

```bash
npm install x-view-model

# 또는 yarn 사용
yarn add x-view-model

# 또는 pnpm 사용
pnpm add x-view-model
```

## 빠른 시작

간단한 카운터 예제로 시작해보세요:

```typescript
import { registViewModel, useViewModel } from "x-view-model";

// 뷰 모델 인터페이스 정의
interface CounterViewModel {
  count: number;
  increment(): void;
  decrement(): void;
}

// 뷰 모델 생성
const counterVM = registViewModel<CounterViewModel>(
  {
    count: 0,
    increment() {
      this.state.count += 1;
    },
    decrement() {
      this.state.count -= 1;
    },
  },
  { name: "counter-view-model", deep: true }
);

// 컴포넌트에서 사용
function Counter() {
  // 두 번째 매개변수 ["count"]는 구독할 상태 속성을 지정합니다
  // 이는 이러한 특정 속성이 변경될 때만 업데이트하여 리렌더링을 최적화합니다
  const { state, increment, decrement } = useViewModel(counterVM, ["count"]);

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}
```

## 핵심 개념

### 뷰 모델

뷰 모델은 애플리케이션의 비즈니스 로직과 상태를 캡슐화합니다. UI와 비즈니스 로직 사이의 깔끔한 분리를 제공합니다:

```typescript
type UserState = {
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  profile: {
    avatar: string;
  };
  settings: {
    theme: "dark" | "light";
  };
};

type UserAction = {
  updateProfile(payload: { name?: string; email?: string }): void;
  fetchUserData(payload: { userId: string }): Promise<{
    id: string;
    name: string;
    email: string;
  }>;
};

export type UserContext = UserState & UserAction;

const userVM = registViewModel<UserContext>(
  {
    name: "",
    email: "",
    firstName: "",
    lastName: "",
    profile: {
      avatar: "",
    },
    settings: {
      theme: "dark",
    },
    updateProfile(data: { name?: string; email?: string }) {
      if (data.name) this.state.name = data.name;
      if (data.email) this.state.email = data.email;
    },
    async fetchUserData(data: { userId: string }) {
      // API 호출 시뮬레이션
      return {
        id: data.userId,
        name: "John Doe",
        email: "john@example.com",
      };
    },
  },
  { name: "user-view-model", deep: true }
);
```

### 훅

#### useViewModel

뷰 모델 상태와 메서드에 접근하기 위한 기본 훅:

```typescript
const [state, send] = useViewModel(userVM, ["name", "email"]);

// send 함수 사용 예시:
// 1. 프로필 업데이트 (void 반환)
send("updateProfile", { name: "John Doe" }); // 이벤트 기반 호출
await send("updateProfile", { name: "John Doe" }, true); // 비동기 호출

// 2. 데이터 가져오기 (반환 값 있음)
const userData = await send("fetchUserData", { userId: "123" }, true); // 사용자 데이터 반환
// userData는 다음과 같습니다: { id: "123", name: "John Doe", email: "john@example.com" }

/* send 함수의 동작은 async 매개변수에 따라 다릅니다:
 * - async가 false인 경우 (기본값): 메서드를 이벤트로 호출하고 void를 반환
 * - async가 true인 경우: 메서드를 호출하고 결과를 반환
 *   - 메서드가 Promise를 반환하면 풀어서 반환
 *   - 메서드가 직접 값을 반환하면 해당 값을 반환
 */
```

#### useMemoizedViewModel

뷰 모델에서 특정 경로를 선택하기 위한 최적화된 훅:

```typescript
const [state, send] = useMemoizedViewModel(userVM, [
  "name",
  "profile.avatar",
  "settings.theme",
] as const);

/* useMemoizedViewModel은 지정된 상태 경로만 구독하고 반환합니다.
 * 이 예제에서 state 객체는 다음만 포함합니다:
 * - state.name
 * - state.profile.avatar
 * - state.settings.theme
 * 다른 속성은 state 객체에 포함되지 않습니다.
 */
```

#### useComputedViewModel

뷰 모델 상태에서 계산된 값을 생성:

```typescript
const [state, send] = useComputedViewModel(
  userVM,
  (state) => ({
    fullName: `${state.firstName} ${state.lastName}`,
  }),
  ["firstName", "lastName"]
);

/* useComputedViewModel은 의존성이 변경될 때만 계산된 값을 반환합니다.
 * 이 예제에서 firstName이나 lastName이 변경될 때 state 객체는 다음만 포함합니다:
 * - state.fullName
 * 계산된 값 fullName은 firstName이나 lastName이 변경될 때마다 자동으로 업데이트됩니다.
 */
```

### 히스토리 기능

x-view-model은 `send` 메소드를 통한 모든 메소드 호출에 대한 히스토리를 기록하고 관리하는 기능을 제공합니다. 이를 통해 모든 상태 변경 메소드의 호출을 추적하고 모니터링할 수 있습니다:

```typescript
// 히스토리 핸들러 정의
const counterVM = registViewModel<CounterContext>(
  {
    count: 0,
    increment() {
      this.count += 1;
      return this.count;
    },
    decrement() {
      this.count -= 1;
      return this.count;
    }
  },
  {
    name: "counter",
    deep: true,
    history: {
      handler: (history, state) => {
        // send 메소드를 통한 호출 기록 처리
        console.log('Method called via send:', {
          name: history.name,      // 호출된 메소드 이름
          payload: history.payload, // send 메소드에 전달된 인자
          result: history.result,   // 메소드의 반환값
          error: history.error,     // 에러 발생 시
          timestamp: history.timestamp // 호출 시간
        });
      },
      maxSize: 100 // 최대 히스토리 저장 개수 (선택적)
    }
  }
);

// 사용 예시
const [state, send] = useViewModel(counterVM, ["count"]);

// 이 send 호출들이 히스토리에 기록됩니다
await send("increment", undefined, true);  // history에 기록
await send("decrement", undefined, true);  // history에 기록
```

#### 히스토리 기능의 주요 특징

1. **send 메소드 호출 추적**
   - `send` 메소드를 통한 모든 메소드 호출 기록
   - 호출된 메소드 이름, 전달된 인자, 결과값, 시간 기록
   - 에러 발생 시 에러 정보도 기록

2. **커스텀 핸들러**
   - 히스토리 이벤트를 자유롭게 처리할 수 있는 핸들러 제공
   - 외부 로깅 시스템 연동 가능
   - 상태 변화 추적 가능

3. **히스토리 크기 관리**
   - `maxSize` 옵션으로 히스토리 저장 개수 제한
   - 메모리 사용량 최적화

4. **히스토리 조회 및 관리**
   ```typescript
   // 히스토리 조회
   const history = counterVM.context.getSendHistory();
   
   // 히스토리 초기화
   counterVM.context.clearSendHistory();
   ```

#### 활용 예시

```typescript
// 디버깅을 위한 히스토리 로깅
const vm = registViewModel<UserContext>(
  {
    // ... state and methods
  },
  {
    name: "user",
    deep: true,
    history: {
      handler: (history, state) => {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[${new Date(history.timestamp).toISOString()}]`, {
            method: history.name,
            payload: history.payload,
            result: history.result
          });
        }
      }
    }
  }
);

// 외부 모니터링 서비스 연동
const vm = registViewModel<PaymentContext>(
  {
    // ... state and methods
  },
  {
    name: "payment",
    deep: true,
    history: {
      handler: async (history, state) => {
        if (history.error) {
          await sendToErrorTracking({
            method: history.name,
            error: history.error,
            state: state
          });
        }
      },
      maxSize: 50
    }
  }
);
```

이 기능은 다음과 같은 상황에서 특히 유용합니다:
- 디버깅 및 문제 해결
- 사용자 행동 분석
- 에러 추적 및 모니터링
- 상태 변화 감사(audit) 로깅
- 실행 취소/다시 실행 기능 구현

## 미들웨어

x-view-model은 상태 변경을 가로채고 처리할 수 있는 미들웨어 시스템을 제공합니다. 미들웨어는 상태 변경 전후에 특정 작업을 수행하거나, 변경을 검증하거나, 로깅 등을 할 수 있습니다.

### 미들웨어 정의

미들웨어는 다음과 같은 형태로 정의됩니다:

```typescript
type Middleware<T> = (changes: Change[], next: () => void) => void;
```

- `changes`: 상태 변경 정보를 담은 배열
- `next`: 다음 미들웨어를 호출하는 함수

### 미들웨어 사용 예시

```typescript
import { registViewModel } from 'x-view-model';
import { Change } from 'x-view-model/core/observer';

// 로깅 미들웨어
const loggingMiddleware = (changes: Change[], next: () => void) => {
  console.log('State changes:', changes);
  next();
};

// 검증 미들웨어
const validationMiddleware = (changes: Change[], next: () => void) => {
  const invalidChanges = changes.filter(change => {
    // 특정 조건에 맞지 않는 변경을 필터링
    return !isValid(change);
  });
  
  if (invalidChanges.length > 0) {
    throw new Error('Invalid state changes detected');
  }
  
  next();
};

// ViewModel 정의
const counterVM = registViewModel({
  count: 0,
  increment() {
    this.count += 1;
  }
}, {
  name: 'counter',
  deep: true,
  middlewares: [loggingMiddleware, validationMiddleware]
});
```

### 미들웨어 실행 순서

미들웨어는 등록된 순서대로 실행됩니다. 각 미들웨어는 `next()`를 호출하여 다음 미들웨어로 제어를 넘길 수 있습니다.

```typescript
const middleware1 = (changes: Change[], next: () => void) => {
  console.log('Middleware 1: before');
  next();
  console.log('Middleware 1: after');
};

const middleware2 = (changes: Change[], next: () => void) => {
  console.log('Middleware 2: before');
  next();
  console.log('Middleware 2: after');
};

// 실행 순서:
// 1. Middleware 1: before
// 2. Middleware 2: before
// 3. Middleware 2: after
// 4. Middleware 1: after
```

### 미들웨어 사용 사례

1. **로깅 및 디버깅**
   - 상태 변경 추적
   - 성능 모니터링
   - 디버그 정보 수집

2. **검증 및 보안**
   - 상태 변경 유효성 검사
   - 접근 제어
   - 데이터 무결성 검증

3. **상태 동기화**
   - 다른 시스템과의 상태 동기화
   - 백엔드 API 호출
   - 로컬 스토리지 저장

4. **성능 최적화**
   - 변경 배치 처리
   - 불필요한 업데이트 필터링
   - 캐싱 및 메모이제이션

## 고급 사용법

### 간단한 폼 예제

기본적인 상태 관리를 보여주는 간단한 폼 예제입니다:

```typescript
type FormState = {
  username: string;
  email: string;
  isValid: boolean;
};

type FormAction = {
  updateField(payload: { field: keyof FormState; value: string }): void;
  validateForm(): boolean;
};

type FormContext = FormState & FormAction;

const formVM = registViewModel<FormContext>({
  username: "",
  email: "",
  isValid: false,
  updateField({ field, value }) {
    this.state[field] = value;
    this.state.isValid = this.validateForm();
  },
  validateForm() {
    return this.state.username.length > 0 && this.state.email.includes("@");
  },
});

function FormComponent() {
  const [state, send] = useViewModel(formVM, ["username", "email", "isValid"]);

  return (
    <form>
      <input
        value={state.username}
        onChange={(e) =>
          send("updateField", { field: "username", value: e.target.value })
        }
        placeholder="Username"
      />
      <input
        value={state.email}
        onChange={(e) =>
          send("updateField", { field: "email", value: e.target.value })
        }
        placeholder="Email"
      />
      <button disabled={!state.isValid}>Submit</button>
    </form>
  );
}
```

### 캔버스와 함께하는 컨트롤러 패턴

이 예제는 Canvas와 같은 복잡한 DOM 조작을 처리하기 위해 컨트롤러 패턴과 함께 x-view-model을 사용하는 방법을 보여줍니다:

```typescript
// types/canvas.ts
export interface CanvasState {
  width: number;
  height: number;
  color: string;
  lineWidth: number;
  isDrawing: boolean;
  points: Array<{ x: number; y: number }>;
}

// controllers/CanvasController.ts
export class CanvasController {
  private ctx: CanvasRenderingContext2D | null = null;

  constructor(private state: CanvasState) {}

  setCanvas(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d");
    if (this.ctx) {
      this.ctx.lineWidth = this.state.lineWidth;
      this.ctx.strokeStyle = this.state.color;
      this.ctx.lineCap = "round";
    }
  }

  startDrawing(x: number, y: number) {
    if (!this.ctx) return;

    this.state.isDrawing = true;
    this.state.points = [{ x, y }];

    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
  }

  draw(x: number, y: number) {
    if (!this.ctx || !this.state.isDrawing) return;

    this.state.points.push({ x, y });

    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  }

  stopDrawing() {
    if (!this.ctx) return;

    this.state.isDrawing = false;
    this.ctx.closePath();
  }

  clearCanvas() {
    if (!this.ctx) return;

    this.ctx.clearRect(0, 0, this.state.width, this.state.height);
    this.state.points = [];
  }

  setColor(color: string) {
    this.state.color = color;
    if (this.ctx) {
      this.ctx.strokeStyle = color;
    }
  }

  setLineWidth(width: number) {
    this.state.lineWidth = width;
    if (this.ctx) {
      this.ctx.lineWidth = width;
    }
  }
}

// viewModels/canvasViewModel.ts
import { registViewModel } from "x-view-model";
import { CanvasController } from "../controllers/CanvasController";
import { CanvasState } from "../types/canvas";

const initialState: CanvasState = {
  width: 800,
  height: 600,
  color: "#000000",
  lineWidth: 2,
  isDrawing: false,
  points: [],
};

const controller = new CanvasController(initialState);

export const canvasViewModel = registViewModel<CanvasState, CanvasController>(
  initialState,
  {
    name: "canvas-view-model",
    deep: true,
  },
  controller
);

// components/CanvasComponent.tsx
import React, { useRef, useEffect } from "react";
import { useViewModel } from "x-view-model";
import { canvasViewModel } from "../viewModels/canvasViewModel";

const CanvasComponent: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, send, controller] = useViewModel(canvasViewModel, [
    "color",
    "lineWidth",
    "width",
    "height",
  ]);

  useEffect(() => {
    if (canvasRef.current) {
      controller.setCanvas(canvasRef.current);
    }
  }, [controller]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    controller.startDrawing(x, y);
  };

  return (
    <div>
      <div className="controls">
        <input
          type="color"
          value={state.color}
          onChange={(e) => controller.setColor(e.target.value)}
        />
        <input
          type="range"
          min="1"
          max="20"
          value={state.lineWidth}
          onChange={(e) => controller.setLineWidth(Number(e.target.value))}
        />
        <button onClick={() => controller.clearCanvas()}>Clear</button>
      </div>
      <canvas
        ref={canvasRef}
        width={state.width}
        height={state.height}
        onMouseDown={handleMouseDown}
        onMouseMove={(e) => {
          const rect = canvasRef.current?.getBoundingClientRect();
          if (!rect) return;
          controller.draw(e.clientX - rect.left, e.clientY - rect.top);
        }}
        onMouseUp={() => controller.stopDrawing()}
        onMouseLeave={() => controller.stopDrawing()}
        style={{ border: "1px solid #000" }}
      />
    </div>
  );
};
```

## 성능

x-view-model은 성능에 최적화되어 있습니다:

- **효율적인 업데이트**: 구독된 상태가 변경될 때만 컴포넌트 리렌더링
- **경로 기반 선택**: 리렌더링을 최소화하기 위해 특정 상태 경로 구독
- **메모이제이션된 계산**: 계산된 값은 캐시되며 의존성이 변경될 때만 재계산
- **최소 오버헤드**: 제로 의존성과 작은 번들 크기
- **트리 쉐이킹 가능**: 사용하는 코드만 포함
- **스마트 리소스 관리**: 참조 카운팅을 통한 미사용 뷰 모델의 자동 처리

## 타입 안전성

라이브러리는 우수한 TypeScript 지원을 제공합니다:

- 상태와 메서드에 대한 완전한 타입 추론
- 경로 기반 타입 선택
- 메서드 매개변수 타이핑
- 반환 값 타이핑
- 제네릭 타입 지원

## 기여하기

기여를 환영합니다! Pull Request를 자유롭게 제출해주세요.

## 라이선스

ISC © [seokhwan.kim](https://github.com/shk1447)

## 지원

- [문서](https://shk1447.github.io/x-view-model/docs/introduction/summary)
- [이슈](https://github.com/shk1447/x-view-model/issues)
- [토론](https://github.com/shk1447/x-view-model/discussions)

## 자주 묻는 질문

### 일반적인 질문

#### Q: 뷰 모델과 일반적인 React 상태 관리의 차이점은 무엇인가요?

A: 뷰 모델은 MVVM 패턴을 사용하여 상태와 비즈니스 로직을 관리하는 구조화된 방법을 제공합니다. 일반적인 React 상태와 달리:

- 비즈니스 로직을 UI 컴포넌트와 분리
- 타입 안전한 상태 관리 제공
- 경로 기반 구독을 통한 효율적인 업데이트 지원
- 계산된 속성과 비동기 작업 지원

#### Q: MVVM 패턴을 사용하는 이유는 무엇인가요?

A: MVVM 패턴은 다음과 같은 이점을 제공합니다:

- 뷰와 비즈니스 로직 간의 명확한 관심사 분리
- 비즈니스 로직의 더 나은 테스트 가능성
- 더 유지보수 가능하고 확장 가능한 코드 구조
- 복잡한 애플리케이션에서 더 쉬운 상태 관리

#### Q: Redux나 MobX 대신 x-view-model을 선택하는 이유는 무엇인가요?

A: x-view-model은 다음을 제공합니다:

- 더 간단한 API와 더 적은 보일러플레이트
- 기본적으로 더 나은 TypeScript 지원
- 더 작은 번들 크기
- 더 직관적인 상태 관리
- 최적화된 업데이트를 통한 더 나은 성능

### 성능

#### Q: 프로덕션에서 성능은 어떠한가요?

A: x-view-model은 프로덕션 사용에 최적화되어 있습니다:

- 최소한의 리렌더링으로 효율적인 업데이트
- 작은 번들 크기 (~13.5KB 압축)
- 더 나은 성능을 위한 제로 의존성
- 작은 애플리케이션과 큰 애플리케이션 모두에 최적화

#### Q: 대규모 애플리케이션에서 잘 작동하나요?

A: 네, x-view-model은 확장을 위해 설계되었습니다:

- 효율적인 업데이트를 위한 경로 기반 상태 선택
- 파생 상태를 위한 계산된 속성
- 더 나은 코드 구성을 위한 모듈식 아키텍처
- 더 나은 유지보수성을 위한 타입 안전한 상태 관리

#### Q: 메모리 사용량은 어떠한가요?

A: 메모리 사용량은 다음을 통해 최적화됩니다:

- 효율적인 상태 업데이트
- 스마트 가비지 컬렉션
- 상태 관리에서 최소한의 오버헤드
- 불필요한 리렌더링 없음

### TypeScript

#### Q: TypeScript 없이 사용할 수 있나요?

A: 네, x-view-model은 일반 JavaScript에서도 작동하지만 다음을 놓치게 됩니다:

- 타입 안전성
- 더 나은 IDE 지원
- 더 쉬운 리팩토링
- 타입을 통한 더 나은 문서화

#### Q: 복잡한 타입 정의는 어떻게 처리하나요?

A: 복잡한 타입의 경우:

- 가독성을 위한 타입 별칭 사용
- TypeScript의 유틸리티 타입 활용
- 복잡한 타입을 더 작은 인터페이스로 분해
- 재사용 가능한 컴포넌트에 제네릭 사용

#### Q: 제네릭 타입 사용에 대한 팁이 있나요?

A: 제네릭을 사용할 때:

- 명확한 타입 제약 조건 정의
- 가능할 때 타입 추론 사용
- 제네릭 타입 매개변수 문서화
- 다른 타입 매개변수로 테스트

### 상태 관리

#### Q: 전역 상태와 지역 상태를 어떻게 구분하나요?

A: 모범 사례:

- 공유 데이터에는 전역 상태 사용
- 컴포넌트별 데이터에는 지역 상태 사용
- 다른 관심사에 대해 여러 뷰 모델 사용 고려
- 효율적인 업데이트를 위한 경로 기반 선택 사용

#### Q: 빈번한 상태 업데이트를 어떻게 최적화하나요?

A: 최적화 전략:

- 경로 기반 선택 사용
- 빠른 업데이트에 디바운싱 구현
- 파생 상태에 계산된 속성 사용
- 업데이트 배치 고려

#### Q: 중첩된 상태를 어떻게 효율적으로 관리하나요?

A: 중첩된 상태의 경우:

- 경로 기반 선택 사용
- 적절한 타입 정의 구현
- 파생 값에 계산된 속성 사용
- 깊게 중첩된 상태를 평탄화하는 것 고려

### 비동기 작업

#### Q: 비동기 작업을 처리하는 가장 좋은 방법은 무엇인가요?

A: 권장 접근 방식:

- async 플래그와 함께 `send` 함수 사용
- 적절한 오류 처리 구현
- 더 나은 UX를 위한 로딩 상태 사용
- 더 깔끔한 코드를 위해 async/await 사용 고려

#### Q: 오류는 어떻게 처리하나요?

A: 오류 처리 모범 사례:

- try/catch 블록 사용
- 적절한 오류 경계 구현
- 의미 있는 오류 메시지 제공
- 뷰 모델에서 오류 상태 사용 고려

#### Q: 로딩 상태는 어떻게 관리하나요?

A: 로딩 상태 관리:

- 상태에서 불리언 플래그 사용
- 로딩 표시기 구현
- 로딩 큐 사용 고려
- UI 컴포넌트에서 로딩 상태 처리

### 테스트

#### Q: 뷰 모델을 어떻게 테스트하나요?

A: 테스트 전략:

- 비즈니스 로직 단위 테스트
- 의존성 모킹
- 상태 업데이트 검증
- 계산된 속성 확인
- 비동기 작업 테스트

#### Q: 테스트 환경을 어떻게 설정하나요?

A: 테스트 설정:

- Jest 또는 선호하는 테스트 프레임워크 사용
- React 의존성 모킹
- 적절한 TypeScript 구성 설정
- 테스트 유틸리티 구현

#### Q: 모킹은 어떻게 처리하나요?

A: 모킹 접근 방식:

- 외부 의존성 모킹
- 의존성 주입 사용
- 적절한 테스트 픽스처 구현
- 테스트 팩토리 사용 고려

### 마이그레이션

#### Q: Redux에서 어떻게 마이그레이션하나요?

A: 마이그레이션 단계:

1. Redux 스토어 슬라이스 식별
2. 해당 뷰 모델 생성
3. Redux 사용을 점진적으로 교체
4. 컴포넌트를 뷰 모델 사용으로 업데이트
5. Redux 의존성 제거

#### Q: 기존 코드를 어떻게 리팩토링하나요?

A: 리팩토링 접근 방식:

1. 작고 격리된 컴포넌트로 시작
2. 비즈니스 로직에 대한 뷰 모델 생성
3. 컴포넌트를 뷰 모델 사용으로 업데이트
4. 각 변경 후 철저히 테스트
5. 리팩토링을 점진적으로 확장

#### Q: 점진적 마이그레이션이 가능한가요?

A: 네, x-view-model은 다음을 지원합니다:

- 점진적 채택
- 다른 상태 관리와의 공존
- 단계별 마이그레이션
- 전환 기간 동안 병렬 사용

### 커뮤니티

#### Q: 어디서 도움을 받을 수 있나요?

A: 지원 채널:

- GitHub 이슈
- GitHub 토론
- 문서
- 커뮤니티 포럼

#### Q: 어떻게 기여할 수 있나요?

A: 기여 옵션:

- 버그 보고
- 기능 제안
- 문서 개선
- Pull Request 제출
- 예제 공유

#### Q: 버그를 발견하면 어떻게 해야 하나요?

A: 버그 보고 단계:

1. 기존 이슈 확인
2. 최소 재현 생성
3. 자세한 정보 제공
4. 버그 보고서 제출

---

[seokhwan.kim](https://github.com/shk1447)이 만든 ❤️
