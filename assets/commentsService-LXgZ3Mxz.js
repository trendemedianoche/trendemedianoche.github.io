import{s as t}from"./index-CEThN-wG.js";async function s(){const{data:o,error:r}=await t.from("blog_posts").select("*").eq("published",!0).order("created_at",{ascending:!1});return r?[]:o||[]}async function c(){const{data:o,error:r}=await t.from("blog_posts").select("*").order("created_at",{ascending:!1});return r?[]:o||[]}async function l(o){const{data:r,error:e}=await t.from("blog_posts").insert([{title:o.title,content:o.content,author:o.author,published:o.published||!1,created_at:new Date().toISOString()}]).select();if(e)throw e;return r[0]}async function d(o,r){const{data:e,error:a}=await t.from("blog_posts").update(r).eq("id",o).select();if(a)throw a;return e[0]}async function i(o){const{error:r}=await t.from("blog_posts").delete().eq("id",o);if(r)throw r}async function g(o,r){const{data:e,error:a}=await t.from("blog_posts").update({published:r}).eq("id",o).select();if(a)throw a;return e[0]}async function m(o){const{data:r,error:e}=await t.from("blog_comments").select("*").eq("post_id",o).order("created_at",{ascending:!0});return e?[]:r||[]}async function u(){const{data:o,error:r}=await t.from("blog_comments").select(`
      *,
      blog_posts (
        title
      )
    `).order("created_at",{ascending:!1});return r?[]:o||[]}async function p(){const{data:o,error:r}=await t.from("blog_comments").select(`
      *,
      blog_posts (
        title
      )
    `).eq("approved",!1).order("created_at",{ascending:!1});return r?[]:o||[]}async function f(o){const{data:r,error:e}=await t.from("blog_comments").insert([{post_id:o.post_id,author_name:o.author_name,author_email:o.author_email,content:o.content,approved:!0,created_at:new Date().toISOString()}]).select();if(e)throw e;return r[0]}async function _(o){const{data:r,error:e}=await t.from("blog_comments").update({approved:!0}).eq("id",o).select();if(e)throw e;return r[0]}async function b(o){const{error:r}=await t.from("blog_comments").delete().eq("id",o);if(r)throw r}async function h(o){const{count:r,error:e}=await t.from("blog_comments").select("*",{count:"exact",head:!0}).eq("post_id",o);return e?0:r||0}export{u as a,p as b,l as c,i as d,_ as e,b as f,c as g,s as h,h as i,f as j,m as k,g as t,d as u};
