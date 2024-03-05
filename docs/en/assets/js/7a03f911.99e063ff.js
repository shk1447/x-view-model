"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[7100],{8144:(e,n,r)=>{r.r(n),r.d(n,{assets:()=>a,contentTitle:()=>l,default:()=>w,frontMatter:()=>o,metadata:()=>s,toc:()=>d});var t=r(7624),i=r(2172);const o={},l="Getting Started",s={id:"guides/getting_started",title:"Getting Started",description:"ViewModel \uc0ac\uc6a9\ubc95",source:"@site/docs/guides/getting_started.mdx",sourceDirName:"guides",slug:"/guides/getting_started",permalink:"/x-view-model/en/docs/guides/getting_started",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"Installation",permalink:"/x-view-model/en/docs/guides/installation"},next:{title:"API",permalink:"/x-view-model/en/docs/guides/api"}},a={},d=[{value:"ViewModel \uc0ac\uc6a9\ubc95",id:"viewmodel-\uc0ac\uc6a9\ubc95",level:2},{value:"ViewModel \ub4f1\ub85d\ud558\uae30",id:"viewmodel-\ub4f1\ub85d\ud558\uae30",level:3},{value:"ViewModel \uc0ac\uc6a9\ud558\uae30",id:"viewmodel-\uc0ac\uc6a9\ud558\uae30",level:3},{value:"ViewFlow \uc0ac\uc6a9\ubc95",id:"viewflow-\uc0ac\uc6a9\ubc95",level:2},{value:"ViewFlow \ub4f1\ub85d\ud558\uae30",id:"viewflow-\ub4f1\ub85d\ud558\uae30",level:3},{value:"ViewFlow \uc0ac\uc6a9\ud558\uae30",id:"viewflow-\uc0ac\uc6a9\ud558\uae30",level:3}];function c(e){const n={blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",hr:"hr",pre:"pre",...(0,i.M)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.h1,{id:"getting-started",children:"Getting Started"}),"\n",(0,t.jsx)(n.blockquote,{children:"\n"}),"\n",(0,t.jsx)(n.h2,{id:"viewmodel-\uc0ac\uc6a9\ubc95",children:"ViewModel \uc0ac\uc6a9\ubc95"}),"\n",(0,t.jsx)(n.hr,{}),"\n",(0,t.jsx)(n.h3,{id:"viewmodel-\ub4f1\ub85d\ud558\uae30",children:"ViewModel \ub4f1\ub85d\ud558\uae30"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-ts",metastring:'title="/src/viewModel.ts"',children:'import { registViewModel } from "x-view-model";\r\n\r\ntype State = {\r\n  user: {\r\n    name: string;\r\n  };\r\n};\r\n\r\ntype Action = {\r\n  setName: (payload: string) => void;\r\n};\r\n\r\ntype Context = State & Action;\r\n\r\nexport const viewModel = registViewModel<Context>({\r\n  user: {\r\n    name: "",\r\n  },\r\n  setName: (payload) => {\r\n    this.user.name = payload;\r\n  },\r\n});\n'})}),"\n",(0,t.jsx)(n.h3,{id:"viewmodel-\uc0ac\uc6a9\ud558\uae30",children:"ViewModel \uc0ac\uc6a9\ud558\uae30"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-tsx",metastring:'title="/src/view.tsx"',children:'import React from "react";\r\nimport { viewModel } from "./viewModel";\r\n\r\nexport const Form = () => {\r\n  const [state, send] = useViewModel(viewModel, ["user.name"]);\r\n  const handleChange = (e) => send("setName", e.target.value);\r\n  return <input value={state.name} onChange={handleChange} />;\r\n};\n'})}),"\n",(0,t.jsx)(n.h2,{id:"viewflow-\uc0ac\uc6a9\ubc95",children:"ViewFlow \uc0ac\uc6a9\ubc95"}),"\n",(0,t.jsx)(n.h3,{id:"viewflow-\ub4f1\ub85d\ud558\uae30",children:"ViewFlow \ub4f1\ub85d\ud558\uae30"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-ts",metastring:'title="/src/viewFlow.ts"',children:'import { registViewFlow } from "x-view-model";\r\n\r\ntype State = {\r\n  name: string;\r\n};\r\n\r\ntype Action = {\r\n  setName: (payload: string) => void;\r\n};\r\n\r\ntype Context = State & Action;\r\n\r\ntype Flow = {\r\n  login: {\r\n    success: {};\r\n    fail: {};\r\n  };\r\n  main: {};\r\n};\r\n\r\nexport const viewFlow = registViewFlow<Context, Flow>(\r\n  {\r\n    name: "",\r\n    setName: (payload) => {\r\n      this.name = payload;\r\n    },\r\n  },\r\n  {\r\n    login: {\r\n      invoke: async function (context: Context, err: any) {\r\n        if (!context.name) {\r\n          throw new Error("");\r\n        }\r\n\r\n        // api \uc694\uccad \ub85c\uc9c1\r\n      },\r\n      onDone: "#login.success",\r\n      onError: "#login.fail",\r\n    },\r\n\r\n    "login.success": {\r\n      invoke: async function (context: Context, err: any) {\r\n        // \uc131\uacf5 \ud6c4\uc5d0 \ub300\ud55c \ucc98\ub9ac\r\n      },\r\n      onDone: (context) => {\r\n        return "#main";\r\n      },\r\n      onError: undefined,\r\n    },\r\n    "login.fail": {\r\n      invoke: async function (context: Context, err: any) {\r\n        // fail\uc5d0 \ub300\ud55c \ucc98\ub9ac \ub85c\uc9c1\r\n        if (!context.name) alert("no named.");\r\n      },\r\n      onDone: "#login",\r\n      onError: undefined,\r\n    },\r\n    main: {\r\n      invoke: async function (context: Context, err: any) {},\r\n      onDone: undefined,\r\n      onError: undefined,\r\n    },\r\n  }\r\n);\n'})}),"\n",(0,t.jsx)(n.h3,{id:"viewflow-\uc0ac\uc6a9\ud558\uae30",children:"ViewFlow \uc0ac\uc6a9\ud558\uae30"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-tsx",metastring:'title="/src/view.tsx"',children:'import React from "react";\r\nimport { viewFlow } from "./viewFlow";\r\n\r\nexport const Form = () => {\r\n  const [[state, send], [current, flow]] = useViewFlow(viewFlow, ["user.name"]);\r\n  const handleChange = (e) => send("setName", e.target.value);\r\n\r\n  useEffect(() => {\r\n    if (current == "login.success") {\r\n      // \ub85c\uadf8\uc778 \uc131\uacf5\uc2dc\r\n    } else if (current == "login.fail") {\r\n      // \ub85c\uadf8\uc778 \uc2e4\ud328\uc2dc\r\n    } else if (current == "main") {\r\n      // \ub85c\uadf8\uc778 \uc131\uacf5\ud6c4 \uba54\uc778\uc73c\ub85c \uc811\uadfc\uc2dc\r\n    }\r\n  }, [current]);\r\n  return (\r\n    <>\r\n      <input value={state.name} onChange={handleChange} />\r\n      <button onClick={() => flow("#login")}>login</button>\r\n    </>\r\n  );\r\n};\n'})})]})}function w(e={}){const{wrapper:n}={...(0,i.M)(),...e.components};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(c,{...e})}):c(e)}}}]);