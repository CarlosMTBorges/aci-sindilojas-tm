import Link from "next/link";
import {redirect} from "next/navigation";
import {adminNav,resources} from "@/lib/cms";
import {getAdminUser} from "@/lib/admin-auth";

export default async function AdminLayout({children}:{children:React.ReactNode}){
  if(!await getAdminUser())redirect("/auth/sign-in");
  return <div className="admin-shell"><aside className="admin-sidebar"><Link href="/admin" className="admin-logo"><img src="/brand/logo.png" alt="ACI Sindilojas"/></Link><nav>{adminNav.map(item=><Link key={item} href={`/admin/${item}`}>{resources[item].title}</Link>)}<Link href="/admin/usuarios">Usuários do painel</Link></nav><Link href="/" className="admin-site-link">Ver site publicado ↗</Link></aside><main className="admin-main">{children}</main></div>;
}
