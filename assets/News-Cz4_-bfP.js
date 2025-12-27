import{s as o,r as i,j as e}from"./index-DwFGreWk.js";async function c(){const{data:s}=await o.from("news").select("*").eq("active",!0).order("id",{ascending:!1});return s}async function l(){const{data:s,error:n}=await o.from("donation_methods").select(`
      id,
      type,
      donation_transfer_data (
        id,
        field_key,
        field_value,
        position,
        visible
      )
    `).eq("type","transfer").eq("active",!0).order("position",{foreignTable:"donation_transfer_data"}).single();return n?(console.error("Error loading transfer data:",n),[]):s.donation_transfer_data}function u(){const[s,n]=i.useState([]);i.useEffect(()=>{l().then(n)},[]);const t=()=>{const a=s.map(r=>`${r.field_key}: ${r.field_value}`).join(`
`);navigator.clipboard.writeText(a).then(()=>alert("Datos de transferencia copiados"))},d=s.filter(a=>a.visible);return s.length?e.jsxs("div",{className:"side-card donation-card",children:[e.jsx("h3",{children:"Apoya el proyecto"}),e.jsx("p",{className:"donation-intro",children:"Si quieres apoyar nuestro trabajo y futuras producciones, puedes hacerlo mediante transferencia bancaria:"}),e.jsx("div",{className:"donation-grid",children:d.map(a=>e.jsxs("div",{children:[e.jsx("span",{children:a.field_key}),e.jsx("strong",{children:a.field_value})]},a.id))}),e.jsx("button",{className:"copy-button",onClick:t,children:"📋 Copiar datos"})]}):null}function p(){const[s,n]=i.useState([]);return i.useEffect(()=>{c().then(n)},[]),e.jsxs("section",{id:"news",className:"news-section",children:[e.jsx("h2",{className:"section-title",children:"Noticias & Comunidad"}),e.jsxs("div",{className:"news-layout",children:[e.jsx("div",{className:"news-content",children:s.map(t=>e.jsxs("article",{className:"side-card news-item",children:[e.jsx("h3",{children:t.title}),e.jsx("p",{children:t.content}),e.jsx("span",{className:"news-date",children:t.date})]},t.id))}),e.jsx("aside",{className:"support-aside",children:e.jsx(u,{})})]})]})}export{p as default};
