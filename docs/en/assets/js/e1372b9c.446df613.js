"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[1576],{5332:(e,t,i)=>{i.r(t),i.d(t,{assets:()=>c,contentTitle:()=>r,default:()=>h,frontMatter:()=>s,metadata:()=>d,toc:()=>a});var n=i(7624),o=i(2172);const s={},r="Comparison With hooks",d={id:"introduction/quick_guide",title:"Comparison With hooks",description:"\ube44\uc988\ub2c8\uc2a4 \ub85c\uc9c1\uacfc \ud654\uba74 \ub80c\ub354\ucf54\ub4dc\uc758 \ubd84\ub9ac",source:"@site/docs/introduction/quick_guide.mdx",sourceDirName:"introduction",slug:"/introduction/quick_guide",permalink:"/x-view-model/en/docs/introduction/quick_guide",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"What is x-view-model?",permalink:"/x-view-model/en/docs/introduction/summary"},next:{title:"Guides",permalink:"/x-view-model/en/docs/category/guides"}},c={},a=[];function l(e){const t={blockquote:"blockquote",code:"code",h1:"h1",p:"p",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,o.M)(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(t.h1,{id:"comparison-with-hooks",children:"Comparison With hooks"}),"\n",(0,n.jsxs)(t.blockquote,{children:["\n",(0,n.jsx)(t.p,{children:"\ube44\uc988\ub2c8\uc2a4 \ub85c\uc9c1\uacfc \ud654\uba74 \ub80c\ub354\ucf54\ub4dc\uc758 \ubd84\ub9ac"}),"\n"]}),"\n",(0,n.jsxs)(t.p,{children:[(0,n.jsx)(t.code,{children:"x-view-model"})," is mainly used to separate UI and business logic, which can solve some of the problems caused by the official react hooks."]}),"\n",(0,n.jsxs)(t.table,{children:[(0,n.jsx)(t.thead,{children:(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.th,{children:"hooks component issues"}),(0,n.jsx)(t.th,{children:"x-view-model"})]})}),(0,n.jsxs)(t.tbody,{children:[(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:"Usually need to set multiple useStates, can't update property values at fine granularity"}),(0,n.jsx)(t.td,{children:"Support update and deconstruct data by object form, support update property values at fine granularity"})]}),(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:"When the component reaches a certain complexity, the code piled up together will become more and more difficult to maintain"}),(0,n.jsx)(t.td,{children:"UI and logic are well separated, code is well organized"})]}),(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:"The closure trap problem of React Hook"}),(0,n.jsx)(t.td,{children:"Since the methods are maintained in the class, there is no such problem"})]}),(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:"there is thinking burden while using useReducer+context to global shared state"}),(0,n.jsx)(t.td,{children:"an intuitive api and simple to use"})]}),(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:"useState updater can't implement immutable data, even memo wrapped subcomponents will be re-rendered"}),(0,n.jsx)(t.td,{children:"can implement immutable data by state keys, won't re-render subcomponents"})]})]})]})]})}function h(e={}){const{wrapper:t}={...(0,o.M)(),...e.components};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(l,{...e})}):l(e)}}}]);