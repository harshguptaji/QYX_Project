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

const emptyContact = {
  email: "",
  phone: "",
  purpose: "",
};

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
  const phoneRef = useRef(null);
  const purposeRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [contact, setContact] = useState({ ...emptyContact });
  const [error, setError] = useState({
    field: "",
    message: "",
  });

  const totalSteps = questions.length + 1;
  const isQuestion = step < questions.length;
  const isContact = step === questions.length;
  const isResult = step === totalSteps;

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
    if (open) {
      headingRef.current?.focus();
    }
  }, [open, step]);

  const clearError = () => {
    setError({ field: "", message: "" });
  };

  const startQuiz = () => {
    setStep(0);
    setAnswers([]);
    setContact({ ...emptyContact });
    clearError();
    setOpen(true);

    if (!dialogRef.current?.open) {
      dialogRef.current?.showModal();
    }
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
    clearError();
  };

  const goBack = () => {
    setStep((previous) => Math.max(0, previous - 1));
    clearError();
  };

  const updateContact = (event) => {
    const { name, value } = event.target;

    setContact((previous) => ({
      ...previous,
      [name]: value,
    }));

    clearError();
  };

  const submitContact = (event) => {
    event.preventDefault();

    const email = contact.email.trim();
    const phone = contact.phone.trim();
    const purpose = contact.purpose.trim();
    const digits = phone.replace(/\D/g, "");

    if (
      !/^[+]?[\d\s()-]+$/.test(phone) ||
      digits.length < 10 ||
      digits.length > 15
    ) {
      setError({
        field: "phone",
        message:
          "Please enter a valid phone number with country code if needed.",
      });

      phoneRef.current?.focus();
      return;
    }

    if (!purpose) {
      setError({
        field: "purpose",
        message: "Please enter your purpose of visiting.",
      });

      purposeRef.current?.focus();
      return;
    }

    const submission = {
      email,
      phone,
      purpose,
      answers,
    };

    setContact({ email, phone, purpose });
    clearError();

    // Connect your backend here to save `submission`.
    // These details currently remain in component state.
    // Example payload:
    // { email, phone, purpose, answers }

    setStep(totalSteps);
  };

  return (
    <>
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
          if (event.target !== event.currentTarget) return;

          const bounds = event.currentTarget.getBoundingClientRect();

          const clickedOutside =
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom;

          if (clickedOutside) closeQuiz();
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
                      ? `Question ${step + 1} of ${questions.length}`
                      : "One last step"}
                  </span>

                  <span>YOUR NEXT STEP</span>
                </div>

                <div
                  className="qyx-quiz__progress"
                  role="progressbar"
                  aria-label="Quiz progress"
                  aria-valuemin={0}
                  aria-valuemax={totalSteps}
                  aria-valuenow={step}
                >
                  <span
                    style={{
                      width: `${(step / totalSteps) * 100}%`,
                    }}
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
                    Enter your email, phone number, and purpose of
                    visiting to view your personalized summary.
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
                      onChange={updateContact}
                    />

                    <label htmlFor="qyx-quiz-phone">
                      Phone number
                    </label>

                    <input
                      ref={phoneRef}
                      id="qyx-quiz-phone"
                      type="tel"
                      name="phone"
                      autoComplete="tel"
                      placeholder="+91 98765 43210"
                      maxLength={25}
                      required
                      value={contact.phone}
                      onChange={updateContact}
                      aria-invalid={error.field === "phone"}
                      aria-describedby={
                        error.field === "phone"
                          ? "qyx-quiz-error"
                          : undefined
                      }
                    />

                    <label htmlFor="qyx-quiz-purpose">
                      Purpose of visiting
                    </label>

                    <textarea
                      ref={purposeRef}
                      id="qyx-quiz-purpose"
                      name="purpose"
                      placeholder="Tell us what you would like help with."
                      rows={3}
                      maxLength={500}
                      required
                      value={contact.purpose}
                      onChange={updateContact}
                      aria-invalid={error.field === "purpose"}
                      aria-describedby={
                        error.field === "purpose"
                          ? "qyx-quiz-error"
                          : undefined
                      }
                    />

                    {error.message && (
                      <p
                        id="qyx-quiz-error"
                        className="qyx-quiz__error"
                        role="alert"
                      >
                        {error.message}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="qyx-quiz__primary"
                    >
                      View my summary
                      <span aria-hidden="true">→</span>
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
              A starting point for a conversation, not a fertility
              diagnosis.
            </footer>
          </div>
        )}
      </dialog>
    </>
  );
}