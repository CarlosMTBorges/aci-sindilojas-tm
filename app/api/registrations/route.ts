import {NextResponse} from "next/server";
import {z} from "zod";
import {database} from "@/lib/db";
import {notifyMarketing} from "@/lib/email";

const schema=z.object({event_id:z.string().uuid(),name:z.string().min(2),email:z.string().email(),phone:z.string().min(8),company:z.string().optional()});
function esc(value:string|undefined){return(value||"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[char]!))}
export async function POST(request:Request){const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Revise os dados da inscrição."},{status:400});const data=parsed.data;const eventRows=await database().query("SELECT title,registration_enabled,status FROM events WHERE id=$1",[data.event_id]);const event=eventRows[0] as {title:string;registration_enabled:boolean;status:string}|undefined;if(!event||!event.registration_enabled||event.status!=="published")return NextResponse.json({error:"As inscrições não estão disponíveis."},{status:400});await database().query("INSERT INTO event_registrations (event_id,name,email,phone,company) VALUES ($1,$2,$3,$4,$5)",[data.event_id,data.name,data.email,data.phone,data.company||null]);await notifyMarketing(`Nova inscrição — ${event.title}`,`<h2>${esc(event.title)}</h2><p><strong>Nome:</strong> ${esc(data.name)}</p><p><strong>E-mail:</strong> ${esc(data.email)}</p><p><strong>WhatsApp:</strong> ${esc(data.phone)}</p><p><strong>Empresa:</strong> ${esc(data.company)}</p>`);return NextResponse.json({ok:true})}
