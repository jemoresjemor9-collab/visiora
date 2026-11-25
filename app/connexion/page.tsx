"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ConnexionPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");

    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name.trim() },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/espace`,
          },
        });
        if (signUpError) throw signUpError;
        if (data.session) {
          router.push("/espace");
          router.refresh();
        } else {
          setMessage("Votre compte est créé. Consultez votre boîte mail pour confirmer votre adresse.");
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        router.push("/espace");
        router.refresh();
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Une erreur est survenue. Réessayez.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-backdrop" />
      <header className="auth-header">
        <Link className="brand" href="/"><span className="brand-mark"><svg viewBox="0 0 42 42" fill="none"><path d="M8.5 9.5L19.6 31.8C20.2 33 21.8 33 22.4 31.8L33.5 9.5" stroke="currentColor" strokeWidth="6.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M15.8 9.5L21 20" stroke="#8CC8FF" strokeWidth="2.4" strokeLinecap="round"/></svg></span><span>visiora<span className="brand-period">.</span></span></Link>
        <Link className="auth-back-link" href="/">← Retour à l’accueil</Link>
      </header>
      <section className="auth-card">
        <div className="auth-kicker">VOTRE ESPACE VISIORA</div>
        <h1>{mode === "signup" ? "Faites votre entrée." : "Heureux de vous revoir."}</h1>
        <p className="auth-subtitle">{mode === "signup" ? "Créez votre compte et préparez votre première campagne." : "Connectez-vous pour retrouver vos campagnes."}</p>
        <div className="auth-tabs">
          <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => { setMode("signup"); setError(""); setMessage(""); }}>Créer un compte</button>
          <button type="button" className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setError(""); setMessage(""); }}>Connexion</button>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "signup" && <label>Nom complet<input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Votre nom" required /></label>}
          <label>Adresse e-mail<input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" required /></label>
          <label>Mot de passe<input type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="8 caractères minimum" minLength={8} required /></label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          {message && <p className="auth-success" role="status">{message}</p>}
          <button className="button button-primary auth-submit" type="submit" disabled={busy}>{busy ? "Patientez…" : mode === "signup" ? "Créer mon compte" : "Me connecter"} <span>↗</span></button>
        </form>
        <p className="auth-terms">En continuant, vous acceptez nos conditions d’utilisation et notre politique de confidentialité.</p>
      </section>
      <p className="auth-footer">© {new Date().getFullYear()} Visiora · Votre visibilité mérite mieux que le hasard.</p>
    </main>
  );
}
