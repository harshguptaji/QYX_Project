import { Link } from "react-router-dom";
import { ArrowUp, ShieldCheck } from "lucide-react";

import "./TermsPage.css";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const privacyDetails = {
  website: "[WEBSITE URL]",
  legalEntity: "[FULL LEGAL ENTITY NAME]",
  address: "[REGISTERED / BUSINESS ADDRESS]",
  privacyEmail: "[PRIVACY EMAIL]",
  contactMethod: "[PHONE / OTHER CONTACT METHOD]",
  withdrawalMethod: "[CONSENT WITHDRAWAL METHOD / PRIVACY EMAIL]",
  grievanceContact: "[NAME OR DESIGNATION]",
  phone: "[OPTIONAL PHONE]",
  responseProcess: "[INSERT APPROVED PROCESS AND LEGALLY VERIFIED TIMELINE]",
  retention:
    "[INSERT APPROVED RETENTION PERIODS FOR ENQUIRIES, HEALTH-RELATED MESSAGES/UPLOADS, DOCTOR APPLICATIONS, ACCOUNTS, ORDERS, CONSENT RECORDS, SUPPORT TICKETS AND SECURITY LOGS]",
  lastUpdated: "[INSERT PUBLICATION DATE]",
};

const privacySections = [
  {
    id: "who-we-are",
    title: "Who we are",
    paragraphs: [
      `This Privacy Policy explains how QYX MedTech (“QYX MedTech”, “we”, “us” or “our”) collects, uses, stores, shares and otherwise processes personal data when you visit our website at ${privacyDetails.website}, contact us, submit an enquiry, request an appointment or referral, apply to work with us as a healthcare professional, or use any related digital service described on the website.`,
      `For this policy, the organisation responsible for the website and the relevant personal data is: ${privacyDetails.legalEntity}, having its registered/principal office at ${privacyDetails.address}. You can contact us at ${privacyDetails.privacyEmail} or ${privacyDetails.contactMethod}.`,
      "QYX MedTech’s services may include helping users discover or connect with doctors and diagnostic centres, receiving healthcare-related enquiries, supporting appointment or referral requests, and developing digital health or ePharma-related integrations. Only services actually available on the website should be treated as currently offered.",
    ],
  },
  {
    id: "scope",
    title: "Scope of this policy",
    paragraphs: [
      "This policy applies to personal data collected through our website, enquiry and contact forms, appointment or referral flows, doctor/partner application forms, customer support channels linked from the website, and any chatbot or account feature that links to this policy. A separate notice or additional terms may apply to a specific product, clinical service, application or third-party platform.",
      "This policy does not automatically govern third-party websites, apps, pharmacies, hospitals, doctors, diagnostic centres or payment providers that you access through links or integrations. Please review their privacy notices before sharing information with them.",
    ],
  },
  {
    id: "data-collected",
    title: "Personal data we may collect",
    paragraphs: [
      "Depending on the feature you use, we may collect the following categories of data:",
    ],
    items: [
      {
        label: "Contact and identity information",
        text: "Such as name, phone number, email address, city, and preferred contact method.",
      },
      {
        label: "Enquiry and appointment information",
        text: "Such as the service or specialist requested, preferred date/time, referral details, and messages you send us.",
      },
      {
        label: "Health-related information you choose to provide",
        text: "Such as male-fertility concerns, symptoms, medical history, test or report details, or other information included in a message or uploaded document. Please share only what is needed for your enquiry.",
      },
      {
        label: "Doctor, clinic or partner application information",
        text: "Such as name, professional role, specialisation, clinic/hospital, city, contact details, qualifications, registration details and information submitted for verification.",
      },
      {
        label: "Account and authentication information",
        text: "If accounts or single sign-on (SSO) are enabled, such as account identifiers and authentication status provided by the relevant identity provider. We should not collect or store a third-party password unless a clearly documented, secure flow specifically requires it.",
      },
      {
        label: "Transaction or order information",
        text: "If ePharma or other ordering features are launched, such as order identifiers, items requested, delivery details, payment status and transaction references. Payment card or banking credentials should be handled by the payment provider, where applicable, rather than stored by QYX MedTech.",
      },
      {
        label: "Technical and usage data",
        text: "Such as IP address, browser/device type, pages viewed, referring pages, approximate usage timestamps, diagnostic logs and cookie or similar technology identifiers.",
      },
      {
        label: "Communications and preferences",
        text: "Such as support correspondence, consent choices, marketing preferences and records of requests to exercise privacy rights.",
      },
    ],
    after: [
      "Please do not submit another person’s personal or health information unless you are authorised to do so. We do not intend to collect more information than is reasonably needed for the feature you choose to use.",
    ],
  },
  {
    id: "collection",
    title: "How we collect data",
    paragraphs: [
      "We collect information directly when you fill in a form, contact us, request a referral or appointment, apply as a doctor or partner, upload a file, or interact with a chatbot. Some technical information may be collected automatically by our website, hosting provider, security tools and analytics tools. If you use an integrated service, we may receive limited information from that provider as explained at the point of use.",
    ],
  },
  {
    id: "purposes",
    title: "Why we use personal data",
    paragraphs: [
      "We may use personal data for the following purposes, as applicable to the feature you use:",
    ],
    items: [
      "To respond to enquiries and provide customer support.",
      "To help you find or connect with relevant doctors, clinics or diagnostic centres and to coordinate appointment or referral requests.",
      "To assess and respond to doctor, clinic, supplier or business-partner applications.",
      "To operate, maintain, troubleshoot and improve the website and its features.",
      "To provide account access, identity verification or SSO functionality if enabled.",
      "To facilitate ePharma or other orders, fulfilment, customer support and transaction reconciliation if those features are launched.",
      "To protect the website, detect abuse, investigate security incidents and prevent fraud.",
      "To comply with applicable law, lawful requests and record-keeping obligations.",
      "To send service-related communications.",
      "To send promotional communications only where permitted by law and subject to any required consent or opt-out.",
    ],
    after: [
      "We will not use health-related information for unrelated advertising or marketing without a valid legal basis and any consent required by applicable law. We will not sell personal data as a business practice.",
    ],
  },
  {
    id: "consent",
    title: "Legal basis, notice and consent",
    paragraphs: [
      "Where required by applicable law, we will provide a clear notice describing the personal data collected and the specific purposes for which it is used, and obtain consent before processing that requires consent. Where processing is permitted or required under another applicable legal ground, we will rely on that ground and explain it where required.",
      "You may choose not to provide optional information. However, if you do not provide information necessary for a requested service, we may be unable to respond to your enquiry, coordinate an appointment or complete the relevant request.",
      `Where consent is used, you may withdraw it using ${privacyDetails.withdrawalMethod}. Withdrawal does not make earlier processing unlawful and may affect our ability to continue the feature or service for which the data was collected. We will make the withdrawal process reasonably accessible and comparable to the process used to give consent, as required by applicable law.`,
    ],
  },
  {
    id: "healthcare",
    title: "Healthcare information and service limitations",
    paragraphs: [
      "QYX MedTech is a technology and healthcare-access platform. Unless a specific service is expressly described and appropriately authorised, website content, enquiry forms and any automated chatbot are not a substitute for professional medical advice, diagnosis or treatment. A chatbot or automated workflow should not be relied on for diagnosis, emergency assessment or treatment decisions.",
      "Submitting an enquiry does not by itself create a doctor-patient relationship or guarantee an appointment, referral, diagnosis, treatment, availability or outcome. Clinical care, prescriptions, diagnostic testing and medical records may be handled by independent healthcare professionals or facilities under their own professional responsibilities and privacy practices.",
      "Please do not use website forms for emergencies. If you believe you are experiencing a medical emergency, contact local emergency services or seek urgent in-person medical care.",
    ],
  },
  {
    id: "sharing",
    title: "When we share personal data",
    paragraphs: [
      "We may share limited personal data, only as reasonably needed and subject to applicable law, with:",
    ],
    items: [
      "Doctors, clinics, diagnostic centres or healthcare partners you ask us to connect you with, so they can respond to your request.",
      "Website hosting, cloud storage, customer support, communications, security, analytics and software service providers acting on our instructions.",
      "ePharma, order-fulfilment, identity/SSO, payment or other integration partners, but only if the relevant feature is enabled and the sharing is necessary for it.",
      "Our professional advisers, auditors and insurers where reasonably required.",
      "Government, law-enforcement, regulatory or other authorities where disclosure is legally required or necessary to protect rights, safety or security.",
      "A successor or transaction counterparty in connection with a merger, restructuring or transfer of business, subject to appropriate safeguards and applicable law.",
    ],
    after: [
      "We do not authorise service providers to use personal data for their own unrelated purposes. Where another organisation independently determines how it processes data—for example, a doctor, hospital, pharmacy or identity provider—its own privacy notice and terms may also apply.",
    ],
  },
  {
    id: "third-parties",
    title: "Third-party links and integrations",
    paragraphs: [
      "Our website may link to or integrate with third-party websites and services. Their availability, security, privacy practices and content are not controlled by QYX MedTech. Before proceeding with an external service, review its privacy notice and understand which information it receives. The website should identify the relevant provider and explain the data transfer at the point where an integration is activated.",
      "Any proposed integration with a pharmacy, SSO provider, appointment system, analytics provider or other partner must be documented before launch, including the categories of data transferred, purpose, retention, security responsibilities and applicable contractual terms.",
    ],
  },
  {
    id: "cookies",
    title: "Cookies and similar technologies",
    paragraphs: [
      "Our website may use essential cookies or similar technologies to operate securely, remember preferences, maintain sessions and protect against abuse. If we use analytics, advertising or other non-essential technologies, we will provide appropriate information and obtain consent where required by law. You can also control cookies through your browser settings, although disabling essential cookies may affect website functionality.",
    ],
  },
  {
    id: "retention",
    title: "Data retention",
    paragraphs: [
      "We retain personal data only for as long as reasonably necessary for the purpose for which it was collected, to provide the requested service, to maintain relevant records, to resolve disputes, to protect the website, and to meet applicable legal obligations. The retention period may vary by data category and service.",
      `Our retention schedule is: ${privacyDetails.retention}. When data is no longer required, we will securely delete it, anonymise it, or otherwise handle it in accordance with applicable law. Some records may need to be retained where required by law or for the establishment, exercise or defence of legal claims.`,
    ],
  },
  {
    id: "security",
    title: "Security",
    paragraphs: [
      "We use reasonable technical and organisational safeguards designed to protect personal data against unauthorised access, loss, misuse, alteration or disclosure. Safeguards may include access controls, encryption where appropriate, secure transmission, backups, monitoring, staff access restrictions and vendor controls. No method of transmission or storage is completely secure, and we cannot guarantee absolute security.",
      "If a personal data breach occurs, we will assess and respond to it and provide notices to affected individuals or authorities where required by applicable law.",
    ],
  },
  {
    id: "international-processing",
    title: "Data processed outside India",
    paragraphs: [
      "Some service providers may process or store information in locations outside India. Where this occurs, we will assess the relevant provider, apply appropriate contractual and security safeguards, and comply with applicable Indian law and any restrictions on transfers to particular jurisdictions.",
    ],
  },
  {
    id: "rights",
    title: "Your choices and privacy rights",
    paragraphs: [
      "Subject to applicable law and any conditions or exceptions that apply, you may be able to request access to information about your personal data, correction or updating of inaccurate data, erasure, withdrawal of consent, or other rights available under applicable law. You may also opt out of promotional communications using the unsubscribe method provided or by contacting us.",
      `To make a privacy request, contact ${privacyDetails.privacyEmail} with the subject line “Privacy Request”. We may need to verify your identity and clarify the request before acting. We will respond within the time required by applicable law. We may retain certain information where legally permitted or required.`,
      "If you are dissatisfied with our response, you may contact our grievance/privacy contact listed below and, where applicable, use the complaint or grievance mechanism available under Indian law.",
    ],
  },
  {
    id: "children",
    title: "Children and minors",
    paragraphs: [
      "Our website is not intended to encourage children to provide personal data independently. If a service is intended for or may be used by a person under 18, the relevant flow must be reviewed and configured to meet the requirements applicable to children and, where relevant, parental or guardian consent and safeguards.",
    ],
  },
  {
    id: "changes",
    title: "Changes to this policy",
    paragraphs: [
      "We may update this Privacy Policy to reflect changes to our services, technology, data practices or legal obligations. We will publish the updated version on this page and revise the “Last updated” date. Where required by law, we will provide additional notice or obtain consent for material changes.",
      `Last updated: ${privacyDetails.lastUpdated}`,
    ],
  },
  {
    id: "contact",
    title: "Contact and grievance redressal",
    paragraphs: [
      "For privacy questions, requests or complaints, contact:",
    ],
    contact: true,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
    <Navbar/>
    <main className="qyx-terms" id="privacy-top">
      <header className="qyx-terms__hero">
        <div className="qyx-terms__container">
          <nav
            className="qyx-terms__breadcrumb"
            aria-label="Breadcrumb"
          >
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Privacy Policy</span>
          </nav>

          <div className="qyx-terms__hero-content">
            <div>
              <p className="qyx-terms__eyebrow">
                QYX MEDTECH · PRIVACY
              </p>

              <h1>
                Privacy <em>Policy.</em>
              </h1>

              <p className="qyx-terms__intro">
                Understand how we collect, use and share personal
                information, and the choices available to you.
              </p>

              <div className="qyx-terms__metadata">
                <span>
                  Last updated: {privacyDetails.lastUpdated}
                </span>

                {/* <span className="qyx-terms__draft-badge">
                  Draft · Pending approval
                </span> */}
              </div>
            </div>

            <div
              className="qyx-terms__hero-icon"
              aria-hidden="true"
            >
              <ShieldCheck />
            </div>
          </div>
        </div>
      </header>

      <div className="qyx-terms__container qyx-terms__body">
        <aside className="qyx-terms__sidebar">
          <nav
            className="qyx-terms__contents"
            aria-label="Privacy policy contents"
          >
            <p>ON THIS PAGE</p>

            <ol>
              {privacySections.map((section, index) => (
                <li key={section.id}>
                  <a href={`#privacy-${section.id}`}>
                    <span>
                      {String(index + 1).padStart(2, "0")}
                    </span>
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
              Complete the bracketed details and confirm actual data
              collection, vendors, cookies, retention periods and
              international processing before publication. Policy
              statements must match your live services and receive
              legal approval.
            </p>
          </div> */}

          <details className="qyx-terms__mobile-contents">
            <summary>
              Browse all {privacySections.length} sections
            </summary>

            <nav aria-label="Mobile privacy policy contents">
              <ol>
                {privacySections.map((section) => (
                  <li key={section.id}>
                    <a href={`#privacy-${section.id}`}>
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </details>

          <article
            className="qyx-terms__article"
            aria-label="Privacy Policy"
          >
            {privacySections.map((section, index) => (
              <section
                className="qyx-terms__section"
                id={`privacy-${section.id}`}
                aria-labelledby={`privacy-heading-${section.id}`}
                key={section.id}
              >
                <div className="qyx-terms__section-heading">
                  <span aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <h2 id={`privacy-heading-${section.id}`}>
                    {section.title}
                  </h2>
                </div>

                <div className="qyx-terms__section-content">
                  {section.paragraphs?.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}

                  {section.items && (
                    <ul className="qyx-terms__activities">
                      {section.items.map((item, index) => (
                        <li key={index}>
                          {typeof item === "string" ? (
                            item
                          ) : (
                            <>
                              <strong>{item.label}: </strong>
                              {item.text}
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                  {section.after?.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}

                  {section.contact && (
                    <dl className="qyx-terms__contact">
                      <div>
                        <dt>Organisation</dt>
                        <dd>
                          {privacyDetails.legalEntity} / QYX MedTech
                        </dd>
                      </div>

                      <div>
                        <dt>Privacy / grievance contact</dt>
                        <dd>{privacyDetails.grievanceContact}</dd>
                      </div>

                      <div>
                        <dt>Email</dt>
                        <dd>{privacyDetails.privacyEmail}</dd>
                      </div>

                      <div>
                        <dt>Postal address</dt>
                        <dd>{privacyDetails.address}</dd>
                      </div>

                      <div>
                        <dt>Phone</dt>
                        <dd>{privacyDetails.phone}</dd>
                      </div>

                      <div>
                        <dt>Response process</dt>
                        <dd>{privacyDetails.responseProcess}</dd>
                      </div>
                    </dl>
                  )}
                </div>
              </section>
            ))}

            <div className="qyx-terms__bottom">
              <Link to="/terms-and-conditions">
                Terms of Use
              </Link>

              <a href="#privacy-top">
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