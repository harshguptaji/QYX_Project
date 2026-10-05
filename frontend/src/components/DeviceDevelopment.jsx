const deviceSteps = [
  {
    number: "01",
    title: "Prepare privately",
    description:
      "Follow guided instructions designed to support consistent, discreet sample preparation.",
  },
  {
    number: "02",
    title: "Capture observations",
    description:
      "The developing system is intended to observe selected semen-analysis indicators within its validated scope.",
  },
  {
    number: "03",
    title: "Organise the information",
    description:
      "Present results in plain language, with limitations and guidance on what the information may mean.",
  },
  {
    number: "04",
    title: "Discuss with a doctor",
    description:
      "Use the information to prepare questions for a qualified fertility specialist—not as a self-diagnosis.",
  },
];

const potentialBenefits = [
  {
    number: "01",
    title: "Greater privacy",
    description:
      "A more comfortable first step for people hesitant to begin a fertility conversation.",
  },
  {
    number: "02",
    title: "Clearer preparation",
    description:
      "Guided information that helps patients arrive at a consultation with better questions.",
  },
  {
    number: "03",
    title: "Easier access",
    description:
      "A possible route to early information without replacing laboratory testing or specialist care.",
  },
  {
    number: "04",
    title: "Connected care",
    description:
      "Relevant context that may support a more focused online discussion with a doctor.",
  },
];

export default function DeviceDevelopment() {
  return (
    <section
      className="qyx-about-device"
      id="device-development"
      aria-labelledby="qyx-device-title"
    >
      <div className="qyx-about-container">
        <header className="qyx-about-device__header">
          <div>
            <span className="qyx-about-section-label">DEVICE IN DEVELOPMENT</span>
            <h2 id="qyx-device-title">
              From a private sample to a clearer conversation.
            </h2>
          </div>
          <p>
            QYX is developing a guided male-fertility device concept intended
            to make early information easier to collect, understand and discuss
            with a qualified doctor. The final workflow, measurements and claims
            remain subject to technical and clinical validation.
          </p>
        </header>

        <div className="qyx-about-device__layout">
          <article className="qyx-about-device__workflow">
            <div className="qyx-about-device__workflow-heading">
              <h3>How the intended experience may work</h3>
              <span>CONCEPT WORKFLOW</span>
            </div>

            <div className="qyx-about-device__steps">
              {deviceSteps.map((step) => (
                <div className="qyx-about-device__step" key={step.number}>
                  <span>{step.number}</span>
                  <h4>{step.title}</h4>
                  <p>{step.description}</p>
                </div>
              ))}
            </div>

            <p className="qyx-about-device__notice">
              This section describes the intended direction of a product still
              in development. It is not currently available for clinical use,
              diagnosis or treatment decisions.
            </p>
          </article>

          <aside className="qyx-about-benefits" aria-labelledby="qyx-benefits-title">
            <h3 id="qyx-benefits-title">Potential benefits</h3>
            <p>
              Subject to successful validation and regulatory requirements,
              the concept is being explored to support:
            </p>

            <ul>
              {potentialBenefits.map((benefit) => (
                <li key={benefit.number}>
                  <span>{benefit.number}</span>
                  <div>
                    <strong>{benefit.title}</strong>
                    <small>{benefit.description}</small>
                  </div>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
