import {safeQuery} from "./db";

export type SettingRecord={key:string;label:string|null;group_name:string;value:unknown};

function objectValue<T extends Record<string,unknown>>(value:unknown,fallback:T):T{
  if(value&&typeof value==="object"&&!Array.isArray(value))return {...fallback,...value} as T;
  return fallback;
}

export async function getSettingObject<T extends Record<string,unknown>>(key:string,fallback:T):Promise<T>{
  const row=(await safeQuery<SettingRecord>("SELECT key,label,group_name,value FROM site_settings WHERE key=$1 LIMIT 1",[key]).catch(()=>[]))[0];
  return objectValue(row?.value,fallback);
}

export async function getSettingGroup<T extends Record<string,unknown>>(group:string):Promise<Array<T&{key:string;label:string|null}>>{
  const rows=await safeQuery<SettingRecord>("SELECT key,label,group_name,value FROM site_settings WHERE group_name=$1 ORDER BY updated_at",[group]).catch(()=>[]);
  return rows.map(row=>({key:row.key,label:row.label,...objectValue(row.value,{} as T)}));
}
