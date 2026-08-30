import {NextResponse} from "next/server";
import {z} from "zod";
import {database} from "@/lib/db";
import {notifyMarketing} from "@/lib/email";

const schema=z.object({form_type:z.enum(["contact","membership","job_application"]),name:z.string().min(2).max(150),email:z.string().email(),phone:z.string().max(40).optional()}).passthrough();
function escape(value:unknown){return String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[char]!))}
export async function POST(request:Request){const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Revise os campos obrigatórios."},{status:400});const{name,email,phone,form_type,...payload}=parsed.data;await database().query("INSERT INTO form_submissions (form_type,name,email,phone,payload) VALUES ($1,$2,$3,$4,$5)",[form_type,name,email,phone||null,JSON.stringify(payload)]);const details=Object.entries(payload).map(([key,value])=>`<p><strong>${escape(key)}:</strong> ${escape(value)}</p>`).join("");await notifyMarketing(`${form_type==="membership"?"Novo pedido de associação":"Novo contato pelo site"} — ${name}`,`<h2>${escape(name)}</h2><p><strong>E-mail:</strong> ${escape(email)}</p><p><strong>Telefone:</strong> ${escape(phone)}</p>${details}`);return NextResponse.json({ok:true})}
