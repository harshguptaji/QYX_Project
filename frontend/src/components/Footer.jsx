import { Link } from "react-router-dom";

import logoImg from "../assets/logo.png";
import "../style/Footer.css";

export const footerLinkGroups = [
  {
    id: "care",
    title: "Care",
    links: [
      { label: "Book a consultation", href: "/doctors" },
      { label: "Meet our specialists", href: "/specialists" },
      { label: "How appointments work", href: "/how-it-works" },
      { label: "Take the 2-min quiz", href: "/#professional-guidance" },
      { label: "Privacy & Security", href: "/privacy-policy" },
    ],
  },
  {
    id: "learn",
    title: "Learn",
    links: [
      { label: "Male fertility basics", href: "/#professional-guidance" },
      { label: "Sperm health", href: "/#appointment-journey" },
      { label: "Fertility Factors", href: "/#appointment-journey" },
      { label: "Semen Analysis", href: "/#privacy" },
      { label: "Preparing for a consultation", href: "/#privacy" },
    ],
  },
  {
    id: "company",
    title: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Our Team", href: "/about#our-team" },
      { label: "Career", href: "/career" },
      { label: "For Doctors: Join our network", href: "/#learning-path" },
      { label: "The QYX device (Coming Soon)", href: "/#faq" },
    ],
  },
  {
    id: "support",
    title: "Support",
    links: [
      { label: "Frequently asked questions", href: "/faq" },
      { label: "Contact Us", href: "/contact" },
      { label: "Grievance redressal", href: "/privacy-policy#privacy-contact" },
    ],
  },
];

export const legalLinks = [
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms of use", href: "/terms" },
  { label: "Medical disclaimer", href: "/medical-disclaimer" },
  { label: "Cookie Preferences", href: "/" },
];

// Keep native anchors for fragment links so they can scroll to a section.
function FooterLink({ href, children, ...props }) {
  const external = /^(https?:|mailto:|tel:)/i.test(href);

  if (external || href.includes("#")) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  }

  return (
    <Link to={href} {...props}>
      {children}
    </Link>
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
            <Link
              className="qyx-footer__logo"
              to="/"
              aria-label="QYX MedTech home"
            >
              <img src={logo} alt={logoAlt} loading="lazy" />
            </Link>

            <p className="qyx-footer__description">
              {description}
            </p>

            <span className="qyx-footer__status">
              <span aria-hidden="true" />
              Fertility device in development
            </span>

            <div className="qyx-footer__contact">
              <a href="mailto:care@qyxmedtech.com">
                care@qyxmedtech.com
              </a>

              <a href="tel:+917453898747">
                +91 74538 98747
              </a>
            </div>

            <address className="qyx-footer__address">
              QYX Office
              <br />
              B-2, IT Park, Sahastradhara Road,
              <br />
              Dehradun, Uttarakhand – 248001, India
            </address>
          </div>

          <div className="qyx-footer__link-groups">
            {linkGroups.map((group) => (
              <nav
                className="qyx-footer__links"
                key={group.id}
                aria-label={`Footer ${group.title}`}
              >
                <h2>{group.title}</h2>

                <ul>
                  {group.links.map((link) => (
                    <li key={`${group.id}-${link.label}`}>
                      <FooterLink href={link.href}>
                        {link.label}
                      </FooterLink>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="qyx-footer__notice">
          <p>
            QYX connects you with independent, verified doctors through
            telemedicine. It does not provide emergency care. In an
            emergency, call <a href="tel:112">112</a>.
          </p>
        </div>

        <div className="qyx-footer__bottom">
          <p>
            © {currentYear} QYX MedTech. All rights reserved.
          </p>

          <nav aria-label="Legal information">
            {policies.map((link) => (
              <FooterLink href={link.href} key={link.label}>
                {link.label}
              </FooterLink>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}