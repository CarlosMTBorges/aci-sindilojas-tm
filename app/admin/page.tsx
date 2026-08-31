import Link from "next/link";
import {CalendarDays,FileText,Home,Image,Inbox,Newspaper,Phone,UserCog,Users} from "lucide-react";

const cards=[
  ["Home e Sobre","Textos institucionais do site","/admin/home",Home],
  ["Banners","Hero responsivo e carrossel","/admin/banners",Image],
  ["Soluções","Serviços oferecidos aos associados","/admin/solucoes",FileText],
  ["Notícias e vídeos","Conteúdo editorial","/admin/noticias",Newspaper],
  ["Cursos e eventos","Calendário e inscrições","/admin/agenda",CalendarDays],
  ["Rede empresarial","Parceiros e associados","/admin/parceiros",Users],
  ["Documentos e vagas","Publicações úteis","/admin/legislacao",FileText],
  ["Caixa de entrada","Formulários e inscrições","/admin/formularios",Inbox],
  ["Contato e WhatsApps","Rodapé, redes sociais e canais","/admin/contato_rodape",Phone],
  ["Usuários","Acessos e permissões do painel","/admin/usuarios",UserCog],
] as const;
export default function AdminDashboard(){return <><header className="admin-heading"><div><span className="eyebrow">Gerenciamento</span><h1>Visão geral</h1><p>Atualize o site, acompanhe solicitações e organize as publicações.</p></div></header><section className="admin-cards">{cards.map(([title,text,href,Icon])=><Link href={href} key={title}><Icon/><div><h2>{title}</h2><p>{text}</p></div><span>→</span></Link>)}</section><section className="admin-tip"><strong>Fluxo recomendado</strong><p>Salve novos conteúdos como rascunho, revise a visualização e publique quando estiver pronto. Todas as alterações ficam preparadas para auditoria.</p></section></>}
