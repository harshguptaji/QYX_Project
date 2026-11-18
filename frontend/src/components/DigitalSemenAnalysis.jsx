import { ArrowUpRight, FlaskConical, Microscope } from "lucide-react";
import "../style/DigitalSemenAnalysis.css";

// Replace with your digital semen analysis tool URL.
const RESEARCH_TOOL_URL = "https://qyxdev--qyx-app.us-east.modal.run/login";

export default function DigitalSemenAnalysis() {
  return (
    <section
      className="qyx-research"
      aria-labelledby="qyx-research-title"
    >
      <div className="qyx-research__container">
        <div className="qyx-research__content">
          <span className="qyx-research__eyebrow">
            EXPLORING WHAT COMES NEXT
          </span>

          <h2 id="qyx-research-title">
            Digital semen analysis.
            <span>A model in research.</span>
          </h2>

          <p className="qyx-research__description">
            We’re developing a digital semen analysis model to explore
            how technology can support research into male reproductive
            health.
          </p>

          <div className="qyx-research__notice">
            <FlaskConical aria-hidden="true" />

            <div>
              <strong>For research purposes only</strong>

              <p>
                This model is experimental. It is not intended for
                clinical use, diagnosis, treatment, or fertility
                decisions. Its outputs do not replace a laboratory
                semen analysis or advice from a qualified specialist.
              </p>
            </div>
          </div>

          <a
            href={RESEARCH_TOOL_URL}
            className="qyx-research__button"
            target="_blank"
            rel="noopener noreferrer"
            aria-describedby="qyx-research-link-note"
          >
            Explore the Research Model
            <ArrowUpRight aria-hidden="true" />
          </a>

          <p
            className="qyx-research__link-note"
            id="qyx-research-link-note"
          >
            Opens the research platform in a new tab.
          </p>
        </div>

        <div className="qyx-research__visual" aria-hidden="true">
          <div className="qyx-research__visual-top">
            <span>QYX RESEARCH</span>
            <span className="qyx-research__status">
              In development
            </span>
          </div>

          <div className="qyx-research__illustration">
            <div className="qyx-research__orbit" />
            <div className="qyx-research__orbit qyx-research__orbit--inner" />

            <div className="qyx-research__icon">
              <Microscope />
            </div>

            <span className="qyx-research__dot qyx-research__dot--one" />
            <span className="qyx-research__dot qyx-research__dot--two" />
            <span className="qyx-research__dot qyx-research__dot--three" />
          </div>

          <div className="qyx-research__visual-bottom">
            <strong>Digital semen analysis model</strong>
            <span>Experimental technology · Research use only</span>
          </div>
        </div>
      </div>
    </section>
  );
}