import { Link } from "react-router-dom";
import { ArrowRight, Hammer, Leaf } from "lucide-react";

import "./UnderDevelopmentPage.css";

export default function UnderDevelopmentPage() {
  return (
    <main className="qyx-development">
      <section
        className="qyx-development__card"
        aria-labelledby="development-title"
      >
        <Link
          to="/"
          className="qyx-development__brand"
          aria-label="QYX MedTech home"
        >
          QYX<span>.</span>
        </Link>

        <div className="qyx-development__illustration" aria-hidden="true">
          <div className="qyx-development__ring" />

          <div className="qyx-development__icon">
            <Hammer />
          </div>

          <span className="qyx-development__leaf">
            <Leaf />
          </span>
        </div>

        <p className="qyx-development__eyebrow">
          A LITTLE MORE TIME, A LITTLE MORE CARE
        </p>

        <h1 id="development-title">
          Something thoughtful
          <br />
          is <em>taking shape.</em>
        </h1>

        <p className="qyx-development__description">
          We’re working on this part of QYX to bring you a better
          experience. Please check back soon.
        </p>

        <span className="qyx-development__status">
          <span aria-hidden="true" />
          Under development
        </span>

        <Link to="/" className="qyx-development__button">
          Back to home
          <ArrowRight aria-hidden="true" />
        </Link>

        <p className="qyx-development__note">
          Your next step can still start at home.
        </p>
      </section>
    </main>
  );
}