"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

type Thread = { id: string; subject: string; status: string; last_message_at: string };
type Message = { id: string; sender_role: string; body: string; created_at: string };

export default function MessagesPage() {
  const supabase = createClient();
  const [threads,setThreads] = useState<Thread[]>([]);
  const [active,setActive] = useState<string>("");
  const [messages,setMessages] = useState<Message[]>([]);
  const [body,setBody] = useState("");
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState("");

  async function loadThreads() {
    const {data,error} = await supabase.from("conversation_threads").select("id,subject,status,last_message_at").order("last_message_at",{ascending:false});
    if(error){setError(error.message);return;}
    setThreads(data||[]);
    if(!active && data?.length) setActive(data[0].id);
  }
  async function loadMessages(id:string) {
    const {data,error} = await supabase.from("conversation_messages").select("id,sender_role,body,created_at").eq("thread_id",id).order("created_at");
    if(error){setError(error.message);return;}
    setMessages(data||[]);
  }
  useEffect(()=>{loadThreads();},[]);
  useEffect(()=>{if(active)loadMessages(active);},[active]);

  async function createThread() {
    setError("");
    const {data:userData} = await supabase.auth.getUser();
    if(!userData.user){setError("Connectez-vous pour contacter l’équipe.");return;}
    const {data,error} = await supabase.from("conversation_threads").insert({user_id:userData.user.id,subject:"Question à l’équipe Visiora",status:"open"}).select("id,subject,status,last_message_at").single();
    if(error){setError(error.message);return;}
    setThreads(prev=>[data,...prev]);setActive(data.id);setMessages([]);
  }
  async function send(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); if(!body.trim()||!active)return;
    setBusy(true);setError("");
    const {data:userData} = await supabase.auth.getUser();
    const {error} = await supabase.from("conversation_messages").insert({thread_id:active,sender_id:userData.user?.id,sender_role:"user",body:body.trim()});
    if(error)setError(error.message);
    else {setBody("");await loadMessages(active);await supabase.from("conversation_threads").update({status:"waiting_admin",last_message_at:new Date().toISOString()}).eq("id",active);}
    setBusy(false);
  }

  return <main className="flow-page"><header className="flow-header"><Link href="/" className="brand"><span className="brand-mark"><svg viewBox="0 0 42 42" fill="none"><path d="M8.5 9.5L19.6 31.8C20.2 33 21.8 33 22.4 31.8L33.5 9.5" stroke="currentColor" strokeWidth="6.2" strokeLinecap="round" strokeLinejoin="round"/></svg></span><span>Visiora<span className="brand-period">.</span></span></Link><Link href="/espace" className="auth-back-link">Mon espace →</Link></header>
  <section className="flow-wrap"><div className="auth-kicker">ASSISTANCE VISIORA</div><h1>Parlons de votre projet.</h1><p className="flow-lead">Posez votre question ou signalez un problème. Votre message arrive directement dans l’espace de l’équipe.</p>
  <div className="chat-layout"><aside className="chat-sidebar"><button className="button button-primary" onClick={createThread}>+ Nouvelle conversation</button>{threads.map(t=><button key={t.id} className={active===t.id?"thread-link active":"thread-link"} onClick={()=>setActive(t.id)}><strong>{t.subject}</strong><small>{t.status==="waiting_admin"?"Réponse attendue":t.status==="closed"?"Clôturée":"Ouverte"}</small></button>)}</aside>
  <section className="chat-panel"><div className="chat-top"><strong>{threads.find(t=>t.id===active)?.subject||"Nouvelle conversation"}</strong><span>Équipe Visiora</span></div><div className="chat-messages">{messages.length===0?<p className="chat-empty">Votre conversation commence ici. Écrivez-nous, nous vous répondrons dès que possible.</p>:messages.map(m=><div key={m.id} className={m.sender_role==="user"?"chat-bubble mine":"chat-bubble"}><span>{m.sender_role==="user"?"Vous":m.sender_role==="assistant"?"Assistant Visiora":"Équipe Visiora"}</span><p>{m.body}</p><small>{new Date(m.created_at).toLocaleString("fr-FR")}</small></div>)}</div>
  <form className="chat-compose" onSubmit={send}><textarea rows={2} value={body} onChange={e=>setBody(e.target.value)} placeholder="Écrivez votre message…" maxLength={5000}/><button className="button button-primary" disabled={busy||!active||!body.trim()}>{busy?"Envoi…":"Envoyer ↗"}</button></form></section></div>{error&&<p className="auth-error">{error}</p>}</section></main>;
}
