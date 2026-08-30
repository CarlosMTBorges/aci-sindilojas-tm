import {auth} from "@/lib/auth";
import {safeQuery} from "@/lib/db";

export async function getAdminUser(){
  const{data}=await auth.getSession();
  const email=data?.user?.email?.toLowerCase();
  const allowed=(process.env.ADMIN_EMAILS||"marketing@acisindilojastm.com.br").toLowerCase().split(",").map(item=>item.trim());
  if(!data?.user||!email)return null;
  if(allowed.includes(email))return data.user;
  const profile=(await safeQuery<{active:boolean}>("SELECT active FROM admin_profiles WHERE email=$1 LIMIT 1",[email]).catch(()=>[]))[0];
  return profile?.active?data.user:null;
}
