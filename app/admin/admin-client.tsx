"use client";

import {FormEvent,useState} from "react";
import type {Field,Resource} from "@/lib/cms";
import {RichTextEditor} from "./rich-text-editor";
import {legacyBodyToHtml} from "@/lib/richtext";

type Row=Record<string,unknown>;
function display(row:Row){return String(row.title||row.name||row.label||row.company||row.key||row.email||row.id||"");}
function fieldValue(row:Row|null,field:Field){
  const value=row?.[field.name];
  if(field.type==="richtext"&&value&&typeof value==="object")return legacyBodyToHtml(value);
  if(field.type==="json"&&value!==undefined)return JSON.stringify(value,null,2);
  if(field.type==="datetime-local"&&value)return new Date(String(value)).toISOString().slice(0,16);
  return value==null?"":String(value);
}
function makeSlug(value:string){return value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}
async function readResponse(response:Response){const text=await response.text();try{return JSON.parse(text) as Row}catch{return {error:response.status===413?"O arquivo ou conteúdo excede o limite aceito. Reduza o tamanho da imagem e tente novamente.":`O servidor retornou um erro (${response.status}). Tente novamente.`}}}
async function prepareUpload(file:File){
  const uploadLimit=3_800_000;
  if(!file.type.startsWith("image/")){
    if(file.size>uploadLimit)throw new Error("O arquivo deve ter até 3,8 MB. Reduza o tamanho e tente novamente.");
    return file;
  }
  try{
    const image=await createImageBitmap(file);
    try{
      for(const [maxDimension,quality] of [[2000,0.78],[1600,0.66],[1200,0.56]] as const){
        const scale=Math.min(1,maxDimension/Math.max(image.width,image.height));
        const canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));
        const context=canvas.getContext("2d");if(!context)continue;
        context.drawImage(image,0,0,canvas.width,canvas.height);
        const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,"image/webp",quality));
        if(blob&&blob.size<=uploadLimit)return new File([blob],file.name.replace(/\.[^.]+$/,"")+".webp",{type:"image/webp"});
      }
    }finally{image.close()}
    throw new Error("Não foi possível reduzir esta imagem para até 3,8 MB. Escolha uma versão menor.");
  }catch(error){
    if(error instanceof Error&&error.message.includes("3,8 MB"))throw error;
    if(file.size<=uploadLimit)return file;
    throw new Error("Não foi possível processar esta imagem. Escolha uma versão com até 3,8 MB.");
  }
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
    try{
      for(const field of resource.fields){const raw=form.get(field.name);if(field.required&&(raw===null||String(raw).replace(/<[^>]*>/g,"").trim()==="")){setMessage(`Preencha o campo ${field.label}.`);setBusy(false);return}if(field.type==="files"){const files=form.getAll(field.name).filter((item):item is File=>item instanceof File&&item.size>0);if(files.length){const urls:string[]=[];for(const file of files){const upload=new FormData();upload.set("file",await prepareUpload(file));const uploaded=await fetch("/api/upload",{method:"POST",body:upload});const result=await readResponse(uploaded);if(!uploaded.ok){setMessage(String(result.error||"Falha ao enviar uma das imagens."));setBusy(false);return}urls.push(String(result.url))}payload[field.name]=[...(Array.isArray(editing?.[field.name])?editing[field.name] as string[]:[]),...urls]}}else if(field.type==="file"){if(raw instanceof File&&raw.size){const upload=new FormData();upload.set("file",await prepareUpload(raw));const uploaded=await fetch("/api/upload",{method:"POST",body:upload});const result=await readResponse(uploaded);if(!uploaded.ok){setMessage(String(result.error||"Falha ao enviar arquivo."));setBusy(false);return}payload[field.name]=result.url}else if(!editing)payload[field.name]=null}else if(field.type==="checkbox")payload[field.name]=raw==="on";else if(field.type==="number")payload[field.name]=raw?Number(raw):null;else if(field.type==="richtext")payload[field.name]={html:String(raw||"")};else if(field.type==="json"){try{payload[field.name]=raw?JSON.parse(String(raw)):{};}catch{setMessage(`O campo ${field.label} precisa ser um JSON válido.`);setBusy(false);return}}else payload[field.name]=raw||null}
      const response=await fetch(`/api/admin/${section}`,{method:editing?"PATCH":"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});const result=await readResponse(response);
      if(!response.ok){setMessage(String(result.error||"Não foi possível salvar."));setBusy(false);return}
      setRows(editing?rows.map(row=>row[primaryKey]===result[primaryKey]?result:row):[result,...rows]);close();
    }catch(error){setMessage(error instanceof Error?error.message:"Não foi possível concluir o salvamento. Tente novamente.")}finally{setBusy(false)}
  }
  function autoSlug(event:FormEvent<HTMLFormElement>){const target=event.target as HTMLInputElement;if(target.name==="slug"){target.dataset.manual="true";return}if(!["title","name","cargo"].includes(target.name))return;const slugInput=event.currentTarget.elements.namedItem("slug") as HTMLInputElement|null;if(slugInput&&!slugInput.dataset.manual)slugInput.value=makeSlug(target.value)}
  async function remove(row:Row){if(!confirm("Remover este item?"))return;const id=row[primaryKey];const response=await fetch(`/api/admin/${section}?id=${encodeURIComponent(String(id))}`,{method:"DELETE"});if(response.ok)setRows(rows.filter(item=>item[primaryKey]!==id));}
  async function toggle(row:Row){const next=row.status==="published"?"draft":"published";const response=await fetch(`/api/admin/${section}`,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({[primaryKey]:row[primaryKey],status:next})});if(response.ok){const result=await response.json();setRows(rows.map(item=>item[primaryKey]===row[primaryKey]?result:item))}}
  return <><header className="admin-heading"><div><span className="eyebrow">Conteúdo</span><h1>{resource.title}</h1><p>{rows.length} {rows.length===1?"registro":"registros"}</p></div>{!resource.readOnly&&resource.allowCreate!==false&&<button className="button button-blue" onClick={open?close:openNew}>{open?"Fechar":"Novo cadastro"}</button>}</header>
  {open&&<form key={editing?String(editing[primaryKey]):"new"} className="admin-form" onSubmit={save} onChange={autoSlug}>{editing&&<div className="admin-edit-title wide"><strong>Editando: {display(editing)}</strong><button type="button" onClick={close}>Cancelar edição</button></div>}{resource.fields.map(field=>{const value=fieldValue(editing,field);const wide=field.type==="textarea"||field.type==="richtext"||field.type==="json"||field.type==="files";const currentFiles=Array.isArray(editing?.[field.name])?editing[field.name] as unknown[]:[];return <label key={field.name} className={wide?"wide":""}><span>{field.label}{field.required&&" *"}</span>{field.type==="richtext"?<RichTextEditor name={field.name} initialHtml={value}/>:field.type==="textarea"||field.type==="json"?<textarea name={field.name} rows={field.type==="json"?9:4} required={field.required} defaultValue={value} placeholder={field.type==="json"?'{"texto":"Conteúdo"}':undefined}/>:field.type==="select"?<select name={field.name} required={field.required} defaultValue={value}>{field.options?.map(option=><option key={option} value={option}>{option}</option>)}</select>:field.type==="checkbox"?<input name={field.name} type="checkbox" defaultChecked={Boolean(editing?.[field.name])}/>:<input name={field.name} type={field.type==="files"?"file":field.type||"text"} multiple={field.type==="files"} accept={field.accept||(field.type==="files"?"image/*":field.type==="file"?"image/*,.pdf,.doc,.docx":undefined)} required={field.required&&!editing} defaultValue={field.type==="file"||field.type==="files"?undefined:value}/>} {field.name==="slug"&&!editing&&<small>Preenchido automaticamente pelo título; você pode ajustar se precisar.</small>}{field.type==="file"&&Boolean(editing?.[field.name])&&<small>Arquivo atual mantido se nenhum novo arquivo for selecionado.</small>}{field.type==="files"&&currentFiles.length>0&&<small>{currentFiles.length} {currentFiles.length===1?"imagem cadastrada":"imagens cadastradas"}. As novas imagens serão adicionadas à galeria.</small>}{field.help&&<small>{field.help}</small>}</label>})}{message&&<div className="form-message error">{message}</div>}<button className="button button-yellow" disabled={busy}>{busy?"Salvando…":editing?"Salvar alterações":`Salvar ${resource.singular}`}</button></form>}
  <section className="admin-table"><div className="admin-table-head"><span>Item</span><span>Status / tipo</span><span>Atualização</span><span>Ações</span></div>{rows.length===0?<div className="admin-empty">Nenhum registro cadastrado.</div>:rows.map(row=><article key={String(row[primaryKey])}><strong>{display(row)}</strong><span className={`status status-${row.status||"new"}`}>{String(row.status||row.kind||row.form_type||"ativo")}</span><time>{row.updated_at||row.created_at?new Date(String(row.updated_at||row.created_at)).toLocaleDateString("pt-BR"):"—"}</time><div>{!resource.readOnly&&<button onClick={()=>openEdit(row)}>Editar</button>}{!resource.readOnly&&Boolean(row.status)&&<button onClick={()=>toggle(row)}>{row.status==="published"?"Despublicar":"Publicar"}</button>}{resource.deletable!==false&&!resource.readOnly&&<button className="danger" onClick={()=>remove(row)}>Excluir</button>}</div></article>)}</section></>;
}
