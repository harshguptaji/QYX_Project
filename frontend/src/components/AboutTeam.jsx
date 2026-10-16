const teamFunctions = [
  {
    number: "01",
    name: "Kamal A. Rachuri",
    title: "ML & CV Engineer",
    description:
      "VIT, IIT Madras, Owns the CV Pipeline and modeling tarining.",
    skills: ["ML", "Model Training"],
  },
  {
    number: "02",
    name: "Abhishek Dixit",
    title: "Product Lead",
    description:
      "AI/Technical and business engagement strategy.",
    skills: ["Artificial Intelligence"],
  },
  {
    number: "03",
    name: "Harsh Gupta",
    title: "Full Stack Engineer",
    description:
      "B.Tech in CS, expertees in MERN Stack, and developing consultation platform.",
    skills: ["MERN", "JavaScript"],
  },
  {
    number: "04",
    name: "Name - 4",
    title: "Patient Experience",
    description:
      "Shapes clear communication and supportive journeys before, during and after a consultation.",
    skills: ["Care journey", "Patient support"],
  },
];

export default function AboutTeam() {
  return (
    <section className="qyx-about-team" id="our-team" aria-labelledby="qyx-team-title">
      <div className="qyx-about-container">
        <header className="qyx-about-team__header">
          <span className="qyx-about-section-label">THE TEAM BEHIND THE EXPERIENCE</span>
          <h2 id="qyx-team-title">
            Different disciplines, one responsible direction.
          </h2>
          <p>
            This prototype uses team functions rather than unverified
            individual profiles. Replace these cards with confirmed names,
            photographs and credentials before launch.
          </p>
        </header>

        <div className="qyx-about-team__grid">
          {teamFunctions.map((team) => (
            <article className="qyx-about-team__card" key={team.number}>
              <div className="qyx-about-team__card-top">
                <span>{team.number}</span>
                <small>{team.name}</small>
              </div>
              <h3>{team.title}</h3>
              <p>{team.description}</p>
              <ul>
                {team.skills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        {/* <div className="qyx-about-team__verification">
          <span aria-hidden="true">i</span>
          <p>
            <strong>Before publishing real team profiles:</strong> verify
            professional qualifications, registration information, role
            descriptions, photographs and consent for public display.
          </p>
        </div> */}
      </div>
    </section>
  );
}
