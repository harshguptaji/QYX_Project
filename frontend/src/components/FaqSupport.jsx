import {
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function FaqSupport() {
  return (
    <section
      className="faq-support"
      aria-labelledby="faq-support-title"
    >
      <div className="faq-support__card">
        <span className="faq-support__icon">
          <ShieldCheck aria-hidden="true" />
        </span>

        <div className="faq-support__content">
          <small>PRIVATE SPECIALIST CARE</small>

          <h2 id="faq-support-title">
            Still have a personal question?
          </h2>

          <p>
            Choose a specialist, review transparent pricing
            and select a convenient time for a private video
            consultation.
          </p>
        </div>

        <Link
          to="/doctors"
          className="faq-support__link"
        >
          View doctors
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
