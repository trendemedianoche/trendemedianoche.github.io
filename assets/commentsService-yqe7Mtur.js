import{s as t}from"./index-DvY0DCZu.js";async function a(o){const{data:e,error:r}=await t.from("blog_comments").select("*").eq("post_id",o).order("created_at",{ascending:!0});return r?[]:e||[]}async function s(){const{data:o,error:e}=await t.from("blog_comments").select(`
      *,
      blog_posts (
        title
      )
    `).order("created_at",{ascending:!1});return e?[]:o||[]}async function c(){const{data:o,error:e}=await t.from("blog_comments").select(`
      *,
      blog_posts (
        title
      )
    `).eq("approved",!1).order("created_at",{ascending:!1});return e?[]:o||[]}async function i(o){const{data:e,error:r}=await t.from("blog_comments").insert([{post_id:o.post_id,author_name:o.author_name,author_email:o.author_email,content:o.content,approved:!0,created_at:new Date().toISOString()}]).select();if(r)throw r;return e[0]}async function l(o){const{data:e,error:r}=await t.from("blog_comments").update({approved:!0}).eq("id",o).select();if(r)throw r;return e[0]}async function d(o){const{error:e}=await t.from("blog_comments").delete().eq("id",o);if(e)throw e}async function m(o){const{count:e,error:r}=await t.from("blog_comments").select("*",{count:"exact",head:!0}).eq("post_id",o);return r?0:e||0}export{a,s as b,i as c,c as d,l as e,d as f,m as g};
