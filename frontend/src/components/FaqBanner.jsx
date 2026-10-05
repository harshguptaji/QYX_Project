import {
  BookOpenText,
  Check,
  ShieldCheck,
  Video,
} from "lucide-react";

const bannerHighlights = [
  {
    id: 1,
    title: "Answers",
    description: "Common patient questions",
    icon: BookOpenText,
  },
  {
    id: 2,
    title: "Education first",
    description: "Plain-language information",
    icon: ShieldCheck,
  },
  {
    id: 3,
    title: "Private care",
    description: "Online specialist support",
    icon: Video,
  },
];

const carePoints = [
  "Clear fertility education",
  "Private online consultations",
  "Transparent appointment pricing",
];

export default function FaqBanner() {
  return (
    <section
      className="faq-banner"
      aria-labelledby="faq-page-title"
    >
      <div className="faq-banner__container">
        <div className="faq-banner__content">
          <span className="faq-banner__eyebrow">
            Clear answers. Private support.
          </span>

          <h1 id="faq-page-title">
            Questions about fertility care,
            answered.
          </h1>

          <p>
            Find clear information about male fertility
            education, online doctor appointments, payments,
            privacy and QYX MedTech&apos;s developing device
            concept.
          </p>

          <div
            className="faq-banner__highlights"
            aria-label="FAQ page coverage"
          >
            {bannerHighlights.map((highlight) => {
              const Icon = highlight.icon;

              return (
                <article key={highlight.id}>
                  <Icon aria-hidden="true" />

                  <span>
                    <strong>{highlight.title}</strong>
                    <small>{highlight.description}</small>
                  </span>
                </article>
              );
            })}
          </div>
        </div>

        <aside
          className="faq-banner__panel"
          aria-label="QYX care information"
        >
          <span className="faq-banner__panel-label">
            QYX CARE
          </span>

          <h2>
            Education and specialist support in one place.
          </h2>

          <ul>
            {carePoints.map((point) => (
              <li key={point}>
                <span aria-hidden="true">
                  <Check />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
