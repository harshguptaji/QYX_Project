import "../style/SpecialistsHero.css";

const steps = [
  {
    title: "Share Privately",
    detail:
      "Complete a short, confidential intake — no clinic branding, no account visible to anyone else.",
  },
  {
    title: "Get Matched",
    detail:
      "QYX matches you with a verified specialist suited to your concern and availability.",
  },
  {
    title: "Confirm Your Slot",
    detail:
      "Pick a time that works for you; receive a private, discreet confirmation.",
  },
  {
    title: "Consult",
    detail:
      "Meet your specialist on video or chat, from wherever you’re comfortable.",
  },
  {
    title: "Follow Up",
    detail:
      "Book a follow-up with the same specialist, or close the loop — entirely your choice.",
  },
];

export default function HowItWorks() {
  return (
    <section
      className="qyx-how"
      aria-labelledby="qyx-how-title"
    >
      <div className="qyx-how__container">
        <header className="qyx-how__header">
          <span className="qyx-journey-eyebrow">
            HOW IT WORKS
          </span>

          <h2 id="qyx-how-title">
            One private conversation.
            <br />
            A clearer way forward.
          </h2>

          <p>
            From your first question to your follow-up, take each
            step at your own pace.
          </p>
        </header>

        <div className="qyx-how__layout">
          <ol className="qyx-how__steps">
            {steps.map((step, index) => (
              <li className="qyx-how__step" key={step.title}>
                <span
                  className="qyx-how__number"
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="qyx-how__step-content">
                  <h3>{step.title}</h3>
                  <p>{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>

          <aside
            className="qyx-how__visual"
            aria-label="Start your consultation journey"
          >
            <div className="qyx-how__orbit" aria-hidden="true" />

            <div className="qyx-how__consultation">
              <div className="qyx-how__card-top">
                <span className="qyx-how__brand">
                  QYX<span>.</span>
                </span>

                <span className="qyx-how__private">
                  <LockIcon />
                  Private care
                </span>
              </div>

              <div className="qyx-how__avatar">
                <DoctorIcon />
              </div>

              <span className="qyx-how__card-eyebrow">
                YOUR NEXT CHAPTER
              </span>

              <h3>
                Real specialists.
                <br />
                Space to talk.
              </h3>

              <p>
                Ask your questions, explore your options, and
                decide what comes next.
              </p>

              <div className="qyx-how__formats">
                <span>
                  <VideoIcon />
                  Video
                </span>
                <span>
                  <ChatIcon />
                  Chat
                </span>
              </div>

              <a href="/doctors" className="qyx-how__cta">
                Find your specialist
                <span aria-hidden="true">↗</span>
              </a>
            </div>

            <div className="qyx-how__note">
              <span aria-hidden="true">✓</span>
              Your journey. Your choice.
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function LockIcon() {
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
      <rect x="5" y="10" width="14" height="11" rx="3" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      <path d="M12 14v3" />
    </svg>
  );
}

function DoctorIcon() {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="32" cy="20" r="10" />
      <path d="M12 55v-6c0-10 9-17 20-17s20 7 20 17v6" />
      <path d="m25 34 7 9 7-9M32 43v12" />
      <path d="M21 37v9a5 5 0 0 0 10 0v-3" />
      <circle cx="43" cy="47" r="3" />
      <path d="M43 36v8" />
    </svg>
  );
}

function VideoIcon() {
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
      <rect x="3" y="6" width="12" height="12" rx="3" />
      <path d="m15 10 6-3v10l-6-3" />
    </svg>
  );
}

function ChatIcon() {
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
      <path d="M20 11a8 8 0 0 1-8 8H4l-2 3V11a9 9 0 0 1 18 0Z" />
      <path d="M7 9h8M7 13h5" />
    </svg>
  );
}