import { Link } from "react-router-dom";

const teamMembers = [
  {
    number: "01",
    name: "Kamal A. Rachuri",
    title: "ML & CV Engineer",
    description:
      "VIT, IIT Madras. Works on the computer vision pipeline and model training.",
    skills: ["Machine Learning", "Model Training"],
  },
  {
    number: "02",
    name: "Abhishek Dixit",
    title: "Product Lead",
    description:
      "Works on AI, technical strategy, and business engagement.",
    skills: ["Artificial Intelligence", "Product Strategy"],
  },
  {
    number: "03",
    name: "Harsh Gupta",
    title: "Full Stack Engineer",
    description:
      "B.Tech in Computer Science with expertise in the MERN stack, developing the consultation platform.",
    skills: ["MERN Stack", "JavaScript"],
  },
];

export default function AboutTeam() {
  return (
    <section
      className="qyx-about-team"
      id="our-team"
      aria-labelledby="qyx-team-title"
    >
      <div className="qyx-about-container">
        <header className="qyx-about-team__header">
          <span className="qyx-about-section-label">
            THE TEAM BEHIND THE EXPERIENCE
          </span>

          <h2 id="qyx-team-title">
            Different disciplines, one responsible direction.
          </h2>

          <p>
            Meet the people bringing together technology, product, and
            care to build a more supportive fertility experience.
          </p>
        </header>

        <div className="qyx-about-team__grid">
          {teamMembers.map((member) => (
            <article
              className="qyx-about-team__card"
              key={member.number}
            >
              <div className="qyx-about-team__card-top">
                <span>{member.number}</span>
                <small>{member.name}</small>
              </div>

              <h3>{member.title}</h3>
              <p>{member.description}</p>

              <ul aria-label={`${member.name}'s skills`}>
                {member.skills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="qyx-about-team__career">
          <div className="qyx-about-team__career-content">
            <span>GROW WITH QYX</span>

            <h3>Want to be part of our journey?</h3>

            <p>
              We’re building a thoughtful team around a shared purpose.
              Explore our careers page and tell us how you’d like to
              contribute.
            </p>
          </div>

          <Link
            to="/career"
            className="qyx-about-team__career-button"
          >
            Explore Careers
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}