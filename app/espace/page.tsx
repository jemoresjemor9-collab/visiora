import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function EspacePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims?.sub) redirect("/connexion");

  const email = typeof claims.email === "string" ? claims.email : "Compte Visiora";
  const userId = claims.sub as string;
  const { data: adminAccess } = await supabase.from("admin_users").select("role").eq("user_id", userId).maybeSingle();
  const { data: myCampaigns } = await supabase.from("campaigns").select("id,title,platform,status,budget_amount,currency,created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(10);

  return (
    <main className="workspace-page">
      <header className="workspace-header">
        <Link className="brand" href="/"><span className="brand-mark"><img src="/visiora-mark.svg" alt="" /></span><span>Visiora<span className="brand-period">.</span></span></Link>
        <form action="/auth/signout" method="post"><button className="workspace-logout" type="submit">Déconnexion</button></form>
      </header>
      <section className="workspace-main">
        <div className="auth-kicker">VOTRE ESPACE PERSONNEL</div>
        <h1>Bienvenue sur Visiora.</h1>
        <p className="workspace-email">{email}</p>
        <div className="workspace-actions"><Link className="button button-primary" href="/campagne">Créer une campagne ↗</Link><Link className="workspace-logout" href="/messages">Contacter l’équipe</Link>{adminAccess && <Link className="workspace-logout" href="/admin">Administration</Link>}</div><div className="workspace-panel">
          <div><span className="workspace-panel-icon">↗</span><h2>Votre espace est prêt.</h2><p>Votre compte est connecté. Créez et suivez vos campagnes pour attirer des abonnés authentiques.</p></div>
          <span className="workspace-badge">Compte actif</span>
        </div>
        <div className="admin-section"><h2>Mes campagnes</h2>{myCampaigns?.length ? myCampaigns.map(c => <article className="admin-row" key={c.id}><div><strong>{c.title}</strong><small>{c.platform} · {new Date(c.created_at).toLocaleDateString("fr-FR")}</small></div><div><b>{Number(c.budget_amount).toLocaleString("fr-FR")} {c.currency}</b><small>{c.status === "pending_payment" ? "En attente de paiement" : c.status === "pending_review" ? "Paiement confirmé · en vérification" : c.status}</small></div></article>) : <p className="admin-empty">Vos demandes apparaîtront ici.</p>}</div>
        <Link className="button button-primary" href="/">Retour à l’accueil <span>↗</span></Link>
      </section>
    </main>
  );
}
