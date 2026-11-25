import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function EspacePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims?.sub) redirect("/connexion");

  const email = typeof claims.email === "string" ? claims.email : "Compte Visiora";

  return (
    <main className="workspace-page">
      <header className="workspace-header">
        <Link className="brand" href="/"><span className="brand-mark"><svg viewBox="0 0 42 42" fill="none"><path d="M8.5 9.5L19.6 31.8C20.2 33 21.8 33 22.4 31.8L33.5 9.5" stroke="currentColor" strokeWidth="6.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M15.8 9.5L21 20" stroke="#8CC8FF" strokeWidth="2.4" strokeLinecap="round"/></svg></span><span>visiora<span className="brand-period">.</span></span></Link>
        <form action="/auth/signout" method="post"><button className="workspace-logout" type="submit">Déconnexion</button></form>
      </header>
      <section className="workspace-main">
        <div className="auth-kicker">VOTRE ESPACE PERSONNEL</div>
        <h1>Bienvenue sur Visiora.</h1>
        <p className="workspace-email">{email}</p>
        <div className="workspace-panel">
          <div><span className="workspace-panel-icon">↗</span><h2>Votre espace est prêt.</h2><p>Votre compte est connecté. Nous préparons maintenant la création et le suivi de vos campagnes.</p></div>
          <span className="workspace-badge">Compte actif</span>
        </div>
        <Link className="button button-primary" href="/">Retour à l’accueil <span>↗</span></Link>
      </section>
    </main>
  );
}
