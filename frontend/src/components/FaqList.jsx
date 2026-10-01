import { useState } from "react";
import { ChevronDown } from "lucide-react";

export const faqItems = [
  {
    id: "male-fertility",
    category: "Fertility education",
    question: "What is male fertility?",
    answer:
      "Male fertility describes the ability to contribute to a pregnancy. It may be influenced by sperm concentration, movement, shape, reproductive health, medical history and lifestyle factors. A qualified clinician can interpret these factors together.",
  },
  {
    id: "semen-analysis",
    category: "Fertility education",
    question: "What does a semen analysis measure?",
    answer:
      "A laboratory semen analysis commonly evaluates measures such as volume, sperm concentration, movement and shape. A single result is not a complete diagnosis, so results should be discussed with an appropriately qualified doctor.",
  },
  {
    id: "specialist-guidance",
    category: "Fertility education",
    question: "When should I speak with a fertility specialist?",
    answer:
      "You may consider professional guidance when you have questions about fertility planning, a previous test result, reproductive symptoms, medical conditions or medicines that may affect fertility. For urgent symptoms or emergencies, seek immediate in-person medical care.",
  },
  {
    id: "book-appointment",
    category: "Appointments",
    question: "How do I book an online doctor appointment?",
    answer:
      "Select a doctor, review the consultation fee, choose an available date and time, complete the pre-consultation questions and confirm payment. Your appointment details will then appear in your account.",
  },
  {
    id: "prepare-consultation",
    category: "Appointments",
    question: "What information should I prepare before the consultation?",
    answer:
      "Prepare the reason for your visit, duration of the concern, current medicines, known allergies and any relevant previous advice. You may also upload earlier prescriptions or medical reports.",
  },
  {
    id: "upload-records",
    category: "Appointments",
    question: "Can I upload a previous prescription or medical report?",
    answer:
      "Yes. The appointment flow supports up to five PDF, JPG, JPEG or PNG files, with a maximum size of 10 MB per file. Upload only information relevant to your consultation.",
  },
  {
    id: "consultation-payment",
    category: "Payments",
    question: "How does consultation payment work?",
    answer:
      "The booking flow displays the doctor's consultation price in INR before payment. The planned payment experience uses Razorpay, and payment is completed before the appointment is submitted for approval.",
  },
  {
    id: "payment-status",
    category: "Payments",
    question: "Where can I see my payment and appointment status?",
    answer:
      "Your dashboard shows upcoming and previous appointments, payment information and the current appointment status. Final refund, cancellation and rescheduling terms should be reviewed during booking.",
  },
  {
    id: "join-video",
    category: "Video and privacy",
    question: "How do I join the video consultation?",
    answer:
      "When the room becomes available, select Join consultation from your appointment. Enter the meeting password, check your microphone and camera, and join the private room from a supported browser.",
  },
  {
    id: "room-participants",
    category: "Video and privacy",
    question: "How many people can join a consultation room?",
    answer:
      "The current room concept supports a maximum of four approved participants. Do not share the room password with anyone who is not authorized to attend your consultation.",
  },
  {
    id: "health-information",
    category: "Video and privacy",
    question: "How is my health information handled?",
    answer:
      "The experience is designed around controlled account access and minimal necessary information. Detailed privacy, consent, retention and security terms must be available before the service accepts real patient information.",
  },
  {
    id: "device-availability",
    category: "Our device",
    question: "Is the QYX fertility device available to purchase?",
    answer:
      "No. The QYX male-fertility device is still under development. Website content about the device is educational and conceptual; it should not be treated as a diagnostic result, medical claim or purchase offer.",
  },
];

export default function FaqList() {
  const [openFaqId, setOpenFaqId] = useState(
    faqItems[0].id
  );

  const toggleFaq = (faqId) => {
    setOpenFaqId((currentId) =>
      currentId === faqId ? null : faqId
    );
  };

  return (
    <section
      className="faq-list-section"
      aria-labelledby="faq-list-title"
    >
      <div className="faq-list-section__container">
        <header className="faq-list-section__header">
          <div>
            <span>HELP CENTRE</span>
            <h2 id="faq-list-title">
              Frequently asked questions
            </h2>
          </div>

          <p>{faqItems.length} questions</p>
        </header>

        <div className="faq-accordion">
          {faqItems.map((faq) => {
            const isOpen = openFaqId === faq.id;
            const panelId = `${faq.id}-answer`;
            const buttonId = `${faq.id}-button`;

            return (
              <article
                className={`faq-accordion__item ${
                  isOpen ? "is-open" : ""
                }`}
                key={faq.id}
              >
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggleFaq(faq.id)}
                  >
                    <span>{faq.question}</span>

                    <span
                      className="faq-accordion__toggle"
                      aria-hidden="true"
                    >
                      <ChevronDown />
                    </span>
                  </button>
                </h3>

                <div
                  id={panelId}
                  className="faq-accordion__answer"
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                >
                  <p>{faq.answer}</p>
                  <span>{faq.category}</span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
