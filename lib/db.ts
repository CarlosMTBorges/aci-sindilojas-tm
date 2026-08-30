import {neon} from "@neondatabase/serverless";

export function database(){
  const url=process.env.DATABASE_URL;
  if(!url) throw new Error("DATABASE_URL não configurada");
  return neon(url);
}

export async function safeQuery<T=Record<string,unknown>>(query:string,params:unknown[]=[]):Promise<T[]>{
  if(!process.env.DATABASE_URL) return [];
  const result=await database().query(query,params);
  return result as T[];
}
