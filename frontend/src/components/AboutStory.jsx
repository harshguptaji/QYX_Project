const journeySteps = [
  {
    number: "01",
    title: "Learn",
    description: "Understand the basics without unsupported promises.",
  },
  {
    number: "02",
    title: "Prepare",
    description: "Organise questions, records and consultation details.",
  },
  {
    number: "03",
    title: "Connect",
    description: "Speak privately with an appropriately qualified doctor.",
  },
];

export default function AboutStory() {
  return (
    <section className="qyx-about-story" id="our-story" aria-labelledby="qyx-story-title">
      <div className="qyx-about-container qyx-about-story__grid">
        <header>
          <span className="qyx-about-section-label">OUR STARTING POINT</span>
          <h2 id="qyx-story-title">
            Make a sensitive subject easier to understand.
          </h2>
        </header>

        <div className="qyx-about-story__content">
          <p>
            Male fertility can feel complex, private and difficult to discuss.
            QYX begins with clear education: helping people understand common
            fertility terms, prepare useful questions and recognise when
            professional guidance may help.
          </p>
          <p>
            Alongside education, the platform connects people with online
            video consultations. Patients can review a doctor&apos;s verified
            information, select an available time, share relevant background
            and meet privately from home.
          </p>

          <div className="qyx-about-story__steps">
            {journeySteps.map((step) => (
              <article key={step.number}>
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
