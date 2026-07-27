import{s as e}from"./index-mfpO8gAU.js";async function s(){const{data:o,error:r}=await e.from("donation_methods").select(`
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
    `).eq("type","transfer").eq("active",!0).order("position",{foreignTable:"donation_transfer_data"}).single();return r||!o?[]:o.donation_transfer_data.filter(t=>t.active)}async function i(){const{data:o,error:r}=await e.from("donation_methods").select(`
      id,
      donation_transfer_data (
        id,
        field_key,
        field_value,
        position,
        active,
        visible
      )
    `).eq("type","transfer").eq("active",!0).limit(1);return r||!o?.length?{methodId:null,fields:[]}:{methodId:o[0].id,fields:o[0].donation_transfer_data.sort((t,a)=>t.position-a.position)}}async function l(o,r){return e.from("donation_transfer_data").update(r).eq("id",o)}async function d(o){return e.from("donation_transfer_data").delete().eq("id",o)}async function c(o){for(let r=0;r<o.length;r++){const t=o[r];await e.from("donation_transfer_data").update({position:r+1}).eq("id",t.id)}}async function f(){const{data:o,error:r}=await e.from("social_networks").select("*").order("position");return r?[]:o||[]}async function u(o,r){return e.from("social_networks").update(r).eq("id",o)}async function g(o,r){return e.from("social_networks").update({active:r}).eq("id",o)}async function p(o){for(let r=0;r<o.length;r++)await e.from("social_networks").update({position:r+1}).eq("id",o[r].id)}async function _(){const{data:o,error:r}=await e.from("social_networks").select("*").eq("active",!0).in("type",["email","phone"]).order("position");if(r)return{email:null,phone:null};const t={email:null,phone:null};return o?.forEach(a=>{a.type==="email"&&(t.email=a.url),a.type==="phone"&&(t.phone=a.url)}),t}async function m(){const{data:o,error:r}=await e.from("social_networks").select("*").eq("active",!0).eq("type","social").order("position");return r?[]:o||[]}async function w(){const{data:o,error:r}=await e.from("blog_posts").select("*").eq("published",!0).order("created_at",{ascending:!1});return r?[]:o||[]}async function h(){const{data:o,error:r}=await e.from("blog_posts").select("*").order("created_at",{ascending:!1});return r?[]:o||[]}async function y(o){const{data:r,error:t}=await e.from("blog_posts").insert([{title:o.title,content:o.content,author:o.author,published:o.published||!1,created_at:new Date().toISOString()}]).select();if(t)throw t;return r[0]}async function b(o,r){const{data:t,error:a}=await e.from("blog_posts").update(r).eq("id",o).select();if(a)throw a;return t[0]}async function q(o){const{error:r}=await e.from("blog_posts").delete().eq("id",o);if(r)throw r}async function k(o,r){const{data:t,error:a}=await e.from("blog_posts").update({published:r}).eq("id",o).select();if(a)throw a;return t[0]}export{w as a,_ as b,m as c,i as d,d as e,f,s as g,u as h,p as i,h as j,b as k,y as l,q as m,k as n,c as r,g as t,l as u};
