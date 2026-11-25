const platforms = [
  { name: "TikTok", mark: "t", className: "tiktok", detail: "Gagnez de nouveaux abonnés" },
  { name: "YouTube", mark: "▶", className: "youtube", detail: "Développez votre communauté" },
  { name: "Facebook", mark: "f", className: "facebook", detail: "Attirez de nouveaux abonnés" },
];

const steps = [
  { number: "01", title: "Choisissez votre réseau", text: "Choisissez TikTok, YouTube ou Facebook et le compte dont vous souhaitez développer les abonnés." },
  { number: "02", title: "Lancez votre campagne", text: "Définissez votre budget et soumettez votre campagne en quelques instants." },
  { number: "03", title: "Suivez vos abonnés", text: "Consultez le suivi de votre campagne d’acquisition d’abonnés depuis votre espace personnel." },
];

function BrandMark({ small = false }: { small?: boolean }) {
  return (
    <span className={small ? "brand-mark brand-mark-small" : "brand-mark"} aria-hidden="true">
      <img src="/visiora-mark.svg" alt="" />
    </span>
  );
}

function ArrowUpRight() {
  return <span aria-hidden="true" className="arrow-up-right">↗</span>;
}

export default function Home() {
  return (
    <main>
      <div className="announcement">
        <span className="announcement-dot" />
        Les abonnés se gagnent par la découverte et le choix libre de votre profil.
      </div>

      <header className="site-header container">
        <a className="brand" href="#" aria-label="Visiora, accueil">
          <BrandMark />
          <span>Visiora<span className="brand-period">.</span></span>
        </a>
        <nav className="desktop-nav" aria-label="Navigation principale">
          <a href="/campagne">Plateformes</a>
          <a href="#fonctionnement">Comment ça marche</a>
          <a href="#avantages">Avantages</a>
        </nav>
        <div className="header-actions">
          <a className="login-link" href="/connexion?mode=login">Connexion</a>
          <a className="button button-small button-outline" href="/connexion?mode=signup">Commencer <ArrowUpRight /></a>
        </div>
      </header>

      <section className="hero container">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> LA CROISSANCE DE VOS ABONNÉS</div>
          <h1>Votre compte mérite <span>une communauté qui grandit.</span></h1>
          <p className="hero-description">
            Développez votre communauté en faisant découvrir votre compte à de nouvelles personnes susceptibles de s’y abonner.
          </p>
          <div className="hero-actions" id="demarrer">
            <a className="button button-primary" href="/connexion?mode=signup">Commencer ma campagne <ArrowUpRight /></a>
            <a className="text-link" href="#fonctionnement">Découvrir Visiora <span>→</span></a>
          </div>
          <div className="hero-proof">
            <div className="proof-avatars" aria-hidden="true"><span>V</span><span>+</span><span>↗</span></div>
            <p><strong>Une présence qui se construit.</strong><br />Avec des abonnements choisis librement.</p>
          </div>
        </div>

        <div className="hero-visual" aria-label="Aperçu illustratif du tableau de bord Visiora">
          <div className="visual-glow" />
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="dashboard-card">
            <div className="dashboard-top">
              <div className="mini-brand"><BrandMark small /><span>Visiora</span></div>
              <span className="live-pill"><i /> APERÇU ILLUSTRATIF</span>
            </div>
            <div className="dashboard-heading">
              <div><span className="muted-label">VOTRE ESPACE</span><h3>Vue d’ensemble</h3></div>
              <span className="period-chip">7 derniers jours⌄</span>
            </div>
            <div className="metric-grid">
              <div className="metric-card"><span>Abonnés gagnés</span><strong>+<b>38</b></strong><small>Exemple illustratif</small></div>
              <div className="metric-card"><span>Objectif indicatif</span><strong><b>2.4</b>k</strong><small>Abonnés souhaités</small></div>
            </div>
            <div className="chart-card">
              <div className="chart-caption"><span>Progression des abonnés</span><span>Cette semaine</span></div>
              <div className="chart">
                <div className="chart-y"><span>+300</span><span>+200</span><span>+100</span><span>0</span></div>
                <svg viewBox="0 0 420 132" preserveAspectRatio="none" role="img" aria-label="Courbe illustrative de progression des abonnés">
                  <defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2587ff" stopOpacity=".34"/><stop offset="100%" stopColor="#2587ff" stopOpacity="0"/></linearGradient></defs>
                  <path d="M0 108 C28 100 36 82 65 88 S105 99 130 71 S171 83 197 62 S238 75 265 44 S306 57 332 31 S384 42 420 8 V132 H0Z" fill="url(#chartFill)"/>
                  <path d="M0 108 C28 100 36 82 65 88 S105 99 130 71 S171 83 197 62 S238 75 265 44 S306 57 332 31 S384 42 420 8" stroke="#4aa4ff" strokeWidth="3" fill="none" strokeLinecap="round"/>
                  <circle cx="332" cy="31" r="5" fill="#fff" stroke="#4aa4ff" strokeWidth="3"/>
                </svg>
              </div>
              <div className="chart-x"><span>Lun</span><span>Mar</span><span>Mer</span><span>Jeu</span><span>Ven</span><span>Sam</span><span>Dim</span></div>
            </div>
            <div className="dashboard-bottom"><span className="bottom-check">✓</span><span>Votre campagne avance</span><span className="bottom-status">En cours</span></div>
          </div>
          <div className="floating-tag tag-top"><span className="tag-icon">↗</span><span><b>Plus d’abonnés</b><small>Des personnes réelles, librement</small></span></div>
          <div className="floating-tag tag-bottom"><span className="tag-pulse" /><span><b>Abonnements volontaires</b><small>Des choix libres et authentiques</small></span></div>
          <div className="visual-spark spark-one">✳</div><div className="visual-spark spark-two">✦</div>
        </div>
      </section>

      <section className="platform-section container" id="plateformes">
        <div className="section-kicker">UN SEUL ESPACE. VOS RÉSEAUX.</div>
        <div className="platform-heading"><h2>Votre présence, <span>sur les bonnes plateformes.</span></h2><p>Choisissez le réseau sur lequel vous souhaitez développer votre communauté.</p></div>
        <div className="platform-grid">
          {platforms.map((platform) => (
            <a className="platform-card" href="/campagne" key={platform.name}>
              <span className={`platform-icon ${platform.className}`}>{platform.mark}</span>
              <span className="platform-copy"><strong>{platform.name}</strong><small>{platform.detail}</small></span>
              <ArrowUpRight />
            </a>
          ))}
        </div>
      </section>

      <section className="how-section" id="fonctionnement">
        <div className="container">
          <div className="how-intro"><div><div className="section-kicker">SIMPLE. CLAIR. EFFICACE.</div><h2>De votre profil à une communauté qui grandit.<br /><span>En trois étapes.</span></h2></div><p>Gardez le contrôle de vos campagnes d’acquisition d’abonnés, de leur lancement jusqu’au suivi.</p></div>
          <div className="steps-grid">
            {steps.map((step) => <article className="step-card" key={step.number}><span className="step-number">{step.number}</span><div className="step-line" /><h3>{step.title}</h3><p>{step.text}</p></article>)}
          </div>
        </div>
      </section>

      <section className="closing-section container" id="avantages">
        <div className="closing-card">
          <div className="closing-orb orb-a" /><div className="closing-orb orb-b" />
          <div className="closing-content"><div className="section-kicker">À VOUS DE JOUER</div><h2>Faites grandir votre communauté<br /><span>à la vitesse supérieure.</span></h2><p>Votre prochaine audience est peut-être à une campagne de vous.</p><a className="button button-primary" href="/connexion?mode=signup">Démarrer avec Visiora <ArrowUpRight /></a></div>
          <div className="closing-mark"><BrandMark /></div>
        </div>
      </section>

      <footer className="site-footer container" id="connexion">
        <a className="brand footer-brand" href="#"><BrandMark /><span>Visiora<span className="brand-period">.</span></span></a>
        <p>Les communautés grandissent. Faites le premier pas.</p>
        <span className="copyright">© {new Date().getFullYear()} Visiora. Tous droits réservés.</span>
      </footer>
    </main>
  );
}
