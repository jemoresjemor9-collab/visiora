import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminConversation from "./thread";

export default async function AdminConversationPage({params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  const supabase=await createClient();
  const {data:claims}=await supabase.auth.getClaims();
  if(!claims?.claims?.sub) redirect("/connexion");
  const userId=claims.claims.sub as string;
  const {data:admin}=await supabase.from("admin_users").select("role").eq("user_id",userId).maybeSingle();
  if(!admin) redirect("/espace");
  const {data:thread}=await supabase.from("conversation_threads").select("id,subject,status,user_id").eq("id",id).maybeSingle();
  if(!thread) notFound();
  const {data:messages}=await supabase.from("conversation_messages").select("id,sender_role,body,created_at").eq("thread_id",id).order("created_at");
  return <main className="workspace-page"><header className="workspace-header"><Link href="/admin" className="brand">Visiora<span className="brand-period">.</span></Link><Link href="/admin" className="workspace-logout">Retour au tableau</Link></header><section className="workspace-main"><div className="auth-kicker">ASSISTANCE · {admin.role.toUpperCase()}</div><h1>{thread.subject}</h1><p className="workspace-email">Conversation client · {thread.status}</p><AdminConversation threadId={id} initialMessages={messages||[]} /></section></main>;
}
