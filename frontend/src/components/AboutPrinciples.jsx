import { Link } from "react-router-dom";

const principles = [
  {
    number: "01",
    title: "Explain before asking",
    description:
      "Use plain language, clear consent and enough context for people to understand the next step.",
  },
  {
    number: "02",
    title: "Protect private moments",
    description:
      "Collect only relevant information and design sensitive interactions around controlled access.",
  },
  {
    number: "03",
    title: "Separate concepts from claims",
    description:
      "Clearly distinguish educational content and developing ideas from verified medical or product claims.",
  },
];

export default function AboutPrinciples() {
  return (
    <section className="qyx-about-principles" aria-labelledby="qyx-principles-title">
      <div className="qyx-about-container">
        <header className="qyx-about-principles__header">
          <span className="qyx-about-section-label">HOW WE WORK</span>
          <h2 id="qyx-principles-title">Clarity, care and responsible progress.</h2>
          <p>
            These principles guide the educational experience, product
            development and online consultation journey.
          </p>
        </header>

        <div className="qyx-about-principles__grid">
          {principles.map((principle) => (
            <article key={principle.number}>
              <span>{principle.number}</span>
              <h3>{principle.title}</h3>
              <p>{principle.description}</p>
            </article>
          ))}
        </div>

        <div className="qyx-about-care-card">
          <div>
            <small>PRIVATE ONLINE CARE</small>
            <h2>Ready to speak with a specialist?</h2>
            <p>
              Review verified doctor information, transparent pricing and
              available appointment times before booking.
            </p>
          </div>
          <Link to="/doctors">View doctors</Link>
        </div>
      </div>
    </section>
  );
}
