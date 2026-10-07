import { ShieldCheck, Video } from "lucide-react";

import "../style/DoctorsUpperSection.css";

export default function DoctorsUpperSection() {
  const sectionData = {
    eyebrow: "PRIVATE ONLINE CARE",

    title: "Choose the right",
    highlightedTitle: "fertility specialist.",

    description:
      "Compare doctors by expertise, experience, languages, consultation fees and availability. Every appointment takes place through a private video consultation.",

    consultation: {
      title: "Video consultation only",
      description: "Secure specialist care from home",
      duration: "30 minutes",
    },

    features: [
      "Private consultation",
      "Transparent pricing",
      "Flexible time slots",
    ],
  };

  const scrollToDoctors = () => {
    document
      .getElementById("doctor-directory")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  return (
    <section
      className="doctors-upper"
      aria-labelledby="doctors-upper-title"
    >
      <div className="doctors-upper__container">
        <div className="doctors-upper__content">
          <p className="doctors-upper__eyebrow">
            {sectionData.eyebrow}
          </p>

          <h1
            className="doctors-upper__title"
            id="doctors-upper-title"
          >
            {sectionData.title}{" "}
            <span>
              {sectionData.highlightedTitle}
            </span>
          </h1>

          <p className="doctors-upper__description">
            {sectionData.description}
          </p>

          <button
            className="doctors-upper__button"
            type="button"
            onClick={scrollToDoctors}
          >
            View available doctors
            <span aria-hidden="true">→</span>
          </button>

          <ul
            className="doctors-upper__features"
            aria-label="Booking benefits"
          >
            {sectionData.features.map((feature) => (
              <li key={feature}>
                <ShieldCheck aria-hidden="true" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <aside
          className="doctors-upper__consultation"
          aria-label="Consultation information"
        >
          <div className="doctors-upper__consultation-icon">
            <Video aria-hidden="true" />
          </div>

          <div className="doctors-upper__consultation-content">
            <strong>
              {sectionData.consultation.title}
            </strong>

            <span>
              {sectionData.consultation.description}
            </span>
          </div>

          <span className="doctors-upper__duration">
            {sectionData.consultation.duration}
          </span>
        </aside>
      </div>
    </section>
  );
}