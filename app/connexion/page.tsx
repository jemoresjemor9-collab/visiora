"use client";

import { useEffect, useState, type FormEvent } from "react";
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
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const requestedMode = new URLSearchParams(window.location.search).get("mode");
    if (requestedMode === "login" || requestedMode === "signup") setMode(requestedMode);
  }, []);

  function switchMode(nextMode: "login" | "signup") {
    if (busy || nextMode === mode) return;
    setMode(nextMode);
    setPassword("");
    setShowPassword(false);
    setMessage("");
    setError("");
  }

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
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        const { data: admin } = await supabase
          .from("admin_users")
          .select("user_id")
          .eq("user_id", data.user.id)
          .maybeSingle();
        router.push(admin ? "/admin" : "/espace");
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
        <Link className="brand" href="/"><span className="brand-mark"><img src="/visiora-mark.svg" alt="" /></span><span>Visiora<span className="brand-period">.</span></span></Link>
        <Link className="auth-back-link" href="/">← Retour à l’accueil</Link>
      </header>

      <section className="auth-card auth-card-slider" aria-label="Inscription et connexion">
        <div className={`auth-slider-track ${mode === "login" ? "is-login" : ""}`}>
          <div className="auth-pane" aria-hidden={mode !== "signup"}>
            <div className="auth-kicker">VOTRE ESPACE VISIORA</div>
            <h1>Faites votre entrée.</h1>
            <p className="auth-subtitle">Créez votre compte et préparez votre première campagne.</p>
            <form className="auth-form" onSubmit={handleSubmit}>
              <label>Nom complet<input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Votre nom" required disabled={mode !== "signup"} /></label>
              <label>Adresse e-mail<input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" required disabled={mode !== "signup"} /></label>
              <label>Mot de passe
                <span className="password-field">
                  <input type={showPassword ? "text" : "password"} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="8 caractères minimum" minLength={8} required disabled={mode !== "signup"} />
                  <button className="password-visibility" type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"} aria-pressed={showPassword} tabIndex={mode === "signup" ? 0 : -1}>
                    {showPassword ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 10.7a2 2 0 002.7 2.7M9.9 5.2A10.8 10.8 0 0112 5c5.2 0 8.7 4.5 9.5 6-.3.6-1.3 2-3.1 3.5M6.2 6.3C4.2 7.6 2.9 9.5 2.5 11c.8 1.5 4.3 6 9.5 6 1 0 2-.2 2.9-.5" /></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" /><circle cx="12" cy="12" r="3" /></svg>}
                  </button>
                </span>
              </label>
              {mode === "signup" && error && <p className="auth-error" role="alert">{error}</p>}
              {mode === "signup" && message && <p className="auth-success" role="status">{message}</p>}
              <button className="button button-primary auth-submit" type="submit" disabled={busy || mode !== "signup"}>{busy ? "Patientez…" : "Créer mon compte"} <span>↗</span></button>
            </form>
            <p className="auth-switch">Vous avez déjà un compte ? <button type="button" onClick={() => switchMode("login")}>Se connecter</button></p>
            <p className="auth-terms">En continuant, vous acceptez nos conditions d’utilisation et notre politique de confidentialité.</p>
          </div>

          <div className="auth-pane" aria-hidden={mode !== "login"}>
            <div className="auth-kicker">CONTENT DE VOUS REVOIR</div>
            <h1>Heureux de vous revoir.</h1>
            <p className="auth-subtitle">Connectez-vous pour retrouver vos campagnes et votre espace personnel.</p>
            <form className="auth-form" onSubmit={handleSubmit}>
              <label>Adresse e-mail<input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" required disabled={mode !== "login"} /></label>
              <label>Mot de passe
                <span className="password-field">
                  <input type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Votre mot de passe" required disabled={mode !== "login"} />
                  <button className="password-visibility" type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"} aria-pressed={showPassword} tabIndex={mode === "login" ? 0 : -1}>
                    {showPassword ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 10.7a2 2 0 002.7 2.7M9.9 5.2A10.8 10.8 0 0112 5c5.2 0 8.7 4.5 9.5 6-.3.6-1.3 2-3.1 3.5M6.2 6.3C4.2 7.6 2.9 9.5 2.5 11c.8 1.5 4.3 6 9.5 6 1 0 2-.2 2.9-.5" /></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" /><circle cx="12" cy="12" r="3" /></svg>}
                  </button>
                </span>
              </label>
              {mode === "login" && error && <p className="auth-error" role="alert">{error}</p>}
              {mode === "login" && message && <p className="auth-success" role="status">{message}</p>}
              <button className="button button-primary auth-submit" type="submit" disabled={busy || mode !== "login"}>{busy ? "Patientez…" : "Me connecter"} <span>↗</span></button>
            </form>
            <p className="auth-switch">Vous n’avez pas encore de compte ? <button type="button" onClick={() => switchMode("signup")}>Créer un compte</button></p>
            <p className="auth-terms">En continuant, vous acceptez nos conditions d’utilisation et notre politique de confidentialité.</p>
          </div>
        </div>
      </section>

      <p className="auth-footer">© {new Date().getFullYear()} Visiora · Votre visibilité mérite mieux que le hasard.</p>
    </main>
  );
}
