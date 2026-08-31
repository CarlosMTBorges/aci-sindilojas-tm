"use client";

import {FormEvent,useState} from "react";
import type {Field,Resource} from "@/lib/cms";

type Row=Record<string,unknown>;
function display(row:Row){return String(row.title||row.name||row.label||row.company||row.key||row.email||row.id||"");}
function fieldValue(row:Row|null,field:Field){
  const value=row?.[field.name];
  if(field.type==="richtext"&&value&&typeof value==="object"&&Array.isArray((value as {body?:unknown[]}).body))return (value as {body:unknown[]}).body.join("\n\n");
  if(field.type==="json"&&value!==undefined)return JSON.stringify(value,null,2);
  if(field.type==="datetime-local"&&value)return new Date(String(value)).toISOString().slice(0,16);
  return value==null?"":String(value);
}

export function ResourceManager({section,resource,initialRows}:{section:string;resource:Resource;initialRows:Row[]}){
  const[rows,setRows]=useState(initialRows);const[open,setOpen]=useState(false);const[editing,setEditing]=useState<Row|null>(null);const[busy,setBusy]=useState(false);const[message,setMessage]=useState("");
  const primaryKey=resource.primaryKey||"id";
  function openNew(){setEditing(null);setMessage("");setOpen(true)}
  function openEdit(row:Row){setEditing(row);setMessage("");setOpen(true);window.scrollTo({top:0,behavior:"smooth"})}
  function close(){setOpen(false);setEditing(null);setMessage("")}
  async function save(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setBusy(true);setMessage("");const form=new FormData(event.currentTarget);const payload:Row={};
    if(editing)payload[primaryKey]=editing[primaryKey];
    for(const field of resource.fields){const raw=form.get(field.name);if(field.type==="file"){if(raw instanceof File&&raw.size){const upload=new FormData();upload.set("file",raw);const uploaded=await fetch("/api/upload",{method:"POST",body:upload});const result=await uploaded.json();if(!uploaded.ok){setMessage(result.error||"Falha ao enviar arquivo.");setBusy(false);return}payload[field.name]=result.url}else if(!editing)payload[field.name]=null}else if(field.type==="checkbox")payload[field.name]=raw==="on";else if(field.type==="number")payload[field.name]=raw?Number(raw):null;else if(field.type==="richtext")payload[field.name]={body:String(raw||"").split(/\n\s*\n/).map(item=>item.trim()).filter(Boolean)};else if(field.type==="json"){try{payload[field.name]=raw?JSON.parse(String(raw)):{};}catch{setMessage(`O campo ${field.label} precisa ser um JSON válido.`);setBusy(false);return}}else payload[field.name]=raw||null}
    const response=await fetch(`/api/admin/${section}`,{method:editing?"PATCH":"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});const result=await response.json();setBusy(false);
    if(!response.ok){setMessage(result.error||"Não foi possível salvar.");return}
    setRows(editing?rows.map(row=>row[primaryKey]===result[primaryKey]?result:row):[result,...rows]);close();
  }
  async function remove(row:Row){if(!confirm("Remover este item?"))return;const id=row[primaryKey];const response=await fetch(`/api/admin/${section}?id=${encodeURIComponent(String(id))}`,{method:"DELETE"});if(response.ok)setRows(rows.filter(item=>item[primaryKey]!==id));}
  async function toggle(row:Row){const next=row.status==="published"?"draft":"published";const response=await fetch(`/api/admin/${section}`,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({[primaryKey]:row[primaryKey],status:next})});if(response.ok){const result=await response.json();setRows(rows.map(item=>item[primaryKey]===row[primaryKey]?result:item))}}
  return <><header className="admin-heading"><div><span className="eyebrow">Conteúdo</span><h1>{resource.title}</h1><p>{rows.length} {rows.length===1?"registro":"registros"}</p></div>{!resource.readOnly&&resource.allowCreate!==false&&<button className="button button-blue" onClick={open?close:openNew}>{open?"Fechar":"Novo cadastro"}</button>}</header>
  {open&&<form key={editing?String(editing[primaryKey]):"new"} className="admin-form" onSubmit={save}>{editing&&<div className="admin-edit-title wide"><strong>Editando: {display(editing)}</strong><button type="button" onClick={close}>Cancelar edição</button></div>}{resource.fields.map(field=>{const value=fieldValue(editing,field);const wide=field.type==="textarea"||field.type==="richtext"||field.type==="json";return <label key={field.name} className={wide?"wide":""}><span>{field.label}{field.required&&" *"}</span>{field.type==="textarea"||field.type==="richtext"||field.type==="json"?<textarea name={field.name} rows={field.type==="json"||field.type==="richtext"?9:4} required={field.required} defaultValue={value} placeholder={field.type==="json"?'{"texto":"Conteúdo"}':field.type==="richtext"?"Escreva o primeiro parágrafo.\n\nSepare os próximos com uma linha em branco.":undefined}/>:field.type==="select"?<select name={field.name} required={field.required} defaultValue={value}>{field.options?.map(option=><option key={option} value={option}>{option}</option>)}</select>:field.type==="checkbox"?<input name={field.name} type="checkbox" defaultChecked={Boolean(editing?.[field.name])}/>:<input name={field.name} type={field.type||"text"} accept={field.type==="file"?"image/*,.pdf,.doc,.docx":undefined} required={field.required&&!editing} defaultValue={field.type==="file"?undefined:value}/>} {field.type==="file"&&Boolean(editing?.[field.name])&&<small>Arquivo atual mantido se nenhum novo arquivo for selecionado.</small>}{field.help&&<small>{field.help}</small>}</label>})}{message&&<div className="form-message error">{message}</div>}<button className="button button-yellow" disabled={busy}>{busy?"Salvando…":editing?"Salvar alterações":`Salvar ${resource.singular}`}</button></form>}
  <section className="admin-table"><div className="admin-table-head"><span>Item</span><span>Status / tipo</span><span>Atualização</span><span>Ações</span></div>{rows.length===0?<div className="admin-empty">Nenhum registro cadastrado.</div>:rows.map(row=><article key={String(row[primaryKey])}><strong>{display(row)}</strong><span className={`status status-${row.status||"new"}`}>{String(row.status||row.kind||row.form_type||"ativo")}</span><time>{row.updated_at||row.created_at?new Date(String(row.updated_at||row.created_at)).toLocaleDateString("pt-BR"):"—"}</time><div>{!resource.readOnly&&<button onClick={()=>openEdit(row)}>Editar</button>}{!resource.readOnly&&Boolean(row.status)&&<button onClick={()=>toggle(row)}>{row.status==="published"?"Despublicar":"Publicar"}</button>}{resource.deletable!==false&&!resource.readOnly&&<button className="danger" onClick={()=>remove(row)}>Excluir</button>}</div></article>)}</section></>;
}
