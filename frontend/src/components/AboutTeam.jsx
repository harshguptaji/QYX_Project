const teamFunctions = [
  {
    number: "01",
    name: "Name - 1",
    title: "Product & Research",
    description:
      "Translates user needs, scientific questions and development constraints into a focused product roadmap.",
    skills: ["Product strategy", "Research planning"],
  },
  {
    number: "02",
    name: "Name - 2",
    title: "Clinical Advisory",
    description:
      "Guides medical content, patient questions and the boundaries between education and clinical care.",
    skills: ["Clinical review", "Care standards"],
  },
  {
    number: "03",
    name: "Name - 3",
    title: "Engineering & Data",
    description:
      "Builds the digital experience, appointment tools and secure foundations needed for responsible growth.",
    skills: ["Platform design", "Data protection"],
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
