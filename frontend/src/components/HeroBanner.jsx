import "../style/HeroBanner.css";
import FertilityQuiz from "./FertilityQuiz";

const HeroBanner = () => {
  return (
    <section className="hero-main-section">
      <div className="hero-content-section">
        <h2>Half the sperm, Twice the silence</h2>
        <h2>Start with one private coversation</h2>
        <p>
          Talk to verified male fertility specialist from home, on video or chat
          - the first place of a private, connected fertility ecosystem QYX is
          building end to end. No clinic visits, no waiting room, no judgement.
        </p>
      </div>
      <div className="hero-btn-section">
        <span>
          <a className="hero-prm-btn" href="#">
            Book Consultation
          </a>
        </span>
        <span>
          <FertilityQuiz />
        </span>
      </div>
    </section>
  );
};

export default HeroBanner;
