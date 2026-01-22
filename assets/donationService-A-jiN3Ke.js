import{s as r}from"./index-CUgLcb1w.js";async function o(){const{data:e,error:t}=await r.from("donation_methods").select(`
      id,
      type,
      donation_transfer_data (
        id,
        field_key,
        field_value,
        position,
        active,
        visible,
        visibleFooter
      )
    `).eq("type","transfer").eq("active",!0).order("position",{foreignTable:"donation_transfer_data"}).single();return t||!e?(console.error("Error loading transfer data:",t),[]):e.donation_transfer_data.filter(a=>a.active)}async function d(){const{data:e,error:t}=await r.from("donation_methods").select(`
      id,
      donation_transfer_data (
        id,
        field_key,
        field_value,
        position,
        active,
        visible,
        visibleFooter
      )
    `).eq("type","transfer").eq("active",!0).limit(1);return t||!e?.length?(console.error("Admin load error:",t),{methodId:null,fields:[]}):{methodId:e[0].id,fields:e[0].donation_transfer_data.sort((a,n)=>a.position-n.position)}}async function s(e,t){return r.from("donation_transfer_data").update(t).eq("id",e)}async function f(e){return r.from("donation_transfer_data").delete().eq("id",e)}async function l(e){for(let t=0;t<e.length;t++){const a=e[t];await r.from("donation_transfer_data").update({position:t+1}).eq("id",a.id)}}export{d as a,f as d,o as g,l as r,s as u};
