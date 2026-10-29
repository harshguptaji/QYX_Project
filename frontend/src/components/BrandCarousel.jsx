import "../style/BrandCarousel.css";

const brands = [
  { id: "tata-1mg", name: "Tata 1mg", mark: "1mg" },
  { id: "dpiit", name: "DPIIT", mark: "DPIIT" },
  { id: "iso", name: "ISO", mark: "ISO" },
  { id: "msme", name: "MSME", mark: "MSME" },
];

function BrandCard({ brand }) {
  return (
    <div className="qyx-brands__card">
      <span className="qyx-brands__mark" aria-hidden="true">
        {brand.mark}
      </span>

      <span className="qyx-brands__name">{brand.name}</span>
    </div>
  );
}

function BrandRow({ items, reverse = false }) {
  // Repeat enough cards to cover wide screens before looping.
  const repeatedItems = Array.from({ length: 4 }, () => items).flat();

  return (
    <div className="qyx-brands__row" aria-hidden="true">
      <div
        className={`qyx-brands__track ${
          reverse ? "qyx-brands__track--reverse" : ""
        }`}
      >
        {[0, 1].map((copy) => (
          <div className="qyx-brands__group" key={copy}>
            {repeatedItems.map((brand, index) => (
              <BrandCard
                key={`${copy}-${brand.id}-${index}`}
                brand={brand}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BrandCarousel() {
  return (
    <section
      className="qyx-brands"
      aria-labelledby="qyx-brands-title"
    >
      <div className="qyx-brands__container">
        {/* <header className="qyx-brands__heading">
          <span className="qyx-brands__eyebrow">THE QYX ECOSYSTEM</span>

          <h2 id="qyx-brands-title">
            Moving forward, <em>together.</em>
          </h2>

          <p>
            Bringing our ecosystem together as we build the next chapter
            of QYX.
          </p>
        </header> */}

        {/* A single accessible list avoids announcing duplicated cards. */}
        <ul className="qyx-brands__accessible-list">
          {brands.map((brand) => (
            <li key={brand.id}>{brand.name}</li>
          ))}
        </ul>
      </div>

      <div className="qyx-brands__sliders">
        {/* First row moves right. */}
        <BrandRow items={brands} reverse />

        {/* Second row moves left. */}
        <BrandRow items={[...brands].reverse()} />
      </div>
    </section>
  );
}