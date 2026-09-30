import { useRef, useState } from "react";
import "../style/QYXCarousel.css";

const cards = [
  {
    title: "A private first conversation",
    highlight: "Your space",
    description:
      "Start from somewhere comfortable, with room to share what is on your mind.",
  },
  {
    title: "Choose how you connect",
    highlight: "Video or chat",
    description:
      "Speak with a specialist in the format that feels right for you.",
  },
  {
    title: "Keep the conversation going",
    highlight: "Next steps",
    description:
      "Understand your options and return for follow-up guidance when needed.",
  },
];

const QYXCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStart = useRef(null);

  const changeSlide = (direction) => {
    setActiveIndex(
      (current) => (current + direction + cards.length) % cards.length
    );
  };

  const handleTouchEnd = (event) => {
    if (!touchStart.current) return;

    const touch = event.changedTouches[0];
    const distanceX = touchStart.current.x - touch.clientX;
    const distanceY = touchStart.current.y - touch.clientY;

    if (
      Math.abs(distanceX) > 50 &&
      Math.abs(distanceX) > Math.abs(distanceY)
    ) {
      changeSlide(distanceX > 0 ? 1 : -1);
    }

    touchStart.current = null;
  };

  return (
    <section
      className="qyx-carousel"
      aria-labelledby="qyx-carousel-title"
      aria-roledescription="carousel"
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          changeSlide(-1);
        }

        if (event.key === "ArrowRight") {
          event.preventDefault();
          changeSlide(1);
        }
      }}
    >
      <div className="qyx-carousel-container">
        <div className="qyx-carousel-heading">
          <span>CARE ON YOUR TERMS</span>
          <h2 id="qyx-carousel-title">
            See how QYX delivers on value and cost saving.
          </h2>
        </div>

        <div className="qyx-carousel-layout">
          <button
            type="button"
            className="qyx-carousel-arrow qyx-carousel-previous"
            aria-label="Previous card"
            onClick={() => changeSlide(-1)}
          >
            <span aria-hidden="true">←</span>
          </button>

          <div
            className="qyx-carousel-stage"
            onTouchStart={(event) => {
              const touch = event.touches[0];

              touchStart.current = {
                x: touch.clientX,
                y: touch.clientY,
              };
            }}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={() => {
              touchStart.current = null;
            }}
          >
            {cards.map((card, index) => {
              const isActive = index === activeIndex;

              return (
                <article
                  key={card.title}
                  className={`qyx-carousel-card ${
                    isActive ? "is-active" : ""
                  }`}
                  style={{
                    "--slot": index - (cards.length - 1) / 2,
                    "--relative": index - activeIndex,
                    zIndex: isActive ? 3 : 1,
                  }}
                  aria-hidden={!isActive}
                  aria-roledescription="slide"
                  aria-label={`${index + 1} of ${cards.length}`}
                >
                  <div className="qyx-carousel-card-header">
                    <h3>{card.title}</h3>
                  </div>

                  <div className="qyx-carousel-card-body">
                    <div className="qyx-carousel-circle">
                      <span>{card.highlight}</span>
                    </div>

                    <p>{card.description}</p>
                  </div>
                </article>
              );
            })}
          </div>

          <button
            type="button"
            className="qyx-carousel-arrow qyx-carousel-next"
            aria-label="Next card"
            onClick={() => changeSlide(1)}
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>

        <div className="qyx-carousel-dots" aria-label="Choose a card">
          {cards.map((card, index) => (
            <button
              key={card.title}
              type="button"
              className={`qyx-carousel-dot ${
                index === activeIndex ? "is-active" : ""
              }`}
              aria-label={`Show card ${index + 1}: ${card.title}`}
              aria-current={index === activeIndex ? "true" : undefined}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>

        <span className="qyx-carousel-sr-only" aria-live="polite">
          Card {activeIndex + 1} of {cards.length}:{" "}
          {cards[activeIndex].title}
        </span>
      </div>
    </section>
  );
};

export default QYXCarousel;