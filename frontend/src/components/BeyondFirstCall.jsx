import "../style/BeyondFirstCall.css";

const followUpSteps = [
  {
    number: "01",
    title: "Understand your plan",
    description:
      "Ask your specialist to explain the recommendations and what they mean for you.",
  },
  {
    number: "02",
    title: "Know what to ask next",
    description:
      "Discuss whether testing or another appointment is appropriate, and when to return.",
  },
  {
    number: "03",
    title: "Continue at your pace",
    description:
      "Book a follow-up when needed, subject to your specialist’s availability.",
  },
];

const BeyondFirstCall = () => {
  const whatsappLink = `https://wa.me/917453898747?text=${encodeURIComponent(
    "Hello QYX team, I would like to ask about follow-up consultations and availability with the same specialist."
  )}`;

  return (
    <section
      className="qyx-beyond-call"
      aria-labelledby="qyx-beyond-call-title"
    >
      <div className="qyx-beyond-call__container">
        <div className="qyx-beyond-call__content">
          <span className="qyx-beyond-call__eyebrow">
            BEYOND THE FIRST CALL
          </span>

          <h2 id="qyx-beyond-call-title">
            The conversation ends.
            <span>
              The next step doesn’t have to feel unclear.
            </span>
          </h2>

          <p>
            Use your consultation to understand what comes next. If you
            need more time or further support, ask about continuing with
            the same specialist.
          </p>

          <a
            className="qyx-beyond-call__link"
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ask about follow-up care
            <span aria-hidden="true">↗</span>
          </a>
        </div>

        <div className="qyx-beyond-call__panel">
          <h3 className="qyx-beyond-call__panel-heading">
            TAKE THE NEXT STEP WITH CLARITY
          </h3>

          <ol className="qyx-beyond-call__steps">
            {followUpSteps.map((step) => (
              <li
                className="qyx-beyond-call__step"
                key={step.number}
              >
                <span
                  className="qyx-beyond-call__number"
                  aria-hidden="true"
                >
                  {step.number}
                </span>

                <div className="qyx-beyond-call__step-content">
                  <h4>{step.title}</h4>
                  <p>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>

          <p className="qyx-beyond-call__note">
            A follow-up is a choice you make with your specialist.
          </p>
        </div>
      </div>
    </section>
  );
};

export default BeyondFirstCall;