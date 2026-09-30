import oneInTwoImage from "../assets/fertility_awareness.png";
import "../style/FertilityAwareness.css";

const FertilityAwareness = () => {
  return (
    <section
      className="fertility-awareness"
      aria-labelledby="fertility-awareness-title"
    >
      <div className="fertility-awareness-container">
        {/* <div className="fertility-awareness-image">
          <img
            src={oneInTwoImage}
            alt="One in two illustration"
            loading="lazy"
          />
        </div> */}

        <div className="fertility-awareness-content">
          <span className="fertility-awareness-label">
            MALE FERTILITY MATTERS
          </span>

          <h2 id="fertility-awareness-title">
            1 in 2
          </h2>

          <p>
            Infertility cases in India involves a male factor, per clinical research -
            yet men are raerely consulted first.
          </p>
        </div>
        <div className="fertility-awareness-image">
          <img
            src={oneInTwoImage}
            alt="One in two illustration"
            loading="lazy"
          />
        </div>
      </div>
      
    </section>
  );
};

export default FertilityAwareness;