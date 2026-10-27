import { useEffect, useId, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";

import {
  ArrowLeft,
  ArrowUpRight,
  Mail,
  Save,
} from "lucide-react";

import {
  clearCareerDetails,
  clearCareerUpdateFeedback,
  fetchCareerApplication,
  reviewCareerApplication,
  updateCareerReadStatus,
} from "../../features/career/careerSlice";

import "./CareerApplicationDetails.css";

const statusLabels = {
  new: "New",
  reviewing: "Reviewing",
  shortlisted: "Shortlisted",
  contacted: "Contacted",
  hired: "Hired",
  rejected: "Rejected",
};

const formatDate = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Only render safe HTTP(S) links from submitted application data.
const getSafeUrl = (value) => {
  if (!value) return null;

  try {
    const url = new URL(value);

    return ["http:", "https:"].includes(url.protocol)
      ? url.href
      : null;
  } catch {
    return null;
  }
};

export default function CareerApplicationDetails() {
  const dispatch = useDispatch();
  const { applicationId } = useParams();

  const [retry, setRetry] = useState(0);
  const autoReadRef = useRef(null);

  const {
    application,
    requestedApplicationId,
    detailsStatus,
    detailsError,
    updates,
  } = useSelector((state) => state.career);

  const currentApplication =
    requestedApplicationId === applicationId
      ? application
      : null;

  const update = updates[applicationId];

  useEffect(() => {
    autoReadRef.current = null;

    const request = dispatch(
      fetchCareerApplication(applicationId)
    );

    return () => {
      request.abort();
      dispatch(clearCareerDetails());
    };
  }, [dispatch, applicationId, retry]);

  useEffect(() => {
    if (
      currentApplication &&
      detailsStatus === "succeeded" &&
      !currentApplication.isRead &&
      autoReadRef.current !== applicationId
    ) {
      autoReadRef.current = applicationId;

      dispatch(
        updateCareerReadStatus({
          applicationId,
          isRead: true,
        })
      );
    }
  }, [
    dispatch,
    applicationId,
    currentApplication,
    detailsStatus,
  ]);

  const loading =
    requestedApplicationId !== applicationId ||
    detailsStatus === "idle" ||
    detailsStatus === "loading";

  return (
    <section className="career-detail">
      <Link to="/accios/careers" className="career-detail__back">
        <ArrowLeft size={18} aria-hidden="true" />
        Back to career enquiries
      </Link>

      <header className="career-detail__heading">
        <p>CAREER MANAGEMENT</p>
        <h1>Enquiry details.</h1>
        <span>Review the information shared by the applicant.</span>
      </header>

      {loading ? (
        <div className="career-detail__state" role="status">
          Loading enquiry…
        </div>
      ) : detailsStatus === "failed" || !currentApplication ? (
        <div className="career-detail__state">
          <p role="alert">
            {detailsError || "Application information is unavailable."}
          </p>

          <button
            type="button"
            className="career-detail__button"
            onClick={() => setRetry((value) => value + 1)}
          >
            Try again
          </button>
        </div>
      ) : (
        <CareerApplicationContent
          key={applicationId}
          application={currentApplication}
          update={update}
        />
      )}
    </section>
  );
}

function CareerApplicationContent({ application, update }) {
  const dispatch = useDispatch();
  const id = useId();
  const savingRef = useRef(false);

  const currentAdmin = useSelector(
    (state) => state.adminAuth.admin
  );

  const [status, setStatus] = useState(application.status || "new");
  const [adminNotes, setAdminNotes] = useState(
    application.adminNotes || ""
  );

  const [localError, setLocalError] = useState("");

  const canReview = ["Root", "Admin"].includes(
    currentAdmin?.adminRole
  );

  const updating = update?.status === "loading";
  const profileUrl = getSafeUrl(application.profileUrl);

  const handleReview = async (event) => {
    event.preventDefault();

    if (!canReview || updating || savingRef.current) return;

    if (adminNotes.trim().length > 5000) {
      setLocalError("Notes must not exceed 5000 characters.");
      return;
    }

    savingRef.current = true;
    setLocalError("");

    dispatch(clearCareerUpdateFeedback(application._id));

    try {
      await dispatch(
        reviewCareerApplication({
          applicationId: application._id,
          status,
          adminNotes: adminNotes.trim(),
        })
      ).unwrap();
    } catch {
      // Redux displays the backend error.
    } finally {
      savingRef.current = false;
    }
  };

  return (
    <>
      <div className="career-detail__summary">
        <div className="career-detail__avatar" aria-hidden="true">
          {(application.name || "A")
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0])
            .join("")
            .toUpperCase() || "A"}
        </div>

        <div className="career-detail__identity">
          <h2>{application.name}</h2>
          <p>{application.interest}</p>
          <span>ID: {application._id}</span>
        </div>

        <span
          className={`career-detail__badge ${
            application.isRead
              ? "career-detail__badge--read"
              : "career-detail__badge--unread"
          }`}
        >
          {application.isRead ? "Read" : "Unread"}
        </span>
      </div>

      <section className="career-detail__panel">
        <div className="career-detail__panel-heading">
          <div>
            <h2>Applicant information</h2>
            <p>Details submitted through the career form.</p>
          </div>
        </div>

        <dl className="career-detail__fields">
          <div>
            <dt>Full name</dt>
            <dd>{application.name || "—"}</dd>
          </div>

          <div>
            <dt>Email address</dt>
            <dd>
              {application.email ? (
                <a href={`mailto:${application.email}`}>
                  {application.email}
                </a>
              ) : (
                "—"
              )}
            </dd>
          </div>

          <div>
            <dt>Mobile number</dt>
            <dd>
              {application.mobile ? (
                <a href={`tel:+91${application.mobile}`}>
                  +91 {application.mobile}
                </a>
              ) : (
                "—"
              )}
            </dd>
          </div>

          <div>
            <dt>Area of interest</dt>
            <dd>{application.interest || "—"}</dd>
          </div>

          <div>
            <dt>Experience</dt>
            <dd>{application.experience || "Not provided"}</dd>
          </div>

          <div>
            <dt>Received on</dt>
            <dd>{formatDate(application.createdAt)}</dd>
          </div>

          <div>
            <dt>Application status</dt>
            <dd>
              {statusLabels[application.status] ||
                application.status ||
                "—"}
            </dd>
          </div>

          <div>
            <dt>Portfolio / profile</dt>
            <dd>
              {profileUrl ? (
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open profile
                  <ArrowUpRight size={15} aria-hidden="true" />
                </a>
              ) : application.profileUrl ? (
                "Invalid profile link"
              ) : (
                "Not provided"
              )}
            </dd>
          </div>
        </dl>

        <div className="career-detail__message">
          <h3>Applicant’s introduction</h3>
          <p>{application.message || "No message provided."}</p>
        </div>

        {application.isRead && (
          <p className="career-detail__reader">
            Read by{" "}
            {application.readBy?.adminName || "an admin"}
            {" · "}
            {formatDate(application.readAt)}
          </p>
        )}

        {update?.error && !canReview && (
          <p className="career-detail__feedback career-detail__feedback--error" role="alert">
            {update.error}
          </p>
        )}

        {!application.isRead && update?.status === "failed" && (
          <button
            type="button"
            className="career-detail__button career-detail__button--outline"
            onClick={() =>
              dispatch(
                updateCareerReadStatus({
                  applicationId: application._id,
                  isRead: true,
                })
              )
            }
          >
            <Mail size={16} aria-hidden="true" />
            Retry marking as read
          </button>
        )}
      </section>

      <form
        className="career-detail__panel"
        onSubmit={handleReview}
        aria-busy={updating}
      >
        <div className="career-detail__panel-heading">
          <div>
            <h2>Admin review</h2>
            <p>Update the application status and internal notes.</p>
          </div>
        </div>

        <div className="career-detail__review-fields">
          <label htmlFor={`${id}-status`}>
            Application status

            <select
              id={`${id}-status`}
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              disabled={!canReview || updating}
            >
              <option value="new">New</option>
              <option value="reviewing">Reviewing</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="contacted">Contacted</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>

          <label htmlFor={`${id}-notes`}>
            Internal admin notes

            <textarea
              id={`${id}-notes`}
              value={adminNotes}
              onChange={(event) => setAdminNotes(event.target.value)}
              placeholder="Add notes for your admin team."
              rows={5}
              maxLength={5000}
              disabled={!canReview || updating}
            />
          </label>
        </div>

        {!canReview && (
          <p className="career-detail__note">
            Only Root and Admin accounts can update the review.
          </p>
        )}

        {(localError || update?.error) && (
          <p
            className="career-detail__feedback career-detail__feedback--error"
            role="alert"
          >
            {localError || update.error}
          </p>
        )}

        {update?.status === "succeeded" && update.message && (
          <p className="career-detail__feedback" role="status">
            {update.message}
          </p>
        )}

        {canReview && (
          <button
            type="submit"
            className="career-detail__button"
            disabled={updating}
          >
            <Save size={16} aria-hidden="true" />
            {updating ? "Saving…" : "Save review"}
          </button>
        )}

        <p className="career-detail__note">
          Updating the review does not send a message to the applicant.
        </p>
      </form>
    </>
  );
}