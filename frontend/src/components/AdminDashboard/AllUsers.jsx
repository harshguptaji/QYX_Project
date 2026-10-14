import { useEffect, useId, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  UsersRound,
} from "lucide-react";

import { fetchAdminUsers } from "../../features/admin/users/adminUsersSlice";

import "./AllUsers.css";

const PAGE_SIZE = 15;

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "U";

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

export default function AllUsers() {
  const dispatch = useDispatch();
  const id = useId();

  const {
    users,
    pagination,
    status: requestStatus,
    error,
  } = useSelector((state) => state.adminUsers);

  const [searchInput, setSearchInput] = useState("");

  const [filters, setFilters] = useState({
    page: 1,
    search: "",
    role: "all",
    verification: "all",
  });

  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const request = dispatch(
      fetchAdminUsers({
        ...filters,
        limit: PAGE_SIZE,
      })
    );

    return () => {
      request.abort();
    };
  }, [dispatch, filters, retryCount]);

  const loading =
    requestStatus === "idle" || requestStatus === "loading";

  const failed = requestStatus === "failed";
  const succeeded = requestStatus === "succeeded";

  const total = pagination.total;
  const currentPage = pagination.page;
  const totalPages = pagination.totalPages;

  const firstResult =
    users.length > 0
      ? (currentPage - 1) * pagination.limit + 1
      : 0;

  const lastResult =
    users.length > 0
      ? firstResult + users.length - 1
      : 0;

  const pageNumbers = [
    ...new Set([
      1,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      totalPages,
    ]),
  ]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

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

    changeFilters({
      search: "",
      role: "all",
      verification: "all",
    });
  };

  const changePage = (nextPage) => {
    if (
      loading ||
      nextPage < 1 ||
      nextPage > totalPages ||
      nextPage === currentPage
    ) {
      return;
    }

    setFilters((current) => ({
      ...current,
      page: nextPage,
    }));
  };

  const retryRequest = () => {
    setRetryCount((current) => current + 1);
  };

  return (
    <section
      className="admin-users"
      aria-labelledby={`${id}-title`}
    >
      <header className="admin-users__heading">
        <div>
          <p className="admin-users__eyebrow">
            ACCOUNT MANAGEMENT
          </p>

          <h1 id={`${id}-title`}>All users.</h1>

          <p>
            Review account details, roles and verification status.
          </p>
        </div>

        <div className="admin-users__total">
          <UsersRound aria-hidden="true" />

          <span>
            {loading
              ? "Loading accounts…"
              : failed
              ? "Accounts unavailable"
              : `${total.toLocaleString("en-IN")} matching accounts`}
          </span>
        </div>
      </header>

      <section
        className="admin-users__panel"
        aria-label="User directory"
        aria-busy={loading}
      >
        {/* Backend search and filters */}
        <form
          className="admin-users__filters"
          onSubmit={handleSearch}
        >
          <div className="admin-users__field">
            <label htmlFor={`${id}-search`}>
              Search users
            </label>

            <div className="admin-users__search">
              <input
                id={`${id}-search`}
                type="search"
                placeholder="Name, email or mobile"
                maxLength={100}
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(event.target.value)
                }
              />

              <button
                type="submit"
                className="admin-users__search-button"
                aria-label="Search users"
              >
                <Search aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="admin-users__field">
            <label htmlFor={`${id}-role`}>Role</label>

            <select
              id={`${id}-role`}
              value={filters.role}
              onChange={(event) =>
                changeFilters({
                  role: event.target.value,
                })
              }
            >
              <option value="all">All roles</option>
              <option value="User">User</option>
              <option value="Doctor">Doctor</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div className="admin-users__field">
            <label htmlFor={`${id}-verification`}>
              Verification
            </label>

            <select
              id={`${id}-verification`}
              value={filters.verification}
              onChange={(event) =>
                changeFilters({
                  verification: event.target.value,
                })
              }
            >
              <option value="all">All accounts</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>

          <button
            type="button"
            className="admin-users__outline-button"
            onClick={resetFilters}
          >
            Reset
          </button>
        </form>

        <p className="admin-users__results" role="status">
          {loading
            ? "Loading users…"
            : failed
            ? "Unable to display users."
            : `Showing ${firstResult}–${lastResult} of ${total} users`}
        </p>

        {/* Request error */}
        {failed ? (
          <div className="admin-users__request-state">
            <p role="alert">
              {error || "Unable to load users."}
            </p>

            <button
              type="button"
              className="admin-users__outline-button"
              onClick={retryRequest}
            >
              <RefreshCw aria-hidden="true" />
              Try again
            </button>
          </div>
        ) : (
          <div className="admin-users__table-wrapper">
            <table className="admin-users__table">
              <caption className="admin-users__sr-only">
                User accounts, up to 15 users per page
              </caption>

              <thead>
                <tr>
                  <th scope="col">User</th>
                  <th scope="col">Contact</th>
                  <th scope="col">Role</th>
                  <th scope="col">City</th>
                  <th scope="col">Gender</th>
                  <th scope="col">Verification</th>
                  <th scope="col">Joined</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="admin-users__empty"
                    >
                      Loading account information…
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="admin-users__empty"
                    >
                      No users found. Try changing your filters.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div className="admin-users__identity">
                          <div
                            className="admin-users__avatar"
                            aria-hidden="true"
                          >
                            {getInitials(user.userName)}
                          </div>

                          <div>
                            <strong>
                              {user.userName || "Unnamed user"}
                            </strong>
                            <span>{user._id}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        {user.userEmail ? (
                          <a href={`mailto:${user.userEmail}`}>
                            {user.userEmail}
                          </a>
                        ) : (
                          <span>—</span>
                        )}

                        {user.userMobile && (
                          <a href={`tel:${user.userMobile}`}>
                            {user.userMobile}
                          </a>
                        )}
                      </td>

                      <td>
                        <span className="admin-users__role">
                          {user.userRole || "—"}
                        </span>
                      </td>

                      <td>{user.userCity || "—"}</td>

                      <td>{user.userGender || "—"}</td>

                      <td>
                        <span
                          className={`admin-users__verification ${
                            user.userVerified
                              ? "admin-users__verification--verified"
                              : "admin-users__verification--unverified"
                          }`}
                        >
                          {user.userVerified
                            ? "Verified"
                            : "Unverified"}
                        </span>

                        <small className="admin-users__verification-detail">
                          Email:{" "}
                          {user.emailVerified
                            ? "Verified"
                            : "Unverified"}

                          <br />

                          Mobile:{" "}
                          {user.mobileVerified
                            ? "Verified"
                            : "Unverified"}
                        </small>
                      </td>

                      <td className="admin-users__date">
                        {formatDate(user.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Backend pagination */}
        {succeeded && total > 0 && (
          <div className="admin-users__pagination">
            <p>
              Page {currentPage} of {totalPages}
              {" · "}
              {PAGE_SIZE} users per page
            </p>

            <nav
              className="admin-users__page-buttons"
              aria-label="User directory pagination"
            >
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => changePage(currentPage - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft aria-hidden="true" />
              </button>

              {pageNumbers.map((page, index) => (
                <span
                  className="admin-users__page-item"
                  key={page}
                >
                  {index > 0 &&
                    page - pageNumbers[index - 1] > 1 && (
                      <span aria-hidden="true">…</span>
                    )}

                  <button
                    type="button"
                    aria-label={`Page ${page}`}
                    aria-current={
                      page === currentPage ? "page" : undefined
                    }
                    onClick={() => changePage(page)}
                  >
                    {page}
                  </button>
                </span>
              ))}

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => changePage(currentPage + 1)}
                aria-label="Next page"
              >
                <ChevronRight aria-hidden="true" />
              </button>
            </nav>
          </div>
        )}
      </section>
    </section>
  );
}