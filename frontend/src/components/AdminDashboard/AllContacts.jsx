import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Mail,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import {
  clearContactDetails,
  fetchContactDetails,
  fetchContacts,
  updateContactReadStatus,
} from "../../features/contact/contactSlice";

import "./AllContacts.css";

const PAGE_SIZE = 15;

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
};

export default function AllContacts() {
  const dispatch = useDispatch();
  const id = useId();

  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({
    page: 1,
    search: "",
    status: "all",
    purpose: "",
    sort: "newest",
  });
  const [retry, setRetry] = useState(0);
  const [selectedId, setSelectedId] = useState(null);

  const {
    contacts,
    pagination,
    listStatus,
    listError,
    listNeedsRefresh,
  } = useSelector((state) => state.contact);

  useEffect(() => {
    const request = dispatch(
      fetchContacts({ ...filters, limit: PAGE_SIZE })
    );

    return () => request.abort();
  }, [dispatch, filters, retry]);

  useEffect(() => {
    if (
      listNeedsRefresh &&
      listStatus !== "loading" &&
      listStatus !== "failed"
    ) {
      dispatch(fetchContacts({ ...filters, limit: PAGE_SIZE }));
    }
  }, [dispatch, filters, listNeedsRefresh, listStatus]);

  const loading = listStatus === "idle" || listStatus === "loading";
  const succeeded = listStatus === "succeeded";

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
      status: "all",
      purpose: "",
      sort: "newest",
    });
  };

  const firstResult = contacts.length
    ? (pagination.page - 1) * pagination.limit + 1
    : 0;

  const lastResult = contacts.length
    ? firstResult + contacts.length - 1
    : 0;

  return (
    <section className="all-contacts" aria-labelledby={`${id}-title`}>
      <div className="all-contacts__heading">
        <div>
          <h2 id={`${id}-title`}>All enquiries</h2>
          <p>Unread messages are highlighted for your attention.</p>
        </div>

        <button
          type="button"
          className="all-contacts__outline"
          onClick={() => setRetry((value) => value + 1)}
          disabled={loading}
        >
          <RefreshCw size={16} aria-hidden="true" />
          Refresh
        </button>
      </div>

      <form className="all-contacts__filters" onSubmit={handleSearch}>
        <label className="all-contacts__search-field">
          Search enquiries
          <div className="all-contacts__search">
            <input
              type="search"
              placeholder="Name, email, mobile or message"
              maxLength={100}
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
            <button type="submit" aria-label="Search enquiries">
              <Search size={19} aria-hidden="true" />
            </button>
          </div>
        </label>

        <label>
          Read status
          <select
            value={filters.status}
            onChange={(event) =>
              changeFilters({ status: event.target.value })
            }
          >
            <option value="all">All messages</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </label>

        <label>
          Purpose
          <select
            value={filters.purpose}
            onChange={(event) =>
              changeFilters({ purpose: event.target.value })
            }
          >
            <option value="">All purposes</option>
            <option value="Book a consultation">Book a consultation</option>
            <option value="Appointment support">Appointment support</option>
            <option value="Join as a specialist">Join as a specialist</option>
            <option value="Partnership enquiry">Partnership enquiry</option>
            <option value="General enquiry">General enquiry</option>
          </select>
        </label>

        <label>
          Sort
          <select
            value={filters.sort}
            onChange={(event) =>
              changeFilters({ sort: event.target.value })
            }
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </label>

        <button
          type="button"
          className="all-contacts__outline"
          onClick={resetFilters}
        >
          Reset
        </button>
      </form>

      <p className="all-contacts__results" role="status">
        {loading
          ? "Loading enquiries…"
          : listStatus === "failed"
          ? "Unable to load enquiries."
          : `Showing ${firstResult}–${lastResult} of ${pagination.total} enquiries`}
      </p>

      {listStatus === "failed" ? (
        <div className="all-contacts__state">
          <p role="alert">{listError}</p>
          <button
            type="button"
            className="all-contacts__outline"
            onClick={() => setRetry((value) => value + 1)}
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="all-contacts__table-wrapper" aria-busy={loading}>
          <table className="all-contacts__table">
            <caption className="all-contacts__sr-only">
              Contact enquiries with read status and details
            </caption>

            <thead>
              <tr>
                <th scope="col">Sender</th>
                <th scope="col">Contact</th>
                <th scope="col">Purpose</th>
                <th scope="col">Received</th>
                <th scope="col">Status</th>
                <th scope="col">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="all-contacts__empty">
                    Loading messages…
                  </td>
                </tr>
              ) : !contacts.length ? (
                <tr>
                  <td colSpan={6} className="all-contacts__empty">
                    No enquiries match your filters.
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => (
                  <tr
                    key={contact._id}
                    className={
                      !contact.isRead ? "all-contacts__row--unread" : ""
                    }
                  >
                    <td>
                      <div className="all-contacts__sender">
                        {!contact.isRead && (
                          <span
                            className="all-contacts__dot"
                            aria-hidden="true"
                          />
                        )}
                        <strong>{contact.name}</strong>
                      </div>
                    </td>

                    <td>
                      <a href={`mailto:${contact.email}`}>
                        {contact.email}
                      </a>
                      <a href={`tel:+91${contact.mobile}`}>
                        +91 {contact.mobile}
                      </a>
                    </td>

                    <td>{contact.purpose}</td>
                    <td>{formatDate(contact.createdAt)}</td>

                    <td>
                      <span
                        className={`all-contacts__badge ${
                          contact.isRead
                            ? "all-contacts__badge--read"
                            : "all-contacts__badge--unread"
                        }`}
                      >
                        {contact.isRead ? "Read" : "Unread"}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="all-contacts__view"
                        onClick={() => setSelectedId(contact._id)}
                        aria-haspopup="dialog"
                        aria-label={`View enquiry from ${contact.name}`}
                      >
                        View details
                        <ArrowUpRight size={16} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {succeeded && pagination.total > 0 && (
        <div className="all-contacts__pagination">
          <p>
            Page {pagination.page} of {pagination.totalPages}
            {" · "}
            {pagination.limit} per page
          </p>

          <div>
            <button
              type="button"
              className="all-contacts__outline"
              disabled={pagination.page <= 1}
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  page: pagination.page - 1,
                }))
              }
            >
              <ChevronLeft size={17} aria-hidden="true" />
              Previous
            </button>

            <button
              type="button"
              className="all-contacts__outline"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  page: pagination.page + 1,
                }))
              }
            >
              Next
              <ChevronRight size={17} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {selectedId && (
        <ContactDetailsDialog
          key={selectedId}
          contactId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </section>
  );
}

function ContactDetailsDialog({ contactId, onClose }) {
  const dispatch = useDispatch();
  const id = useId();
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const loadedRef = useRef(false);
  const autoReadStartedRef = useRef(false);
  const onCloseRef = useRef(onClose);

  onCloseRef.current = onClose;

  const [retry, setRetry] = useState(0);

  const {
    contact,
    requestedContactId,
    detailsStatus,
    detailsError,
    readUpdates,
  } = useSelector((state) => state.contact);

  const currentContact =
    requestedContactId === contactId ? contact : null;

  const readUpdate = readUpdates[contactId];
  const updating = readUpdate?.status === "loading";

  useEffect(() => {
    loadedRef.current = false;

    const request = dispatch(fetchContactDetails(contactId));

    request.unwrap().then(
      () => {
        loadedRef.current = true;
      },
      () => {}
    );

    return () => {
      request.abort();
      dispatch(clearContactDetails());
    };
  }, [dispatch, contactId, retry]);

  useEffect(() => {
    if (
      currentContact &&
      detailsStatus === "succeeded" &&
      !currentContact.isRead &&
      !autoReadStartedRef.current
    ) {
      autoReadStartedRef.current = true;

      dispatch(
        updateContactReadStatus({
          contactId,
          isRead: true,
        })
      );
    }
  }, [dispatch, contactId, currentContact, detailsStatus]);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;

      const elements = Array.from(
        dialogRef.current?.querySelectorAll(
          'button:not([disabled]), a[href], input:not([disabled])'
        ) || []
      ).filter((element) => element.getClientRects().length > 0);

      if (!elements.length) return;

      const first = elements[0];
      const last = elements[elements.length - 1];
      const inside = dialogRef.current?.contains(document.activeElement);

      if (
        event.shiftKey &&
        (document.activeElement === first || !inside)
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || !inside)
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);

      if (
        previousFocus instanceof HTMLElement &&
        previousFocus.isConnected
      ) {
        previousFocus.focus();
      }
    };
  }, []);

  const changeReadStatus = async (isRead) => {
    if (updating) return;

    try {
      await dispatch(
        updateContactReadStatus({ contactId, isRead })
      ).unwrap();

      // Close after marking unread so it stays unread until reopened.
      if (!isRead) onCloseRef.current();
    } catch {
      // Redux displays the error.
    }
  };

  return createPortal(
    <div
      className="contact-dialog-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onCloseRef.current();
        }
      }}
    >
      <section
        ref={dialogRef}
        className="contact-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
      >
        <header className="contact-dialog__heading">
          <div>
            <p>CONTACT ENQUIRY</p>
            <h2 id={`${id}-title`}>Message details</h2>
          </div>

          <button
            ref={closeRef}
            type="button"
            className="contact-dialog__close"
            onClick={() => onCloseRef.current()}
            aria-label="Close message details"
          >
            <X aria-hidden="true" />
          </button>
        </header>

        {detailsStatus === "failed" ? (
          <div className="all-contacts__state">
            <p role="alert">{detailsError}</p>
            <button
              type="button"
              className="all-contacts__outline"
              onClick={() => setRetry((value) => value + 1)}
            >
              Try again
            </button>
          </div>
        ) : !currentContact ? (
          <p role="status">Loading message…</p>
        ) : (
          <>
            <dl className="contact-dialog__details">
              <div>
                <dt>Name</dt>
                <dd>{currentContact.name}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${currentContact.email}`}>
                    {currentContact.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt>Mobile</dt>
                <dd>
                  <a href={`tel:+91${currentContact.mobile}`}>
                    +91 {currentContact.mobile}
                  </a>
                </dd>
              </div>
              <div>
                <dt>Received</dt>
                <dd>{formatDate(currentContact.createdAt)}</dd>
              </div>
              <div>
                <dt>Purpose</dt>
                <dd>{currentContact.purpose}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{currentContact.isRead ? "Read" : "Unread"}</dd>
              </div>
            </dl>

            <div className="contact-dialog__message">
              <h3>Message</h3>
              <p>{currentContact.message}</p>
            </div>

            {currentContact.isRead && (
              <p className="contact-dialog__reader">
                Read by {currentContact.readBy?.adminName || "an admin"}
                {" · "}
                {formatDate(currentContact.readAt)}
              </p>
            )}

            {readUpdate?.error && (
              <p className="contact-dialog__error" role="alert">
                {readUpdate.error}
              </p>
            )}

            <button
              type="button"
              className="all-contacts__view"
              disabled={updating}
              onClick={() => changeReadStatus(!currentContact.isRead)}
            >
              <Mail size={16} aria-hidden="true" />
              {updating
                ? "Updating…"
                : currentContact.isRead
                ? "Mark as unread"
                : "Mark as read"}
            </button>
          </>
        )}
      </section>
    </div>,
    document.body
  );
}