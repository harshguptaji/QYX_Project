import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  IndianRupee,
  LoaderCircle,
  LockKeyhole,
  Upload,
  Video,
  X,
} from "lucide-react";

import "../style/SlotBooking.css";

const BOOKING_STEPS = [
  "Select slot",
  "Consultation details",
  "Previous records",
  "Review & payment",
];

// Frontend prototype schedules. Later, replace this object with data from your API.
const DOCTOR_SCHEDULES = {
  1: [
    { id: "2026-09-08", day: "Tue", date: "08", month: "Sep", fullDate: "Tuesday, 8 September 2026", slots: ["5:30 PM", "6:15 PM", "7:00 PM"] },
    { id: "2026-09-09", day: "Wed", date: "09", month: "Sep", fullDate: "Wednesday, 9 September 2026", slots: ["10:00 AM", "11:30 AM", "4:00 PM"] },
    { id: "2026-09-11", day: "Fri", date: "11", month: "Sep", fullDate: "Friday, 11 September 2026", slots: ["2:15 PM", "4:45 PM", "6:30 PM"] },
  ],
  2: [
    { id: "2026-09-09", day: "Wed", date: "09", month: "Sep", fullDate: "Wednesday, 9 September 2026", slots: ["10:00 AM", "11:00 AM", "12:30 PM"] },
    { id: "2026-09-10", day: "Thu", date: "10", month: "Sep", fullDate: "Thursday, 10 September 2026", slots: ["3:00 PM", "4:30 PM", "6:00 PM"] },
    { id: "2026-09-12", day: "Sat", date: "12", month: "Sep", fullDate: "Saturday, 12 September 2026", slots: ["9:30 AM", "11:15 AM"] },
  ],
  3: [
    { id: "2026-09-09", day: "Wed", date: "09", month: "Sep", fullDate: "Wednesday, 9 September 2026", slots: ["4:15 PM", "5:00 PM", "6:45 PM"] },
    { id: "2026-09-11", day: "Fri", date: "11", month: "Sep", fullDate: "Friday, 11 September 2026", slots: ["10:30 AM", "1:00 PM", "3:30 PM"] },
    { id: "2026-09-13", day: "Sun", date: "13", month: "Sep", fullDate: "Sunday, 13 September 2026", slots: ["11:00 AM", "12:00 PM"] },
  ],
  4: [
    { id: "2026-09-09", day: "Wed", date: "09", month: "Sep", fullDate: "Wednesday, 9 September 2026", slots: ["12:30 PM", "2:00 PM", "3:15 PM"] },
    { id: "2026-09-10", day: "Thu", date: "10", month: "Sep", fullDate: "Thursday, 10 September 2026", slots: ["9:30 AM", "11:45 AM", "5:15 PM"] },
    { id: "2026-09-12", day: "Sat", date: "12", month: "Sep", fullDate: "Saturday, 12 September 2026", slots: ["10:00 AM", "12:30 PM"] },
  ],
};

const FALLBACK_SCHEDULES = [
  [
    { id: "2026-09-10", day: "Thu", date: "10", month: "Sep", fullDate: "Thursday, 10 September 2026", slots: ["11:00 AM", "12:15 PM", "5:30 PM"] },
    { id: "2026-09-11", day: "Fri", date: "11", month: "Sep", fullDate: "Friday, 11 September 2026", slots: ["9:45 AM", "2:30 PM", "4:00 PM"] },
    { id: "2026-09-14", day: "Mon", date: "14", month: "Sep", fullDate: "Monday, 14 September 2026", slots: ["10:15 AM", "3:15 PM"] },
  ],
  [
    { id: "2026-09-10", day: "Thu", date: "10", month: "Sep", fullDate: "Thursday, 10 September 2026", slots: ["3:45 PM", "5:15 PM", "6:30 PM"] },
    { id: "2026-09-12", day: "Sat", date: "12", month: "Sep", fullDate: "Saturday, 12 September 2026", slots: ["9:00 AM", "10:30 AM", "1:30 PM"] },
    { id: "2026-09-14", day: "Mon", date: "14", month: "Sep", fullDate: "Monday, 14 September 2026", slots: ["11:15 AM", "4:45 PM"] },
  ],
  [
    { id: "2026-09-11", day: "Fri", date: "11", month: "Sep", fullDate: "Friday, 11 September 2026", slots: ["9:30 AM", "11:00 AM", "4:30 PM"] },
    { id: "2026-09-13", day: "Sun", date: "13", month: "Sep", fullDate: "Sunday, 13 September 2026", slots: ["10:00 AM", "12:15 PM"] },
    { id: "2026-09-15", day: "Tue", date: "15", month: "Sep", fullDate: "Tuesday, 15 September 2026", slots: ["2:00 PM", "5:00 PM"] },
  ],
];

const INITIAL_FORM = {
  reason: "",
  category: "",
  concernDuration: "",
  description: "",
  medicines: "",
  allergies: "",
  notes: "",
};

const INITIAL_PREVIOUS_DOCTOR = {
  doctorName: "",
  specialization: "",
  consultationDate: "",
  previousAdvice: "",
};

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getInitialState() {
  return {
    currentStep: 0,
    selectedDate: null,
    selectedTime: "",
    formData: { ...INITIAL_FORM },
    hasPreviousDoctor: false,
    previousDoctor: { ...INITIAL_PREVIOUS_DOCTOR },
    files: [],
    error: "",
    isPaying: false,
    bookingId: "",
  };
}

export default function SlotBooking({
  doctor,
  isOpen,
  onClose,
  onBookingComplete,
}) {
  const [booking, setBooking] = useState(getInitialState);

  const availableSchedule = useMemo(() => {
    if (!doctor) return [];

    // API-ready: an availableSchedule array on the selected doctor takes priority.
    return (
      doctor.availableSchedule ||
      DOCTOR_SCHEDULES[doctor.id] ||
      FALLBACK_SCHEDULES[(Number(doctor.id) - 1) % FALLBACK_SCHEDULES.length]
    );
  }, [doctor]);

  useEffect(() => {
    if (!isOpen) return undefined;

    setBooking(getInitialState());
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const closeWithEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", closeWithEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeWithEscape);
    };
  }, [doctor?.id, isOpen, onClose]);

  if (!isOpen || !doctor) return null;

  const activeSchedule =
    booking.selectedDate === null
      ? null
      : availableSchedule[booking.selectedDate];

  const updateBooking = (changes) => {
    setBooking((current) => ({
      ...current,
      error: "",
      ...changes,
    }));
  };

  const updateFormData = (event) => {
    const { name, value } = event.target;

    setBooking((current) => ({
      ...current,
      error: "",
      formData: {
        ...current.formData,
        [name]: value,
      },
    }));
  };

  const updatePreviousDoctor = (event) => {
    const { name, value } = event.target;

    setBooking((current) => ({
      ...current,
      error: "",
      previousDoctor: {
        ...current.previousDoctor,
        [name]: value,
      },
    }));
  };

  const validateCurrentStep = () => {
    if (
      booking.currentStep === 0 &&
      (booking.selectedDate === null || !booking.selectedTime)
    ) {
      return "Please select an available date and time.";
    }

    if (booking.currentStep === 1) {
      const { reason, category, concernDuration, description } =
        booking.formData;

      if (
        !reason.trim() ||
        !category ||
        !concernDuration ||
        !description.trim()
      ) {
        return "Please complete all required appointment questions.";
      }
    }

    if (
      booking.currentStep === 2 &&
      booking.hasPreviousDoctor &&
      !booking.previousDoctor.doctorName.trim()
    ) {
      return "Please enter the previous doctor's name.";
    }

    return "";
  };

  const goNext = () => {
    const validationError = validateCurrentStep();

    if (validationError) {
      setBooking((current) => ({
        ...current,
        error: validationError,
      }));
      return;
    }

    updateBooking({
      currentStep: Math.min(booking.currentStep + 1, 3),
    });
  };

  const goBack = () => {
    updateBooking({
      currentStep: Math.max(booking.currentStep - 1, 0),
    });
  };

  const handleFiles = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (booking.files.length + selectedFiles.length > MAX_FILES) {
      updateBooking({
        error: `You can upload a maximum of ${MAX_FILES} files.`,
      });
      event.target.value = "";
      return;
    }

    const invalidType = selectedFiles.find(
      (file) => !ALLOWED_FILE_TYPES.includes(file.type)
    );

    if (invalidType) {
      updateBooking({
        error: "Please upload only PDF, JPG, JPEG or PNG files.",
      });
      event.target.value = "";
      return;
    }

    const largeFile = selectedFiles.find(
      (file) => file.size > MAX_FILE_SIZE
    );

    if (largeFile) {
      updateBooking({
        error: "Each uploaded file must be 10 MB or smaller.",
      });
      event.target.value = "";
      return;
    }

    updateBooking({
      files: [...booking.files, ...selectedFiles],
    });

    event.target.value = "";
  };

  const removeFile = (fileIndex) => {
    updateBooking({
      files: booking.files.filter((_, index) => index !== fileIndex),
    });
  };

  const handlePayment = () => {
    updateBooking({ isPaying: true });

    // Replace this timer with your Razorpay Checkout integration later.
    window.setTimeout(() => {
      const bookingId = `QYX-${doctor.id}-${Date.now()
        .toString()
        .slice(-6)}`;

      const completedBooking = {
        appointmentId: bookingId,
        doctor,
        selectedDate: activeSchedule,
        selectedTime: booking.selectedTime,
        patientResponses: booking.formData,
        previousDoctor: booking.hasPreviousDoctor
          ? booking.previousDoctor
          : null,
        documents: booking.files,
        amount: doctor.fee,
        paymentStatus: "paid",
        appointmentStatus: "pending-approval",
      };

      setBooking((current) => ({
        ...current,
        currentStep: 4,
        isPaying: false,
        bookingId,
      }));

      onBookingComplete?.(completedBooking);
    }, 1300);
  };

  return (
    <div
      className="slot-booking"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <article
        className="slot-booking__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="slot-booking-title"
      >
        <header className="slot-booking__header">
          <div>
            <span>BOOK VIDEO CONSULTATION</span>
            <h2 id="slot-booking-title">
              {booking.currentStep === 4
                ? "Booking confirmed"
                : BOOKING_STEPS[booking.currentStep]}
            </h2>
          </div>

          <button
            type="button"
            aria-label="Close appointment booking"
            onClick={onClose}
          >
            <X aria-hidden="true" />
          </button>
        </header>

        {booking.currentStep < 4 && (
          <div className="slot-booking__progress">
            {BOOKING_STEPS.map((step, index) => (
              <div
                className={`slot-booking__progress-item ${
                  index === booking.currentStep ? "is-current" : ""
                } ${index < booking.currentStep ? "is-complete" : ""}`}
                key={step}
              >
                <span>{index < booking.currentStep ? <Check /> : index + 1}</span>
                <small>{step}</small>
              </div>
            ))}
          </div>
        )}

        <div className="slot-booking__body">
          {booking.currentStep < 4 && (
            <div className="slot-booking__doctor">
              <div
                className={`slot-booking__avatar slot-booking__avatar--${doctor.color}`}
                aria-hidden="true"
              >
                {doctor.initials}
              </div>

              <div>
                <strong>{doctor.name}</strong>
                <span>
                  {doctor.designation} · {doctor.duration} video
                </span>
              </div>

              <strong>{formatPrice(doctor.fee)}</strong>
            </div>
          )}

          {booking.currentStep === 0 && (
            <section className="slot-booking__step">
              <div className="slot-booking__intro">
                <h3>Choose an available time</h3>
                <p>
                  These dates and slots are available for {doctor.name}.
                </p>
              </div>

              {availableSchedule.length > 0 ? (
                <>
                  <div className="slot-booking__field-heading">
                    <strong>Select date</strong>
                    <span>September 2026</span>
                  </div>

                  <div
                    className="slot-booking__dates"
                    role="radiogroup"
                    aria-label="Available appointment dates"
                  >
                    {availableSchedule.map((schedule, index) => (
                      <button
                        type="button"
                        role="radio"
                        aria-checked={booking.selectedDate === index}
                        className={
                          booking.selectedDate === index
                            ? "is-selected"
                            : ""
                        }
                        key={schedule.id}
                        onClick={() =>
                          updateBooking({
                            selectedDate: index,
                            selectedTime: "",
                          })
                        }
                      >
                        <span>{schedule.day}</span>
                        <strong>{schedule.date}</strong>
                        <small>{schedule.month}</small>
                      </button>
                    ))}
                  </div>

                  <div className="slot-booking__field-heading">
                    <strong>Available time</strong>
                    <span>IST</span>
                  </div>

                  {activeSchedule ? (
                    <div
                      className="slot-booking__times"
                      role="radiogroup"
                      aria-label="Available appointment times"
                    >
                      {activeSchedule.slots.map((time) => (
                        <button
                          type="button"
                          role="radio"
                          aria-checked={booking.selectedTime === time}
                          className={
                            booking.selectedTime === time
                              ? "is-selected"
                              : ""
                          }
                          key={time}
                          onClick={() =>
                            updateBooking({ selectedTime: time })
                          }
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="slot-booking__empty-slots">
                      Select a date to view available time slots.
                    </div>
                  )}

                  {activeSchedule && booking.selectedTime && (
                    <div className="slot-booking__selection">
                      <CalendarDays aria-hidden="true" />
                      <div>
                        <strong>
                          {activeSchedule.fullDate}, {booking.selectedTime}
                        </strong>
                        <span>{doctor.duration} private video consultation</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="slot-booking__empty-slots">
                  This doctor currently has no available appointment slots.
                </div>
              )}
            </section>
          )}

          {booking.currentStep === 1 && (
            <section className="slot-booking__step">
              <div className="slot-booking__intro">
                <h3>Tell the doctor what you need</h3>
                <p>Required fields are marked with an asterisk.</p>
              </div>

              <div className="slot-booking__form-grid">
                <label className="slot-booking__field slot-booking__field--full">
                  <span>Reason for consultation *</span>
                  <input
                    name="reason"
                    value={booking.formData.reason}
                    placeholder="For example: discuss a recent semen analysis"
                    onChange={updateFormData}
                  />
                </label>

                <label className="slot-booking__field">
                  <span>Consultation category *</span>
                  <select
                    name="category"
                    value={booking.formData.category}
                    onChange={updateFormData}
                  >
                    <option value="">Select category</option>
                    <option value="Semen analysis review">Semen analysis review</option>
                    <option value="Fertility planning">Fertility planning</option>
                    <option value="Male reproductive health">Male reproductive health</option>
                    <option value="Second opinion">Second opinion</option>
                    <option value="Follow-up consultation">Follow-up consultation</option>
                  </select>
                </label>

                <label className="slot-booking__field">
                  <span>Duration of concern *</span>
                  <select
                    name="concernDuration"
                    value={booking.formData.concernDuration}
                    onChange={updateFormData}
                  >
                    <option value="">Select duration</option>
                    <option value="Less than 3 months">Less than 3 months</option>
                    <option value="3–6 months">3–6 months</option>
                    <option value="6–12 months">6–12 months</option>
                    <option value="More than 1 year">More than 1 year</option>
                  </select>
                </label>

                <label className="slot-booking__field slot-booking__field--full">
                  <span>Describe your concern *</span>
                  <textarea
                    name="description"
                    rows="4"
                    value={booking.formData.description}
                    placeholder="Share what you would like to discuss"
                    onChange={updateFormData}
                  />
                </label>

                <label className="slot-booking__field slot-booking__field--full">
                  <span>Current medicines</span>
                  <input
                    name="medicines"
                    value={booking.formData.medicines}
                    placeholder="Enter medicine names, or write None"
                    onChange={updateFormData}
                  />
                </label>

                <label className="slot-booking__field slot-booking__field--full">
                  <span>Known allergies</span>
                  <input
                    name="allergies"
                    value={booking.formData.allergies}
                    placeholder="Enter allergies, or write None"
                    onChange={updateFormData}
                  />
                </label>

                <label className="slot-booking__field slot-booking__field--full">
                  <span>Additional notes</span>
                  <textarea
                    name="notes"
                    rows="3"
                    value={booking.formData.notes}
                    placeholder="Optional information for your doctor"
                    onChange={updateFormData}
                  />
                </label>
              </div>
            </section>
          )}

          {booking.currentStep === 2 && (
            <section className="slot-booking__step">
              <div className="slot-booking__intro">
                <h3>Previous consultation records</h3>
                <p>Add this information only when it applies to you.</p>
              </div>

              <fieldset className="slot-booking__choice">
                <legend>Have you consulted another doctor for this concern?</legend>

                <label>
                  <input
                    type="radio"
                    name="hasPreviousDoctor"
                    checked={!booking.hasPreviousDoctor}
                    onChange={() =>
                      updateBooking({ hasPreviousDoctor: false })
                    }
                  />
                  No
                </label>

                <label>
                  <input
                    type="radio"
                    name="hasPreviousDoctor"
                    checked={booking.hasPreviousDoctor}
                    onChange={() =>
                      updateBooking({ hasPreviousDoctor: true })
                    }
                  />
                  Yes
                </label>
              </fieldset>

              {booking.hasPreviousDoctor ? (
                <>
                  <div className="slot-booking__form-grid">
                    <label className="slot-booking__field">
                      <span>Previous doctor name *</span>
                      <input
                        name="doctorName"
                        value={booking.previousDoctor.doctorName}
                        placeholder="Doctor's name"
                        onChange={updatePreviousDoctor}
                      />
                    </label>

                    <label className="slot-booking__field">
                      <span>Specialization</span>
                      <input
                        name="specialization"
                        value={booking.previousDoctor.specialization}
                        placeholder="For example: Andrologist"
                        onChange={updatePreviousDoctor}
                      />
                    </label>

                    <label className="slot-booking__field slot-booking__field--full">
                      <span>Consultation date</span>
                      <input
                        type="date"
                        name="consultationDate"
                        value={booking.previousDoctor.consultationDate}
                        onChange={updatePreviousDoctor}
                      />
                    </label>

                    <label className="slot-booking__field slot-booking__field--full">
                      <span>Previous advice</span>
                      <textarea
                        name="previousAdvice"
                        rows="3"
                        value={booking.previousDoctor.previousAdvice}
                        placeholder="Briefly describe the advice received"
                        onChange={updatePreviousDoctor}
                      />
                    </label>
                  </div>

                  <label className="slot-booking__upload" htmlFor="medical-records">
                    <Upload aria-hidden="true" />
                    <strong>Upload prescription or medical report</strong>
                    <span>PDF, JPG, JPEG or PNG · up to 5 files · 10 MB each</span>
                    <span>Choose files</span>
                    <input
                      id="medical-records"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      multiple
                      onChange={handleFiles}
                    />
                  </label>

                  {booking.files.length > 0 && (
                    <div className="slot-booking__files">
                      {booking.files.map((file, index) => (
                        <div className="slot-booking__file" key={`${file.name}-${index}`}>
                          <FileText aria-hidden="true" />
                          <div>
                            <strong>{file.name}</strong>
                            <span>{formatFileSize(file.size)}</span>
                          </div>
                          <button
                            type="button"
                            aria-label={`Remove ${file.name}`}
                            onClick={() => removeFile(index)}
                          >
                            <X aria-hidden="true" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="slot-booking__record-note">
                  You can continue without adding previous records.
                </div>
              )}
            </section>
          )}

          {booking.currentStep === 3 && (
            <section className="slot-booking__step">
              <div className="slot-booking__intro">
                <h3>Review and pay</h3>
                <p>Confirm your booking details before payment.</p>
              </div>

              <div className="slot-booking__review">
                <div>
                  <span>Doctor</span>
                  <strong>{doctor.name}</strong>
                </div>
                <div>
                  <span>Date and time</span>
                  <strong>
                    {activeSchedule?.fullDate}, {booking.selectedTime}
                  </strong>
                </div>
                <div>
                  <span>Consultation</span>
                  <strong>{doctor.duration} private video visit</strong>
                </div>
                <div>
                  <span>Reason</span>
                  <strong>{booking.formData.reason}</strong>
                </div>
                <div>
                  <span>Uploaded records</span>
                  <strong>
                    {booking.hasPreviousDoctor
                      ? `${booking.files.length} file${
                          booking.files.length === 1 ? "" : "s"
                        }`
                      : "Not applicable"}
                  </strong>
                </div>
              </div>

              <div className="slot-booking__pricing">
                <div>
                  <span>Consultation fee</span>
                  <strong>{formatPrice(doctor.fee)}</strong>
                </div>
                <div>
                  <span>Platform fee</span>
                  <strong>{formatPrice(0)}</strong>
                </div>
                <div>
                  <span>Total payable</span>
                  <strong>{formatPrice(doctor.fee)}</strong>
                </div>
              </div>

              <div className="slot-booking__payment-note">
                <LockKeyhole aria-hidden="true" />
                <div>
                  <strong>Razorpay payment prototype</strong>
                  <span>No real payment is collected in this frontend version.</span>
                </div>
              </div>
            </section>
          )}

          {booking.currentStep === 4 && (
            <section className="slot-booking__success">
              <div className="slot-booking__success-icon">
                <Check aria-hidden="true" />
              </div>
              <span>BOOKING CONFIRMED</span>
              <h3>Your video consultation is booked.</h3>
              <p>
                Your appointment with {doctor.name} has been submitted.
              </p>

              <div className="slot-booking__ticket">
                <div>
                  <span>Appointment ID</span>
                  <strong>{booking.bookingId}</strong>
                </div>
                <div>
                  <span>Date and time</span>
                  <strong>
                    {activeSchedule?.fullDate}
                    <br />
                    {booking.selectedTime} IST
                  </strong>
                </div>
                <div>
                  <span>Amount</span>
                  <strong>{formatPrice(doctor.fee)}</strong>
                </div>
                <div>
                  <span>Consultation</span>
                  <strong>
                    <Video aria-hidden="true" /> Private video room
                  </strong>
                </div>
              </div>

              <button type="button" onClick={onClose}>
                Done
              </button>
            </section>
          )}

          {booking.error && (
            <p className="slot-booking__error" role="alert">
              {booking.error}
            </p>
          )}

          {booking.currentStep < 4 && (
            <footer className="slot-booking__actions">
              {booking.currentStep > 0 && (
                <button
                  className="slot-booking__back"
                  type="button"
                  disabled={booking.isPaying}
                  onClick={goBack}
                >
                  <ChevronLeft aria-hidden="true" /> Back
                </button>
              )}

              {booking.currentStep < 3 ? (
                <button
                  className="slot-booking__next"
                  type="button"
                  disabled={
                    booking.currentStep === 0 &&
                    availableSchedule.length === 0
                  }
                  onClick={goNext}
                >
                  Continue <ChevronRight aria-hidden="true" />
                </button>
              ) : (
                <button
                  className="slot-booking__next"
                  type="button"
                  disabled={booking.isPaying}
                  onClick={handlePayment}
                >
                  {booking.isPaying ? (
                    <>
                      <LoaderCircle className="slot-booking__loader" aria-hidden="true" />
                      Processing…
                    </>
                  ) : (
                    <>
                      <IndianRupee aria-hidden="true" />
                      Pay {formatPrice(doctor.fee)}
                    </>
                  )}
                </button>
              )}
            </footer>
          )}
        </div>
      </article>
    </div>
  );
}
