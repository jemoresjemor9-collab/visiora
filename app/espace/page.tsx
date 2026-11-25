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
        <Link className="brand" href="/"><span className="brand-mark"><svg viewBox="0 0 42 42" fill="none"><path d="M7 31.5 17.8 8h6.4L35 31.5h-7.2L21 17.1l-6.8 14.4H7Z" fill="currentColor"/><path d="m18.1 26.8 3-6.5 3 6.5h-6Z" fill="#42A5FF"/></svg></span><span>visiora<span className="brand-period">.</span></span></Link>
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
