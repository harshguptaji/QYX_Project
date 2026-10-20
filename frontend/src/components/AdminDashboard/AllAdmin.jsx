import { useEffect, useId, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";

import {
  deleteAdminAccount,
  fetchAllAdmins,
} from "../../features/admin/accounts/adminAccountsSlice";

import "./AllAdmin.css";

import AddAdmin from "./AddAdmin";

const PAGE_SIZE = 15;

export default function AllAdmins() {
  const dispatch = useDispatch();
  const id = useId();
  const deletingRef = useRef(new Set());

  const [searchInput, setSearchInput] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);

  // State for Add Admin, Pop-up
  const [addAdminOpen, setAddAdminOpen] = useState(false);

  const [filters, setFilters] = useState({
    page: 1,
    search: "",
    role: "all",
    sort: "newest",
  });

  const {
    admins,
    pagination,
    listStatus,
    listError,
    listNeedsRefresh,
    deleteRequests,
  } = useSelector((state) => state.adminAccounts);

  const currentAdmin = useSelector((state) => state.adminAuth.admin);

  const isRoot = currentAdmin?.adminRole === "Root";
  const currentAdminId = currentAdmin?.id || currentAdmin?._id;

  const canViewDetails = ["Root", "Admin"].includes(currentAdmin?.adminRole);

  useEffect(() => {
    const request = dispatch(
      fetchAllAdmins({
        ...filters,
        limit: PAGE_SIZE,
      }),
    );

    return () => request.abort();
  }, [dispatch, filters, refreshCount]);

  useEffect(() => {
    if (
      listNeedsRefresh &&
      listStatus !== "loading" &&
      listStatus !== "failed"
    ) {
      dispatch(
        fetchAllAdmins({
          ...filters,
          limit: PAGE_SIZE,
        }),
      );
    }
  }, [dispatch, filters, listNeedsRefresh, listStatus]);

  const loading = listStatus === "idle" || listStatus === "loading";

  const changeFilters = (changes) => {
    setFilters((current) => ({
      ...current,
      ...changes,
      page: 1,
    }));
  };

  const handleSearch = (event) => {
    event.preventDefault();
    changeFilters({ search: searchInput.trim() });
  };

  const resetFilters = () => {
    setSearchInput("");

    setFilters({
      page: 1,
      search: "",
      role: "all",
      sort: "newest",
    });
  };

  const handleDelete = async (admin) => {
    const adminId = admin._id;

    if (
      !isRoot ||
      admin.adminRole === "Root" ||
      adminId === currentAdminId ||
      deletingRef.current.has(adminId)
    ) {
      return;
    }

    const confirmed = window.confirm(
      `Delete the admin account for ${admin.adminName}? This cannot be undone.`,
    );

    if (!confirmed) return;

    deletingRef.current.add(adminId);
    setFeedback(null);

    try {
      const result = await dispatch(deleteAdminAccount(adminId)).unwrap();

      setFeedback({
        type: "success",
        message: result.message || "Admin deleted successfully.",
      });

      // Reload the current page with authoritative backend totals.
      setRefreshCount((value) => value + 1);
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          typeof error === "string"
            ? error
            : error?.message || "Unable to delete admin.",
      });
    } finally {
      deletingRef.current.delete(adminId);
    }
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

  const firstResult = admins.length
    ? (pagination.page - 1) * pagination.limit + 1
    : 0;

  const lastResult = admins.length ? firstResult + admins.length - 1 : 0;

  return (
    <section className="all-admins" aria-labelledby={`${id}-title`}>
      <header className="all-admins__heading">
        <div>
          <p className="all-admins__eyebrow">WORKSPACE ACCESS</p>

          <h1 id={`${id}-title`}>All admins.</h1>

          <p>Review administrator accounts and access roles.</p>
        </div>

        <div className="all-admins__top-actions">
  {["Root", "Admin"].includes(currentAdmin?.adminRole) && (
    <button
      type="button"
      className="all-admins__add"
      aria-haspopup="dialog"
      aria-expanded={addAdminOpen}
      onClick={() => setAddAdminOpen(true)}
    >
      Add admin
    </button>
  )}

  <button
    type="button"
    className="all-admins__outline"
    onClick={() => setRefreshCount((value) => value + 1)}
    disabled={loading}
  >
    <RefreshCw size={16} aria-hidden="true" />
    Refresh
  </button>
</div>
      </header>

      <div className="all-admins__panel">
        <form className="all-admins__filters" onSubmit={handleSearch}>
          <label className="all-admins__search-field" htmlFor={`${id}-search`}>
            Search admins
            <div className="all-admins__search">
              <input
                id={`${id}-search`}
                type="search"
                placeholder="Name, email or mobile"
                maxLength={100}
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />

              <button type="submit" aria-label="Search admins">
                <Search size={18} aria-hidden="true" />
              </button>
            </div>
          </label>

          <label htmlFor={`${id}-role`}>
            Role
            <select
              id={`${id}-role`}
              value={filters.role}
              onChange={(event) => changeFilters({ role: event.target.value })}>
              <option value="all">All roles</option>
              <option value="Root">Root</option>
              <option value="Admin">Admin</option>
              <option value="Sub-Admin">Sub-Admin</option>
            </select>
          </label>

          <label htmlFor={`${id}-sort`}>
            Sort
            <select
              id={`${id}-sort`}
              value={filters.sort}
              onChange={(event) => changeFilters({ sort: event.target.value })}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="nameAsc">Name A–Z</option>
              <option value="nameDesc">Name Z–A</option>
            </select>
          </label>

          <button
            type="button"
            className="all-admins__outline"
            onClick={resetFilters}>
            Reset
          </button>
        </form>

        {feedback && (
          <p
            className={`all-admins__feedback all-admins__feedback--${feedback.type}`}
            role={feedback.type === "error" ? "alert" : "status"}>
            {feedback.message}
          </p>
        )}

        <p className="all-admins__results" role="status">
          {loading
            ? "Loading admin accounts…"
            : listStatus === "failed"
              ? "Unable to display admin accounts."
              : `Showing ${firstResult}–${lastResult} of ${pagination.total} admins`}
        </p>

        {listStatus === "failed" ? (
          <div className="all-admins__state">
            <p role="alert">{listError}</p>

            <button
              type="button"
              className="all-admins__outline"
              onClick={() => setRefreshCount((value) => value + 1)}>
              Try again
            </button>
          </div>
        ) : (
          <div className="all-admins__table-wrapper" aria-busy={loading}>
            <table className="all-admins__table">
              <caption className="all-admins__sr-only">
                Admin accounts and available actions
              </caption>

              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Mobile</th>
                  <th scope="col">Role</th>
                  <th scope="col">View details</th>
                  <th scope="col">Delete</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="all-admins__empty">
                      Loading admin information…
                    </td>
                  </tr>
                ) : !admins.length ? (
                  <tr>
                    <td colSpan={6} className="all-admins__empty">
                      No admins match your filters.
                    </td>
                  </tr>
                ) : (
                  admins.map((admin) => {
                    const deleting =
                      deleteRequests[admin._id]?.status === "loading";

                    const protectedAccount =
                      admin.adminRole === "Root" ||
                      admin._id === currentAdminId;

                    const deleteDisabled =
                      !isRoot || protectedAccount || deleting;

                    const deleteTitle = !isRoot
                      ? "Only Root admins can delete accounts."
                      : protectedAccount
                        ? "This account is protected."
                        : `Delete ${admin.adminName}`;

                    return (
                      <tr key={admin._id}>
                        <td>
                          <strong>{admin.adminName || "—"}</strong>
                        </td>

                        <td>
                          <a href={`mailto:${admin.adminEmail}`}>
                            {admin.adminEmail || "—"}
                          </a>
                        </td>

                        <td>{admin.adminMobile || "—"}</td>

                        <td>
                          <span
                            className={`all-admins__role ${
                              admin.adminRole === "Root"
                                ? "all-admins__role--root"
                                : ""
                            }`}>
                            {admin.adminRole}
                          </span>
                        </td>

                        <td>
                          {canViewDetails ? (
                            <Link
                              to={`/accios/admins/${encodeURIComponent(
                                admin._id,
                              )}`}
                              className="all-admins__view"
                              aria-label={`View details for ${admin.adminName}`}>
                              View details
                              <ArrowUpRight size={16} aria-hidden="true" />
                            </Link>
                          ) : (
                            <button
                              type="button"
                              className="all-admins__view"
                              disabled
                              title="Only Root and Admin accounts can view details.">
                              View details
                              <ArrowUpRight size={16} aria-hidden="true" />
                            </button>
                          )}
                        </td>

                        <td>
                          <button
                            type="button"
                            className="all-admins__delete"
                            onClick={() => handleDelete(admin)}
                            disabled={deleteDisabled}
                            title={deleteTitle}
                            aria-label={`Delete ${admin.adminName}`}>
                            <Trash2 size={15} aria-hidden="true" />
                            {deleting ? "Deleting…" : "Delete"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {listStatus === "succeeded" && pagination.total > 0 && (
          <div className="all-admins__pagination">
            <p>
              Page {pagination.page} of {pagination.totalPages}
              {" · "}
              {pagination.limit} per page
            </p>

            <nav aria-label="Admin accounts pagination">
              <button
                type="button"
                className="all-admins__outline"
                disabled={pagination.page <= 1}
                onClick={() => changePage(pagination.page - 1)}>
                <ChevronLeft size={17} aria-hidden="true" />
                Previous
              </button>

              <button
                type="button"
                className="all-admins__outline"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => changePage(pagination.page + 1)}>
                Next
                <ChevronRight size={17} aria-hidden="true" />
              </button>
            </nav>
          </div>
        )}
      </div>

      {addAdminOpen && <AddAdmin onClose={() => setAddAdminOpen(false)} />}
    </section>
  );
}
