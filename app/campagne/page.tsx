"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

const platformLabels = { tiktok: "TikTok", youtube: "YouTube", facebook: "Facebook" };

function isProfileUrl(platform: "tiktok" | "youtube" | "facebook", value: string) {
  try {
    const parsed = new URL(value);
    let host = parsed.hostname.toLowerCase();
    if (host.startsWith("www.")) host = host.slice(4);
    const path = parsed.pathname.endsWith("/") ? parsed.pathname.slice(0, -1) : parsed.pathname;
    const parts = path.split("/").filter(Boolean);

    if (platform === "tiktok") {
      return ["tiktok.com", "m.tiktok.com"].includes(host) &&
        parts.length === 1 && parts[0].startsWith("@") && parts[0].length > 1;
    }
    if (platform === "youtube") {
      return ["youtube.com", "m.youtube.com"].includes(host) &&
        ((parts.length === 1 && parts[0].startsWith("@") && parts[0].length > 1) ||
         (parts.length === 2 && ["channel", "c", "user"].includes(parts[0]) && parts[1].length > 0));
    }
    return ["facebook.com", "m.facebook.com", "fb.com"].includes(host) &&
      ((parts.length === 1 && parts[0] === "profile.php" && Boolean(parsed.searchParams.get("id"))) ||
       (parts.length === 1 && !["watch", "reel", "reels", "groups", "marketplace", "events", "login", "share"].includes(parts[0])) ||
       (parts.length === 3 && parts[0] === "pages"));
  } catch {
    return false;
  }
}

export default function CampaignRequestPage() {
  const router = useRouter();
  const supabase = createClient();
  const [platform, setPlatform] = useState<"tiktok"|"youtube"|"facebook">("tiktok");
  const [url, setUrl] = useState("");
  const [objective, setObjective] = useState<"followers">("followers");
  const [target, setTarget] = useState("1000");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const requestedSubscribers = Number(target);
  const calculatedAmount = Number.isInteger(requestedSubscribers) && requestedSubscribers > 0
    ? Math.ceil((requestedSubscribers * 2500) / 1000)
    : 0;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setDone("");
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
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) { router.push("/connexion"); return; }
      const { data: order, error: orderError } = await supabase.rpc("create_campaign_order", {
        p_platform: platform,
        p_platform_url: url.trim(),
        p_target_subscribers: subscriberTarget
      });
      if (orderError) throw orderError;

      const savedOrder = Array.isArray(order) ? order[0] : order;
      const confirmedAmount = Number(savedOrder?.amount ?? calculatedAmount);
      setDone(`Votre demande est enregistrée. Montant à payer : ${confirmedAmount.toLocaleString("fr-FR")} FCFA. Le moyen de paiement sera activé dès que le prestataire sera configuré.`);
      setUrl(""); setTarget("1000");
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
          <label>Objectif de la campagne
            <input value="Développer des abonnés authentiques" readOnly />
          </label>
          <label>Nombre d’abonnés souhaités
            <input type="number" min="1" step="1" required value={target} onChange={e=>setTarget(e.target.value)} inputMode="numeric" />
            <small className="field-hint">Tarif : 2 500 FCFA pour 1 000 abonnés indicatifs. Le montant est calculé automatiquement et toute fraction de franc est arrondie au franc supérieur.</small>
          </label>
          <label>Montant à payer
            <input type="text" readOnly value={calculatedAmount > 0 ? `${calculatedAmount.toLocaleString("fr-FR")} FCFA` : "Saisissez un nombre d’abonnés valide"} aria-live="polite" />
          </label>
          {error && <p className="auth-error">{error}</p>}
          {done && <p className="auth-success">{done}</p>}
          <button className="button button-primary auth-submit" disabled={busy}>{busy?"Enregistrement…":"Enregistrer ma demande"} <span>↗</span></button>
          <p className="auth-terms">Visiora favorise la découverte de comptes et les abonnements volontaires de personnes réelles. Aucun faux abonné, bot ou résultat garanti.</p>
        </form>
      </section>
    </main>
  );
}
