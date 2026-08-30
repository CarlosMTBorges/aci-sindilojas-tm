import {safeQuery} from "@/lib/db";
import {UserManager} from "./user-manager";
export const dynamic="force-dynamic";
export default async function UsersPage(){const users=await safeQuery<{id:string;name:string;email:string;role:string;active:boolean;created_at:string}>("SELECT id,name,email,role,active,created_at FROM admin_profiles ORDER BY created_at DESC").catch(()=>[]);return <UserManager initialUsers={users}/>}
