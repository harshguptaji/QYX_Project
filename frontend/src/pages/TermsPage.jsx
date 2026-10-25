import { Link } from "react-router-dom";
import { ArrowUp, FileText } from "lucide-react";

import "./TermsPage.css";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

// Replace these details before publication.
const termsDetails = {
  website: "[WEBSITE URL]",
  legalEntity: "[FULL LEGAL ENTITY NAME]",
  address: "[REGISTERED / BUSINESS ADDRESS]",
  jurisdiction: "[CITY / STATE]",
  legalEmail: "[GENERAL / LEGAL CONTACT EMAIL]",
  supportEmail: "[SUPPORT / SECURITY EMAIL]",
  privacyEmail: "[PRIVACY EMAIL]",
  privacyPolicyUrl: "[PRIVACY POLICY URL]",
  lastUpdated: "[INSERT PUBLICATION DATE]",
};

const termsSections = [
  {
    id: "about",
    title: "About these Terms",
    paragraphs: [
      `These Terms of Use (“Terms”) govern access to and use of ${termsDetails.website} and its pages, forms, features and content (the “Website”). The Website is operated by ${termsDetails.legalEntity}, using the name QYX MedTech (“QYX MedTech”, “we”, “us” or “our”), with its registered/principal office at ${termsDetails.address}.`,
      "By accessing or using the Website, you agree to these Terms. If you do not agree, do not use the Website. Additional terms may apply to particular services or transactions. Where applicable law requires separate affirmative acceptance, we will obtain it before the relevant feature is used.",
    ],
  },
  {
    id: "eligibility",
    title: "Eligibility and acceptable use",
    paragraphs: [
      "You may use the Website only lawfully and in accordance with these Terms. If you act for an organisation, you confirm that you are authorised to do so. The Website is not intended for children to independently submit personal or health information. Any feature intended for or likely to be used by minors must be reviewed for applicable legal requirements before launch.",
    ],
  },
  {
    id: "services",
    title: "Website purpose and services",
    paragraphs: [
      "QYX MedTech develops healthcare technology and may provide information about AI-enabled diagnostic technology, male-fertility diagnostics and related digital health products. Depending on features actually enabled, the Website may allow visitors to submit enquiries, request contact or appointments, express interest in connecting with doctors or diagnostic centres, or contact QYX MedTech about partnerships.",
      "The Website’s features may change. We may update, suspend or discontinue content or features, subject to applicable law and any separate agreement governing a paid or contracted service.",
    ],
  },
  {
    id: "medical-information",
    title: "No medical advice or emergency service",
    paragraphs: [
      "Unless a specific service is expressly identified and appropriately authorised, Website content is general information only and is not medical advice, diagnosis, treatment or a substitute for consultation with a qualified healthcare professional. Do not make medical decisions solely on Website content. Do not use the Website or its forms for emergencies; contact local emergency services or seek urgent in-person care.",
      "Any AI, computer-vision or automated feature must be used only for the purpose and in the manner documented for it. Unless expressly stated and legally authorised, automated output must not be treated as a definitive diagnosis or a replacement for a clinician’s judgment.",
    ],
  },
  {
    id: "product-information",
    title: "Product information and no guaranteed outcomes",
    paragraphs: [
      "Website descriptions may refer to research, development goals, demonstrations, planned capabilities or future intentions. Unless expressly confirmed in approved documentation or a written agreement, QYX MedTech does not promise that a product is clinically validated, regulator-approved, available for purchase, suitable for a particular medical purpose, or capable of achieving a specific clinical outcome. All claims about accuracy, performance, intended use and regulatory status must be read only as stated in approved product documentation and applicable labelling.",
      "Submitting an enquiry does not guarantee a response time, appointment, referral, test, prescription, treatment, diagnosis, product availability or result.",
    ],
  },
  {
    id: "providers",
    title: "Doctors, diagnostic centres and third parties",
    paragraphs: [
      "Where we help users connect with a doctor, clinic, diagnostic centre, pharmacy or other provider, that provider may be an independent third party. Unless expressly stated in a separate written agreement, QYX MedTech does not itself provide that provider’s clinical care and does not control its independent professional judgment, availability, fees, records or treatment decisions.",
      "Review the provider’s credentials, privacy notice, fees and terms before proceeding. Any doctor-patient relationship, diagnostic service, prescription, treatment or purchase may be governed by separate terms with the provider. We do not guarantee a third party’s services or outcomes, except to the extent responsibility cannot lawfully be excluded.",
    ],
  },
  {
    id: "enquiries",
    title: "Enquiries and information you submit",
    paragraphs: [
      "You agree to provide accurate, lawful and non-misleading information in forms and communications. Do not submit another person’s information unless authorised, and do not upload content you have no right to share. Submit only information reasonably necessary for your request.",
      "We may use information you submit to respond and take steps you request, in accordance with our Privacy Policy and applicable law. Requesting service-related contact is not, by itself, consent to unrelated marketing. Marketing communications will be handled according to applicable law and the preferences or consents you provide.",
    ],
  },
  {
    id: "prohibited-activities",
    title: "Prohibited activities",
    paragraphs: ["You must not:"],
    items: [
      "Use the Website for unlawful, fraudulent, abusive or misleading purposes.",
      "Interfere with its operation, security or availability.",
      "Introduce malware or harmful code.",
      "Attempt unauthorised access to accounts, systems or integrations.",
      "Scrape or harvest personal data or Website content by automated means without permission, except where permitted by law.",
      "Impersonate another person or misrepresent professional credentials.",
      "Upload unlawful, infringing or confidential material without permission.",
      "Reverse engineer or extract source code or model parameters except to the extent a restriction is prohibited by law.",
      "Use an automated output for a medical or safety-critical decision where the feature is not expressly designed, authorised and documented for that use.",
    ],
    after: [
      "We may investigate suspected misuse and take proportionate action, including restricting access or referring conduct to an appropriate authority where legally justified.",
    ],
  },
  {
    id: "accounts",
    title: "Accounts and security (if enabled)",
    paragraphs: [
      `If accounts are enabled, provide accurate registration information and keep credentials secure. Notify ${termsDetails.supportEmail} promptly if you suspect unauthorised access. We may suspend or require verification where reasonably necessary for security, legal compliance or protection of users. If single sign-on (SSO) is provided, the identity provider’s terms and privacy notice may also apply. Do not share passwords or authentication codes.`,
    ],
  },
  {
    id: "intellectual-property",
    title: "Intellectual property",
    paragraphs: [
      "Unless stated otherwise, Website content—including text, graphics, branding, logos, layouts, software, designs and product materials—is owned by or licensed to QYX MedTech and protected by applicable law. We grant you a limited, revocable, non-exclusive, non-transferable permission to access and use the Website for its intended lawful purpose. You may not copy, modify, distribute, sell or create derivative works from Website materials except with our permission or as permitted by law. Rights not expressly granted are reserved. Third-party marks remain the property of their respective owners.",
    ],
  },
  {
    id: "user-content",
    title: "User-submitted content",
    paragraphs: [
      "You confirm that you have the right to submit any message, suggestion, document or other content (“User Content”) and that it does not violate law or another person’s rights. You retain rights you hold in User Content. You permit QYX MedTech to host, review, reproduce and use it only as reasonably necessary to respond to your request, operate the relevant feature, maintain security and carry out purposes described in our Privacy Policy or separately agreed. Submission does not transfer ownership to QYX MedTech. Health information and confidential material are subject to the Privacy Policy and any applicable separate terms.",
    ],
  },
  {
    id: "integrations",
    title: "Third-party links and integrations",
    paragraphs: [
      "The Website may link to or integrate with third-party services, including healthcare providers, identity/SSO services, communications providers, payment providers or pharmacy/order services if enabled. These third parties may have their own terms and privacy notices. We do not control third-party content, availability, security, products or practices except to the extent responsibility cannot lawfully be excluded. Before an integration is activated, the relevant feature should explain the third party involved and what information may be transferred.",
    ],
  },
  {
    id: "payments",
    title: "Orders, payments and ePharma",
    paragraphs: [
      "Unless the Website expressly enables ordering or payment and displays transaction terms, these Terms do not constitute an offer to sell medicines, medical devices or other goods and do not set prices, delivery, cancellation or refund rules.",
      "If ePharma, ordering, payments or delivery functionality is introduced, separate legally reviewed terms must be displayed before the transaction. They should identify the seller or service provider, product and price details, payment and delivery process, cancellations and refunds, customer support and grievance details, prescription requirements where relevant, and the responsibilities of QYX MedTech and any pharmacy or fulfilment partner. Do not launch checkout until these details are approved.",
    ],
  },
  {
    id: "privacy",
    title: "Privacy",
    paragraphs: [
      `Our collection and use of personal data is described in the QYX MedTech Privacy Policy at ${termsDetails.privacyPolicyUrl}. Read it before submitting information. Separate notices or consents may apply to specific features where required.`,
    ],
  },
  {
    id: "availability",
    title: "Availability and changes",
    paragraphs: [
      "We aim to keep the Website available and accurate but do not guarantee uninterrupted, error-free or continuously available operation. We may perform maintenance, correct errors, update content or suspend a feature for security, operational, legal or business reasons.",
      "We may update these Terms by publishing a revised version and changing the “Last updated” date. Where required by law or where a material change requires renewed acceptance, we will provide notice or request acceptance. Continued use indicates acceptance only to the extent permitted by applicable law.",
    ],
  },
  {
    id: "disclaimers",
    title: "Disclaimers",
    paragraphs: [
      "To the maximum extent permitted by law, the Website and general informational content are provided on an “as available” basis, without warranties not expressly made in writing. We do not warrant that all information will always be complete, current, accurate, uninterrupted, secure or suitable for every purpose. Nothing in these Terms excludes a right, remedy or liability that cannot lawfully be excluded or limited, or removes mandatory consumer protections.",
    ],
  },
  {
    id: "liability",
    title: "Limitation of liability",
    paragraphs: [
      "To the maximum extent permitted by law, QYX MedTech will not be liable for indirect, incidental, special or consequential loss arising from use of, or inability to use, the Website where such exclusion is lawful. Subject to applicable law, we are not responsible for independent third-party clinical decisions or third-party services. This clause does not exclude liability for fraud, wilful misconduct, or any death, personal injury, statutory obligation or other liability that cannot lawfully be excluded or limited. Any liability cap for a paid service must be separately documented and reviewed by counsel.",
    ],
  },
  {
    id: "indemnity",
    title: "Indemnity",
    paragraphs: [
      "To the extent permitted by law, you are responsible for losses and reasonable costs directly caused by your unlawful use of the Website, material breach of these Terms or infringement of another person’s rights. This does not apply to the extent the loss was caused by QYX MedTech’s own breach or conduct for which liability cannot lawfully be excluded.",
    ],
  },
  {
    id: "termination",
    title: "Suspension and termination",
    paragraphs: [
      "You may stop using the Website at any time. We may restrict or suspend access where reasonably necessary for security, maintenance, suspected unlawful activity, material breach or compliance with law. Where appropriate and legally permitted, we will provide an explanation or an opportunity to resolve the issue. Provisions that by nature should continue after use ends—including intellectual property, disclaimers, liability and dispute provisions—continue to apply to the extent permitted by law.",
    ],
  },
  {
    id: "governing-law",
    title: "Governing law and disputes",
    paragraphs: [
      `These Terms are governed by the laws of India. Subject to mandatory law and consumer rights, courts at ${termsDetails.jurisdiction} shall have jurisdiction over disputes arising from these Terms. This does not prevent a consumer from exercising a statutory right to approach a competent consumer commission or other forum where permitted by law. You may contact ${termsDetails.legalEmail} to attempt an informal resolution; this does not limit statutory rights or applicable limitation periods.`,
    ],
  },
  {
    id: "general",
    title: "General",
    paragraphs: [
      "If any provision is unenforceable, the remaining provisions continue to apply to the extent permitted by law. Failure to enforce a provision is not a waiver. You may not transfer your rights or obligations without written consent except where law permits. These Terms, the Privacy Policy and clearly presented additional feature terms govern use of the Website. They do not override a separate signed agreement that expressly governs the relevant subject matter.",
    ],
  },
  {
    id: "contact",
    title: "Contact",
    contact: true,
  },
];

export default function TermsPage() {
  return (
    <>
    <Navbar/>
    <main className="qyx-terms" id="terms-top">
      <header className="qyx-terms__hero">
        <div className="qyx-terms__container">
          <nav className="qyx-terms__breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Terms of Use</span>
          </nav>

          <div className="qyx-terms__hero-content">
            <div>
              <p className="qyx-terms__eyebrow">QYX MEDTECH · LEGAL</p>

              <h1>
                Terms of <em>Use.</em>
              </h1>

              <p className="qyx-terms__intro">
                Please read these terms before using our website,
                submitting information or accessing its features.
              </p>

              <div className="qyx-terms__metadata">
                <span>Last updated: {termsDetails.lastUpdated}</span>
                {/* <span className="qyx-terms__draft-badge">
                  Draft · Pending approval
                </span> */}
              </div>
            </div>

            <div className="qyx-terms__hero-icon" aria-hidden="true">
              <FileText />
            </div>
          </div>
        </div>
      </header>

      <div className="qyx-terms__container qyx-terms__body">
        <aside className="qyx-terms__sidebar">
          <nav className="qyx-terms__contents" aria-label="Terms contents">
            <p>ON THIS PAGE</p>

            <ol>
              {termsSections.map((section, index) => (
                <li key={section.id}>
                  <a href={`#terms-${section.id}`}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <div className="qyx-terms__document">
          {/* <div className="qyx-terms__draft-notice" role="note">
            <strong>Draft for review</strong>
            <p>
              This page contains unresolved business and legal details.
              Complete all bracketed fields, confirm that the terms match
              the live services, and obtain legal approval before publication.
            </p>
          </div> */}

          <details className="qyx-terms__mobile-contents">
            <summary>Browse all 22 sections</summary>

            <nav aria-label="Mobile terms contents">
              <ol>
                {termsSections.map((section) => (
                  <li key={section.id}>
                    <a href={`#terms-${section.id}`}>
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </details>

          <article className="qyx-terms__article" aria-label="Terms of Use">
            {termsSections.map((section, index) => (
              <section
                className="qyx-terms__section"
                id={`terms-${section.id}`}
                aria-labelledby={`terms-heading-${section.id}`}
                key={section.id}
              >
                <div className="qyx-terms__section-heading">
                  <span aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <h2 id={`terms-heading-${section.id}`}>
                    {section.title}
                  </h2>
                </div>

                <div className="qyx-terms__section-content">
                  {section.paragraphs?.map((paragraph, paragraphIndex) => (
                    <p key={paragraphIndex}>{paragraph}</p>
                  ))}

                  {section.items && (
                    <ol className="qyx-terms__activities" type="a">
                      {section.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ol>
                  )}

                  {section.after?.map((paragraph, paragraphIndex) => (
                    <p key={paragraphIndex}>{paragraph}</p>
                  ))}

                  {section.contact && (
                    <dl className="qyx-terms__contact">
                      <div>
                        <dt>Organisation</dt>
                        <dd>{termsDetails.legalEntity} / QYX MedTech</dd>
                      </div>

                      <div>
                        <dt>Address</dt>
                        <dd>{termsDetails.address}</dd>
                      </div>

                      <div>
                        <dt>General / legal email</dt>
                        <dd>{termsDetails.legalEmail}</dd>
                      </div>

                      <div>
                        <dt>Support / security email</dt>
                        <dd>{termsDetails.supportEmail}</dd>
                      </div>

                      <div>
                        <dt>Privacy email</dt>
                        <dd>{termsDetails.privacyEmail}</dd>
                      </div>

                      <div>
                        <dt>Last updated</dt>
                        <dd>{termsDetails.lastUpdated}</dd>
                      </div>
                    </dl>
                  )}
                </div>
              </section>
            ))}

            <div className="qyx-terms__bottom">
              <p>QYX MedTech · Terms of Use</p>

              <a href="#terms-top">
                Back to top
                <ArrowUp size={16} aria-hidden="true" />
              </a>
            </div>
          </article>
        </div>
      </div>
    </main>
    <Footer/>
    </>
  );
}