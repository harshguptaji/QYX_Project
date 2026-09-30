import "../style/HowQYXWorks.css";

const steps = [
  {
    number: "01",
    title: "Verified Specialist",
    description:
      "Every doctor in the directory is credential checked before they accept consultation.",
  },
  {
    number: "02",
    title: "Private Consultations",
    description:
      "Video or chat, from home with no clinic visit required.",
  },
  {
    number: "03",
    title: "Ongoing Care",
    description:
      "Book follow-ups, keep private notes, and revesit past consultations in one place.",
  },
  {
    number: "04",
    title: "Home Testing - Coming Soon",
    description:
      "A QYX device that tracks sperm health over time and sync with specialist.",
  },
];

const HowQYXWorks = () => {
  return (
    <section className="how-qyx-works" aria-labelledby="how-qyx-title">
      <div className="how-qyx-container">
        <div className="how-qyx-heading">
          <span className="how-qyx-eyebrow">HOW QYX WORKS</span>
          <h2 id="how-qyx-title">
            Not a single call. A fertlity care relationship that stays with you.
          </h2>
          <p>
            One private profile. Unlimited follow-ups with the specialist you trust. A confidential history you control ans soon, testing data feeding directly into it.
          </p>
        </div>

        <ol className="how-qyx-steps">
          {steps.map((step) => (
            <li className="how-qyx-step" key={step.number}>
              <div className="how-qyx-step-number" aria-hidden="true">
                {step.number}
              </div>

              <span className="how-qyx-step-label">
                STEP {Number(step.number)}
              </span>

              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>

        <a href="/consultation" className="how-qyx-button">
          Start a Private Conversation
          <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  );
};

export default HowQYXWorks;