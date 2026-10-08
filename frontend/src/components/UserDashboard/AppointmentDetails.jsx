import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  Clock,
  ExternalLink,
  FileText,
  LockKeyhole,
  MessageSquareText,
  Video,
} from "lucide-react";

import {
  appointmentStatusLabels,
  formatAppointmentDate,
  formatAppointmentFee,
  userAppointments,
} from "../../data/userAppointemnts";

import "./AppointmentDetails.css";

export default function AppointmentDetails() {
  const { appointmentId } = useParams();

  // Replace this lookup with your appointment details API later.
  const appointment = userAppointments.find(
    (item) => item.id === appointmentId
  );

  if (!appointment) {
    return (
      <section className="appointment-details">
        <Link
          to="/appointments"
          className="appointment-details__back"
        >
          <ArrowLeft aria-hidden="true" />
          Back to appointments
        </Link>

        <div className="appointment-details__not-found">
          <h1>Appointment not found.</h1>
          <p>
            Return to your appointments and select an available booking.
          </p>
        </div>
      </section>
    );
  }

  const bookingResponses = appointment.bookingResponses ?? [];
  const sessionSummary = appointment.sessionSummary;
  const prescription = appointment.prescription;
  const patient = appointment.patient ?? {};

  const canJoin =
    appointment.status === "upcoming" &&
    appointment.roomAvailable === true;

  const hasPrescription = Boolean(prescription?.url);

  const roomTitle = canJoin
    ? "Your consultation room is available."
    : appointment.status === "completed"
    ? "This consultation has ended."
    : appointment.status === "cancelled"
    ? "This appointment was cancelled."
    : "Your consultation room will open here.";

  const roomDescription = canJoin
    ? "Find a comfortable, quiet space and join when you’re ready."
    : appointment.status === "upcoming"
    ? "The Join room button will appear when the room is available."
    : "You can review your consultation records on this page.";

  return (
    <section
      className="appointment-details"
      aria-labelledby="appointment-details-title"
    >
      <Link
        to="/appointments"
        className="appointment-details__back"
      >
        <ArrowLeft aria-hidden="true" />
        Back to appointments
      </Link>

      <header className="appointment-details__heading">
        <p className="appointment-details__eyebrow">
          YOUR CONSULTATION
        </p>

        <h1 id="appointment-details-title">
          Appointment details.
        </h1>

        <p>Booking reference: {appointment.id}</p>
      </header>

      {/* Doctor */}
      <div className="appointment-details__doctor-panel">
        <div
          className="appointment-details__avatar"
          aria-hidden="true"
        >
          {appointment.initials}
        </div>

        <div className="appointment-details__doctor">
          <h2>{appointment.doctor}</h2>
          <p>{appointment.specialty}</p>
        </div>

        <span
          className={`appointment-details__status appointment-details__status--${appointment.status}`}
        >
          {appointmentStatusLabels[appointment.status] ||
            appointment.status}
        </span>
      </div>

      {/* Appointment information */}
      <div className="appointment-details__grid">
        <section className="appointment-details__panel">
          <h2>Consultation information</h2>

          <dl className="appointment-details__list">
            <div>
              <dt>
                <CalendarDays aria-hidden="true" />
                Date
              </dt>

              <dd>
                <time dateTime={appointment.date}>
                  {formatAppointmentDate(appointment.date)}
                </time>
              </dd>
            </div>

            <div>
              <dt>
                <Clock aria-hidden="true" />
                Time
              </dt>
              <dd>{appointment.time} IST</dd>
            </div>

            <div>
              <dt>Duration</dt>
              <dd>{appointment.duration || "Not provided"}</dd>
            </div>

            <div>
              <dt>
                <Video aria-hidden="true" />
                Consultation type
              </dt>
              <dd>{appointment.type || "Not provided"}</dd>
            </div>

            <div>
              <dt>Purpose of visit</dt>
              <dd>{appointment.purpose || "Not provided"}</dd>
            </div>
          </dl>
        </section>

        <section className="appointment-details__panel">
          <h2>Patient information</h2>

          <dl className="appointment-details__list">
            <div>
              <dt>Name</dt>
              <dd>{patient.name || "Not provided"}</dd>
            </div>

            <div>
              <dt>Email</dt>
              <dd>{patient.email || "Not provided"}</dd>
            </div>

            <div>
              <dt>Mobile number</dt>
              <dd>{patient.mobile || "Not provided"}</dd>
            </div>
          </dl>

          <p className="appointment-details__small-note">
            Patient details recorded when this appointment was booked.
          </p>
        </section>

        <section className="appointment-details__panel">
          <h2>Payment information</h2>

          <dl className="appointment-details__list">
            <div>
              <dt>Consultation fee</dt>
              <dd>
                {typeof appointment.fee === "number"
                  ? formatAppointmentFee(appointment.fee)
                  : "Not provided"}
              </dd>
            </div>

            <div>
              <dt>Payment status</dt>
              <dd>{appointment.paymentStatus || "Not provided"}</dd>
            </div>
          </dl>
        </section>

        <section className="appointment-details__panel">
          <h2>Booking notes</h2>

          <p className="appointment-details__notes">
            {appointment.notes ||
              "No additional notes were provided for this booking."}
          </p>
        </section>
      </div>

      {/* Answers recorded for this specific booking */}
      <section
        className="appointment-details__panel appointment-details__clinical-panel"
        aria-labelledby="appointment-booking-responses-title"
      >
        <div className="appointment-details__section-heading">
          <div className="appointment-details__section-icon">
            <ClipboardList aria-hidden="true" />
          </div>

          <div>
            <h2 id="appointment-booking-responses-title">
              Your booking responses
            </h2>

            <p>The answers you shared for this appointment.</p>
          </div>
        </div>

        {bookingResponses.length > 0 ? (
          <dl className="appointment-details__responses">
            {bookingResponses.map((response, index) => (
              <div
                className="appointment-details__response"
                key={
                  response.questionId ||
                  `${response.question}-${index}`
                }
              >
                <dt>
                  <span aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  {response.question}
                </dt>

                <dd>
                  {response.answer?.trim() ||
                    "No response provided."}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="appointment-details__empty-text">
            No booking responses are available for this appointment.
          </p>
        )}
      </section>

      {/* Prescription and session summary */}
      <section
        className="appointment-details__panel appointment-details__clinical-panel"
        aria-labelledby="appointment-session-record-title"
      >
        <div className="appointment-details__section-heading">
          <div className="appointment-details__section-icon">
            <FileText aria-hidden="true" />
          </div>

          <div>
            <h2 id="appointment-session-record-title">
              Prescription & session summary
            </h2>

            <p>
              Your specialist’s published records for this consultation.
            </p>
          </div>
        </div>

        <div className="appointment-details__records">
          <div className="appointment-details__session-summary">
            <div className="appointment-details__record-heading">
              <MessageSquareText aria-hidden="true" />
              <h3>Session summary</h3>
            </div>

            {sessionSummary ? (
              <>
                {sessionSummary.publishedAt && (
                  <p className="appointment-details__record-date">
                    Published{" "}
                    {formatAppointmentDate(
                      sessionSummary.publishedAt
                    )}
                  </p>
                )}

                <dl className="appointment-details__summary-list">
                  <div>
                    <dt>What we discussed</dt>
                    <dd>
                      {sessionSummary.discussion ||
                        "No discussion notes provided."}
                    </dd>
                  </div>

                  <div>
                    <dt>Recommended next steps</dt>
                    <dd>
                      {sessionSummary.nextSteps ||
                        "No next steps recorded."}
                    </dd>
                  </div>

                  <div>
                    <dt>Follow-up plan</dt>
                    <dd>
                      {sessionSummary.followUp ||
                        "No follow-up plan recorded."}
                    </dd>
                  </div>
                </dl>
              </>
            ) : (
              <p className="appointment-details__empty-text">
                {appointment.status === "cancelled"
                  ? "No session summary is available for this cancelled appointment."
                  : appointment.status === "completed"
                  ? "Your specialist has not published a session summary yet."
                  : "Your summary will appear here after your specialist publishes it."}
              </p>
            )}
          </div>

          <div className="appointment-details__prescription">
            <div className="appointment-details__record-heading">
              <FileText aria-hidden="true" />
              <h3>Prescription</h3>
            </div>

            {hasPrescription ? (
              <>
                <p className="appointment-details__filename">
                  {prescription.fileName || "Prescription document"}
                </p>

                {prescription.issuedAt && (
                  <p className="appointment-details__record-date">
                    Issued{" "}
                    {formatAppointmentDate(prescription.issuedAt)}
                  </p>
                )}

                <a
                  href={prescription.url}
                  className="appointment-details__prescription-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View prescription
                  <ExternalLink aria-hidden="true" />
                </a>
              </>
            ) : (
              <p className="appointment-details__empty-text">
                No prescription has been published for this appointment.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Consultation room */}
      <section className="appointment-details__room">
        <div className="appointment-details__room-icon">
          <Video aria-hidden="true" />
        </div>

        <div className="appointment-details__room-content">
          <h2>{roomTitle}</h2>
          <p>{roomDescription}</p>
        </div>

        {canJoin && (
          <Link
            to={`/meet-room/${encodeURIComponent(appointment.id)}`}
            className="appointment-details__join"
          >
            <Video aria-hidden="true" />
            Join room
          </Link>
        )}
      </section>

      <div className="appointment-details__privacy">
        <LockKeyhole aria-hidden="true" />
        <p>Choose a private space for your consultation.</p>
      </div>

      <p className="appointment-details__small-note">
        Demo data. Connect your backend for appointment records and
        consultation room availability.
      </p>
    </section>
  );
}