"use client";

import {useState,type FormEvent} from "react";
import {createClient} from "@/lib/supabase/client";

type Message={id:string;sender_role:string;body:string;created_at:string};

export default function AdminConversation({threadId,initialMessages}:{threadId:string;initialMessages:Message[]}) {
  const supabase=createClient();
  const [messages,setMessages]=useState(initialMessages);
  const [body,setBody]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  async function send(e:FormEvent<HTMLFormElement>){
    e.preventDefault();if(!body.trim())return;
    setBusy(true);setError("");
    const {data}=await supabase.auth.getUser();
    const {error}=await supabase.from("conversation_messages").insert({thread_id:threadId,sender_id:data.user?.id,sender_role:"admin",body:body.trim()});
    if(error)setError(error.message);
    else{
      setMessages(prev=>[...prev,{id:crypto.randomUUID(),sender_role:"admin",body:body.trim(),created_at:new Date().toISOString()}]);
      setBody("");
      await supabase.from("conversation_threads").update({status:"waiting_user",last_message_at:new Date().toISOString()}).eq("id",threadId);
    }
    setBusy(false);
  }
  return <section className="chat-panel admin-chat"><div className="chat-messages">{messages.map(m=><div key={m.id} className={m.sender_role==="admin"?"chat-bubble mine":"chat-bubble"}><span>{m.sender_role==="admin"?"Vous · équipe Visiora":"Client"}</span><p>{m.body}</p><small>{new Date(m.created_at).toLocaleString("fr-FR")}</small></div>)}</div><form className="chat-compose" onSubmit={send}><textarea rows={3} value={body} onChange={e=>setBody(e.target.value)} placeholder="Rédigez votre réponse…" maxLength={5000}/><button className="button button-primary" disabled={busy||!body.trim()}>{busy?"Envoi…":"Répondre ↗"}</button></form>{error&&<p className="auth-error">{error}</p>}</section>;
}
