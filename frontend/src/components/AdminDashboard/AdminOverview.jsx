import { useEffect, useId, useState } from "react";
import {
  CalendarDays,
  IndianRupee,
  Stethoscope,
  UsersRound,
} from "lucide-react";

import { getAdminOverview } from "../../data/adminOverviewData";
import "./AdminOverview.css";

const periodOptions = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "3m", label: "Last 3 months" },
  { value: "1y", label: "Last 1 year" },
];

const formatNumber = (value) =>
  new Intl.NumberFormat("en-IN").format(value);

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const formatCompactCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

const percentage = (value, total) =>
  total > 0 ? (value / total) * 100 : 0;

const formatPercent = (value) => `${value.toFixed(1)}%`;

function TrendChart({ items, metric, currency = false, label }) {
  const maximum = Math.max(
    1,
    ...items.map((item) => item[metric] ?? 0)
  );

  if (items.length === 0) {
    return (
      <p className="admin-overview__empty">
        No trend data is available for this period.
      </p>
    );
  }

  return (
    <div className="admin-overview__chart-scroll">
      <div
        className="admin-overview__bars"
        style={{
          gridTemplateColumns: `repeat(${items.length}, minmax(70px, 1fr))`,
        }}
        role="group"
        aria-label={label}
      >
        {items.map((item) => {
          const value = item[metric] ?? 0;
          const fullValue = currency
            ? formatCurrency(value)
            : formatNumber(value);

          return (
            <div
              key={item.key}
              className="admin-overview__bar-column"
              aria-label={`${item.label}: ${fullValue}`}
            >
              <span
                className="admin-overview__bar-value"
                title={fullValue}
              >
                {currency
                  ? formatCompactCurrency(value)
                  : formatNumber(value)}
              </span>

              <div className="admin-overview__bar-track">
                <div
                  className="admin-overview__bar"
                  style={{
                    height: `${(value / maximum) * 100}%`,
                  }}
                  aria-hidden="true"
                />
              </div>

              <span className="admin-overview__bar-label">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminOverview() {
  const [period, setPeriod] = useState("30d");
  const [volumeMetric, setVolumeMetric] = useState("appointments");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const id = useId();

  useEffect(() => {
    const controller = new AbortController();

    const loadOverview = async () => {
      setLoading(true);
      setError("");
      setData(null);

      try {
        const overview = await getAdminOverview(period, {
          signal: controller.signal,
        });

        if (!controller.signal.aborted) {
          setData(overview);
        }
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(
            requestError.message || "Unable to load analytics."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadOverview();

    return () => controller.abort();
  }, [period, retryCount]);

  const changePeriod = (event) => {
    setPeriod(event.target.value);
    setLoading(true);
    setError("");
    setData(null);
  };

  const header = (
    <header className="admin-overview__heading">
      <div>
        <p className="admin-overview__eyebrow">
          QYX BUSINESS OVERVIEW
        </p>

        <h1 id={`${id}-title`}>
          Understand your care network.
        </h1>

        <p>
          Revenue, patient engagement and consultation performance
          in one view.
        </p>
      </div>

      <div className="admin-overview__period-filter">
        <label htmlFor={`${id}-period`}>Date range</label>

        <div className="admin-overview__period-select">
          <CalendarDays aria-hidden="true" />

          <select
            id={`${id}-period`}
            value={period}
            onChange={changePeriod}
          >
            {periodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );

  if (loading || error || !data) {
    return (
      <section
        className="admin-overview"
        aria-labelledby={`${id}-title`}
      >
        {header}

        <div
          className="admin-overview__request-state"
          aria-busy={loading}
        >
          {loading ? (
            <p role="status">Loading business analytics…</p>
          ) : (
            <>
              <p role="alert">
                {error || "Overview data is unavailable."}
              </p>

              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  setRetryCount((current) => current + 1);
                }}
              >
                Try again
              </button>
            </>
          )}
        </div>
      </section>
    );
  }

  const completionRate = percentage(
    data.appointments.completed,
    data.appointments.total
  );

  const cancellationRate = percentage(
    data.appointments.cancelled,
    data.appointments.total
  );

  const noShowRate = percentage(
    data.appointments.noShow,
    data.appointments.total
  );

  const repeatPatientRate = percentage(
    data.users.returningPatients,
    data.users.patientsWithBookings
  );

  const averageRevenue =
    data.appointments.total > 0
      ? data.revenue.net / data.appointments.total
      : 0;

  const statistics = [
    {
      label: "Net revenue",
      value: formatCurrency(data.revenue.net),
      description: "Captured payments minus refunds",
      icon: IndianRupee,
    },
    {
      label: "New patients",
      value: formatNumber(data.users.newPatients),
      description: `${formatNumber(data.users.totalPatients)} patient accounts currently`,
      icon: UsersRound,
    },
    {
      label: "Appointments",
      value: formatNumber(data.appointments.total),
      description: `${formatNumber(data.appointments.completed)} completed consultations`,
      icon: CalendarDays,
    },
    {
      label: "Active specialists",
      value: formatNumber(data.doctors.active),
      description: `${formatNumber(data.doctors.total)} specialists currently registered`,
      icon: Stethoscope,
    },
  ];

  const statuses = [
    {
      key: "completed",
      label: "Completed",
      value: data.appointments.completed,
    },
    {
      key: "upcoming",
      label: "Upcoming",
      value: data.appointments.upcoming,
    },
    {
      key: "cancelled",
      label: "Cancelled",
      value: data.appointments.cancelled,
    },
    {
      key: "no-show",
      label: "No-show",
      value: data.appointments.noShow,
    },
  ];

  const statusTotal = statuses.reduce(
    (total, item) => total + item.value,
    0
  );

  let accumulatedPercentage = 0;

  const donutStops = statuses.map((status) => {
    const start = accumulatedPercentage;

    accumulatedPercentage += percentage(status.value, statusTotal);

    return `var(--overview-${status.key}) ${start}% ${accumulatedPercentage}%`;
  });

  const donutBackground =
    statusTotal > 0
      ? `conic-gradient(${donutStops.join(", ")})`
      : "var(--admin-soft)";

  const indicators = [
    {
      label: "Patients with bookings",
      value: formatNumber(data.users.patientsWithBookings),
      description: "Unique patients who booked during this period",
    },
    {
      label: "Repeat patient rate",
      value: formatPercent(repeatPatientRate),
      description: "Repeat patients ÷ patients with bookings",
    },
    {
      label: "Completion rate",
      value: formatPercent(completionRate),
      description: "Completed consultations ÷ all appointments",
    },
    {
      label: "Cancellation rate",
      value: formatPercent(cancellationRate),
      description: "Cancelled bookings ÷ all appointments",
    },
    {
      label: "No-show rate",
      value: formatPercent(noShowRate),
      description: "No-shows ÷ all appointments",
    },
    {
      label: "Net revenue per booking",
      value: formatCurrency(averageRevenue),
      description: "Net revenue ÷ all appointments",
    },
  ];

  return (
    <section
      className="admin-overview"
      aria-labelledby={`${id}-title`}
    >
      {header}

      <p className="admin-overview__period-note">
        {data.period.label} · Demo analytics
      </p>

      <div className="admin-overview__statistics">
        {statistics.map(({ label, value, description, icon: Icon }) => (
          <article className="admin-overview__stat" key={label}>
            <div className="admin-overview__stat-top">
              <p>{label}</p>
              <Icon aria-hidden="true" />
            </div>

            <strong>{value}</strong>
            <span>{description}</span>
          </article>
        ))}
      </div>

      <div className="admin-overview__chart-grid">
        <section className="admin-overview__panel">
          <div className="admin-overview__panel-heading">
            <h2>Revenue trend</h2>
            <p>Net revenue during the selected period.</p>
          </div>

          <TrendChart
            items={data.trend}
            metric="netRevenue"
            currency
            label="Net revenue trend in Indian rupees"
          />

          <div className="admin-overview__revenue-summary">
            <div>
              <span>Captured</span>
              <strong>{formatCurrency(data.revenue.captured)}</strong>
            </div>

            <div>
              <span>Refunded</span>
              <strong>{formatCurrency(data.revenue.refunded)}</strong>
            </div>

            <div>
              <span>Net revenue</span>
              <strong>{formatCurrency(data.revenue.net)}</strong>
            </div>
          </div>
        </section>

        <section className="admin-overview__panel">
          <div className="admin-overview__panel-heading">
            <h2>Activity trend</h2>
            <p>Consultation volume and patient acquisition.</p>
          </div>

          <div
            className="admin-overview__metric-buttons"
            role="group"
            aria-label="Activity metric"
          >
            <button
              type="button"
              aria-pressed={volumeMetric === "appointments"}
              onClick={() => setVolumeMetric("appointments")}
            >
              Appointments
            </button>

            <button
              type="button"
              aria-pressed={volumeMetric === "newPatients"}
              onClick={() => setVolumeMetric("newPatients")}
            >
              New patients
            </button>
          </div>

          <div aria-live="polite">
            <TrendChart
              items={data.trend}
              metric={volumeMetric}
              label={
                volumeMetric === "appointments"
                  ? "Appointment count trend"
                  : "New patient count trend"
              }
            />
          </div>
        </section>
      </div>

      <div className="admin-overview__chart-grid">
        <section className="admin-overview__panel">
          <div className="admin-overview__panel-heading">
            <h2>Appointment outcomes</h2>
            <p>Status distribution during this period.</p>
          </div>

          <div className="admin-overview__outcomes">
            <div
              className="admin-overview__donut"
              style={{ background: donutBackground }}
              aria-hidden="true"
            >
              <div className="admin-overview__donut-center">
                <strong>{formatNumber(statusTotal)}</strong>
                <span>Total</span>
              </div>
            </div>

            <ul className="admin-overview__legend">
              {statuses.map((status) => (
                <li key={status.key}>
                  <span
                    className={`admin-overview__legend-dot admin-overview__legend-dot--${status.key}`}
                    aria-hidden="true"
                  />

                  <span>{status.label}</span>

                  <strong>
                    {formatNumber(status.value)}
                    <small>
                      {formatPercent(
                        percentage(status.value, statusTotal)
                      )}
                    </small>
                  </strong>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="admin-overview__panel">
          <div className="admin-overview__panel-heading">
            <h2>Revenue by specialty</h2>
            <p>Each specialty’s share of net revenue.</p>
          </div>

          <div className="admin-overview__specialties">
            {data.specialties.map((specialty) => {
              const share = percentage(
                specialty.netRevenue,
                data.revenue.net
              );

              return (
                <div
                  className="admin-overview__specialty"
                  key={specialty.name}
                >
                  <div className="admin-overview__specialty-heading">
                    <span>{specialty.name}</span>
                    <strong>
                      {formatCurrency(specialty.netRevenue)}
                    </strong>
                  </div>

                  <div
                    className="admin-overview__specialty-track"
                    aria-hidden="true"
                  >
                    <div
                      style={{
                        width: `${Math.max(0, Math.min(100, share))}%`,
                      }}
                    />
                  </div>

                  <p>{formatPercent(share)} of net revenue</p>
                </div>
              );
            })}

            {data.specialties.length === 0 && (
              <p className="admin-overview__empty">
                No specialty revenue is available for this period.
              </p>
            )}
          </div>
        </section>
      </div>

      <section className="admin-overview__panel">
        <div className="admin-overview__panel-heading">
          <h2>Business indicators</h2>
          <p>Booking activity and consultation performance.</p>
        </div>

        <dl className="admin-overview__indicators">
          {indicators.map((indicator) => (
            <div key={indicator.label}>
              <dt>{indicator.label}</dt>
              <dd>{indicator.value}</dd>
              <dd className="admin-overview__indicator-description">
                {indicator.description}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="admin-overview__verification">
        <Stethoscope aria-hidden="true" />

        <p>
          <strong>
            {data.doctors.pendingVerification} specialists
          </strong>{" "}
          are currently awaiting verification.
        </p>
      </div>
    </section>
  );
}