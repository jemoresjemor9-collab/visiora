import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();
  const {data:claimsData} = await supabase.auth.getClaims();
  if(!claimsData?.claims?.sub) redirect("/connexion");
  const userId = claimsData.claims.sub as string;
  const {data:admin} = await supabase.from("admin_users").select("role").eq("user_id",userId).maybeSingle();
  if(!admin) redirect("/espace");

  const [{data:campaigns},{data:payments},{data:threads}] = await Promise.all([
    supabase.from("campaigns").select("id,title,platform,status,budget_amount,currency,created_at").order("created_at",{ascending:false}).limit(30),
    supabase.from("payments").select("id,campaign_id,amount,currency,status,provider,created_at").order("created_at",{ascending:false}).limit(30),
    supabase.from("conversation_threads").select("id,subject,status,last_message_at,user_id").order("last_message_at",{ascending:false}).limit(30)
  ]);

  return <main className="workspace-page"><header className="workspace-header"><Link href="/" className="brand"><span className="brand-mark"><svg viewBox="0 0 42 42" fill="none"><path d="M8.5 9.5L19.6 31.8C20.2 33 21.8 33 22.4 31.8L33.5 9.5" stroke="currentColor" strokeWidth="6.2" strokeLinecap="round" strokeLinejoin="round"/></svg></span><span>Visiora<span className="brand-period">.</span></span></Link><Link href="/espace" className="workspace-logout">Espace client</Link></header>
  <section className="workspace-main"><div className="auth-kicker">ADMINISTRATION · {admin.role.toUpperCase()}</div><h1>Tableau de bord.</h1><p className="workspace-email">Demandes, paiements et assistance.</p>
  <div className="admin-stats"><div><strong>{campaigns?.length||0}</strong><span>Campagnes récentes</span></div><div><strong>{payments?.filter(p=>p.status==="pending").length||0}</strong><span>Paiements à vérifier</span></div><div><strong>{threads?.filter(t=>t.status==="waiting_admin").length||0}</strong><span>Messages en attente</span></div></div>
  <div className="admin-section"><h2>Demandes de campagne</h2>{campaigns?.length?campaigns.map(c=><article className="admin-row" key={c.id}><div><strong>{c.title}</strong><small>{c.platform} · {new Date(c.created_at).toLocaleDateString("fr-FR")}</small></div><div><b>{Number(c.budget_amount).toLocaleString("fr-FR")} {c.currency}</b><small>{c.status}</small></div></article>):<p className="admin-empty">Aucune demande pour le moment.</p>}</div>
  <div className="admin-section"><h2>Paiements</h2>{payments?.length?payments.map(p=><article className="admin-row" key={p.id}><div><strong>{Number(p.amount).toLocaleString("fr-FR")} {p.currency}</strong><small>{p.provider||"Prestataire à définir"}</small></div><span className={p.status==="succeeded"?"status-good":"status-pending"}>{p.status}</span></article>):<p className="admin-empty">Aucun paiement enregistré.</p>}</div>
  <div className="admin-section"><h2>Conversations clients</h2>{threads?.length?threads.map(t=><Link href={"/admin/conversations/"+t.id} className="admin-row" key={t.id}><div><strong>{t.subject}</strong><small>Client · {new Date(t.last_message_at).toLocaleString("fr-FR")}</small></div><span className="status-pending">{t.status}</span></Link>):<p className="admin-empty">Aucun message reçu.</p>}</div>
  </section></main>;
}
