import {
  ArrowRight,
  CalendarDays,
  CreditCard,
  LockKeyhole,
  Stethoscope,
  Video,
} from "lucide-react";

import "../style/DoctorsLowerSection.css";

export default function DoctorsLowerSection() {
  const appointmentSteps = [
    {
      id: 1,
      number: "01",
      title: "Choose a doctor",
      description:
        "Compare specialties, experience, languages and transparent consultation pricing.",
      icon: Stethoscope,
    },
    {
      id: 2,
      number: "02",
      title: "Select a time",
      description:
        "Choose an available consultation date and a convenient appointment slot.",
      icon: CalendarDays,
    },
    {
      id: 3,
      number: "03",
      title: "Pay securely",
      description:
        "Review your appointment and complete a protected INR payment through Razorpay.",
      icon: CreditCard,
    },
    {
      id: 4,
      number: "04",
      title: "Join online",
      description:
        "Meet your doctor from home through a private and secure video consultation room.",
      icon: Video,
    },
  ];

  const privacyData = {
    eyebrow: "PRIVACY AT EVERY STEP",
    title: "Your health conversation stays personal.",
    description:
      "Our consultation journey is designed around clear consent, minimal information sharing and controlled access to your online appointments.",
    buttonText: "Choose a doctor",
  };

  const scrollToDoctors = () => {
    document
      .getElementById("doctor-directory")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  return (
    <section
      className="doctors-lower"
      aria-labelledby="appointment-journey-title"
    >
      <div className="doctors-lower__container">
        <div className="doctors-lower__heading">
          <p>YOUR APPOINTMENT JOURNEY</p>

          <h2 id="appointment-journey-title">
            From doctor selection to secure video
            care.
          </h2>

          <span>
            Book and attend your online consultation
            in four simple steps.
          </span>
        </div>

        <div className="doctors-lower__steps">
          {appointmentSteps.map((step) => {
            const Icon = step.icon;

            return (
              <article
                className="appointment-step"
                key={step.id}
              >
                <div className="appointment-step__top">
                  <div className="appointment-step__icon">
                    <Icon aria-hidden="true" />
                  </div>

                  <span>{step.number}</span>
                </div>

                <div className="appointment-step__content">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </article>
            );
          })}
        </div>

        <div className="doctors-lower__privacy">
          <div className="doctors-lower__privacy-icon">
            <LockKeyhole aria-hidden="true" />
          </div>

          <div className="doctors-lower__privacy-content">
            <p>{privacyData.eyebrow}</p>

            <h2>{privacyData.title}</h2>

            <span>{privacyData.description}</span>
          </div>

          <button
            className="doctors-lower__privacy-button"
            type="button"
            onClick={scrollToDoctors}
          >
            {privacyData.buttonText}
            <ArrowRight aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}