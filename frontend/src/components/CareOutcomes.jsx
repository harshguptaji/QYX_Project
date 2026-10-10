import { useEffect, useRef, useState } from "react";
import careMemberImage from "../assets/Boy.png";
import "../style/CareOutcomes.css";

const metrics = {
  headline: 60,
  intention: 50,
  memberRate: 1,
  comparisonRate: 2,
  outcomeRate: 55.4,
};

function useCountAnimation(duration = 1800) {
  const sectionRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const element = sectionRef.current;

    if (!element) return;

    let animationFrame;
    let started = false;

    const startAnimation = () => {
      if (started) return;

      started = true;

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reducedMotion) {
        setProgress(1);
        return;
      }

      const startTime = performance.now();

      const animate = (currentTime) => {
        const elapsed = Math.min(
          (currentTime - startTime) / duration,
          1
        );

        const easedProgress = 1 - Math.pow(1 - elapsed, 3);

        setProgress(easedProgress);

        if (elapsed < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };

      animationFrame = requestAnimationFrame(animate);
    };

    if (!("IntersectionObserver" in window)) {
      startAnimation();

      return () => {
        cancelAnimationFrame(animationFrame);
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        startAnimation();
        observer.disconnect();
      },
      { threshold: 0.15 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrame);
    };
  }, [duration]);

  return { sectionRef, progress };
}

export default function CareOutcomes() {
  const { sectionRef, progress } = useCountAnimation();

  const percentage = (value) => {
    const decimals = Number.isInteger(value) ? 0 : 1;

    return `${(value * progress).toFixed(decimals)}%`;
  };

  const ringValue = Math.min(Math.max(metrics.intention, 0), 100);

  const barValue = Math.min(
    Math.max(metrics.outcomeRate, 0),
    100
  );

  return (
    <section
      className="qyx-outcomes"
      ref={sectionRef}
      aria-labelledby="qyx-outcomes-title"
    >
      <div className="qyx-outcomes__container">
        <div className="qyx-outcomes__top">
          {/* Portrait and headline statistic */}
          <div className="qyx-outcomes__visual">
            <div className="qyx-outcomes__portrait">
              <div
                className="qyx-outcomes__portrait-ring"
                aria-hidden="true"
              />

              <img
                src={careMemberImage}
                alt="Illustrative care portrait"
                className="qyx-outcomes__image"
                loading="lazy"
              />

              <div className="qyx-outcomes__person">
                <strong>Personalized support</strong>
                <span>At every step</span>
              </div>
            </div>

            <div className="qyx-outcomes__headline-stat">
              <span
                className="qyx-outcomes__large-number"
                aria-hidden="true"
              >
                {percentage(metrics.headline)}
              </span>

              <span className="qyx-outcomes__sr-only">
                Illustrative metric: {metrics.headline} percent.
              </span>

              <p>
                Exploring a more informed,
                <br />
                personalized path to care.
              </p>
            </div>
          </div>

          {/* Introduction */}
          <div className="qyx-outcomes__intro">
            <span className="qyx-outcomes__eyebrow">
              CARE THAT STARTS WITH YOU
            </span>

            <h2 id="qyx-outcomes-title">
              The right guidance.
              <br />
              A clearer way forward.
            </h2>

            <p>
              Every fertility journey is different. QYX helps you
              connect with specialists, understand your options,
              and take your next step with greater clarity.
            </p>

            <span className="qyx-outcomes__demo">
              Illustrative statistics — replace with verified QYX
              data before publishing.
            </span>
          </div>
        </div>

        {/* Statistics panel */}
        <div className="qyx-outcomes__panel">
          {/* Donut chart */}
          <article className="qyx-outcomes__card">
            <div
              className="qyx-outcomes__chart qyx-outcomes__donut"
              role="img"
              aria-label={`${metrics.intention}% illustrative metric`}
            >
              <svg viewBox="0 0 220 220" aria-hidden="true">
                <circle
                  className="qyx-outcomes__ring-track"
                  cx="110"
                  cy="110"
                  r="94"
                />

                <circle
                  className="qyx-outcomes__ring-fill"
                  cx="110"
                  cy="110"
                  r="94"
                  pathLength="100"
                  strokeDasharray="100"
                  strokeDashoffset={100 - ringValue * progress}
                />
              </svg>

              <span aria-hidden="true">
                {percentage(metrics.intention)}
              </span>
            </div>

            <h3> Sperm Concentration Decline</h3>

            <p>
              Global sperm concentration has fallen by roughly half since 1973 — and the decline is accelerating.
            </p>
          </article>

          {/* Comparison circles */}
          <article className="qyx-outcomes__card">
            <div
              className="qyx-outcomes__chart qyx-outcomes__comparison"
              role="img"
              aria-label={`Illustrative comparison: ${metrics.memberRate}% versus ${metrics.comparisonRate}%`}
            >
              <div className="qyx-outcomes__member-circle">
                <div
                  className="qyx-outcomes__member-fill"
                  style={{
                    transform: `scale(${progress})`,
                  }}
                />

                <div className="qyx-outcomes__circle-content">
                  <span aria-hidden="true">
                    {/* {percentage(metrics.memberRate)} */}
                    1 in 2
                  </span>

                  {/* <small>Sample member rate</small> */}
                </div>
              </div>

              {/* <div className="qyx-outcomes__average-circle">
                <span aria-hidden="true">
                  {percentage(metrics.comparisonRate)}
                </span>
              </div> */}
            </div>

            <h3>Male Factor Infertility</h3>

            <p>
              1 in 2 infertility cases in India involves a male factor — yet men are rarely consulted first.
            </p>
          </article>

          {/* Animated bar */}
          <article className="qyx-outcomes__card">
            <div
              className="qyx-outcomes__chart qyx-outcomes__bar-chart"
              role="img"
              aria-label={`${metrics.outcomeRate}% illustrative outcome metric`}
            >
              <span
                className="qyx-outcomes__bar-number"
                aria-hidden="true"
              >
                {percentage(metrics.outcomeRate)}
              </span>

              <div className="qyx-outcomes__bar">
                <div
                  className="qyx-outcomes__bar-fill"
                  style={{
                    height: `${barValue * progress}%`,
                  }}
                />

                <span
                  className="qyx-outcomes__arrow"
                  aria-hidden="true"
                >
                  ↑
                </span>
              </div>
            </div>

            <h3>The Delay Gap</h3>

            <p>
              Men wait 3–5 years longer than women, on average, before their first fertility consultation.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}