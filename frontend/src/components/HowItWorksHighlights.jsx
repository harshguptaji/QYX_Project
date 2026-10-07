import "../style/HowItWorksHighlights.css";

const highlights = [
  {
    title: "Specialists, with context.",
    description: "Share your concern before the conversation.",
  },
  {
    title: "A consultation that fits.",
    description: "Choose a suitable slot for video or chat.",
  },
  {
    title: "Your next step, your choice.",
    description: "Continue with follow-up care when you need it.",
  },
];

const HowItWorksHighlights = () => {
  return (
    <section
      className="qyx-how-highlights"
      aria-label="The QYX approach to care"
    >
      <ul className="qyx-how-highlights__container">
        {highlights.map((item) => (
          <li className="qyx-how-highlights__item" key={item.title}>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default HowItWorksHighlights;