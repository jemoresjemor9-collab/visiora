"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

const platformLabels = { tiktok: "TikTok", youtube: "YouTube", facebook: "Facebook" };

function isProfileUrl(platform: "tiktok" | "youtube" | "facebook", value: string) {
  try {
    const parsed = new URL(value);
    const host = parsed.hostname.toLowerCase().replace(/^www\\./, "");
    const path = parsed.pathname.replace(/\\/$/, "");
    if (platform === "tiktok") return ["tiktok.com", "m.tiktok.com"].includes(host) && /^\\/@[^/]+$/.test(path);
    if (platform === "youtube") return ["youtube.com", "m.youtube.com"].includes(host) && /^\\/(?:@[^/]+|channel\\/[^/]+|c\\/[^/]+|user\\/[^/]+)$/.test(path);
    return ["facebook.com", "m.facebook.com", "fb.com"].includes(host) &&
      ((path === "/profile.php" && Boolean(parsed.searchParams.get("id"))) ||
       /^\\/(?:pages\\/[^/]+\\/[^/]+|[^/]+)$/.test(path));
  } catch {
    return false;
  }
}

export default function CampaignRequestPage() {
  const router = useRouter();
  const supabase = createClient();
  const [platform, setPlatform] = useState<"tiktok"|"youtube"|"facebook">("tiktok");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [objective, setObjective] = useState<"followers">("followers");
  const [budget, setBudget] = useState("5000");
  const [target, setTarget] = useState("1000");
  const [brief, setBrief] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setDone("");
    const amount = Number(budget);
    if (!isProfileUrl(platform, url.trim())) {
      setError("Saisissez le lien direct du profil du compte, et non celui d’une vidéo ou d’une publication.");
      setBusy(false);
      return;
    }
    const subscriberTarget = Number(target);
    if (!Number.isInteger(subscriberTarget) || subscriberTarget < 1) {
      setError("Indiquez un objectif d’au moins 1 abonné.");
      setBusy(false);
      return;
    }
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
          target_subscribers: subscriberTarget,
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

      setDone("Votre demande est enregistrée. Elle apparaîtra dans votre espace dès que le paiement sera confirmé. Le moyen de paiement sera activé dès que le prestataire sera configuré.");
      setUrl(""); setTitle(""); setBrief("");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Impossible d’enregistrer la demande.";
      setError(message.includes("déjà une campagne Visiora")
        ? "Ce compte a déjà une campagne Visiora en cours ou terminée. Un même compte ne peut pas être boosté deux fois."
        : message.includes("lien direct vers le profil")
          ? "Le lien doit pointer directement vers le profil du compte, pas vers une vidéo ou une publication."
          : message);
    } finally { setBusy(false); }
  }

  return (
    <main className="flow-page">
      <header className="flow-header">
        <Link href="/" className="brand"><span className="brand-mark"><img src="/visiora-mark.svg" alt="" /></span><span>Visiora<span className="brand-period">.</span></span></Link>
        <Link href="/espace" className="auth-back-link">Mon espace →</Link>
      </header>
      <section className="flow-wrap">
        <div className="auth-kicker">NOUVELLE CAMPAGNE</div>
        <h1>Développez vos abonnés.</h1>
        <p className="flow-lead">Présentez le profil de votre compte et définissez votre objectif indicatif d’abonnés authentiques. Une même page ne peut bénéficier que d’une seule campagne Visiora.</p>
        <form className="flow-card" onSubmit={submit}>
          <label>Plateforme
            <div className="platform-choice">
              {(["tiktok","youtube","facebook"] as const).map(p => <button type="button" key={p} className={platform===p?"selected":""} onClick={()=>setPlatform(p)}>{platformLabels[p]}</button>)}
            </div>
          </label>
          <label>Lien du profil du compte<input type="url" required value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://www.tiktok.com/@votrecompte" /><small className="field-hint">Utilisez le lien de votre profil TikTok, de votre chaîne YouTube ou de votre page Facebook. Les liens de vidéos et de publications ne sont pas acceptés.</small></label>
          <label>Nom de votre campagne abonnés<input required maxLength={100} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ex. Mise en avant de ma chaîne" /></label>
          <label>Objectif de la campagne
            <input value="Développer des abonnés authentiques" readOnly />
          </label>
          <label>Nombre indicatif d’abonnés souhaités<input type="number" min="1" step="100" value={target} onChange={e=>setTarget(e.target.value)} /><small className="field-hint">C’est un objectif indicatif, pas une promesse de résultat ni un nombre garanti.</small></label>
          <label>Budget prévu (XOF)<input type="number" min="500" step="500" required value={budget} onChange={e=>setBudget(e.target.value)} /></label>
          <label>Précisions (facultatif)<textarea rows={3} maxLength={1500} value={brief} onChange={e=>setBrief(e.target.value)} placeholder="Décrivez votre public, votre contenu ou vos attentes…" /></label>
          {error && <p className="auth-error">{error}</p>}
          {done && <p className="auth-success">{done}</p>}
          <button className="button button-primary auth-submit" disabled={busy}>{busy?"Enregistrement…":"Enregistrer ma demande"} <span>↗</span></button>
          <p className="auth-terms">Visiora favorise la découverte de comptes et les abonnements volontaires de personnes réelles. Aucun faux abonné, bot ou résultat garanti.</p>
        </form>
      </section>
    </main>
  );
}
