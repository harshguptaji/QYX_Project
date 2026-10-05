import "../style/SpecialistsHero.css";

export default function SpecialistsHero() {
  return (
    <section
      className="qyx-specialists-hero"
      aria-labelledby="qyx-specialists-title"
    >
      <div className="qyx-specialists-hero__container">
        <span className="qyx-journey-eyebrow">
          MEET OUR SPECIALISTS
        </span>

        <h1 id="qyx-specialists-title">
          Every specialist here has been checked,
          <span> so you don’t have to.</span>
        </h1>

        <p>
          Browse verified male fertility specialists by focus area
          and experience, then book a private consultation directly.
        </p>

        <div className="qyx-specialists-hero__tags">
          <span>
            <CheckIcon />
            Verified specialists
          </span>

          <span>
            <CheckIcon />
            Male fertility focus
          </span>

          <span>
            <CheckIcon />
            Private consultations
          </span>
        </div>
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.5 2.5L16 9" />
    </svg>
  );
}