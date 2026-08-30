import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {ArrowLeft,CalendarDays} from "lucide-react";
import {Footer,Header} from "@/app/site-components";
import {safeQuery} from "@/lib/db";
import {demoNews} from "@/lib/demo-content";

type NewsItem=typeof demoNews[number];
async function getNews(slug:string){const row=(await safeQuery<NewsItem>("SELECT id,slug,title,excerpt,published_at,cover_image_url,content FROM posts WHERE kind='news' AND status='published' AND slug=$1 LIMIT 1",[slug]).catch(()=>[]))[0];return row||demoNews.find(item=>item.slug===slug)}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const{slug}=await params;const item=await getNews(slug);return item?{title:`${item.title} | ACI Sindilojas`,description:item.excerpt}:{title:"Notícia não encontrada | ACI Sindilojas"}}

export default async function NewsPage({params}:{params:Promise<{slug:string}>}){const{slug}=await params;const item=await getNews(slug);if(!item)notFound();const content=typeof item.content==="string"?JSON.parse(item.content):item.content;const paragraphs=Array.isArray(content?.body)?content.body:[];return <><Header/><main><article className="news-detail"><header><div className="container"><Link href="/noticias" className="news-back"><ArrowLeft size={16}/> Voltar para notícias</Link><span className="eyebrow light">Notícias</span><h1>{item.title}</h1><p>{item.excerpt}</p><time><CalendarDays size={16}/>{new Date(item.published_at).toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"})}</time></div></header><div className="container news-detail-body">{item.cover_image_url&&<img src={item.cover_image_url} alt=""/>}<div className="prose">{paragraphs.map((paragraph:string)=><p key={paragraph}>{paragraph}</p>)}{content?.note&&<aside>{content.note}</aside>}</div></div></article></main><Footer/></>}
