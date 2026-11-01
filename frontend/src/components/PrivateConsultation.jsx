import { Link } from "react-router-dom";
import clinicImage from "../assets/private_clinic.png";
import "../style/PrivateConsultation.css";

export default function PrivateConsultation() {
  return (
    <section
      className="private-consultation"
      aria-labelledby="private-consultation-title"
    >
      <div className="private-consultation-container">
        <h2
          className="private-consultation-label"
          id="private-consultation-title"
        >
          Care that feels comfortable
        </h2>

        <div className="private-consultation-image">
          <img
            src={clinicImage}
            alt="Illustration of a private clinical consultation room"
            loading="lazy"
          />
        </div>

        <div className="private-consultation-content">
          <h3>3–5 Years</h3>

          <p>
            How much longer men wait than women, on average, before
            their first fertility consultation. This delay can leave
            male fertility concerns unexplored and postpone a fuller
            understanding of a couple’s fertility.
          </p>

          <Link
            to="/doctors"
            className="private-consultation-button"
          >
            Book a Consultation
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}