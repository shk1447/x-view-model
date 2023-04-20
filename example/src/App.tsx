import React, { createElement } from "react";

import { registViewModel, useViewModel } from "x-view-model";

import { PixelUtils } from "./utils/pixel";

type CountType = {
  count: number;
  multiply: number;
  nested: {
    test: string[];
    deepTest: {
      level: number;
    };
  };
  src: string;
  increase: (payload: { amount: number }) => void;
  decrease: (payload: { amount: number }) => void;
};

const appViewModel = registViewModel<CountType>(
  {
    count: 0,
    multiply: 0,
    nested: {
      test: [],
      deepTest: {
        level: 1,
      },
    },
    src: "",
    increase(payload) {
      this.count = this.count + 1 + payload.amount;
    },
    decrease() {
      this.count = this.count - 1;
    },
  },
  { deep: true, name: "AppViewModel" }
);

function App() {
  const [state, send] = useViewModel(appViewModel, ["count", "nested", "src"]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "auto",
      }}
    >
      <div style={{ display: "flex", gap: "4px" }}>
        <button onClick={() => send("increase", { amount: 1 })}>+</button>
        <span>{state.count}</span>
        <button onClick={() => send("decrease", { amount: 1 })}>-</button>
      </div>
      <div style={{ display: "flex", gap: "4px" }}>
        <span>{state.nested.test.length}</span>
        <button onClick={() => state.nested.test.push("1")}>Nested Test</button>
      </div>
      <img
        src={state.src}
        onLoad={async (e) => {
          const img = e.target as any;
          const [width, height] = [img.width, img.height];

          // an intermediate "buffer" 2D context is necessary
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d") as any;
          ctx.drawImage(img, 0, 0, width, height);
          // console.log(width, height);
          // const a = document.getElementById("test");
          // a?.appendChild(canvas);

          const imageData = ctx.getImageData(0, 0, width, height);

          var selector = "f1";
          console.time(selector);
          const pixel = new PixelUtils();
          const svg = pixel.convert(imageData);

          // console.log(Object.values(svg.points).length);
          // console.log(svg.colors.length);
          console.log(svg.renderG());
          console.timeEnd(selector);
        }}
      />
      <div id="test"></div>

      <input
        type="file"
        onChange={(e) => {
          if (e.target.files) {
            const file = e.target.files[0];
            const blobURL = window.URL.createObjectURL(file);
            state.src = blobURL;
            // new Promise((resolve) => {
            //   let img = document.createElement("img");
            //   img.addEventListener("load", () => {

            // });
            // img.src = blobURL;
          }
        }}
      ></input>
    </div>
  );
}

export default App;
