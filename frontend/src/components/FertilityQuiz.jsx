import { useEffect, useRef, useState } from "react";
import "../style/FertilityQuiz.css";

const questions = [
  {
    title: "What brings you here today?",
    subtitle: "Choose the option that feels closest to your situation.",
    options: [
      "Understand my fertility",
      "Plan for a pregnancy",
      "Discuss a fertility concern",
      "Get a second opinion",
    ],
  },
  {
    title: "Where are you in your journey?",
    subtitle: "There is no right or wrong answer.",
    options: [
      "Just exploring",
      "Planning to start trying",
      "Currently trying for a pregnancy",
      "Already receiving fertility care",
    ],
  },
  {
    title: "Have you had a semen analysis?",
    subtitle: "This helps us understand what you would like to discuss.",
    options: [
      "Not yet",
      "Yes, and I understand the report",
      "Yes, but I need help understanding it",
      "Prefer not to say",
    ],
  },
  {
    title: "What would you like support with?",
    subtitle: "Select your main priority.",
    options: [
      "Understanding tests and reports",
      "Discussing lifestyle questions",
      "Exploring care options",
      "Knowing where to start",
    ],
  },
  {
    title: "How would you prefer to meet a doctor?",
    subtitle: "Choose the consultation format you prefer.",
    options: [
      "Video consultation",
      "In-person appointment",
      "Either works for me",
      "I would like to learn more first",
    ],
  },
];

function getResult(answers) {
  if (answers[2] === 2) {
    return [
      "Your next step could be a guided review of your semen analysis.",
      "A male fertility specialist can explain your report and discuss your questions.",
    ];
  }

  if (answers[0] === 3) {
    return [
      "You’re looking for another perspective on your fertility care.",
      "A specialist can review your history and help you understand your options.",
    ];
  }

  if (answers[3] === 1) {
    return [
      "You’re interested in how lifestyle relates to your fertility journey.",
      "A specialist can discuss your habits, concerns, and appropriate next steps.",
    ];
  }

  return [
    "You’re ready to understand your fertility journey more clearly.",
    "A male fertility specialist can discuss your goals and help you plan your next step.",
  ];
}

export default function FertilityQuiz() {
  const dialogRef = useRef(null);
  const headingRef = useRef(null);
  const triggerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [contact, setContact] = useState({
    email: "",
    phone: "",
  });
  const [error, setError] = useState("");

  const isQuestion = step < questions.length;
  const isContact = step === questions.length;
  const isResult = step === questions.length + 1;
  const question = questions[step];
  const result = getResult(answers);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (open) headingRef.current?.focus();
  }, [open, step]);

  const startQuiz = () => {
    setStep(0);
    setAnswers([]);
    setContact({ email: "", phone: "" });
    setError("");
    setOpen(true);
    dialogRef.current?.showModal();
  };

  const closeQuiz = () => {
    dialogRef.current?.close();
  };

  const handleClosed = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const selectOption = (optionIndex) => {
    setAnswers((previous) => {
      const updated = previous.slice(0, step);
      updated[step] = optionIndex;
      return updated;
    });

    setStep((previous) => previous + 1);
    setError("");
  };

  const goBack = () => {
    setStep((previous) => Math.max(0, previous - 1));
    setError("");
  };

  const submitContact = (event) => {
    event.preventDefault();

    const email = contact.email.trim();
    const phone = contact.phone.trim();
    const digits = phone.replace(/\D/g, "");

    if (
      !/^[+]?[\d\s()-]+$/.test(phone) ||
      digits.length < 10 ||
      digits.length > 15
    ) {
      setError("Please enter a valid phone number with country code if needed.");
      return;
    }

    setContact({ email, phone });
    setError("");

    // Add your API request here to save:
    // { email, phone, answers }
    // Move to the result after the request succeeds.

    setStep(questions.length + 1);
  };

  return (
    <>
      {/* <button
        ref={triggerRef}
        type="button"
        className="qyx-quiz-trigger"
        onClick={startQuiz}
      >
        Quiz
      </button> */}
      <button
  ref={triggerRef}
  type="button"
  className="hero-sec-btn"
  onClick={startQuiz}
>
  Quiz
</button>

      <dialog
        ref={dialogRef}
        className="qyx-quiz-dialog"
        aria-labelledby="qyx-quiz-title"
        onClose={handleClosed}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeQuiz();
        }}
      >
        {open && (
          <div className="qyx-quiz">
            <header className="qyx-quiz__header">
              <span className="qyx-quiz__logo">
                QYX<span>.</span>
              </span>

              <button
                type="button"
                className="qyx-quiz__close"
                onClick={closeQuiz}
                aria-label="Close quiz"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  aria-hidden="true"
                >
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </header>

            {!isResult && (
              <div className="qyx-quiz__progress-section">
                <div className="qyx-quiz__progress-label">
                  <span>
                    {isQuestion
                      ? `Question ${step + 1} of 5`
                      : "One last step"}
                  </span>
                  <span>YOUR NEXT STEP</span>
                </div>

                <div
                  className="qyx-quiz__progress"
                  role="progressbar"
                  aria-label="Quiz progress"
                  aria-valuemin={0}
                  aria-valuemax={6}
                  aria-valuenow={step}
                >
                  <span
                    style={{ width: `${(step / 6) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <div className="qyx-quiz__body" key={step}>
              {isQuestion && (
                <>
                  <span className="qyx-quiz__eyebrow">
                    A LITTLE ABOUT YOU
                  </span>

                  <h2
                    id="qyx-quiz-title"
                    ref={headingRef}
                    tabIndex={-1}
                  >
                    {question.title}
                  </h2>

                  <p className="qyx-quiz__subtitle">
                    {question.subtitle}
                  </p>

                  <div className="qyx-quiz__options">
                    {question.options.map((option, index) => (
                      <button
                        key={option}
                        type="button"
                        className={`qyx-quiz__option ${
                          answers[step] === index
                            ? "qyx-quiz__option--selected"
                            : ""
                        }`}
                        onClick={() => selectOption(index)}
                      >
                        <span className="qyx-quiz__option-letter">
                          {String.fromCharCode(65 + index)}
                        </span>

                        <span>{option}</span>

                        <span
                          className="qyx-quiz__option-arrow"
                          aria-hidden="true"
                        >
                          →
                        </span>
                      </button>
                    ))}
                  </div>

                  {step > 0 && (
                    <button
                      type="button"
                      className="qyx-quiz__back"
                      onClick={goBack}
                    >
                      ← Previous question
                    </button>
                  )}
                </>
              )}

              {isContact && (
                <>
                  <span className="qyx-quiz__eyebrow">
                    YOUR JOURNEY, YOUR NEXT STEP
                  </span>

                  <h2
                    id="qyx-quiz-title"
                    ref={headingRef}
                    tabIndex={-1}
                  >
                    Almost there.
                  </h2>

                  <p className="qyx-quiz__subtitle">
                    Enter your email and phone number to view your
                    personalized summary.
                  </p>

                  <form
                    className="qyx-quiz__form"
                    onSubmit={submitContact}
                  >
                    <label htmlFor="qyx-quiz-email">
                      Email address
                    </label>

                    <input
                      id="qyx-quiz-email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      maxLength={254}
                      required
                      value={contact.email}
                      onChange={(event) => {
                        setContact((previous) => ({
                          ...previous,
                          email: event.target.value,
                        }));
                        setError("");
                      }}
                    />

                    <label htmlFor="qyx-quiz-phone">
                      Phone number
                    </label>

                    <input
                      id="qyx-quiz-phone"
                      type="tel"
                      name="phone"
                      autoComplete="tel"
                      placeholder="+91 98765 43210"
                      maxLength={25}
                      required
                      value={contact.phone}
                      aria-invalid={Boolean(error)}
                      aria-describedby={
                        error ? "qyx-quiz-error" : undefined
                      }
                      onChange={(event) => {
                        setContact((previous) => ({
                          ...previous,
                          phone: event.target.value,
                        }));
                        setError("");
                      }}
                    />

                    {error && (
                      <p
                        id="qyx-quiz-error"
                        className="qyx-quiz__error"
                        role="alert"
                      >
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="qyx-quiz__primary"
                    >
                      View my summary <span aria-hidden="true">→</span>
                    </button>
                  </form>

                  <button
                    type="button"
                    className="qyx-quiz__back"
                    onClick={goBack}
                  >
                    ← Back to questions
                  </button>
                </>
              )}

              {isResult && (
                <div className="qyx-quiz__result">
                  <div
                    className="qyx-quiz__result-icon"
                    aria-hidden="true"
                  >
                    ✓
                  </div>

                  <span className="qyx-quiz__eyebrow">
                    YOUR PERSONALIZED SUMMARY
                  </span>

                  <h2
                    id="qyx-quiz-title"
                    ref={headingRef}
                    tabIndex={-1}
                  >
                    Let’s take the next step.
                  </h2>

                  <div className="qyx-quiz__result-copy">
                    <p>{result[0]}</p>
                    <p>{result[1]}</p>
                  </div>

                  <a
                    href="/doctors"
                    className="qyx-quiz__primary"
                  >
                    Connect with doctor
                    <span aria-hidden="true">↗</span>
                  </a>
                </div>
              )}
            </div>

            <footer className="qyx-quiz__footer">
              A starting point for a conversation, not a fertility diagnosis.
            </footer>
          </div>
        )}
      </dialog>
    </>
  );
}