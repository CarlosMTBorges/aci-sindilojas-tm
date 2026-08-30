"use client";

import {FormEvent,useState} from "react";
import {createAuthClient} from "@neondatabase/auth/next";

const authClient=createAuthClient();

export default function SignInPage(){
  const[message,setMessage]=useState("");
  const[busy,setBusy]=useState(false);
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setBusy(true);setMessage("");
    const data=new FormData(event.currentTarget);const email=String(data.get("email"));const password=String(data.get("password"));
    const result=await authClient.signIn.email({email,password});
    setBusy(false);
    if(result.error){setMessage(result.error.message||"Não foi possível entrar.");return}
    window.location.href="/admin";
  }
  return <main className="auth-page"><section className="auth-card"><img src="/brand/logo.png" alt="ACI Sindilojas Três de Maio"/><span className="eyebrow">Área restrita</span><h1>Acessar gerenciamento</h1><p>Entre com o e-mail autorizado para atualizar o conteúdo do site.</p><form onSubmit={submit}><label>E-mail<input type="email" name="email" required/></label><label>Senha<input type="password" name="password" minLength={8} required/></label>{message&&<div className="form-message error">{message}</div>}<button className="button button-blue" disabled={busy}>{busy?"Aguarde…":"Entrar"}</button></form></section></main>;
}
