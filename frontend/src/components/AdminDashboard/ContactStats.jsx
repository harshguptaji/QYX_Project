import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Inbox, Mail, MailOpen, RefreshCw } from "lucide-react";

import { fetchContactStats } from "../../features/contact/contactSlice";

import "./ContactStats.css";

export default function ContactStats() {
  const dispatch = useDispatch();

  const {
    stats,
    statsStatus,
    statsError,
    statsNeedsRefresh,
  } = useSelector((state) => state.contact);

  useEffect(() => {
    const request = dispatch(fetchContactStats());

    return () => request.abort();
  }, [dispatch]);

  useEffect(() => {
    if (statsNeedsRefresh && statsStatus !== "loading") {
      // Errors remain visible until a manual retry.
      if (statsStatus !== "failed") {
        dispatch(fetchContactStats());
      }
    }
  }, [dispatch, statsNeedsRefresh, statsStatus]);

  const cards = [
    { label: "Total enquiries", value: stats.total, icon: Inbox },
    { label: "Unread messages", value: stats.unread, icon: Mail },
    { label: "Read messages", value: stats.read, icon: MailOpen },
  ];

  return (
    <section className="contact-stats" aria-label="Contact statistics">
      <div className="contact-stats__grid" aria-busy={statsStatus === "loading"}>
        {cards.map(({ label, value, icon: Icon }) => (
          <article className="contact-stats__card" key={label}>
            <div className="contact-stats__icon">
              <Icon aria-hidden="true" />
            </div>

            <div>
              <p>{label}</p>
              <strong>
                {statsStatus === "loading"
                  ? "…"
                  : statsStatus === "failed"
                  ? "—"
                  : value.toLocaleString("en-IN")}
              </strong>
            </div>
          </article>
        ))}
      </div>

      {statsError && (
        <div className="contact-stats__error">
          <p role="alert">{statsError}</p>
          <button
            type="button"
            onClick={() => dispatch(fetchContactStats())}
            disabled={statsStatus === "loading"}
          >
            <RefreshCw size={16} aria-hidden="true" />
            Retry statistics
          </button>
        </div>
      )}
    </section>
  );
}