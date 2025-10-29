import{c as a,j as e,m as c}from"./index-CY3YBhta.js";/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const i=[["path",{d:"M18 20a6 6 0 0 0-12 0",key:"1qehca"}],["circle",{cx:"12",cy:"10",r:"4",key:"1h16sb"}],["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]],n=a("circle-user-round",i);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const o=[["path",{d:"M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719",key:"1sd12s"}]],r=a("message-circle",o);function t({onSelect:l}){return e.jsx("main",{className:"feeling-root",children:e.jsxs("div",{className:"feeling-card",children:[e.jsx("h1",{className:"feeling-title",children:"How are you feeling today?"}),e.jsx("p",{className:"feeling-sub",children:"Choose your space to begin."}),e.jsxs("div",{className:"feeling-list",children:[e.jsxs(c.button,{whileHover:{scale:1.02},whileTap:{scale:.98},onClick:()=>l("echo"),onKeyDown:s=>{(s.key==="Enter"||s.key===" ")&&l("echo")},className:"feeling-tile feeling-echo",tabIndex:0,"aria-label":"Choose Echo",children:[e.jsx("span",{className:"feeling-icon",children:e.jsx(r,{className:"feeling-svg"})}),e.jsx("span",{className:"feeling-label",children:"Echo"})]}),e.jsxs(c.button,{whileHover:{scale:1.02},whileTap:{scale:.98},onClick:()=>l("circles"),onKeyDown:s=>{(s.key==="Enter"||s.key===" ")&&l("circles")},className:"feeling-tile feeling-circles",tabIndex:0,"aria-label":"Choose Circles",children:[e.jsx("span",{className:"feeling-icon",children:e.jsx(n,{className:"feeling-svg"})}),e.jsx("span",{className:"feeling-label",children:"Circles"})]})]})]})})}export{t as default};
