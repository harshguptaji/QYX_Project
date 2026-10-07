import { useId, useRef, useState } from "react";
import "../style/HowItWorksJourney.css";

const journeySteps = [
  {
    label: "Share privately",
    subtitle: "A little context goes a long way",
    title: "Start with what’s on your mind.",
    description:
      "Complete a short intake about your concern, relevant history, and what you hope to discuss. It gives your specialist a useful starting point.",
    points: [
      "Share a brief overview of your concern",
      "Include relevant context, at your own pace",
      "Save detailed medical questions for your consultation",
    ],
    conversation: [
      "I’m not sure where to begin.",
      "Let’s start with what you’d like help understanding.",
    ],
  },
  {
    label: "Get matched",
    subtitle: "Find the right specialist for you",
    title: "Connect with a suitable specialist.",
    description:
      "QYX helps match you with a verified specialist suited to your concern and availability. Ask the team about focus areas and experience before confirming.",
    points: [
      "Consider the specialist’s area of focus",
      "Check experience and consultation details",
      "Ask questions before choosing your next step",
    ],
    conversation: [
      "Who should I speak with?",
      "Our team can help you find a suitable specialist.",
    ],
  },
  {
    label: "Confirm your slot",
    subtitle: "Make space for the conversation",
    title: "Choose a time that works for you.",
    description:
      "Pick an available consultation slot and review the booking details. Keep the confirmation and joining instructions handy.",
    points: [
      "Choose from available appointment times",
      "Review the consultation format and fee",
      "Keep your confirmation accessible",
    ],
    conversation: [
      "I’ve found a time that works.",
      "Review your booking and keep the joining details nearby.",
    ],
  },
  {
    label: "Consult comfortably",
    subtitle: "Connect from wherever you’re at ease",
    title: "Have the conversation from home.",
    description:
      "Meet your specialist on video or chat, according to the available consultation options. Discuss your concerns and ask about recommended next steps.",
    points: [
      "Join from a comfortable, quiet space",
      "Talk through questions and relevant history",
      "Ask for clarity about the proposed next steps",
    ],
    conversation: [
      "What happens after this consultation?",
      "Your specialist can discuss an appropriate next step with you.",
    ],
  },
  {
    label: "Follow up, your way",
    subtitle: "Continue the care relationship",
    title: "Keep the relationship, when you need it.",
    description:
      "Book a follow-up with the same specialist when appropriate and available, or pause after your consultation. How you continue is your choice.",
    points: [
      "Ask about follow-up timing",
      "Return to the specialist you’ve spoken with",
      "Continue or pause according to your needs",
    ],
    conversation: [
      "I’d like to continue with the same specialist.",
      "Ask our team about their next available follow-up slots.",
    ],
  },
];

const HowItWorksJourney = () => {
  const [activeStep, setActiveStep] = useState(0);
  const tabRefs = useRef([]);
  const componentId = useId();

  const currentStep = journeySteps[activeStep];
  const panelId = `${componentId}-panel`;
  const headingId = `${componentId}-heading`;

  const handleTabKeyDown = (event, index) => {
    let nextIndex;

    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
        nextIndex = (index + 1) % journeySteps.length;
        break;

      case "ArrowUp":
      case "ArrowLeft":
        nextIndex =
          (index - 1 + journeySteps.length) % journeySteps.length;
        break;

      case "Home":
        nextIndex = 0;
        break;

      case "End":
        nextIndex = journeySteps.length - 1;
        break;

      default:
        return;
    }

    event.preventDefault();
    setActiveStep(nextIndex);
    tabRefs.current[nextIndex]?.focus();
  };

  const handleNextStep = () => {
    setActiveStep((previous) => (previous + 1) % journeySteps.length);
  };

  return (
    <section
      className="qyx-how-journey"
      id="qyx-how-journey"
      aria-labelledby={headingId}
    >
      <div className="qyx-how-journey__container">
        <div className="qyx-how-journey__header">
          <div>
            <span className="qyx-how-journey__eyebrow">
              YOUR QYX JOURNEY
            </span>

            <h2 id={headingId}>
              Five steps.
              <span>One thoughtful beginning.</span>
            </h2>
          </div>

          <p>
            Select a step to see what happens, what you’ll need, and how
            you stay in control.
          </p>
        </div>

        <div className="qyx-how-journey__layout">
          <div
            className="qyx-how-journey__tabs"
            role="tablist"
            aria-label="Care journey steps"
            aria-orientation="vertical"
          >
            {journeySteps.map((step, index) => {
              const isActive = activeStep === index;

              return (
                <button
                  key={step.label}
                  ref={(element) => {
                    tabRefs.current[index] = element;
                  }}
                  className={`qyx-how-journey__tab ${
                    isActive ? "qyx-how-journey__tab--active" : ""
                  }`}
                  id={`${componentId}-tab-${index}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={panelId}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActiveStep(index)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                >
                  <span
                    className="qyx-how-journey__number"
                    aria-hidden="true"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="qyx-how-journey__tab-copy">
                    <span className="qyx-how-journey__tab-title">
                      {step.label}
                    </span>

                    <span className="qyx-how-journey__tab-subtitle">
                      {step.subtitle}
                    </span>
                  </span>

                  <span
                    className="qyx-how-journey__tab-arrow"
                    aria-hidden="true"
                  >
                    ↗
                  </span>
                </button>
              );
            })}
          </div>

          <div
            className="qyx-how-journey__panel"
            id={panelId}
            role="tabpanel"
            aria-labelledby={`${componentId}-tab-${activeStep}`}
            tabIndex={0}
          >
            <div>
              <span className="qyx-how-journey__eyebrow">
                STEP {String(activeStep + 1).padStart(2, "0")}
              </span>

              <h3>{currentStep.title}</h3>

              <p className="qyx-how-journey__description">
                {currentStep.description}
              </p>

              <ul className="qyx-how-journey__points">
                {currentStep.points.map((point) => (
                  <li key={point}>
                    <span aria-hidden="true">✓</span>
                    {point}
                  </li>
                ))}
              </ul>

              <div className="qyx-how-journey__conversation">
                <span className="qyx-how-journey__conversation-label">
                  ILLUSTRATIVE CONVERSATION
                </span>

                <p className="qyx-how-journey__bubble">
                  {currentStep.conversation[0]}
                </p>

                <p className="qyx-how-journey__bubble qyx-how-journey__bubble--reply">
                  {currentStep.conversation[1]}
                </p>
              </div>
            </div>

            <div className="qyx-how-journey__panel-footer">
              <span role="status" aria-live="polite" aria-atomic="true">
                Step {activeStep + 1} of {journeySteps.length}
              </span>

              <button
                type="button"
                className="qyx-how-journey__next"
                onClick={handleNextStep}
              >
                {activeStep === journeySteps.length - 1
                  ? "Back to the beginning"
                  : "Next step"}

                <span aria-hidden="true">
                  {activeStep === journeySteps.length - 1 ? "↺" : "→"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksJourney;