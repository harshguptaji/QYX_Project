import oneInTwoImage from "../assets/fertility_awareness.png";
import "../style/FertilityAwareness.css";

export default function FertilityAwareness() {
  return (
    <section
      className="fertility-awareness"
      aria-labelledby="fertility-awareness-title"
    >
      <div className="fertility-awareness-container">
        <h2
          className="fertility-awareness-label"
          id="fertility-awareness-title"
        >
          Male fertility matters
        </h2>

        <div className="fertility-awareness-image">
          <img
            src={oneInTwoImage}
            alt="One in two illustration"
            loading="lazy"
          />
        </div>

        <div className="fertility-awareness-content">
          <h3>1 in 2</h3>

          <p>
            Infertility cases in India can involve a male factor,
            according to clinical research. Including both partners in
            fertility assessments can help identify contributing
            factors and guide the next steps in care.
          </p>
        </div>
      </div>
    </section>
  );
}