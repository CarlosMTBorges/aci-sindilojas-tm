import {notFound} from "next/navigation";
import {ResourceManager} from "../admin-client";
import {resources} from "@/lib/cms";
import {safeQuery} from "@/lib/db";

export const dynamic="force-dynamic";
export default async function ResourcePage({params}:{params:Promise<{section:string}>}){const{section}=await params;const resource=resources[section];if(!resource)notFound();const settingFilter=resource.settingsKey?{column:"key",value:resource.settingsKey}:resource.settingsGroup?{column:"group_name",value:resource.settingsGroup}:null;const filter=settingFilter||resource.filter;const where=filter?` WHERE ${filter.column} = $1`:"";const order=resource.table==="event_registrations"?"created_at":resource.table==="site_settings"?"updated_at":"updated_at";const rawRows=await safeQuery<Record<string,unknown>>(`SELECT * FROM ${resource.table}${where} ORDER BY ${order} DESC LIMIT 200`,filter?[filter.value]:[]).catch(()=>[]);const rows=resource.settingsObject?rawRows.map(row=>({...row,...(row.value&&typeof row.value==="object"&&!Array.isArray(row.value)?row.value:{})})):rawRows;return <ResourceManager section={section} resource={resource} initialRows={rows}/>;}
