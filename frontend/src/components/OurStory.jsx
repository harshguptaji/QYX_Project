import "../style/OurStory.css";

export default function OurStory() {
  return (
    <section
      className="qyx-our-story"
      aria-labelledby="qyx-our-story-title"
    >
      <div className="qyx-our-story__container">
        <div className="qyx-our-story__panel">
          <span className="qyx-our-story__eyebrow">
            FOUNDER STORY
          </span>

          <h2 id="qyx-our-story-title">
            In India, some questions are still difficult to ask.
          </h2>

          <div className="qyx-our-story__content">
            <p>
              In a society where conversations around fertility often
              remain unspoken, many men struggle with stigma,
              misinformation, and knowing where to turn for the right
              care.
            </p>

            <p>
              We started QYX MedTech with a simple belief:{" "}
              <strong>
                no man should have to face these questions alone.
              </strong>
            </p>

            <p>
              By bringing together intelligent assessment technology,
              trusted health information, and access to specialist
              care, we aim to make male reproductive health more
              accessible, private, and easier to understand.
            </p>

            <p className="qyx-our-story__closing">
              Because talking about fertility should never be a matter
              of shame.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}