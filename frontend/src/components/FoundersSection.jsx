import founderOne from "../assets/founder.png";
import founderTwo from "../assets/co_founder.png";
import "../style/FoundersSection.css";

const founders = [
  {
    name: "Founder Name",
    role: "Co-founder & CEO",
    image: founderOne,
  },
  {
    name: "Founder Name",
    role: "Co-founder",
    image: founderTwo,
  },
];

const FoundersSection = () => {
  return (
    <section
      className="qyx-founders-section"
      aria-labelledby="qyx-founders-title"
    >
      <div className="qyx-founders-panel">
        <span className="qyx-founders-label">THE PEOPLE BEHIND QYX</span>

        <h2 id="qyx-founders-title">Meet our co-founders.</h2>

        <div className="qyx-founders-grid">
          {founders.map((founder, index) => (
            <article className="qyx-founder" key={index}>
              <div className="qyx-founder-portrait">
                <img
                  src={founder.image}
                  alt={founder.name}
                  loading="lazy"
                />
              </div>

              <h3>{founder.name}</h3>
              <p>{founder.role}</p>
            </article>
          ))}
        </div>

        {/* <a href="/about" className="qyx-founders-link">
          Meet the team
          <span aria-hidden="true">→</span>
        </a> */}
      </div>
    </section>
  );
};

export default FoundersSection;