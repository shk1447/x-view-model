import React, { useEffect, useMemo, useState } from "react";

import { registViewFlow, useViewFlow } from "x-view-model";

type UserContext = {
  id: string;
  setId: (id: string) => void;
};

type UserFlow = {
  ready: {};
  login: {
    fail: {};
    success: {};
  };
  main: {};
};

const vf = registViewFlow<UserContext, UserFlow>(
  {
    id: "",
    setId: function (id: string): void {
      this.id = id;
    },
  },
  {
    ready: {
      invoke: function (context: UserContext): void {
        console.log("ready!!!");
      },
    },
    login: {
      invoke: function (context: UserContext): void {
        // alert(context.id);
      },
      onDone: "#login.success",
      onError: "#login.fail",
    },
    "login.fail": {
      invoke: function (context: UserContext): void {
        context.id = "";
      },
      onDone: "#ready",
      onError: "#ready",
    },
    "login.success": {
      invoke: function (context: UserContext): void {
        // console.log("login success action!!?");
      },
      onDone: "#main",
      onError: "#main",
    },
    main: {
      invoke: function (context: UserContext): void {
        // console.log("go to main!!!");
      },
    },
  }
);

function App() {
  const [flows, setFlows] = useState<string>("");
  const [[current, flow], [state, send]] = useViewFlow(vf, ["id"]);
  useMemo(() => {
    flow("#ready");
  }, []);

  useEffect(() => {
    if (current) {
      alert(current);
    }
  }, [current]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <div>{flows}</div>
      <input
        value={state.id}
        onChange={(e) => send("setId", e.target.value)}
      ></input>
      <button onClick={() => flow("#login")}>Login</button>
    </div>
  );
}

export default App;
