import { useEffect, useId, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
} from "lucide-react";

import {
  fetchCareerApplications,
} from "../../features/career/careerSlice";

import "./AllCareerApplications.css";

const PAGE_SIZE = 15;

const statusLabels = {
  new: "New",
  reviewing: "Reviewing",
  shortlisted: "Shortlisted",
  contacted: "Contacted",
  hired: "Hired",
  rejected: "Rejected",
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function AllCareerApplications() {
  const dispatch = useDispatch();
  const id = useId();

  const [searchInput, setSearchInput] = useState("");
  const [retry, setRetry] = useState(0);

  const [filters, setFilters] = useState({
    page: 1,
    search: "",
    status: "all",
    readStatus: "all",
    experience: "",
    sort: "newest",
  });

  const {
    applications,
    pagination,
    listStatus,
    listError,
    listNeedsRefresh,
  } = useSelector((state) => state.career);

  // Fetch when filters or page change.
  useEffect(() => {
    const request = dispatch(
      fetchCareerApplications({
        ...filters,
        limit: PAGE_SIZE,
      })
    );

    return () => {
      request.abort();
    };
  }, [dispatch, filters, retry]);

  // Refresh after a read status or review change.
  useEffect(() => {
    if (
      listNeedsRefresh &&
      listStatus !== "loading" &&
      listStatus !== "failed"
    ) {
      dispatch(
        fetchCareerApplications({
          ...filters,
          limit: PAGE_SIZE,
        })
      );
    }
  }, [dispatch, filters, listNeedsRefresh, listStatus]);

  const loading =
    listStatus === "idle" || listStatus === "loading";

  const changeFilters = (changes) => {
    setFilters((current) => ({
      ...current,
      ...changes,
      page: 1,
    }));
  };

  const handleSearch = (event) => {
    event.preventDefault();

    changeFilters({
      search: searchInput.trim(),
    });
  };

  const resetFilters = () => {
    setSearchInput("");

    setFilters({
      page: 1,
      search: "",
      status: "all",
      readStatus: "all",
      experience: "",
      sort: "newest",
    });
  };

  const changePage = (page) => {
    if (
      loading ||
      page < 1 ||
      page > pagination.totalPages ||
      page === pagination.page
    ) {
      return;
    }

    setFilters((current) => ({
      ...current,
      page,
    }));
  };

  const firstResult = applications.length
    ? (pagination.page - 1) * pagination.limit + 1
    : 0;

  const lastResult = applications.length
    ? firstResult + applications.length - 1
    : 0;

  return (
    <section
      className="career-applications"
      aria-labelledby={`${id}-title`}
    >
      <header className="career-applications__heading">
        <div>
          <p className="career-applications__eyebrow">
            CAREER MANAGEMENT
          </p>

          <h1 id={`${id}-title`}>Career enquiries.</h1>

          <p>
            Review introductions and keep track of unread applications.
          </p>
        </div>

        <button
          type="button"
          className="career-applications__outline"
          onClick={() => setRetry((value) => value + 1)}
          disabled={loading}
        >
          <RefreshCw size={16} aria-hidden="true" />
          Refresh
        </button>
      </header>

      <div className="career-applications__panel">
        <form
          className="career-applications__filters"
          onSubmit={handleSearch}
        >
          <label
            className="career-applications__search-field"
            htmlFor={`${id}-search`}
          >
            Search applicants

            <div className="career-applications__search">
              <input
                id={`${id}-search`}
                type="search"
                placeholder="Name, email, mobile or interest"
                maxLength={100}
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(event.target.value)
                }
              />

              <button
                type="submit"
                aria-label="Search career enquiries"
              >
                <Search size={18} aria-hidden="true" />
              </button>
            </div>
          </label>

          <label htmlFor={`${id}-read`}>
            Read status

            <select
              id={`${id}-read`}
              value={filters.readStatus}
              onChange={(event) =>
                changeFilters({
                  readStatus: event.target.value,
                })
              }
            >
              <option value="all">All messages</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </label>

          <label htmlFor={`${id}-status`}>
            Application status

            <select
              id={`${id}-status`}
              value={filters.status}
              onChange={(event) =>
                changeFilters({
                  status: event.target.value,
                })
              }
            >
              <option value="all">All statuses</option>
              <option value="new">New</option>
              <option value="reviewing">Reviewing</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="contacted">Contacted</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>

          <label htmlFor={`${id}-sort`}>
            Sort

            <select
              id={`${id}-sort`}
              value={filters.sort}
              onChange={(event) =>
                changeFilters({
                  sort: event.target.value,
                })
              }
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="nameAsc">Name A–Z</option>
              <option value="nameDesc">Name Z–A</option>
            </select>
          </label>

          <button
            type="button"
            className="career-applications__outline"
            onClick={resetFilters}
          >
            Reset
          </button>
        </form>

        <p className="career-applications__results" role="status">
          {loading
            ? "Loading career enquiries…"
            : listStatus === "failed"
            ? "Unable to display career enquiries."
            : `Showing ${firstResult}–${lastResult} of ${pagination.total} enquiries`}
        </p>

        {listStatus === "failed" ? (
          <div className="career-applications__state">
            <p role="alert">
              {listError || "Unable to load applications."}
            </p>

            <button
              type="button"
              className="career-applications__outline"
              onClick={() => setRetry((value) => value + 1)}
            >
              Try again
            </button>
          </div>
        ) : (
          <div
            className="career-applications__table-wrapper"
            aria-busy={loading}
          >
            <table className="career-applications__table">
              <caption className="career-applications__sr-only">
                Career enquiries and read status
              </caption>

              <thead>
                <tr>
                  <th scope="col">Applicant</th>
                  <th scope="col">Contact</th>
                  <th scope="col">Interest</th>
                  <th scope="col">Experience</th>
                  <th scope="col">Received</th>
                  <th scope="col">Read status</th>
                  <th scope="col">Application status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="career-applications__empty"
                    >
                      Loading applications…
                    </td>
                  </tr>
                ) : applications.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="career-applications__empty"
                    >
                      No enquiries found. Try changing your filters.
                    </td>
                  </tr>
                ) : (
                  applications.map((application) => (
                    <tr
                      key={application._id}
                      className={
                        application.isRead
                          ? ""
                          : "career-applications__row--unread"
                      }
                    >
                      <td>
                        <div className="career-applications__applicant">
                          {!application.isRead && (
                            <span
                              className="career-applications__dot"
                              aria-hidden="true"
                            />
                          )}

                          <strong>{application.name}</strong>
                        </div>
                      </td>

                      <td>
                        <a href={`mailto:${application.email}`}>
                          {application.email}
                        </a>

                        <a href={`tel:+91${application.mobile}`}>
                          +91 {application.mobile}
                        </a>
                      </td>

                      <td>{application.interest || "—"}</td>

                      <td>{application.experience || "—"}</td>

                      <td>{formatDate(application.createdAt)}</td>

                      <td>
                        <span
                          className={`career-applications__badge ${
                            application.isRead
                              ? "career-applications__badge--read"
                              : "career-applications__badge--unread"
                          }`}
                        >
                          {application.isRead ? "Read" : "Unread"}
                        </span>
                      </td>

                      <td>
                        <span className="career-applications__status">
                          {statusLabels[application.status] ||
                            application.status ||
                            "—"}
                        </span>
                      </td>

                      <td>
                        <Link
                          to={`/accios/careers/${encodeURIComponent(
                            application._id
                          )}`}
                          className="career-applications__view"
                          aria-label={`View career enquiry from ${application.name}`}
                        >
                          View details
                          <ArrowUpRight
                            size={16}
                            aria-hidden="true"
                          />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {listStatus === "succeeded" && pagination.total > 0 && (
          <div className="career-applications__pagination">
            <p>
              Page {pagination.page} of {pagination.totalPages}
              {" · "}
              {pagination.limit} per page
            </p>

            <nav aria-label="Career enquiry pagination">
              <button
                type="button"
                className="career-applications__outline"
                disabled={pagination.page <= 1}
                onClick={() => changePage(pagination.page - 1)}
              >
                <ChevronLeft size={17} aria-hidden="true" />
                Previous
              </button>

              <button
                type="button"
                className="career-applications__outline"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => changePage(pagination.page + 1)}
              >
                Next
                <ChevronRight size={17} aria-hidden="true" />
              </button>
            </nav>
          </div>
        )}
      </div>
    </section>
  );
}