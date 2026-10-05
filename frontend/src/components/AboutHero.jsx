const developmentPoints = [
  "Evidence-led product development",
  "Qualified specialist consultation",
  "Privacy-conscious patient experience",
];

export default function AboutHero() {
  return (
    <section className="qyx-about-hero" aria-labelledby="qyx-about-title">
      <div className="qyx-about-container qyx-about-hero__grid">
        <div className="qyx-about-hero__content">
          <span className="qyx-about-eyebrow">ABOUT QYX MEDTECH</span>
          <h1 id="qyx-about-title">
            Built around better questions in male fertility.
          </h1>
          <p>
            QYX MedTech is developing a male-fertility device concept while
            building a clear educational platform and a private route to
            online specialist care.
          </p>

          <div className="qyx-about-hero__actions">
            <a className="qyx-about-button qyx-about-button--primary" href="#our-story">
              Explore our approach
            </a>
            <a className="qyx-about-button qyx-about-button--secondary" href="#our-team">
              Meet the team functions
            </a>
          </div>
        </div>

        <aside className="qyx-about-status-card" aria-label="Device development status">
          <span className="qyx-about-status-card__badge">UNDER DEVELOPMENT</span>
          <h2>Carefully developing, clearly communicating.</h2>
          <p>
            The device is not currently offered for purchase or diagnosis.
            Product claims and clinical information will require appropriate
            evidence and review before publication.
          </p>

          <ul>
            {developmentPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
