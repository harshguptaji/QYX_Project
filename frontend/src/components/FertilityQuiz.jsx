import {
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import {
  fetchPublicQuiz,
  submitPublicQuiz,
  clearQuizError,
  resetQuiz,
} from "../features/quiz/quizSlice.js";

import "../style/FertilityQuiz.css";

const createEmptyContact = () => ({
  email: "",
  mobile: "",
  purposeOfVisiting: "",
  otherPurpose: "",
  contactConsent: false,
});

const PURPOSE_OPTIONS = [
  ["book_consultation", "Book a specialist consultation"],
  ["fertility_testing", "Understand fertility testing options"],
  ["general_information", "Get general information"],
  ["follow_up_support", "Seek follow-up support"],
  ["other", "Other"],
];

export default function FertilityQuiz() {
  const dispatch = useDispatch();
  const uniqueId = useId();

  const dialogRef = useRef(null);
  const headingRef = useRef(null);
  const triggerRef = useRef(null);
  const fetchRef = useRef(null);
  const submitLock = useRef(false);

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [contact, setContact] = useState(createEmptyContact);
  const [localError, setLocalError] = useState("");

  const {
    quiz,
    loading,
    submitting,
    responseId,
    error,
    validationErrors,
    needsRestart,
  } = useSelector((state) => state.quiz);

  const questions = [...(quiz?.questions ?? [])].sort(
    (a, b) => a.order - b.order
  );

  const totalSteps = questions.length + 1;
  const isResult = Boolean(responseId);
  const isQuestion =
    !isResult && step < questions.length;
  const isContact =
    !isResult && step === questions.length;

  const question = questions[step];
  const currentAnswer = question
    ? answers[question._id]
    : null;

  const ready = Boolean(
    quiz && questions.length > 0 && !loading
  );

  const titleId = `${uniqueId}-title`;
  const errorId = `${uniqueId}-error`;

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
  }, [open, step, ready, isResult]);

  useEffect(() => {
    return () => {
      fetchRef.current?.abort();
    };
  }, []);

  const clearErrors = () => {
    setLocalError("");
    dispatch(clearQuizError());
  };

  const loadQuiz = () => {
    fetchRef.current?.abort();

    dispatch(resetQuiz());
    setStep(0);
    setAnswers({});
    setContact(createEmptyContact());
    setLocalError("");

    fetchRef.current = dispatch(fetchPublicQuiz());
  };

  const startQuiz = () => {
    loadQuiz();
    setOpen(true);

    if (!dialogRef.current?.open) {
      dialogRef.current?.showModal();
    }
  };

  const closeQuiz = () => {
    if (submitLock.current) return;

    dialogRef.current?.close();
  };

  const handleClosed = () => {
    fetchRef.current?.abort();
    setOpen(false);
    triggerRef.current?.focus();
  };

  const selectOption = (optionId) => {
    clearErrors();

    setAnswers((previous) => {
      const selected =
        previous[question._id]?.selectedOptionIds ?? [];

      const selectedOptionIds =
        question.questionType === "multipleChoice"
          ? selected.includes(optionId)
            ? selected.filter((id) => id !== optionId)
            : [...selected, optionId]
          : [optionId];

      return {
        ...previous,
        [question._id]: {
          selectedOptionIds,
          textAnswer: "",
        },
      };
    });
  };

  const updateTextAnswer = (value) => {
    clearErrors();

    setAnswers((previous) => ({
      ...previous,
      [question._id]: {
        selectedOptionIds: [],
        textAnswer: value,
      },
    }));
  };

  const goNext = () => {
    const hasAnswer =
      question.questionType === "text"
        ? Boolean(currentAnswer?.textAnswer?.trim())
        : Boolean(currentAnswer?.selectedOptionIds?.length);

    if (question.isRequired && !hasAnswer) {
      setLocalError("Please answer this question to continue.");
      return;
    }

    clearErrors();
    setStep((previous) => previous + 1);
  };

  const goBack = () => {
    if (submitting) return;

    clearErrors();
    setStep((previous) => Math.max(0, previous - 1));
  };

  const updateContact = (event) => {
    const { name, value, type, checked } = event.target;

    setContact((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    clearErrors();
  };

  const submitContact = async (event) => {
    event.preventDefault();

    if (submitLock.current || submitting || needsRestart) {
      return;
    }

    clearErrors();

    const email = contact.email.trim();

    // Accept spaces, brackets and hyphens, then normalize.
    const rawMobile = contact.mobile.trim();
    const mobile = rawMobile.replace(/[\s()-]/g, "");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLocalError("Please enter a valid email address.");
      return;
    }

    if (
      !/^\+[\d\s()-]+$/.test(rawMobile) ||
      !/^\+[1-9]\d{7,14}$/.test(mobile)
    ) {
      setLocalError(
        "Enter your phone number with country code, for example +919876543210."
      );
      return;
    }

    if (!contact.purposeOfVisiting) {
      setLocalError("Please select your purpose of visiting.");
      return;
    }

    if (
      contact.purposeOfVisiting === "other" &&
      !contact.otherPurpose.trim()
    ) {
      setLocalError("Please describe your purpose of visiting.");
      return;
    }

    const submittedAnswers = questions
      .map((item) => ({
        questionId: item._id,
        selectedOptionIds:
          answers[item._id]?.selectedOptionIds ?? [],
        textAnswer:
          answers[item._id]?.textAnswer?.trim() ?? "",
      }))
      .filter(
        (answer) =>
          answer.selectedOptionIds.length > 0 ||
          answer.textAnswer.length > 0
      );

    if (submittedAnswers.length === 0) {
      setLocalError("Please answer at least one quiz question.");
      return;
    }

    submitLock.current = true;

    try {
      await dispatch(
        submitPublicQuiz({
          quizVersion: quiz.version,
          answers: submittedAnswers,
          email,
          mobile,
          purposeOfVisiting: contact.purposeOfVisiting,
          otherPurpose:
            contact.purposeOfVisiting === "other"
              ? contact.otherPurpose.trim()
              : "",
          contactConsent: contact.contactConsent,
        })
      ).unwrap();
    } catch {
      // Server errors are rendered from Redux.
    } finally {
      submitLock.current = false;
    }
  };

  const displayedError = localError || error;

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
        aria-labelledby={titleId}
        onClose={handleClosed}
        onCancel={(event) => {
          if (submitLock.current) {
            event.preventDefault();
          }
        }}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;

          const bounds =
            event.currentTarget.getBoundingClientRect();

          const clickedOutside =
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom;

          if (clickedOutside) closeQuiz();
        }}
      >
        {open && (
          <div className="qyx-quiz" aria-busy={loading || submitting}>
            <header className="qyx-quiz__header">
              <span className="qyx-quiz__logo">
                QYX<span>.</span>
              </span>

              <button
                type="button"
                className="qyx-quiz__close"
                onClick={closeQuiz}
                disabled={submitting}
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

            {ready && !isResult && (
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

            <div className="qyx-quiz__body">
              {loading && (
                <>
                  <h2 id={titleId} ref={headingRef} tabIndex={-1}>
                    Loading your quiz…
                  </h2>
                  <p role="status" className="qyx-quiz__subtitle">
                    Please wait a moment.
                  </p>
                </>
              )}

              {!loading && !ready && (
                <>
                  <h2 id={titleId} ref={headingRef} tabIndex={-1}>
                    Quiz unavailable
                  </h2>

                  <p className="qyx-quiz__subtitle">
                    Please try loading the quiz again.
                  </p>

                  <button
                    type="button"
                    className="qyx-quiz__primary"
                    onClick={loadQuiz}
                  >
                    Try again
                  </button>
                </>
              )}

              {ready && isQuestion && (
                <>
                  <span className="qyx-quiz__eyebrow">
                    A LITTLE ABOUT YOU
                  </span>

                  <h2 id={titleId} ref={headingRef} tabIndex={-1}>
                    {question.questionText}
                  </h2>

                  <p className="qyx-quiz__subtitle">
                    {question.questionType === "multipleChoice"
                      ? "Select all options that apply."
                      : question.questionType === "text"
                        ? "Share what you would like us to know."
                        : "Choose one option."}
                    {!question.isRequired && " This question is optional."}
                  </p>

                  {question.questionType === "text" ? (
                    <div className="qyx-quiz__form">
                      <label htmlFor={`${uniqueId}-answer`}>
                        Your answer
                      </label>

                      <textarea
                        id={`${uniqueId}-answer`}
                        rows={4}
                        maxLength={5000}
                        value={currentAnswer?.textAnswer ?? ""}
                        onChange={(event) =>
                          updateTextAnswer(event.target.value)
                        }
                      />
                    </div>
                  ) : (
                    <div
                      className="qyx-quiz__options"
                      role="group"
                      aria-labelledby={titleId}
                    >
                      {question.options.map((option, index) => {
                        const selected =
                          currentAnswer?.selectedOptionIds?.includes(
                            option._id
                          ) ?? false;

                        return (
                          <button
                            key={option._id}
                            type="button"
                            className={`qyx-quiz__option ${
                              selected
                                ? "qyx-quiz__option--selected"
                                : ""
                            }`}
                            aria-pressed={selected}
                            onClick={() => selectOption(option._id)}
                          >
                            <span className="qyx-quiz__option-letter">
                              {index + 1}
                            </span>

                            <span>{option.label}</span>

                            <span
                              className="qyx-quiz__option-arrow"
                              aria-hidden="true"
                            >
                              {selected ? "✓" : "→"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <button
                    type="button"
                    className="qyx-quiz__primary qyx-quiz__continue"
                    onClick={goNext}
                  >
                    Continue
                    <span aria-hidden="true">→</span>
                  </button>

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

              {ready && isContact && (
                <>
                  <span className="qyx-quiz__eyebrow">
                    YOUR JOURNEY, YOUR NEXT STEP
                  </span>

                  <h2 id={titleId} ref={headingRef} tabIndex={-1}>
                    Almost there.
                  </h2>

                  <p className="qyx-quiz__subtitle">
                    Enter your contact details and purpose of visiting
                    to complete the quiz.
                  </p>

                  <form
                    className="qyx-quiz__form"
                    onSubmit={submitContact}
                  >
                    <fieldset
                      className="qyx-quiz__fieldset"
                      disabled={submitting || needsRestart}
                    >
                      <label htmlFor={`${uniqueId}-email`}>
                        Email address
                      </label>
                      <input
                        id={`${uniqueId}-email`}
                        type="email"
                        name="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        maxLength={254}
                        required
                        value={contact.email}
                        onChange={updateContact}
                      />

                      <label htmlFor={`${uniqueId}-mobile`}>
                        Phone number with country code
                      </label>
                      <input
                        id={`${uniqueId}-mobile`}
                        type="tel"
                        name="mobile"
                        autoComplete="tel"
                        placeholder="+91 98765 43210"
                        maxLength={25}
                        required
                        value={contact.mobile}
                        onChange={updateContact}
                      />

                      <label htmlFor={`${uniqueId}-purpose`}>
                        Purpose of visiting
                      </label>
                      <select
                        id={`${uniqueId}-purpose`}
                        name="purposeOfVisiting"
                        required
                        value={contact.purposeOfVisiting}
                        onChange={updateContact}
                      >
                        <option value="">Select your purpose</option>
                        {PURPOSE_OPTIONS.map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>

                      {contact.purposeOfVisiting === "other" && (
                        <>
                          <label htmlFor={`${uniqueId}-other`}>
                            Tell us more
                          </label>
                          <textarea
                            id={`${uniqueId}-other`}
                            name="otherPurpose"
                            rows={3}
                            maxLength={1000}
                            required
                            value={contact.otherPurpose}
                            onChange={updateContact}
                          />
                        </>
                      )}

                      <label className="qyx-quiz__consent">
                        <input
                          type="checkbox"
                          name="contactConsent"
                          checked={contact.contactConsent}
                          onChange={updateContact}
                        />
                        <span>
                          I agree to be contacted by QYX about my enquiry.
                          This is optional.
                        </span>
                      </label>

                      <button
                        type="submit"
                        className="qyx-quiz__primary"
                      >
                        {submitting ? "Submitting..." : "Submit my answers"}
                        <span aria-hidden="true">→</span>
                      </button>
                    </fieldset>
                  </form>

                  <button
                    type="button"
                    className="qyx-quiz__back"
                    disabled={submitting}
                    onClick={goBack}
                  >
                    ← Back to questions
                  </button>
                </>
              )}

              {displayedError && !isResult && (
                <div
                  id={errorId}
                  className="qyx-quiz__error"
                  role="alert"
                >
                  <p>{displayedError}</p>

                  {validationErrors.length > 0 && (
                    <ul>
                      {validationErrors.map((message, index) => (
                        <li key={`${index}-${message}`}>
                          {message}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {needsRestart && (
                <button
                  type="button"
                  className="qyx-quiz__primary"
                  onClick={loadQuiz}
                >
                  Restart with updated questions
                </button>
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
                    RESPONSE RECEIVED
                  </span>

                  <h2 id={titleId} ref={headingRef} tabIndex={-1}>
                    Let’s take the next step.
                  </h2>

                  <div className="qyx-quiz__result-copy">
                    <p>Your answers have been saved successfully.</p>
                    <p>
                      A specialist can discuss your questions and help
                      you explore your next steps.
                    </p>
                  </div>

                  <Link
                    to="/doctors"
                    className="qyx-quiz__primary"
                    onClick={closeQuiz}
                  >
                    Connect with doctor
                    <span aria-hidden="true">↗</span>
                  </Link>
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