"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Campaign = {id:string;user_id:string;platform:string;platform_url:string;target_subscribers:number;status:string;budget_amount:number|string;currency:string;created_at:string;title:string};
type Payment = {id:string;user_id:string;campaign_id:string|null;amount:number|string;currency:string;status:string;provider:string|null;provider_reference:string|null;proof_url:string|null;admin_note:string|null;verified_at:string|null;created_at:string};
type Thread = {id:string;subject:string;status:string;last_message_at:string;user_id:string;campaign_id:string|null};
type Profile = {id:string;display_name:string|null;avatar_url:string|null;phone:string|null;country_code:string|null};
type FollowEvent = {campaign_id:string;event_type:string};

const statusLabels:Record<string,string>={draft:"Brouillon",pending_payment:"Paiement attendu",pending_review:"À valider",active:"En cours",paused:"En pause",completed:"Terminée",cancelled:"Annulée",rejected:"Refusée",pending:"En attente",succeeded:"Confirmé",failed:"Échoué",refunded:"Remboursé",open:"Ouverte",waiting_admin:"À traiter",waiting_user:"En attente du client",closed:"Fermée"};
const money=(value:number|string,currency="XOF")=>`${Number(value).toLocaleString("fr-FR")} ${currency==="XOF"?"FCFA":currency}`;

export default function AdminDashboard({initialCampaigns,initialPayments,initialThreads,profiles,followEvents}:{initialCampaigns:Campaign[];initialPayments:Payment[];initialThreads:Thread[];profiles:Profile[];followEvents:FollowEvent[]}) {
  const supabase=createClient();
  const [campaigns,setCampaigns]=useState(initialCampaigns);
  const [payments,setPayments]=useState(initialPayments);
  const [threads]=useState(initialThreads);
  const [filter,setFilter]=useState("all");
  const [platform,setPlatform]=useState("all");
  const [search,setSearch]=useState("");
  const [busy,setBusy]=useState<string|null>(null);
  const [notice,setNotice]=useState("");
  const [error,setError]=useState("");
  const profileById=useMemo(()=>new Map(profiles.map(p=>[p.id,p])),[profiles]);
  const deliveredByCampaign=useMemo(()=>{const counts=new Map<string,number>();for(const event of followEvents)counts.set(event.campaign_id,(counts.get(event.campaign_id)||0)+1);return counts;},[followEvents]);
  const visibleCampaigns=campaigns.filter(c=>(filter==="all"||c.status===filter)&&(platform==="all"||c.platform===platform)&&(`${c.title} ${c.platform_url} ${profileById.get(c.user_id)?.display_name||""}`).toLowerCase().includes(search.toLowerCase()));
  const pendingPayments=payments.filter(p=>p.status==="pending");
  const waitingThreads=threads.filter(t=>t.status==="waiting_admin"||t.status==="open");

  async function changeCampaign(id:string,status:string) {
    setBusy(id);setError("");setNotice("");
    const {error}=await supabase.from("campaigns").update({status,updated_at:new Date().toISOString()}).eq("id",id);
    if(error)setError(error.message);
    else {setCampaigns(old=>old.map(c=>c.id===id?{...c,status}:c));setNotice(`Campagne mise à jour : ${statusLabels[status]||status}.`);}
    setBusy(null);
  }
  async function reviewPayment(payment:Payment,status:"succeeded"|"failed") {
    setBusy(payment.id);setError("");setNotice("");
    const {data:user}=await supabase.auth.getUser();
    const adminNote=status==="succeeded"?"Paiement vérifié et confirmé par l’administration.":"Paiement non validé par l’administration.";
    const {error}=await supabase.from("payments").update({status,verified_by:user.user?.id,verified_at:new Date().toISOString(),paid_at:status==="succeeded"?new Date().toISOString():null,admin_note:adminNote}).eq("id",payment.id);
    if(error)setError(error.message);
    else {
      setPayments(old=>old.map(p=>p.id===payment.id?{...p,status,verified_at:new Date().toISOString(),admin_note:adminNote}:p));
      if(status==="succeeded"&&payment.campaign_id)setCampaigns(old=>old.map(c=>c.id===payment.campaign_id&&c.status==="pending_payment"?{...c,status:"pending_review"}:c));
      setNotice(status==="succeeded"?"Paiement confirmé. La campagne est passée en attente de validation.":"Paiement marqué comme non validé.");
    }
    setBusy(null);
  }

  return <div className="admin-dashboard">
    <div className="admin-stats">
      <div><strong>{campaigns.length}</strong><span>Campagnes enregistrées</span></div>
      <div><strong>{pendingPayments.length}</strong><span>Paiements à vérifier</span></div>
      <div><strong>{waitingThreads.length}</strong><span>Messages à traiter</span></div>
      <div><strong>{campaigns.filter(c=>c.status==="active").length}</strong><span>Campagnes actives</span></div>
    </div>
    {notice&&<p className="admin-notice">{notice}</p>}{error&&<p className="auth-error">{error}</p>}
    <section className="admin-section">
      <div className="admin-heading"><div><h2>Campagnes</h2><p>Consultez les demandes et pilotez leur statut.</p></div><span>{visibleCampaigns.length} résultat(s)</span></div>
      <div className="admin-filters">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un profil ou une campagne…" />
        <select value={platform} onChange={e=>setPlatform(e.target.value)}><option value="all">Toutes les plateformes</option><option value="youtube">YouTube</option><option value="tiktok">TikTok</option><option value="facebook">Facebook</option></select>
        <select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">Tous les statuts</option>{["pending_payment","pending_review","active","paused","completed","rejected","cancelled"].map(s=><option key={s} value={s}>{statusLabels[s]}</option>)}</select>
      </div>
      {visibleCampaigns.length?visibleCampaigns.map(c=>{
        const profile=profileById.get(c.user_id);
        const payment=payments.find(p=>p.campaign_id===c.id);
        return <article className="admin-record" key={c.id}>
          <div className="admin-record-main">
            <div className="admin-record-title"><strong>{c.title}</strong><span className={`admin-status status-${c.status}`}>{statusLabels[c.status]||c.status}</span></div>
            <div className="admin-record-meta"><span>{c.platform.toUpperCase()}</span><span>{c.target_subscribers.toLocaleString("fr-FR")} abonnés visés</span><span>{(deliveredByCampaign.get(c.id)||0).toLocaleString("fr-FR")} abonnements volontaires enregistrés</span><span>{money(c.budget_amount,c.currency)}</span><span>{new Date(c.created_at).toLocaleDateString("fr-FR")}</span></div>
            <a className="admin-profile-link" href={c.platform_url} target="_blank" rel="noreferrer">{c.platform_url}</a>
            <small>Client : {profile?.display_name||"Nom non renseigné"} · {profile?.phone||"Téléphone non renseigné"} · ID {c.user_id.slice(0,8)}</small>
            {payment&&<small>Paiement : {statusLabels[payment.status]||payment.status}{payment.provider? ` · ${payment.provider}`:""}{payment.proof_url?<> · <a href={payment.proof_url} target="_blank" rel="noreferrer">Voir le justificatif</a></>:""}</small>}
          </div>
          <div className="admin-actions">
            {c.status==="pending_review"&&<><button disabled={busy===c.id} onClick={()=>changeCampaign(c.id,"active")}>Activer</button><button className="danger" disabled={busy===c.id} onClick={()=>changeCampaign(c.id,"rejected")}>Refuser</button></>}
            {c.status==="active"&&<><button disabled={busy===c.id} onClick={()=>changeCampaign(c.id,"paused")}>Mettre en pause</button><button disabled={busy===c.id} onClick={()=>changeCampaign(c.id,"completed")}>Terminer</button></>}
            {c.status==="paused"&&<button disabled={busy===c.id} onClick={()=>changeCampaign(c.id,"active")}>Réactiver</button>}
            {c.status==="pending_payment"&&<span className="admin-action-hint">En attente du paiement</span>}
          </div>
        </article>;
      }):<p className="admin-empty">Aucune campagne pour ces filtres.</p>}
    </section>
    <section className="admin-section">
      <div className="admin-heading"><div><h2>Vérification des paiements</h2><p>Confirmez uniquement les paiements réellement reçus.</p></div><span>{pendingPayments.length} en attente</span></div>
      {payments.length?payments.map(p=><article className="admin-record" key={p.id}>
        <div className="admin-record-main"><div className="admin-record-title"><strong>{money(p.amount,p.currency)}</strong><span className={`admin-status status-${p.status}`}>{statusLabels[p.status]||p.status}</span></div><div className="admin-record-meta"><span>Créé le {new Date(p.created_at).toLocaleString("fr-FR")}</span><span>{p.provider||"Prestataire non configuré"}</span>{p.provider_reference&&<span>Réf. {p.provider_reference}</span>}</div><small>Client : {profileById.get(p.user_id)?.display_name||"Nom non renseigné"} · ID {p.user_id.slice(0,8)}</small>{p.proof_url&&<a className="admin-profile-link" href={p.proof_url} target="_blank" rel="noreferrer">Ouvrir le justificatif de paiement</a>}{p.admin_note&&<small>{p.admin_note}</small>}</div>
        {p.status==="pending"&&<div className="admin-actions"><button disabled={busy===p.id} onClick={()=>reviewPayment(p,"succeeded")}>Confirmer reçu</button><button className="danger" disabled={busy===p.id} onClick={()=>reviewPayment(p,"failed")}>Refuser</button></div>}
      </article>):<p className="admin-empty">Aucun paiement enregistré.</p>}
    </section>
    <section className="admin-section">
      <div className="admin-heading"><div><h2>Assistance client</h2><p>Retrouvez les échanges et répondez aux utilisateurs.</p></div><span>{threads.length} conversation(s)</span></div>
      {threads.length?threads.map(t=><Link href={`/admin/conversations/${t.id}`} className="admin-record admin-thread" key={t.id}><div className="admin-record-main"><div className="admin-record-title"><strong>{t.subject}</strong><span className={`admin-status status-${t.status}`}>{statusLabels[t.status]||t.status}</span></div><small>{profileById.get(t.user_id)?.display_name||"Client"} · {new Date(t.last_message_at).toLocaleString("fr-FR")}</small></div><span className="admin-thread-arrow">Ouvrir →</span></Link>):<p className="admin-empty">Aucune conversation reçue.</p>}
    </section>
  </div>;
}
