"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

const platformLabels = { tiktok: "TikTok", youtube: "YouTube", facebook: "Facebook" };

export default function CampaignRequestPage() {
  const router = useRouter();
  const supabase = createClient();
  const [platform, setPlatform] = useState<"tiktok"|"youtube"|"facebook">("tiktok");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [objective, setObjective] = useState<"reach"|"views"|"engagement">("reach");
  const [budget, setBudget] = useState("5000");
  const [brief, setBrief] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setDone("");
    const amount = Number(budget);
    if (!Number.isFinite(amount) || amount < 500) {
      setError("Saisissez un budget d’au moins 500 XOF."); setBusy(false); return;
    }
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) { router.push("/connexion"); return; }
      const { data: campaign, error: campaignError } = await supabase
        .from("campaigns")
        .insert({
          user_id: userData.user.id,
          platform,
          platform_url: url.trim(),
          objective,
          title: title.trim(),
          brief: brief.trim() || null,
          budget_amount: amount,
          currency: "XOF",
          status: "pending_payment"
        })
        .select("id")
        .single();
      if (campaignError) throw campaignError;

      const { error: paymentError } = await supabase.from("payments").insert({
        user_id: userData.user.id,
        campaign_id: campaign.id,
        amount,
        currency: "XOF",
        status: "pending"
      });
      if (paymentError) throw paymentError;

      setDone("Votre demande est enregistrée. Elle apparaîtra dans votre espace dès que le paiement sera confirmé. Les instructions de paiement seront ajoutées après le choix du prestataire.");
      setUrl(""); setTitle(""); setBrief("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible d’enregistrer la demande.");
    } finally { setBusy(false); }
  }

  return (
    <main className="flow-page">
      <header className="flow-header">
        <Link href="/" className="brand"><span className="brand-mark"><svg viewBox="0 0 42 42" fill="none"><path d="M8.5 9.5L19.6 31.8C20.2 33 21.8 33 22.4 31.8L33.5 9.5" stroke="currentColor" strokeWidth="6.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M15.8 9.5L21 20" stroke="#8CC8FF" strokeWidth="2.4" strokeLinecap="round"/></svg></span><span>Visiora<span className="brand-period">.</span></span></Link>
        <Link href="/espace" className="auth-back-link">Mon espace →</Link>
      </header>
      <section className="flow-wrap">
        <div className="auth-kicker">NOUVELLE CAMPAGNE</div>
        <h1>Faites découvrir votre contenu.</h1>
        <p className="flow-lead">Décrivez votre objectif. Nous vous accompagnons pour toucher une audience réellement intéressée.</p>
        <form className="flow-card" onSubmit={submit}>
          <label>Plateforme
            <div className="platform-choice">
              {(["tiktok","youtube","facebook"] as const).map(p => <button type="button" key={p} className={platform===p?"selected":""} onClick={()=>setPlatform(p)}>{platformLabels[p]}</button>)}
            </div>
          </label>
          <label>Lien du compte ou du contenu<input type="url" required value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://..." /></label>
          <label>Nom de la campagne<input required maxLength={100} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ex. Mise en avant de ma chaîne" /></label>
          <label>Votre objectif
            <select value={objective} onChange={e=>setObjective(e.target.value as typeof objective)}>
              <option value="reach">Faire découvrir mon compte (portée)</option>
              <option value="views">Obtenir des vues sur un contenu</option>
              <option value="engagement">Encourager les interactions volontaires</option>
            </select>
          </label>
          <label>Budget prévu (XOF)<input type="number" min="500" step="500" required value={budget} onChange={e=>setBudget(e.target.value)} /></label>
          <label>Précisions (facultatif)<textarea rows={3} maxLength={1500} value={brief} onChange={e=>setBrief(e.target.value)} placeholder="Décrivez votre public, votre contenu ou vos attentes…" /></label>
          {error && <p className="auth-error">{error}</p>}
          {done && <p className="auth-success">{done}</p>}
          <button className="button button-primary auth-submit" disabled={busy}>{busy?"Enregistrement…":"Continuer vers le paiement"} <span>↗</span></button>
          <p className="auth-terms">Les abonnements et interactions ne sont jamais artificiels ni garantis. Les campagnes reposent sur la découverte et le choix libre des utilisateurs.</p>
        </form>
      </section>
    </main>
  );
}
