import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchAdminQuizResponses,
  fetchAdminQuizResponseDetails,
  clearAdminQuizResponseDetails,
} from "../../features/admin/response/adminQuizResponseSlice";

import "./AdminQuizResponses.css";

const CATEGORIES = {
  very_good: "Very good",
  good: "Good",
  low_interest: "Low interest",
  unscored: "Unscored",
};

const PURPOSES = {
  book_consultation: "Book consultation",
  fertility_testing: "Fertility testing",
  general_information: "General information",
  follow_up_support: "Follow-up support",
  other: "Other",
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
};

const formatScore = (analysis) =>
  analysis?.scorePercentage == null
    ? "Unscored"
    : `${Number(analysis.scorePercentage).toFixed(1)}%`;

const CategoryBadge = ({ category }) => (
  <span
    className={`aqr-badge aqr-badge--${category || "unscored"}`}
  >
    {CATEGORIES[category] || "Unscored"}
  </span>
);

export default function AdminQuizResponses() {
  const dispatch = useDispatch();

  const {
    responses,
    pagination,
    loading,
    error,
    responseDetails,
    detailsLoading,
    detailsError,
  } = useSelector((state) => state.adminQuizResponses);

  const [searchInput, setSearchInput] = useState("");

  const [query, setQuery] = useState({
    search: "",
    leadCategory: "",
    purposeOfVisiting: "",
    page: 1,
    limit: 10,
  });

  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedId, setSelectedId] = useState(null);

  const dialogRef = useRef(null);
  const dialogHeadingRef = useRef(null);
  const triggerRef = useRef(null);
  const detailsRequestRef = useRef(null);

  useEffect(() => {
    const request = dispatch(fetchAdminQuizResponses(query));

    return () => request.abort();
  }, [dispatch, query, refreshKey]);

  useEffect(() => {
    if (!selectedId) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) return;

    dialogHeadingRef.current?.focus();
  }, [selectedId]);

  useEffect(() => {
    return () => {
      detailsRequestRef.current?.abort();
      dispatch(clearAdminQuizResponseDetails());
    };
  }, [dispatch]);

  const handleSearch = (event) => {
    event.preventDefault();

    setQuery((previous) => ({
      ...previous,
      search: searchInput.trim(),
      page: 1,
    }));
  };

  const updateFilter = (event) => {
    const { name, value } = event.target;

    setQuery((previous) => ({
      ...previous,
      [name]: name === "limit" ? Number(value) : value,
      page: 1,
    }));
  };

  const resetFilters = () => {
    setSearchInput("");

    setQuery({
      search: "",
      leadCategory: "",
      purposeOfVisiting: "",
      page: 1,
      limit: 10,
    });
  };

  const changePage = (page) => {
    setQuery((previous) => ({
      ...previous,
      page,
    }));
  };

  const loadDetails = (responseId) => {
    detailsRequestRef.current?.abort();

    detailsRequestRef.current = dispatch(
      fetchAdminQuizResponseDetails(responseId)
    );
  };

  const openDetails = (responseId, trigger) => {
    triggerRef.current = trigger;
    setSelectedId(responseId);
    loadDetails(responseId);

    if (!dialogRef.current?.open) {
      dialogRef.current?.showModal();
    }
  };

  const closeDetails = () => {
    dialogRef.current?.close();
  };

  const handleDialogClosed = () => {
    detailsRequestRef.current?.abort();
    dispatch(clearAdminQuizResponseDetails());
    setSelectedId(null);

    if (triggerRef.current?.isConnected) {
      triggerRef.current.focus();
    }
  };

  const firstResult =
    responses.length > 0
      ? (pagination.page - 1) * pagination.limit + 1
      : 0;

  const lastResult =
    responses.length > 0
      ? firstResult + responses.length - 1
      : 0;

  const details =
    selectedId && responseDetails?._id === selectedId
      ? responseDetails
      : null;

  return (
    <section className="aqr">
      <header className="aqr-heading">
        <div>
          <p className="aqr-eyebrow">QYX ADMIN</p>
          <h1>Quiz responses</h1>
          <p>
            Review submissions, lead interest and the answers visitors shared.
          </p>
        </div>

        <span className="aqr-total">
          {loading ? "Loading..." : `${pagination.totalResponses} matching responses`}
        </span>
      </header>

      <div className="aqr-panel">
        <form className="aqr-filters" onSubmit={handleSearch}>
          <label className="aqr-field">
            <span>Search responses</span>

            <div className="aqr-search">
              <input
                type="search"
                placeholder="Email, phone or response ID"
                maxLength={100}
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />

              <button className="aqr-button" type="submit">
                Search
              </button>
            </div>
          </label>

          <label className="aqr-field">
            <span>Lead category</span>
            <select
              name="leadCategory"
              value={query.leadCategory}
              onChange={updateFilter}
            >
              <option value="">All categories</option>

              {Object.entries(CATEGORIES).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="aqr-field">
            <span>Purpose of visiting</span>
            <select
              name="purposeOfVisiting"
              value={query.purposeOfVisiting}
              onChange={updateFilter}
            >
              <option value="">All purposes</option>

              {Object.entries(PURPOSES).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="aqr-button aqr-button--outline"
            onClick={resetFilters}
          >
            Reset
          </button>
        </form>

        <div className="aqr-toolbar">
          <p className="aqr-results" aria-live="polite">
            {loading
              ? "Loading responses..."
              : `Showing ${firstResult}–${lastResult} of ${pagination.totalResponses}`}
          </p>

          <button
            type="button"
            className="aqr-button aqr-button--outline"
            disabled={loading}
            onClick={() => setRefreshKey((value) => value + 1)}
          >
            Refresh
          </button>
        </div>

        {error ? (
          <div className="aqr-request-state" role="alert">
            <p>{error}</p>
            <button
              type="button"
              className="aqr-button"
              onClick={() => setRefreshKey((value) => value + 1)}
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="aqr-table-wrapper" aria-busy={loading}>
            <table className="aqr-table">
              <caption className="aqr-sr-only">
                Quiz submissions and lead classifications
              </caption>

              <thead>
                <tr>
                  <th scope="col">Contact</th>
                  <th scope="col">Purpose</th>
                  <th scope="col">Category</th>
                  <th scope="col">Score</th>
                  <th scope="col">Contact consent</th>
                  <th scope="col">Submitted</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="aqr-empty">
                      Loading responses...
                    </td>
                  </tr>
                ) : responses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="aqr-empty">
                      No responses found for these filters.
                    </td>
                  </tr>
                ) : (
                  responses.map((response) => (
                    <tr key={response._id}>
                      <td>
                        <a href={`mailto:${response.email}`}>
                          {response.email}
                        </a>
                        <a href={`tel:${response.mobile}`}>
                          {response.mobile}
                        </a>
                      </td>

                      <td>
                        {PURPOSES[response.purposeOfVisiting] ||
                          response.purposeOfVisiting}
                      </td>

                      <td>
                        <CategoryBadge
                          category={response.analysis?.leadCategory}
                        />
                      </td>

                      <td className="aqr-nowrap">
                        {formatScore(response.analysis)}
                      </td>

                      <td>
                        <span className="aqr-consent">
                          {response.contactConsent ? "Granted" : "Not granted"}
                        </span>
                      </td>

                      <td className="aqr-nowrap">
                        {formatDate(response.createdAt)}
                      </td>

                      <td>
                        <button
                          type="button"
                          className="aqr-button aqr-button--details"
                          aria-label={`View response from ${response.email}`}
                          onClick={(event) =>
                            openDetails(response._id, event.currentTarget)
                          }
                        >
                          View details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <footer className="aqr-pagination">
          <label className="aqr-page-size">
            <span>Rows per page</span>
            <select
              name="limit"
              value={query.limit}
              onChange={updateFilter}
              disabled={loading}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </label>

          <nav className="aqr-page-buttons" aria-label="Response pagination">
            <button
              type="button"
              disabled={loading || Boolean(error) || query.page <= 1}
              onClick={() => changePage(query.page - 1)}
            >
              Previous
            </button>

            <span>
              Page {query.page} of {Math.max(1, pagination.totalPages)}
            </span>

            <button
              type="button"
              disabled={
                loading || Boolean(error) || !pagination.hasNextPage
              }
              onClick={() => changePage(query.page + 1)}
            >
              Next
            </button>
          </nav>
        </footer>
      </div>

      <dialog
        ref={dialogRef}
        className="aqr-dialog"
        aria-labelledby="aqr-details-title"
        onClose={handleDialogClosed}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;

          const bounds = event.currentTarget.getBoundingClientRect();

          if (
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom
          ) {
            closeDetails();
          }
        }}
      >
        {selectedId && (
          <>
            <header className="aqr-dialog-header">
              <div>
                <p className="aqr-eyebrow">SUBMISSION DETAILS</p>
                <h2
                  id="aqr-details-title"
                  ref={dialogHeadingRef}
                  tabIndex={-1}
                >
                  Quiz response
                </h2>
              </div>

              <button
                type="button"
                className="aqr-close"
                aria-label="Close response details"
                onClick={closeDetails}
              >
                ×
              </button>
            </header>

            <div className="aqr-dialog-body">
              {detailsLoading && <p role="status">Loading response...</p>}

              {detailsError && (
                <div className="aqr-request-state" role="alert">
                  <p>{detailsError}</p>
                  <button
                    type="button"
                    className="aqr-button"
                    onClick={() => loadDetails(selectedId)}
                  >
                    Try again
                  </button>
                </div>
              )}

              {!detailsLoading && !detailsError && details && (
                <>
                  <section className="aqr-detail-section">
                    <h3>Contact and submission</h3>

                    <dl className="aqr-details-grid">
                      <div>
                        <dt>Email</dt>
                        <dd>
                          <a href={`mailto:${details.email}`}>
                            {details.email}
                          </a>
                        </dd>
                      </div>

                      <div>
                        <dt>Phone</dt>
                        <dd>
                          <a href={`tel:${details.mobile}`}>
                            {details.mobile}
                          </a>
                        </dd>
                      </div>

                      <div>
                        <dt>Purpose</dt>
                        <dd>
                          {PURPOSES[details.purposeOfVisiting] ||
                            details.purposeOfVisiting}
                        </dd>
                      </div>

                      <div>
                        <dt>Submitted</dt>
                        <dd>{formatDate(details.createdAt)}</dd>
                      </div>

                      <div>
                        <dt>Contact consent</dt>
                        <dd>
                          {details.contactConsent ? "Granted" : "Not granted"}
                        </dd>
                      </div>

                      <div>
                        <dt>Consent recorded</dt>
                        <dd>{formatDate(details.contactConsentAt)}</dd>
                      </div>

                      <div>
                        <dt>Quiz</dt>
                        <dd>{details.quizTitleSnapshot || "—"}</dd>
                      </div>

                      <div>
                        <dt>Quiz version</dt>
                        <dd>{details.quizVersion}</dd>
                      </div>

                      <div className="aqr-full-width">
                        <dt>Response ID</dt>
                        <dd>{details._id}</dd>
                      </div>

                      {details.otherPurpose && (
                        <div className="aqr-full-width">
                          <dt>Additional purpose</dt>
                          <dd className="aqr-preserve">
                            {details.otherPurpose}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </section>

                  <section className="aqr-detail-section">
                    <h3>Lead analysis</h3>

                    <div className="aqr-analysis">
                      <div>
                        <span>Category</span>
                        <CategoryBadge
                          category={details.analysis?.leadCategory}
                        />
                      </div>

                      <div>
                        <span>Percentage</span>
                        <strong>{formatScore(details.analysis)}</strong>
                      </div>

                      <div>
                        <span>Points earned</span>
                        <strong>
                          {details.analysis?.totalScore ?? 0}
                          {" / "}
                          {details.analysis?.maximumPossibleScore ?? 0}
                        </strong>
                      </div>
                    </div>
                  </section>

                  <section className="aqr-detail-section">
                    <h3>Questions and answers</h3>
                    <p className="aqr-help">
                      These are the questions and options saved when the
                      visitor submitted the quiz.
                    </p>

                    <div className="aqr-answers">
                      {details.answers?.map((answer, index) => (
                        <article
                          className="aqr-answer"
                          key={answer.questionId}
                        >
                          <div className="aqr-answer-heading">
                            <span>Question {index + 1}</span>

                            {answer.isScoredSnapshot && (
                              <small>
                                {answer.earnedScore} /{" "}
                                {answer.maxScoreSnapshot} points
                              </small>
                            )}
                          </div>

                          <h4>{answer.questionTextSnapshot}</h4>

                          {answer.answered === false ? (
                            <p className="aqr-help">Skipped</p>
                          ) : answer.questionTypeSnapshot === "text" ? (
                            <p className="aqr-preserve">
                              {answer.textAnswer}
                            </p>
                          ) : (
                            <ul className="aqr-selected-options">
                              {answer.selectedOptions?.map((option) => (
                                <li key={option.optionId}>
                                  <span>{option.labelSnapshot}</span>
                                  <small>
                                    {option.tagSnapshot?.replaceAll("_", " ")}
                                    {" · "}
                                    {option.scoreSnapshot} points
                                  </small>
                                </li>
                              ))}
                            </ul>
                          )}
                        </article>
                      ))}
                    </div>
                  </section>
                </>
              )}
            </div>
          </>
        )}
      </dialog>
    </section>
  );
}