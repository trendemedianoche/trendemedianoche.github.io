import{s as t}from"./index-AjKe7Bp1.js";async function i(){const{data:r,error:e}=await t.from("donation_methods").select(`
      id,
      type,
      donation_transfer_data (
        id,
        field_key,
        field_value,
        position,
        active,
        visible
      )
    `).eq("type","transfer").eq("active",!0).order("position",{foreignTable:"donation_transfer_data"}).single();return e||!r?(console.error("Error loading transfer data:",e),[]):r.donation_transfer_data.filter(o=>o.active)}async function s(){const{data:r,error:e}=await t.from("donation_methods").select(`
      id,
      donation_transfer_data (
        id,
        field_key,
        field_value,
        position,
        active,
        visible
      )
    `).eq("type","transfer").eq("active",!0).limit(1);return e||!r?.length?(console.error("Admin load error:",e),{methodId:null,fields:[]}):{methodId:r[0].id,fields:r[0].donation_transfer_data.sort((o,a)=>o.position-a.position)}}async function d(r,e){return t.from("donation_transfer_data").update(e).eq("id",r)}async function l(r){return t.from("donation_transfer_data").delete().eq("id",r)}async function c(r){for(let e=0;e<r.length;e++){const o=r[e];await t.from("donation_transfer_data").update({position:e+1}).eq("id",o.id)}}async function f(){const{data:r,error:e}=await t.from("social_networks").select("*").order("position");return e?(console.error("Error loading social networks admin:",e),[]):r||[]}async function u(r,e){return t.from("social_networks").update(e).eq("id",r)}async function p(r,e){return t.from("social_networks").update({active:e}).eq("id",r)}async function _(r){for(let e=0;e<r.length;e++)await t.from("social_networks").update({position:e+1}).eq("id",r[e].id)}async function m(){const{data:r,error:e}=await t.from("social_networks").select("*").eq("active",!0).in("type",["email","phone"]).order("position");if(e)return console.error("Error loading footer contact data:",e),{email:null,phone:null};const o={email:null,phone:null};return r?.forEach(a=>{a.type==="email"&&(o.email=a.url),a.type==="phone"&&(o.phone=a.url)}),o}async function y(){const{data:r,error:e}=await t.from("social_networks").select("*").eq("active",!0).eq("type","social").order("position");return e?(console.error("Error loading footer social networks:",e),[]):r||[]}export{y as a,i as b,s as c,l as d,f as e,u as f,m as g,_ as h,c as r,p as t,d as u};
