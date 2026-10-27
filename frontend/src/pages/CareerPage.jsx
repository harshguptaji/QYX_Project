import { useId, useRef, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  HeartHandshake,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
  submitCareerApplicationAPI,
} from "../features/career/careerAPI";

import "./CareerPage.css";

const values = [
  {
    title: "Care comes first.",
    description:
      "Think about the person behind every screen, question and decision. Build experiences that respect their dignity.",
    icon: HeartHandshake,
  },
  {
    title: "Earn people’s trust.",
    description:
      "Be clear about what we can do, protect personal information and make promises we can stand behind.",
    icon: ShieldCheck,
  },
  {
    title: "Stay curious.",
    description:
      "Ask better questions, listen to different perspectives and keep improving the way we work.",
    icon: Lightbulb,
  },
];

const hiringSteps = [
  {
    number: "01",
    title: "Introduce yourself",
    description:
      "Share your background, interests and the kind of work you would like to contribute.",
  },
  {
    number: "02",
    title: "Explore the fit",
    description:
      "If there is a suitable opportunity, our team may reach out to learn more about you.",
  },
  {
    number: "03",
    title: "Discuss what comes next",
    description:
      "We will explain the expectations and any further conversations or practical work involved.",
  },
];

const getEmptyForm = () => ({
  name: "",
  email: "",
  mobile: "",
  interest: "",
  experience: "",
  profileUrl: "",
  message: "",
});

export default function CareerPage() {
  const id = useId();
  const submittingRef = useRef(false);

  const [form, setForm] = useState(getEmptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setFeedback(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submittingRef.current) return;

    const fields = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      mobile: form.mobile.trim(),
      interest: form.interest.trim(),
      experience: form.experience,
      profileUrl: form.profileUrl.trim(),
      message: form.message.trim(),
    };

    if (
      !fields.name ||
      !fields.email ||
      !fields.mobile ||
      !fields.interest ||
      !fields.message
    ) {
      setFeedback({
        type: "error",
        message: "Please complete all required fields.",
      });

      return;
    }

    if (!/^[6-9]\d{9}$/.test(fields.mobile)) {
      setFeedback({
        type: "error",
        message: "Enter a valid 10-digit Indian mobile number.",
      });

      return;
    }

    if (fields.profileUrl) {
      try {
        const url = new URL(fields.profileUrl);

        if (!["http:", "https:"].includes(url.protocol)) {
          throw new Error("Invalid URL protocol.");
        }
      } catch {
        setFeedback({
          type: "error",
          message:
            "Enter a valid profile link starting with http:// or https://.",
        });

        return;
      }
    }

    submittingRef.current = true;
    setSubmitting(true);
    setFeedback(null);

    try {
      const response = await submitCareerApplicationAPI(fields);

      setForm(getEmptyForm());

      setFeedback({
        type: "success",
        message:
          response.message ||
          "Thank you for introducing yourself. Your career enquiry has been submitted to the QYX team.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error.response?.data?.message ||
          error.message ||
          "Unable to send your enquiry. Please try again.",
      });
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="qyx-careers">
        <section
          className="qyx-careers__hero"
          aria-labelledby="careers-title"
        >
          <div className="qyx-careers__container">
            <nav
              className="qyx-careers__breadcrumb"
              aria-label="Breadcrumb"
            >
              <Link to="/">Home</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">Careers</span>
            </nav>

            <div className="qyx-careers__hero-grid">
              <div className="qyx-careers__hero-content">
                <p className="qyx-careers__eyebrow">
                  CAREERS AT QYX MEDTECH
                </p>

                <h1 id="careers-title">
                  Good work starts
                  <br />
                  with <em>real purpose.</em>
                </h1>

                <p className="qyx-careers__intro">
                  Help us make conversations around male fertility
                  more informed, more private and easier to begin.
                </p>

                <a
                  href="#career-form"
                  className="qyx-careers__primary"
                >
                  Introduce yourself
                  <ArrowRight aria-hidden="true" />
                </a>

                <p className="qyx-careers__hero-note">
                  Different skills. A shared commitment to better care.
                </p>
              </div>

              <div className="qyx-careers__visual">
                <div className="qyx-careers__visual-top">
                  <span>PEOPLE · PURPOSE · PROGRESS</span>
                  <Sparkles aria-hidden="true" />
                </div>

                <div
                  className="qyx-careers__visual-symbol"
                  aria-hidden="true"
                >
                  <div className="qyx-careers__symbol-ring" />
                  <HeartHandshake />
                  <span className="qyx-careers__symbol-dot" />
                </div>

                <p className="qyx-careers__visual-heading">
                  Build something
                  <br />
                  that matters.
                </p>

                <p className="qyx-careers__visual-copy">
                  Bring your perspective to the intersection of
                  healthcare, technology and human understanding.
                </p>

                <div className="qyx-careers__visual-bottom">
                  <strong>QYX MedTech</strong>
                  <span>Care, thoughtfully connected.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className="qyx-careers__purpose"
          aria-labelledby="careers-purpose-title"
        >
          <div className="qyx-careers__container qyx-careers__purpose-grid">
            <div>
              <p className="qyx-careers__eyebrow">
                WHY WE ARE HERE
              </p>

              <h2 id="careers-purpose-title">
                Some conversations
                <br />
                need a <em>better starting point.</em>
              </h2>
            </div>

            <div className="qyx-careers__purpose-copy">
              <p>
                Fertility concerns can be difficult to talk about.
                Uncertainty, stigma and confusing information can make
                the first step feel bigger than it should.
              </p>

              <p>
                At QYX, we are working on clearer education, private
                connections to specialists and thoughtful healthcare
                technology. We value people who care about both the
                quality of their work and the people it reaches.
              </p>

              <Link
                to="/about"
                className="qyx-careers__text-link"
              >
                Get to know QYX
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section
          className="qyx-careers__values"
          aria-labelledby="careers-values-title"
        >
          <div className="qyx-careers__container">
            <div className="qyx-careers__section-heading">
              <p className="qyx-careers__eyebrow">
                WHAT GUIDES THE WORK
              </p>

              <h2 id="careers-values-title">
                Thoughtful people.
                <em> Shared principles.</em>
              </h2>

              <p>
                The way we build matters as much as what we build.
              </p>
            </div>

            <div className="qyx-careers__values-grid">
              {values.map(({ title, description, icon: Icon }) => (
                <article
                  className="qyx-careers__value-card"
                  key={title}
                >
                  <div className="qyx-careers__card-icon">
                    <Icon aria-hidden="true" />
                  </div>

                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className="qyx-careers__process"
          aria-labelledby="careers-process-title"
        >
          <div className="qyx-careers__container">
            <div className="qyx-careers__section-heading">
              <p className="qyx-careers__eyebrow">
                STARTING THE CONVERSATION
              </p>

              <h2 id="careers-process-title">
                A clear introduction.
                <em> A thoughtful next step.</em>
              </h2>

              <p>
                Share your interest today. If a relevant opportunity is
                available, we may contact you to continue the conversation.
              </p>
            </div>

            <ol className="qyx-careers__steps">
              {hiringSteps.map((step) => (
                <li
                  className="qyx-careers__step"
                  key={step.number}
                >
                  <span
                    className="qyx-careers__step-number"
                    aria-hidden="true"
                  >
                    {step.number}
                  </span>

                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          className="qyx-careers__application"
          id="career-form"
          aria-labelledby={`${id}-form-title`}
        >
          <div className="qyx-careers__container qyx-careers__application-grid">
            <div className="qyx-careers__application-content">
              <div
                className="qyx-careers__application-icon"
                aria-hidden="true"
              >
                <UsersRound />
              </div>

              <p className="qyx-careers__eyebrow">
                BRING YOUR PERSPECTIVE
              </p>

              <h2 id={`${id}-form-title`}>
                Tell us about
                <em> yourself.</em>
              </h2>

              <p>
                Share your background, interests and the work you would
                like to contribute to QYX.
              </p>

              <div className="qyx-careers__application-note">
                <ShieldCheck aria-hidden="true" />

                <p>
                  Please share professional information only. Do not
                  include identity documents, medical information or
                  other sensitive details.
                </p>
              </div>

              <p className="qyx-careers__application-disclaimer">
                Submitting this form expresses your interest and does
                not guarantee an opening, interview or offer.
              </p>
            </div>

            <form
              className="qyx-careers__form"
              onSubmit={handleSubmit}
              aria-busy={submitting}
            >
              <div className="qyx-careers__form-heading">
                <h3>Career enquiry</h3>
                <p>Fields marked with * are required.</p>
              </div>

              <div className="qyx-careers__fields">
                <label htmlFor={`${id}-name`}>
                  Full name *
                  <input
                    id={`${id}-name`}
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    autoComplete="name"
                    placeholder="Your full name"
                    maxLength={100}
                    disabled={submitting}
                    required
                  />
                </label>

                <label htmlFor={`${id}-email`}>
                  Email address *
                  <input
                    id={`${id}-email`}
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    placeholder="you@example.com"
                    maxLength={254}
                    disabled={submitting}
                    required
                  />
                </label>

                <label htmlFor={`${id}-mobile`}>
                  Mobile number (+91) *
                  <input
                    id={`${id}-mobile`}
                    name="mobile"
                    type="tel"
                    inputMode="numeric"
                    value={form.mobile}
                    onChange={handleChange}
                    autoComplete="tel-national"
                    placeholder="9876543210"
                    pattern="[6-9][0-9]{9}"
                    maxLength={10}
                    title="Enter a valid 10-digit Indian mobile number."
                    disabled={submitting}
                    required
                  />
                </label>

                <label htmlFor={`${id}-experience`}>
                  Professional experience
                  <select
                    id={`${id}-experience`}
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                    disabled={submitting}
                  >
                    <option value="">Select experience</option>

                    <option value="Student / Fresher">
                      Student / Fresher
                    </option>

                    <option value="Less than 1 year">
                      Less than 1 year
                    </option>

                    <option value="1–3 years">
                      1–3 years
                    </option>

                    <option value="3–5 years">
                      3–5 years
                    </option>

                    <option value="5+ years">
                      5+ years
                    </option>
                  </select>
                </label>

                <label
                  className="qyx-careers__full"
                  htmlFor={`${id}-interest`}
                >
                  Area of interest *
                  <input
                    id={`${id}-interest`}
                    name="interest"
                    value={form.interest}
                    onChange={handleChange}
                    placeholder="For example: engineering, design or operations"
                    maxLength={150}
                    disabled={submitting}
                    required
                  />
                </label>

                <label
                  className="qyx-careers__full"
                  htmlFor={`${id}-profile`}
                >
                  Portfolio, LinkedIn or CV link
                  <input
                    id={`${id}-profile`}
                    name="profileUrl"
                    type="url"
                    value={form.profileUrl}
                    onChange={handleChange}
                    placeholder="https://"
                    maxLength={1000}
                    aria-describedby={`${id}-profile-hint`}
                    disabled={submitting}
                  />

                  <small id={`${id}-profile-hint`}>
                    Optional. Share a link our team can access without
                    requesting permission.
                  </small>
                </label>

                <label
                  className="qyx-careers__full"
                  htmlFor={`${id}-message`}
                >
                  A little about you *
                  <textarea
                    id={`${id}-message`}
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us about your skills, interests and why you would like to work with QYX."
                    rows={5}
                    maxLength={2500}
                    disabled={submitting}
                    required
                  />
                </label>
              </div>

              <p
                className="qyx-careers__form-notice"
                id={`${id}-notice`}
              >
                We will use these details to review and respond to your
                career enquiry. Read our{" "}
                <Link to="/privacy">Privacy Policy</Link>.
              </p>

              {feedback && (
                <p
                  className={`qyx-careers__feedback qyx-careers__feedback--${feedback.type}`}
                  role={
                    feedback.type === "error" ? "alert" : "status"
                  }
                >
                  {feedback.message}
                </p>
              )}

              <button
                type="submit"
                className="qyx-careers__primary qyx-careers__submit"
                disabled={submitting}
                aria-describedby={`${id}-notice`}
              >
                {submitting
                  ? "Sending enquiry…"
                  : "Send career enquiry"}

                <ArrowRight aria-hidden="true" />
              </button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}