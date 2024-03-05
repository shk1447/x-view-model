import React from "react";
import {
  registViewFlow,
  registViewModel,
  useViewFlow,
  useViewModel,
} from "x-view-model";
// Add react-live imports you need here
const ReactLiveScope = {
  React,
  ...React,
  xvm: {
    registViewFlow,
    registViewModel,
    useViewFlow,
    useViewModel,
  },
};
export default ReactLiveScope;
