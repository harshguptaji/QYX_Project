import "../style/Footer.css";
import { Link } from "react-router-dom";
import logoImg from "../assets/logo.png";
export const footerLinkGroups = [
  {
    id: "explore",
    title: "Explore",
    links: [
      { label: "Sperm health", href: "#understand" },
      { label: "Fertility factors", href: "#fertility-factors" },
      { label: "Our device", href: "#device-concept" },
      { label: "Find a doctor", href: "#professional-guidance" },
    ],
  },
  {
    id: "care",
    title: "Care",
    links: [
      { label: "Book a consultation", href: "#professional-guidance" },
      { label: "How appointments work", href: "#appointment-journey" },
      { label: "Video consultation", href: "#appointment-journey" },
      { label: "Privacy and security", href: "#privacy" },
    ],
  },
  {
    id: "education",
    title: "Education",
    links: [
      { label: "Semen analysis", href: "#understand" },
      { label: "Male fertility basics", href: "#fertility-factors" },
      { label: "Preparing for a consultation", href: "#learning-path" },
      { label: "Frequently asked questions", href: "#faq" },
    ],
  },
];

export const legalLinks = [
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms of use", href: "/terms" },
  { label: "Medical disclaimer", href: "/medical-disclaimer" },
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export default function Footer({
  logo = logoImg,
  logoAlt = "QYX MedTech",
  description =
    "Clear male fertility education and confidential online specialist consultations, designed around privacy and responsible guidance.",
  linkGroups = footerLinkGroups,
  policies = legalLinks,
}) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="qyx-footer">
      <div className="qyx-footer__container">
        <div className="qyx-footer__main">
          <div className="qyx-footer__brand-column">
            <a className="qyx-footer__logo" href="/" aria-label="QYX MedTech home">
              <img src={logo} alt={logoAlt} />
            </a>

            <p>{description}</p>

            <span className="qyx-footer__status">
              <span aria-hidden="true" />
              Fertility device in development
            </span>
          </div>

          {linkGroups.map((group) => (
            <nav className="qyx-footer__links" key={group.id} aria-label={group.title}>
              <h2>{group.title}</h2>
              <ul>
                {group.links.map((link) => (
                  <li key={`${group.id}-${link.label}`}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="qyx-footer__bottom">
          <p>© {currentYear} QYX MedTech. All rights reserved.</p>

          <nav aria-label="Legal information">
            {policies.map((link) => (
              <a href={link.href} key={link.label}>
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}