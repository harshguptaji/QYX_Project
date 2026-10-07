import { useId } from "react";
import "../style/LittleReassurance.css";

const questions = [
  {
    question: "What if I’m not sure I need a consultation?",
    answer:
      "You can ask our team about the process before booking. A specialist can help you understand your concern during a consultation.",
  },
  {
    question: "Do I need test reports before I book?",
    answer:
      "Keep any existing reports handy. If you don’t have reports, ask the team how to begin and what your specialist may need.",
  },
  {
    question: "Can I speak to the same specialist again?",
    answer:
      "You can request a follow-up with the same specialist, subject to availability. Ask about suitable timing during your appointment.",
  },
  {
    question: "Can I choose video or chat?",
    answer:
      "Ask which consultation formats are available for your chosen specialist before confirming your slot.",
  },
  {
    question: "Is the QYX home-testing device available?",
    answer:
      "Home testing is still in development and is not available to book or purchase. We’ll share more details as the concept progresses.",
  },
];

const LittleReassurance = () => {
  const componentId = useId();
  const faqHeadingId = `${componentId}-faq`;
  const startingHeadingId = `${componentId}-starting`;

  const enquiryLink = `https://wa.me/917453898747?text=${encodeURIComponent(
    "Hello QYX team, I have a question about the consultation process."
  )}`;

  const bookingLink = `https://wa.me/917453898747?text=${encodeURIComponent(
    "Hello QYX team, I would like help booking my first male fertility consultation. Please guide me on the next steps."
  )}`;

  return (
    <div className="qyx-reassurance">
      <div className="qyx-reassurance__container">
        <section
          className="qyx-reassurance__faq"
          aria-labelledby={faqHeadingId}
        >
          <div className="qyx-reassurance__intro">
            <span className="qyx-reassurance__eyebrow">
              A LITTLE REASSURANCE
            </span>

            <h2 id={faqHeadingId}>
              Still wondering
              <span>about something?</span>
            </h2>

            <p>These are a few good places to start.</p>

            <a
              className="qyx-reassurance__link"
              href={enquiryLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ask our team
              <span aria-hidden="true">↗</span>
            </a>
          </div>

          <div className="qyx-reassurance__questions">
            {questions.map((item, index) => (
              <details
                className="qyx-reassurance__item"
                key={item.question}
                open={index === 0}
              >
                <summary className="qyx-reassurance__question">
                  <span>{item.question}</span>

                  <span
                    className="qyx-reassurance__toggle"
                    aria-hidden="true"
                  />
                </summary>

                <div className="qyx-reassurance__answer">
                  <p>{item.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        <section
          className="qyx-reassurance__starting"
          aria-labelledby={startingHeadingId}
        >
          <div className="qyx-reassurance__starting-content">
            <span className="qyx-reassurance__eyebrow">
              YOUR STARTING POINT
            </span>

            <h2 id={startingHeadingId}>
              One question.
              <span>A conversation worth having.</span>
            </h2>

            <p>
              Ask our team about booking your first consultation.
            </p>
          </div>

          <div className="qyx-reassurance__starting-action">
            <a
              className="qyx-reassurance__starting-button"
              href={bookingLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Let’s start a conversation
              <span aria-hidden="true">↗</span>
            </a>

            <span className="qyx-reassurance__starting-note">
              Opens WhatsApp with the QYX team
            </span>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LittleReassurance;