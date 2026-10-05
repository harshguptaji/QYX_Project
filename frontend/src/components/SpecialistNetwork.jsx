import { useState } from "react";
import "../style/SpecialistNetwork.css";

const slides = [
  {
    label: "WHY JOIN",
    title: "Reach patients earlier.",
    description:
      "Bring your expertise closer to the people who need it, with a consultation experience built around your practice.",
    items: [
      {
        title: "Earlier referrals",
        text: "Connect with patients earlier in their fertility journey.",
      },
      {
        title: "Context before the consultation",
        text: "Review pre-populated patient intake before your first conversation.",
      },
      {
        title: "Flexible scheduling",
        text: "Offer tele-consultation slots that fit around your practice.",
      },
    ],
  },
  {
    label: "HOW CONSULTATIONS WORK",
    title: "From intake to conversation.",
    description:
      "A straightforward consultation journey, with patient context available before you meet.",
    items: [
      {
        title: "Patient shares intake",
        text: "The patient completes an intake describing their concerns and goals.",
      },
      {
        title: "Specialist reviews",
        text: "Review the shared context before the consultation.",
      },
      {
        title: "Consultation booked in-app",
        text: "Meet your patient through a scheduled video or chat consultation.",
      },
    ],
  },
  {
    label: "CREDENTIALING",
    title: "Build trust from the start.",
    description:
      "Credential verification and patient feedback help people make an informed choice.",
    items: [
      {
        title: "Verification process",
        text: "Submit your professional credentials for review by the QYX team.",
      },
      {
        title: "Required qualifications",
        text: "Share your medical registration, relevant qualifications, and experience for assessment.",
      },
      {
        title: "Patient reviews and ratings",
        text: "Help patients understand your consultation experience through feedback.",
      },
    ],
  },
];

export default function SpecialistNetwork() {
  const [activeIndex, setActiveIndex] = useState(0);

  const moveSlide = (direction) => {
    setActiveIndex((previous) =>
      (previous + direction + slides.length) % slides.length
    );
  };

  return (
    <section
      className="qyx-network"
      aria-labelledby="qyx-network-title"
    >
      <div className="qyx-network__container">
        <header className="qyx-network__header">
          <span className="qyx-network__eyebrow">
            FOR MALE FERTILITY SPECIALISTS
          </span>

          <h2 id="qyx-network-title">
            Extend your practice into
            <span> your patients’ homes.</span>
          </h2>

          <p>
            Join the QYX specialist network and reach patients
            earlier — before stigma turns a routine concern into
            a delayed diagnosis.
          </p>
        </header>

        <div
          className="qyx-network__carousel"
          role="region"
          aria-roledescription="carousel"
          aria-label="Specialist network benefits"
        >
          <button
            className="qyx-network__arrow qyx-network__arrow--previous"
            type="button"
            onClick={() => moveSlide(-1)}
            aria-label="Previous slide"
          >
            <ArrowIcon direction="left" />
          </button>

          <div className="qyx-network__stage">
            {slides.map((slide, index) => {
              const position =
                (index - activeIndex + slides.length) %
                slides.length;

              const isActive = position === 0;

              return (
                <article
                  key={slide.label}
                  className={`qyx-network__card qyx-network__card--${position}`}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${index + 1} of ${slides.length}: ${slide.label}`}
                  aria-hidden={!isActive}
                >
                  <div className="qyx-network__card-top">
                    <span>{slide.label}</span>
                    <span aria-hidden="true">
                      0{index + 1}
                    </span>
                  </div>

                  <div className="qyx-network__card-body">
                    <div
                      className="qyx-network__symbol"
                      aria-hidden="true"
                    >
                      <NetworkIcon index={index} />
                    </div>

                    <h3>{slide.title}</h3>
                    <p>{slide.description}</p>

                    <ol className="qyx-network__list">
                      {slide.items.map((item, itemIndex) => (
                        <li key={item.title}>
                          <span
                            className="qyx-network__number"
                            aria-hidden="true"
                          >
                            {itemIndex + 1}
                          </span>

                          <div>
                            <h4>{item.title}</h4>
                            <p>{item.text}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                </article>
              );
            })}
          </div>

          <button
            className="qyx-network__arrow qyx-network__arrow--next"
            type="button"
            onClick={() => moveSlide(1)}
            aria-label="Next slide"
          >
            <ArrowIcon direction="right" />
          </button>
        </div>

        <div
          className="qyx-network__dots"
          aria-label="Choose a slide"
        >
          {slides.map((slide, index) => (
            <button
              key={slide.label}
              type="button"
              className={
                index === activeIndex ? "is-active" : ""
              }
              onClick={() => setActiveIndex(index)}
              aria-label={`Show ${slide.label.toLowerCase()}`}
              aria-current={
                index === activeIndex ? "true" : undefined
              }
            />
          ))}
        </div>

        <span
          className="qyx-network__sr-only"
          aria-live="polite"
          aria-atomic="true"
        >
          {slides[activeIndex].label}, slide {activeIndex + 1}
          {" "}of {slides.length}
        </span>

        <div className="qyx-network__application">
          <p>
            Bring your expertise.
            <span> We’ll help make the connection.</span>
          </p>

          <a
            href={`https://wa.me/917453898747?text=${encodeURIComponent(
                "Hello QYX team, I would like to apply to join the QYX Specialist Network as a doctor specializing in male fertility. Please share the eligibility requirements, credential verification process, and next steps to register. Thank you."
                )}`}
            className="qyx-network__apply"
          >
            Apply to Join the Specialist Network
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}

function ArrowIcon({ direction }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {direction === "left" ? (
        <path d="M19 12H5m7-7-7 7 7 7" />
      ) : (
        <path d="M5 12h14m-7-7 7 7-7 7" />
      )}
    </svg>
  );
}

function NetworkIcon({ index }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {index === 0 && (
        <>
          <circle cx="24" cy="16" r="6" />
          <path d="M13 36v-3a11 11 0 0 1 22 0v3" />
          <path d="M9 12H4v24h5M39 12h5v24h-5" />
        </>
      )}

      {index === 1 && (
        <>
          <rect x="5" y="11" width="26" height="26" rx="6" />
          <path d="m31 21 12-7v20l-12-7" />
          <path d="m12 24 4 4 8-9" />
        </>
      )}

      {index === 2 && (
        <>
          <path d="m24 5 15 6v12c0 9-7 15-15 20C16 38 9 32 9 23V11Z" />
          <path d="m16 24 5 5 11-12" />
        </>
      )}
    </svg>
  );
}