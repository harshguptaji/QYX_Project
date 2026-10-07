import "../style/FirstConsultation.css";

const preparationItems = [
  {
    number: "01",
    label: "YOUR SPACE",
    title: "Somewhere you can speak freely.",
    description:
      "Find a quiet corner, check your connection, and keep your device charged. Choose a place where you feel at ease.",
    note: "A little comfort makes room for conversation.",
  },
  {
    number: "02",
    label: "YOUR QUESTIONS",
    title: "Bring what’s on your mind.",
    description:
      "Write down what you’d like to understand. You can ask about your concerns, existing reports, or what happens next.",
    note: "You don’t have to know where to begin.",
  },
  {
    number: "03",
    label: "YOUR CONTEXT",
    title: "A little history. A fuller picture.",
    description:
      "Keep any relevant reports and your medication list nearby. Ask the team how to share documents before your appointment.",
    note: "Bring what you have. Ask about what you don’t.",
  },
];

const FirstConsultation = () => {
  return (
    <section
      className="qyx-first-consultation"
      id="qyx-first-consultation"
      aria-labelledby="qyx-first-consultation-title"
    >
      <div className="qyx-first-consultation__container">
        <div className="qyx-first-consultation__heading">
          <span className="qyx-first-consultation__eyebrow">
            YOUR FIRST CONSULTATION
          </span>

          <h2 id="qyx-first-consultation-title">
            Come as you are.
            <span>We’ll take it from there.</span>
          </h2>

          <p>
            You don’t need a diagnosis or the perfect words. A question,
            a concern, or a wish to understand more is enough to start.
          </p>
        </div>

        <div className="qyx-first-consultation__grid">
          {preparationItems.map((item) => (
            <article
              className="qyx-first-consultation__item"
              key={item.number}
            >
              <span className="qyx-first-consultation__item-label">
                {item.number} / {item.label}
              </span>

              <h3>{item.title}</h3>

              <p className="qyx-first-consultation__description">
                {item.description}
              </p>

              <p className="qyx-first-consultation__note">
                {item.note}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FirstConsultation;