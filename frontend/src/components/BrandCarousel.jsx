import "../style/BrandCarousel.css";

import tataLogo from "../assets/tata.png";
import dpiitLogo from "../assets/tata.png";
import isoLogo from "../assets/iso.png";
import msmeLogo from "../assets/tata.png";

const brands = [
  {
    id: "tata-1mg",
    name: "Tata 1mg",
    image: tataLogo,
  },
  {
    id: "dpiit",
    name: "DPIIT",
    image: dpiitLogo,
  },
  {
    id: "iso",
    name: "ISO",
    image: isoLogo,
  },
  {
    id: "msme",
    name: "MSME",
    image: msmeLogo,
  },
];

function BrandCard({ brand }) {
  return (
    <div className="qyx-brands__card">
      <span className="qyx-brands__logo">
        <img
          src={brand.image}
          alt=""
          width={80}
          height={60}
          decoding="async"
          draggable={false}
        />
      </span>

      <span className="qyx-brands__name">{brand.name}</span>
    </div>
  );
}

function BrandRow({ items, reverse = false }) {
  const repeatedItems = Array.from(
    { length: 4 },
    () => items
  ).flat();

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
      aria-label="QYX ecosystem"
    >
      <div className="qyx-brands__container">
        <ul className="qyx-brands__accessible-list">
          {brands.map((brand) => (
            <li key={brand.id}>{brand.name}</li>
          ))}
        </ul>
      </div>

      <div className="qyx-brands__sliders">
        <BrandRow items={brands} reverse />
        <BrandRow items={[...brands].reverse()} />
      </div>
    </section>
  );
}