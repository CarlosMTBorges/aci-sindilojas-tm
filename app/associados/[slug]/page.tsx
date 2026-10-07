import Link from "next/link";
import {notFound} from "next/navigation";
import {Footer,Header} from "../../site-components";
import {safeQuery} from "@/lib/db";
import {ensureDirectorySchema} from "@/lib/cms-schema";

export const dynamic="force-dynamic";

type Associate={id:string;slug:string;name:string;segment:string|null;address:string|null;logo_url:string|null;contact_name:string|null;email:string|null;phone:string|null;whatsapp:string|null;website_url:string|null;presentation:string|null};

export default async function AssociatePage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  await ensureDirectorySchema();
  const associate=(await safeQuery<Associate>("SELECT id,slug,name,segment,address,logo_url,contact_name,email,phone,whatsapp,website_url,presentation FROM organizations WHERE kind='associate' AND status='published' AND slug=$1 LIMIT 1",[slug]).catch(()=>[]))[0];
  if(!associate)notFound();
  const phone=String(associate.phone||"").replace(/\D/g,"");
  const whatsapp=String(associate.whatsapp||"").replace(/\D/g,"");
  return <><Header/><main><section className="associate-detail"><div className="container">
    <Link className="associate-back" href="/associados">Todos os associados</Link>
    <div className="associate-profile">
      <div className="associate-profile-main">{associate.logo_url&&<img className="associate-logo" src={associate.logo_url} alt={`Logo ${associate.name}`}/>}<span className="eyebrow">{associate.segment||"Associado"}</span><h1>{associate.name}</h1>{associate.presentation&&<p className="associate-presentation">{associate.presentation}</p>}</div>
      <aside className="associate-contact"><h2>Informações</h2>{associate.address&&<div><strong>Endereço</strong><p>{associate.address}</p><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(associate.address)}`} target="_blank" rel="noreferrer">Ver localização</a></div>}{associate.contact_name&&<div><strong>Pessoa de contato</strong><p>{associate.contact_name}</p></div>}{associate.phone&&<div><strong>Telefone</strong><a href={`tel:${phone}`}>{associate.phone}</a></div>}{associate.whatsapp&&<div><strong>WhatsApp</strong><a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">{associate.whatsapp}</a></div>}{associate.email&&<div><strong>E-mail</strong><a href={`mailto:${associate.email}`}>{associate.email}</a></div>}{associate.website_url&&<div><strong>Site</strong><a href={associate.website_url} target="_blank" rel="noreferrer">{associate.website_url.replace(/^https?:\/\//,"")}</a></div>}</aside>
    </div>
  </div></section></main><Footer/></>;
}
