import { useId, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  CalendarDays,
  Clock,
  Search,
  Video,
} from "lucide-react";

import {
  appointmentStatusLabels,
  formatAppointmentDate,
  userAppointments,
} from "../../data/userAppointemnts";

import "./UserAppointments.css";

export default function UserAppointments() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [date, setDate] = useState("");

  const id = useId();

  // Replace this demo array with appointments returned by your API.
  const appointments = userAppointments;

  const filteredAppointments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return appointments.filter((appointment) => {
      const searchableText = [
        appointment.id,
        appointment.doctor,
        appointment.specialty,
        appointment.purpose,
      ]
        .join(" ")
        .toLowerCase();

      return (
        searchableText.includes(query) &&
        (status === "all" || appointment.status === status) &&
        (!date || appointment.date === date)
      );
    });
  }, [appointments, search, status, date]);

  const handleSearch = (event) => {
    event.preventDefault();
    setSearch(searchInput);
  };

  const resetFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatus("all");
    setDate("");
  };

  return (
    <section
      className="user-appointments"
      aria-labelledby={`${id}-title`}
    >
      <header className="user-appointments__heading">
        <p className="user-appointments__eyebrow">
          YOUR CONSULTATIONS
        </p>

        <h1 id={`${id}-title`}>Your appointments.</h1>
        <p>Your conversations, scheduled around you.</p>
      </header>

      <form
        className="user-appointments__filters"
        onSubmit={handleSearch}
      >
        <div className="user-appointments__field">
          <label htmlFor={`${id}-search`}>
            Search appointments
          </label>

          <div className="user-appointments__search">
            <input
              id={`${id}-search`}
              type="search"
              placeholder="Doctor, specialty or ID"
              value={searchInput}
              onChange={(event) =>
                setSearchInput(event.target.value)
              }
            />

            <button
              type="submit"
              className="user-appointments__search-button"
              aria-label="Search appointments"
            >
              <Search aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="user-appointments__field">
          <label htmlFor={`${id}-status`}>Status</label>

          <select
            id={`${id}-status`}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">All appointments</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="user-appointments__field">
          <label htmlFor={`${id}-date`}>Appointment date</label>

          <input
            id={`${id}-date`}
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </div>

        <button
          type="button"
          className="user-appointments__reset"
          onClick={resetFilters}
        >
          Reset
        </button>
      </form>

      <p className="user-appointments__count" role="status">
        {filteredAppointments.length} appointment
        {filteredAppointments.length === 1 ? "" : "s"}
      </p>

      <div className="user-appointments__list">
        {filteredAppointments.map((appointment) => {
          const canJoin =
            appointment.status === "upcoming" &&
            appointment.roomAvailable === true;

          return (
            <article
              key={appointment.id}
              className="user-appointments__card"
            >
              <div className="user-appointments__card-heading">
                <div
                  className="user-appointments__avatar"
                  aria-hidden="true"
                >
                  {appointment.initials}
                </div>

                <div className="user-appointments__doctor">
                  <h2>{appointment.doctor}</h2>
                  <p>{appointment.specialty}</p>
                  <span>{appointment.id}</span>
                </div>

                <span
                  className={`user-appointments__status user-appointments__status--${appointment.status}`}
                >
                  {appointmentStatusLabels[appointment.status] ||
                    appointment.status}
                </span>
              </div>

              <div className="user-appointments__details">
                <span>
                  <CalendarDays aria-hidden="true" />

                  <time dateTime={appointment.date}>
                    {formatAppointmentDate(appointment.date)}
                  </time>
                </span>

                <span>
                  <Clock aria-hidden="true" />
                  {appointment.time} IST
                </span>

                <span>
                  <Video aria-hidden="true" />
                  {appointment.type}
                </span>
              </div>

              <div className="user-appointments__actions">
                <Link
                  to={`/appointments/${encodeURIComponent(
                    appointment.id
                  )}`}
                  className="user-appointments__view"
                  aria-label={`View details for ${appointment.id}`}
                >
                  View details
                  <ArrowUpRight aria-hidden="true" />
                </Link>

                {canJoin && (
                  <Link
                    to={`/meet-room/${encodeURIComponent(
                      appointment.id
                    )}`}
                    className="user-appointments__join"
                    aria-label={`Join consultation for ${appointment.id}`}
                  >
                    <Video aria-hidden="true" />
                    Join room
                  </Link>
                )}
              </div>

              {appointment.status === "upcoming" && (
                <p className="user-appointments__room-note">
                  {canJoin
                    ? "Room available · You can join now."
                    : "Join room will appear when your consultation room is available."}
                </p>
              )}
            </article>
          );
        })}
      </div>

      {filteredAppointments.length === 0 && (
        <div className="user-appointments__empty">
          <CalendarDays aria-hidden="true" />

          <h2>
            {appointments.length === 0
              ? "No appointments yet"
              : "No matching appointments"}
          </h2>

          <p>
            {appointments.length === 0
              ? "Your appointments will appear here after you book a consultation."
              : "Try another search or reset your filters."}
          </p>

          {appointments.length > 0 && (
            <button
              type="button"
              className="user-appointments__reset"
              onClick={resetFilters}
            >
              Reset filters
            </button>
          )}

          <Link to="/doctors">Browse doctors →</Link>
        </div>
      )}

      <p className="user-appointments__demo">
        Demo appointments. Replace with data returned by your backend.
      </p>
    </section>
  );
}