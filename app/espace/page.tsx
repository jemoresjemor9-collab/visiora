import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  pending_payment: "Paiement à effectuer",
  pending_review: "Paiement reçu · validation en attente",
  active: "En cours",
  half_completed: "À moitié terminée",
  paused: "En pause",
  completed: "Terminée",
  cancelled: "Annulée",
  rejected: "Refusée",
};

const paymentLabels: Record<string, string> = {
  pending: "Paiement en attente",
  succeeded: "Paiement confirmé",
  failed: "Paiement refusé",
  refunded: "Remboursé",
  cancelled: "Paiement annulé",
};

const platformLabels: Record<string, string> = {
  tiktok: "TikTok",
  youtube: "YouTube",
  facebook: "Facebook",
};

export default async function EspacePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims?.sub) redirect("/connexion?mode=login");

  const email = typeof claims.email === "string" ? claims.email : "Compte Visiora";
  const userId = claims.sub as string;

  const [{ data: adminAccess }, { data: myCampaigns }] = await Promise.all([
    supabase.from("admin_users").select("role").eq("user_id", userId).maybeSingle(),
    supabase.from("campaigns")
      .select("id,title,platform,platform_url,status,budget_amount,currency,target_subscribers,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const campaignIds = (myCampaigns || []).map(c => c.id);
  const [{ data: followEvents }, { data: payments }] = campaignIds.length
    ? await Promise.all([
        supabase.from("campaign_events").select("campaign_id").in("campaign_id", campaignIds).eq("event_type", "voluntary_follow").limit(10000),
        supabase.from("payments").select("campaign_id,status,amount,currency").eq("user_id", userId).in("campaign_id", campaignIds),
      ])
    : [{ data: [] }, { data: [] }];

  const paymentByCampaign = new Map((payments || []).map(p => [p.campaign_id, p]));

  const totalCampaigns = myCampaigns?.length || 0;
  const activeCampaigns = (myCampaigns || []).filter(c => ["active", "paused", "pending_review", "pending_payment"].includes(c.status)).length;
  const completedCampaigns = (myCampaigns || []).filter(c => c.status === "completed").length;

  return (
    <main className="workspace-page">
      <header className="workspace-header">
        <Link className="brand" href="/"><span className="brand-mark"><img src="/visiora-mark.svg" alt="" /></span><span>Visiora<span className="brand-period">.</span></span></Link>
        <div className="workspace-actions" style={{ margin: 0 }}>
          <Link className="workspace-logout" href="/">Retour à l’accueil</Link>
          <form action="/auth/signout" method="post"><button className="workspace-logout" type="submit">Déconnexion</button></form>
        </div>
      </header>
      <section className="workspace-main">
        <div className="auth-kicker">VOTRE ESPACE PERSONNEL</div>
        <h1>Bienvenue sur Visiora.</h1>
        <p className="workspace-email">{email}</p>
        <div className="workspace-actions">
          <Link className="button button-primary" href="/campagne">+ Créer une campagne</Link>
          <Link className="workspace-logout" href="/messages">Contacter l’équipe</Link>
          {adminAccess && <Link className="workspace-logout" href="/admin">Administration</Link>}
        </div>

        <div className="admin-stats">
          <div><strong>{totalCampaigns}</strong><span>Mes campagnes</span></div>
          <div><strong>{activeCampaigns}</strong><span>En attente ou en cours</span></div>
          <div><strong>{completedCampaigns}</strong><span>Campagnes terminées</span></div>
        </div>

        <section className="admin-section">
          <div className="admin-heading">
            <div><h2>Mes campagnes</h2><p>Retrouvez vos campagnes et leur statut, mis à jour par l’administration.</p></div>
            <span>{totalCampaigns} campagne(s)</span>
          </div>
          {myCampaigns?.length ? myCampaigns.map(c => {
            const target = Number(c.target_subscribers) || 0;
            const payment = paymentByCampaign.get(c.id);
            return (
              <article className="admin-record" key={c.id}>
                <div className="admin-record-main" style={{ width: "100%" }}>
                  <div className="admin-record-title">
                    <strong>{c.title || `Campagne ${platformLabels[c.platform] || c.platform}`}</strong>
                    <span className={`admin-status status-${c.status}`}>{statusLabels[c.status] || c.status}</span>
                  </div>
                  <div className="admin-record-meta">
                    <span>{platformLabels[c.platform] || c.platform}</span>
                    <span>Objectif : {target.toLocaleString("fr-FR")} abonnés</span>
                    <span>{Number(c.budget_amount).toLocaleString("fr-FR")} {c.currency === "XOF" ? "FCFA" : c.currency}</span>
                    <span>Créée le {new Date(c.created_at).toLocaleDateString("fr-FR")}</span>
                  </div>
                  <a className="admin-profile-link" href={c.platform_url} target="_blank" rel="noreferrer">Voir le profil concerné ↗</a>
                  <div className="admin-record-meta">
                  </div>
                  <div style={{ height: 8, borderRadius: 20, background: "#26374e", overflow: "hidden", maxWidth: 520 }}>
                  </div>
                  <small>{payment ? paymentLabels[payment.status] || payment.status : "Aucun paiement associé"}</small>
                </div>
              </article>
            );
          }) : (
            <div className="workspace-panel">
              <div><span className="workspace-panel-icon">↗</span><h2>Votre première campagne commence ici.</h2><p>Choisissez TikTok, YouTube ou Facebook, indiquez le lien de votre profil et votre objectif d’abonnés. Le montant sera calculé automatiquement.</p></div>
              <Link className="button button-primary" href="/campagne">Lancer ma première demande ↗</Link>
            </div>
          )}
        </section>
        <p className="auth-terms">Le statut de chaque campagne est mis à jour par l’administration. Les abonnements restent volontaires et aucun résultat n’est garanti.</p>
      </section>
    </main>
  );
}
