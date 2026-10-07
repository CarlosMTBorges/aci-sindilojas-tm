"use client";

import Link from "next/link";
import {useMemo,useState} from "react";

type Associate={id:string;name:string;slug:string;category:string|null;logo_url:string|null;presentation:string|null};

export function OrganizationDirectory({items,categories}:{items:Associate[];categories:string[]}){
  const[query,setQuery]=useState("");
  const[category,setCategory]=useState("");
  const visible=useMemo(()=>items.filter(item=>item.name.toLocaleLowerCase("pt-BR").includes(query.trim().toLocaleLowerCase("pt-BR"))&&(!category||item.category===category)),[items,query,category]);
  return <>
    <div className="associate-filters">
      <label><span className="sr-only">Buscar associado pelo nome</span><input type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Buscar associado pelo nome"/></label>
      <label><span className="sr-only">Filtrar por categoria</span><select value={category} onChange={event=>setCategory(event.target.value)}><option value="">Todas as categorias</option>{categories.map(item=><option key={item} value={item}>{item}</option>)}</select></label>
    </div>
    <p className="associate-count">{visible.length} {visible.length===1?"associado":"associados"}</p>
    {visible.length?<div className="organization-grid">{visible.map(item=><Link className="associate-card" href={`/associados/${item.slug}`} key={item.id}>
      {item.logo_url&&<img src={item.logo_url} alt={`Logo ${item.name}`}/>}
      {item.category&&<span>{item.category}</span>}
      <h2>{item.name}</h2>
      {item.presentation&&<p>{item.presentation}</p>}
      <strong>Ver perfil</strong>
    </Link>)}</div>:<p className="associate-empty">Nenhum associado encontrado. Ajuste a busca ou escolha outra categoria.</p>}
  </>;
}
