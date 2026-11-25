const platforms = [
  { name: "TikTok", mark: "t", className: "tiktok", detail: "Faites découvrir vos vidéos" },
  { name: "YouTube", mark: "▶", className: "youtube", detail: "Donnez de l’élan à vos contenus" },
  { name: "Facebook", mark: "f", className: "facebook", detail: "Développez votre communauté" },
];

const steps = [
  { number: "01", title: "Choisissez votre objectif", text: "Sélectionnez votre réseau et le contenu que vous souhaitez mettre en avant." },
  { number: "02", title: "Lancez votre campagne", text: "Définissez votre budget et soumettez votre campagne en quelques instants." },
  { number: "03", title: "Suivez votre visibilité", text: "Consultez l’avancement et les résultats depuis votre espace personnel." },
];

function BrandMark({ small = false }: { small?: boolean }) {
  return (
    <span className={small ? "brand-mark brand-mark-small" : "brand-mark"} aria-hidden="true">
      <svg viewBox="0 0 42 42" fill="none">
        <path d="M7 31.5 17.8 8h6.4L35 31.5h-7.2L21 17.1l-6.8 14.4H7Z" fill="currentColor" />
        <path d="m18.1 26.8 3-6.5 3 6.5h-6Z" fill="#42A5FF" />
      </svg>
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
        La visibilité commence par une vraie rencontre avec votre audience.
      </div>

      <header className="site-header container">
        <a className="brand" href="#" aria-label="Visiora, accueil">
          <BrandMark />
          <span>visiora<span className="brand-period">.</span></span>
        </a>
        <nav className="desktop-nav" aria-label="Navigation principale">
          <a href="#plateformes">Plateformes</a>
          <a href="#fonctionnement">Comment ça marche</a>
          <a href="#avantages">Avantages</a>
        </nav>
        <div className="header-actions">
          <a className="login-link" href="#connexion">Connexion</a>
          <a className="button button-small button-outline" href="#demarrer">Commencer <ArrowUpRight /></a>
        </div>
      </header>

      <section className="hero container">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> LA VISIBILITÉ, EN MOUVEMENT</div>
          <h1>Votre contenu mérite <span>le devant de la scène.</span></h1>
          <p className="hero-description">
            Faites découvrir vos contenus, touchez de nouvelles audiences et développez votre présence sur les réseaux sociaux.
          </p>
          <div className="hero-actions" id="demarrer">
            <a className="button button-primary" href="#plateformes">Lancer ma campagne <ArrowUpRight /></a>
            <a className="text-link" href="#fonctionnement">Découvrir Visiora <span>→</span></a>
          </div>
          <div className="hero-proof">
            <div className="proof-avatars" aria-hidden="true"><span>V</span><span>+</span><span>↗</span></div>
            <p><strong>Une présence qui se construit.</strong><br />Avec des interactions authentiques.</p>
          </div>
        </div>

        <div className="hero-visual" aria-label="Aperçu illustratif du tableau de bord Visiora">
          <div className="visual-glow" />
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="dashboard-card">
            <div className="dashboard-top">
              <div className="mini-brand"><BrandMark small /><span>visiora</span></div>
              <span className="live-pill"><i /> CAMPAGNE ACTIVE</span>
            </div>
            <div className="dashboard-heading">
              <div><span className="muted-label">VOTRE ESPACE</span><h3>Vue d’ensemble</h3></div>
              <span className="period-chip">7 derniers jours⌄</span>
            </div>
            <div className="metric-grid">
              <div className="metric-card"><span>Portée de campagne</span><strong>+<b>38</b>%</strong><small>↗ Progression</small></div>
              <div className="metric-card"><span>Interactions</span><strong><b>2.4</b>k</strong><small>↗ Activité réelle</small></div>
            </div>
            <div className="chart-card">
              <div className="chart-caption"><span>Évolution de la visibilité</span><span>Cette semaine</span></div>
              <div className="chart">
                <div className="chart-y"><span>3k</span><span>2k</span><span>1k</span><span>0</span></div>
                <svg viewBox="0 0 420 132" preserveAspectRatio="none" role="img" aria-label="Courbe illustrative de progression">
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
          <div className="floating-tag tag-top"><span className="tag-icon">↗</span><span><b>Plus de portée</b><small>Une audience à découvrir</small></span></div>
          <div className="floating-tag tag-bottom"><span className="tag-pulse" /><span><b>100 % orienté humain</b><small>Des choix libres et authentiques</small></span></div>
          <div className="visual-spark spark-one">✳</div><div className="visual-spark spark-two">✦</div>
        </div>
      </section>

      <section className="platform-section container" id="plateformes">
        <div className="section-kicker">UN SEUL ESPACE. VOS RÉSEAUX.</div>
        <div className="platform-heading"><h2>Votre présence, <span>sur les bonnes plateformes.</span></h2><p>Choisissez où vous souhaitez gagner en visibilité.</p></div>
        <div className="platform-grid">
          {platforms.map((platform) => (
            <a className="platform-card" href="#demarrer" key={platform.name}>
              <span className={`platform-icon ${platform.className}`}>{platform.mark}</span>
              <span className="platform-copy"><strong>{platform.name}</strong><small>{platform.detail}</small></span>
              <ArrowUpRight />
            </a>
          ))}
        </div>
      </section>

      <section className="how-section" id="fonctionnement">
        <div className="container">
          <div className="how-intro"><div><div className="section-kicker">SIMPLE. CLAIR. EFFICACE.</div><h2>De l’idée à la visibilité.<br /><span>En trois étapes.</span></h2></div><p>Gardez le contrôle de vos campagnes, de leur lancement jusqu’au suivi des résultats.</p></div>
          <div className="steps-grid">
            {steps.map((step) => <article className="step-card" key={step.number}><span className="step-number">{step.number}</span><div className="step-line" /><h3>{step.title}</h3><p>{step.text}</p></article>)}
          </div>
        </div>
      </section>

      <section className="closing-section container" id="avantages">
        <div className="closing-card">
          <div className="closing-orb orb-a" /><div className="closing-orb orb-b" />
          <div className="closing-content"><div className="section-kicker">À VOUS DE JOUER</div><h2>Faites passer votre visibilité<br /><span>à la vitesse supérieure.</span></h2><p>Votre prochaine audience est peut-être à une campagne de vous.</p><a className="button button-primary" href="#connexion">Démarrer avec Visiora <ArrowUpRight /></a></div>
          <div className="closing-mark"><BrandMark /></div>
        </div>
      </section>

      <footer className="site-footer container" id="connexion">
        <a className="brand footer-brand" href="#"><BrandMark /><span>visiora<span className="brand-period">.</span></span></a>
        <p>La visibilité se construit. Faites le premier pas.</p>
        <span className="copyright">© {new Date().getFullYear()} Visiora. Tous droits réservés.</span>
      </footer>
    </main>
  );
}
