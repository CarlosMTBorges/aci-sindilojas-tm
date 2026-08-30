import {put} from "@vercel/blob";
import {NextResponse} from "next/server";
import {getAdminUser} from "@/lib/admin-auth";
import {database} from "@/lib/db";

export async function POST(request:Request){const user=await getAdminUser();if(!user)return NextResponse.json({error:"Não autorizado"},{status:401});if(!process.env.BLOB_READ_WRITE_TOKEN)return NextResponse.json({error:"Armazenamento de arquivos ainda não conectado"},{status:503});const form=await request.formData();const file=form.get("file");if(!(file instanceof File))return NextResponse.json({error:"Arquivo obrigatório"},{status:400});if(file.size>10_000_000)return NextResponse.json({error:"O arquivo deve ter até 10 MB"},{status:400});const blob=await put(`aci/${Date.now()}-${file.name}`,file,{access:"public",addRandomSuffix:true});await database().query("INSERT INTO media_assets (file_name,url,mime_type,size_bytes,created_by) VALUES ($1,$2,$3,$4,$5)",[file.name,blob.url,file.type,file.size,user.id]);return NextResponse.json({url:blob.url})}
