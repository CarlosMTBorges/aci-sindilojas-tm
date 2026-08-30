import {notFound} from "next/navigation";
import {ResourceManager} from "../admin-client";
import {resources} from "@/lib/cms";
import {safeQuery} from "@/lib/db";

export const dynamic="force-dynamic";
export default async function ResourcePage({params}:{params:Promise<{section:string}>}){const{section}=await params;const resource=resources[section];if(!resource)notFound();const where=resource.filter?` WHERE ${resource.filter.column} = $1`:"";const order=resource.table==="event_registrations"?"created_at":resource.table==="site_settings"?"updated_at":"updated_at";const rows=await safeQuery(`SELECT * FROM ${resource.table}${where} ORDER BY ${order} DESC LIMIT 200`,resource.filter?[resource.filter.value]:[]).catch(()=>[]);return <ResourceManager section={section} resource={resource} initialRows={rows}/>;}
