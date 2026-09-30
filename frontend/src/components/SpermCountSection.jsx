import spermCountImage from "../assets/sperm_count.png"
import "../style/SpermCountSection.css";

const SpermCountSection = () => {
  return (
    <section className="sperm-count-section" aria-labelledby="sperm-count-title">
      <div className="sperm-count-container">
        <div className="sperm-count-image">
          <img
            src={spermCountImage}
            alt="Illustration comparing sperm counts in 1973 and 2018"
            loading="lazy"
          />
        </div>

        <div className="sperm-count-content">
          <span className="sperm-count-label">SPERM COUNT</span>

          <h2 id="sperm-count-title">
            ~ 50%
          </h2>

          <p>
Global sperm concentration declined between 1973 and 2018, according to a
large review of studies. The researchers also found that the estimated
pace of decline accelerated after 2000.          </p>
        </div>
      </div>
    </section>
  );
};

export default SpermCountSection;