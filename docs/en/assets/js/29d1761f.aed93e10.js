"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[2456],{7988:(n,r,e)=>{e.r(r),e.d(r,{assets:()=>i,contentTitle:()=>a,default:()=>d,frontMatter:()=>l,metadata:()=>s,toc:()=>c});var t=e(7624),o=e(2172);const l={},a="\uc2e0\ud638\ub4f1 \ud750\ub984 \uc608\uc2dc",s={id:"examples/signal_light",title:"\uc2e0\ud638\ub4f1 \ud750\ub984 \uc608\uc2dc",description:"\uc2e0\ud638\ub4f1 \ud750\ub984\uc5d0 \ub530\ub77c \uc0ac\ub78c\uc758 \ud589\ub3d9\uc744 \uc0c1\ud0dc\ub85c \uad00\ub9ac\ud558\ub294 \uc608\uc81c",source:"@site/docs/examples/signal_light.mdx",sourceDirName:"examples",slug:"/examples/signal_light",permalink:"/x-view-model/en/docs/examples/signal_light",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"Counter \uc608\uc2dc",permalink:"/x-view-model/en/docs/examples/counter"}},i={},c=[];function v(n){const r={blockquote:"blockquote",code:"code",h1:"h1",p:"p",pre:"pre",...(0,o.M)(),...n.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(r.h1,{id:"\uc2e0\ud638\ub4f1-\ud750\ub984-\uc608\uc2dc",children:"\uc2e0\ud638\ub4f1 \ud750\ub984 \uc608\uc2dc"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsx)(r.p,{children:"\uc2e0\ud638\ub4f1 \ud750\ub984\uc5d0 \ub530\ub77c \uc0ac\ub78c\uc758 \ud589\ub3d9\uc744 \uc0c1\ud0dc\ub85c \uad00\ub9ac\ud558\ub294 \uc608\uc81c"}),"\n"]}),"\n",(0,t.jsx)(r.pre,{children:(0,t.jsx)(r.code,{className:"language-tsx",metastring:"live noInline",live:!0,children:'const { useViewFlow, registViewFlow } = xvm;\r\n\r\ntype State = {\r\n  flow?: string;\r\n  // \ube68\uac04 \uc2e0\ud638\uac00 \uc720\uc9c0\ud558\ub294 \uc2dc\uac04 ms\r\n  redInterval: number;\r\n  // \ucd08\ub85d \uc2e0\ud638\uac00 \uc720\uc9c0\ud558\ub294 \uc2dc\uac04 ms\r\n  greenInterval: number;\r\n  // \ub178\ub780 \uc2e0\ud638\uac00 \uc720\uc9c0\ud558\ub294 \uc2dc\uac04 ms\r\n  yellowInterval: number;\r\n  // \uc0ac\ub78c\uc758 \ud589\ub3d9\r\n  personBehavior: "walk" | "stop" | "run" | "ready";\r\n};\r\n\r\ntype Action = {\r\n  // \uc2e0\ud638\uc758 \uc2dc\uac04\uc744 \ubcc0\uacbd\ud558\ub294 \uc561\uc158\r\n  setIntervalForSignals: (payload: {\r\n    redInterval: number;\r\n    greenInterval: number;\r\n    yellowInterval: number;\r\n  }) => void;\r\n  // \uc0ac\ub78c\uc758 \ud589\ub3d9\uc744 \ubcc0\uacbd\ud558\ub294 \uc561\uc158\r\n  setPersonBehavior: (payload: State["personBehavior"]) => void;\r\n};\r\n\r\ntype Context = State & Action;\r\n\r\ntype Flow = {\r\n  red: {};\r\n  yellow: {};\r\n  green: {};\r\n  break: {};\r\n};\r\n\r\nconst viewFlow = registViewFlow<Context, Flow>(\r\n  {\r\n    personBehavior: "stop",\r\n    redInterval: 5000,\r\n    greenInterval: 5000,\r\n    yellowInterval: 2000,\r\n    setIntervalForSignals(payload) {\r\n      this.redInterval = payload.redInterval;\r\n      this.greenInterval = payload.greenInterval;\r\n      this.yellowInterval = payload.yellowInterval;\r\n    },\r\n    setPersonBehavior(payload) {\r\n      this.personBehavior = payload;\r\n    },\r\n  },\r\n  {\r\n    red: {\r\n      invoke: async function (context: Context, prev, err: any) {\r\n        context.flow = "red";\r\n        context.setPersonBehavior("stop");\r\n        return new Promise((resolve) => {\r\n          setTimeout(() => {\r\n            resolve();\r\n          }, context.redInterval);\r\n        });\r\n      },\r\n      onDone(context) {\r\n        return "#yellow";\r\n      },\r\n      onError: "#break",\r\n    },\r\n\r\n    yellow: {\r\n      invoke: async function (context: Context, prev, err: any) {\r\n        context.flow = "yellow";\r\n        if (prev == "#red") context.setPersonBehavior("ready");\r\n        else context.setPersonBehavior("run");\r\n        return new Promise((resolve) => {\r\n          setTimeout(() => {\r\n            resolve();\r\n          }, context.yellowInterval);\r\n        });\r\n      },\r\n      onDone(context, prev) {\r\n        return prev == "#red" ? "#green" : "#red";\r\n      },\r\n      onError: "#break",\r\n    },\r\n    green: {\r\n      invoke: async function (context: Context, prev, err: any) {\r\n        context.flow = "green";\r\n        context.setPersonBehavior("walk");\r\n        return new Promise((resolve) => {\r\n          setTimeout(() => {\r\n            resolve();\r\n          }, context.greenInterval);\r\n        });\r\n      },\r\n      onDone(context) {\r\n        return "#yellow";\r\n      },\r\n      onError: "#break",\r\n    },\r\n    break: {\r\n      invoke: async function (context: Context, err: any) {\r\n        // fail\uc5d0 \ub300\ud55c \ucc98\ub9ac \ub85c\uc9c1\r\n        alert("\uc2e0\ud638\ub4f1\uc774 \uace0\uc7a5\ub0ac\uc2b5\ub2c8\ub2e4!!!");\r\n      },\r\n    },\r\n  },\r\n  { deep: true, name: "SignalLightViewFlow" }\r\n);\r\n\r\nconst Form = () => {\r\n  const [state, send, flow] = useViewFlow(viewFlow, ["personBehavior", "flow"]);\r\n\r\n  return (\r\n    <>\r\n      <p>signal : {state.flow}</p>\r\n      <p>person : {state.personBehavior}</p>\r\n\r\n      <button onClick={() => flow("#red")}>\uc2e0\ud638\ub4f1 \uc2dc\uc791</button>\r\n    </>\r\n  );\r\n};\r\n\r\nrender(\r\n  <>\r\n    <Form />\r\n  </>\r\n);\n'})})]})}function d(n={}){const{wrapper:r}={...(0,o.M)(),...n.components};return r?(0,t.jsx)(r,{...n,children:(0,t.jsx)(v,{...n})}):v(n)}}}]);