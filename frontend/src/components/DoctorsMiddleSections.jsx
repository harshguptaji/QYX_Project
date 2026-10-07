import { useEffect, useState } from "react";
import {
  BadgeCheck,
  Search,
  Video,
  X,
} from "lucide-react";

import SlotBookingModal from "../components/SlotBooking";
import "../style/DoctorsMiddleSection.css";

export default function DoctorsMiddleSection() {
  // Paste the previously provided
  // 16-doctor array here.
  const doctorsData = [
  {
    id: 1,
    name: "Dr. Arjun Mehta",
    initials: "AM",
    specialty: "Andrology",
    designation: "Consultant Andrologist",
    experience: "14 years",
    languages: ["English", "Hindi"],
    fee: 1499,
    duration: "30 minutes",
    nextAvailable: "Today, 5:30 PM",
    education: "MBBS, MS, Fellowship in Andrology",
    focus: "Male fertility assessment and semen analysis",
    description:
      "Supports patients with male fertility questions, semen-analysis interpretation and reproductive health planning.",
    color: "blue",
  },
  {
    id: 2,
    name: "Dr. Neha Kapoor",
    initials: "NK",
    specialty: "Reproductive Medicine",
    designation: "Reproductive Medicine Specialist",
    experience: "11 years",
    languages: ["English", "Hindi", "Punjabi"],
    fee: 1299,
    duration: "30 minutes",
    nextAvailable: "Tomorrow, 10:00 AM",
    education:
      "MBBS, MD, Fellowship in Reproductive Medicine",
    focus: "Fertility evaluation and report review",
    description:
      "Helps patients understand fertility reports, treatment options and suitable clinical next steps.",
    color: "green",
  },
  {
    id: 3,
    name: "Dr. Rohan Iyer",
    initials: "RI",
    specialty: "Urology",
    designation: "Consultant Urologist",
    experience: "12 years",
    languages: ["English", "Hindi", "Tamil"],
    fee: 1399,
    duration: "30 minutes",
    nextAvailable: "Tomorrow, 4:15 PM",
    education: "MBBS, MS, MCh Urology",
    focus: "Reproductive urology and clinical evaluation",
    description:
      "Provides urology-led evaluation for reproductive health concerns and appropriate specialist follow-up.",
    color: "navy",
  },
  {
    id: 4,
    name: "Dr. Meera Sen",
    initials: "MS",
    specialty: "Fertility Counselling",
    designation: "Fertility Counsellor",
    experience: "9 years",
    languages: ["English", "Hindi", "Bengali"],
    fee: 999,
    duration: "30 minutes",
    nextAvailable: "Wednesday, 12:30 PM",
    education:
      "MSc Psychology, Fertility Counselling Certification",
    focus: "Emotional wellbeing and consultation preparation",
    description:
      "Offers confidential support for preparing for fertility care and discussing reports with specialists.",
    color: "purple",
  },
  {
    id: 5,
    name: "Dr. Vikram Rao",
    initials: "VR",
    specialty: "Andrology",
    designation: "Male Fertility Specialist",
    experience: "10 years",
    languages: ["English", "Hindi", "Telugu"],
    fee: 1199,
    duration: "30 minutes",
    nextAvailable: "Thursday, 11:00 AM",
    education:
      "MBBS, MS, Clinical Andrology Fellowship",
    focus: "Male fertility testing and care planning",
    description:
      "Guides patients through male fertility assessments, testing preparation and report interpretation.",
    color: "cyan",
  },
  {
    id: 6,
    name: "Dr. Sana Qureshi",
    initials: "SQ",
    specialty: "Reproductive Medicine",
    designation: "Fertility Care Specialist",
    experience: "8 years",
    languages: ["English", "Hindi", "Urdu"],
    fee: 1099,
    duration: "30 minutes",
    nextAvailable: "Thursday, 3:45 PM",
    education:
      "MBBS, MD, Reproductive Medicine Training",
    focus: "Report review and coordinated fertility care",
    description:
      "Provides clear guidance on fertility reports, care pathways and specialist follow-up.",
    color: "orange",
  },
  {
    id: 7,
    name: "Dr. Karan Malhotra",
    initials: "KM",
    specialty: "Urology",
    designation: "Reproductive Urologist",
    experience: "13 years",
    languages: ["English", "Hindi"],
    fee: 1599,
    duration: "30 minutes",
    nextAvailable: "Friday, 9:30 AM",
    education: "MBBS, MS, MCh Urology",
    focus: "Male reproductive health and urological care",
    description:
      "Supports patients requiring a urological perspective on male reproductive health concerns.",
    color: "blue",
  },
  {
    id: 8,
    name: "Dr. Ananya Bose",
    initials: "AB",
    specialty: "Reproductive Medicine",
    designation: "Fertility Consultant",
    experience: "10 years",
    languages: ["English", "Hindi", "Bengali"],
    fee: 1399,
    duration: "30 minutes",
    nextAvailable: "Friday, 11:15 AM",
    education:
      "MBBS, MD, Fellowship in Reproductive Medicine",
    focus: "Fertility assessment and treatment planning",
    description:
      "Helps patients understand fertility assessments and prepare questions for further treatment planning.",
    color: "green",
  },
  {
    id: 9,
    name: "Dr. Aditya Nair",
    initials: "AN",
    specialty: "Andrology",
    designation: "Consultant Andrologist",
    experience: "9 years",
    languages: ["English", "Hindi", "Malayalam"],
    fee: 1299,
    duration: "30 minutes",
    nextAvailable: "Friday, 2:30 PM",
    education: "MBBS, MS, Fellowship in Andrology",
    focus: "Semen analysis and reproductive health",
    description:
      "Provides educational consultations about semen analysis, reproductive health and appropriate next steps.",
    color: "navy",
  },
  {
    id: 10,
    name: "Dr. Priya Menon",
    initials: "PM",
    specialty: "Reproductive Medicine",
    designation: "Reproductive Health Specialist",
    experience: "12 years",
    languages: ["English", "Hindi", "Malayalam"],
    fee: 1499,
    duration: "30 minutes",
    nextAvailable: "Saturday, 10:30 AM",
    education:
      "MBBS, MD, Reproductive Medicine Fellowship",
    focus: "Fertility reports and preconception guidance",
    description:
      "Supports individuals and couples with fertility-report discussions and preconception planning.",
    color: "purple",
  },
  {
    id: 11,
    name: "Dr. Sameer Khanna",
    initials: "SK",
    specialty: "Urology",
    designation: "Consultant Urologist",
    experience: "15 years",
    languages: ["English", "Hindi", "Punjabi"],
    fee: 1699,
    duration: "30 minutes",
    nextAvailable: "Saturday, 12:00 PM",
    education: "MBBS, MS, MCh Urology",
    focus: "Reproductive urology and clinical investigation",
    description:
      "Reviews reproductive health concerns and explains when further urological investigation may be required.",
    color: "cyan",
  },
  {
    id: 12,
    name: "Dr. Aisha Verma",
    initials: "AV",
    specialty: "Fertility Counselling",
    designation: "Reproductive Health Counsellor",
    experience: "7 years",
    languages: ["English", "Hindi"],
    fee: 899,
    duration: "30 minutes",
    nextAvailable: "Saturday, 3:30 PM",
    education:
      "MSc Clinical Psychology, Fertility Care Certification",
    focus: "Fertility-care preparation and wellbeing",
    description:
      "Provides private support for managing questions, expectations and conversations during fertility care.",
    color: "orange",
  },
  {
    id: 13,
    name: "Dr. Nikhil Desai",
    initials: "ND",
    specialty: "Andrology",
    designation: "Andrology Consultant",
    experience: "11 years",
    languages: ["English", "Hindi", "Gujarati"],
    fee: 1399,
    duration: "30 minutes",
    nextAvailable: "Monday, 9:45 AM",
    education: "MBBS, MS, Fellowship in Andrology",
    focus: "Male fertility assessment and report review",
    description:
      "Assists patients in understanding male fertility assessments and laboratory reports.",
    color: "blue",
  },
  {
    id: 14,
    name: "Dr. Kavya Reddy",
    initials: "KR",
    specialty: "Reproductive Medicine",
    designation: "Fertility Medicine Specialist",
    experience: "9 years",
    languages: ["English", "Hindi", "Telugu"],
    fee: 1299,
    duration: "30 minutes",
    nextAvailable: "Monday, 11:30 AM",
    education:
      "MBBS, MD, Fellowship in Reproductive Health",
    focus: "Fertility education and coordinated care",
    description:
      "Explains fertility reports and helps patients prepare for coordinated specialist care.",
    color: "green",
  },
  {
    id: 15,
    name: "Dr. Farhan Ali",
    initials: "FA",
    specialty: "Urology",
    designation: "Male Reproductive Urologist",
    experience: "10 years",
    languages: ["English", "Hindi", "Urdu"],
    fee: 1499,
    duration: "30 minutes",
    nextAvailable: "Monday, 4:00 PM",
    education: "MBBS, MS, MCh Urology",
    focus: "Male reproductive and urinary health",
    description:
      "Provides online consultations for reproductive concerns that may require urological evaluation.",
    color: "navy",
  },
  {
    id: 16,
    name: "Dr. Ritu Sharma",
    initials: "RS",
    specialty: "Fertility Counselling",
    designation: "Fertility Support Counsellor",
    experience: "8 years",
    languages: ["English", "Hindi"],
    fee: 999,
    duration: "30 minutes",
    nextAvailable: "Tuesday, 10:15 AM",
    education:
      "MA Psychology, Reproductive Health Counselling",
    focus: "Emotional support and care preparation",
    description:
      "Helps patients prepare for appointments and understand how to discuss fertility concerns confidently.",
    color: "purple",
  },
];

  const specialtyOptions = [
    "All specialties",
    "Andrology",
    "Reproductive Medicine",
    "Urology",
    "Fertility Counselling",
  ];

  const DOCTORS_PER_PAGE = 9;

  const [searchValue, setSearchValue] =
    useState("");

  const [selectedSpecialty, setSelectedSpecialty] =
    useState("All specialties");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [profileDoctor, setProfileDoctor] =
    useState(null);

  const [bookingDoctor, setBookingDoctor] =
    useState(null);

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  const filteredDoctors = doctorsData.filter(
    (doctor) => {
      const searchText = searchValue
        .trim()
        .toLowerCase();

      const searchableContent = [
        doctor.name,
        doctor.specialty,
        doctor.designation,
        doctor.experience,
        ...doctor.languages,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !searchText ||
        searchableContent.includes(searchText);

      const matchesSpecialty =
        selectedSpecialty === "All specialties" ||
        doctor.specialty === selectedSpecialty;

      return matchesSearch && matchesSpecialty;
    }
  );

  const totalDoctors = filteredDoctors.length;

  const totalPages = Math.ceil(
    totalDoctors / DOCTORS_PER_PAGE
  );

  const firstDoctorIndex =
    (currentPage - 1) * DOCTORS_PER_PAGE;

  const lastDoctorIndex = Math.min(
    firstDoctorIndex + DOCTORS_PER_PAGE,
    totalDoctors
  );

  const currentDoctors = filteredDoctors.slice(
    firstDoctorIndex,
    lastDoctorIndex
  );

  const openBooking = (doctor) => {
    setProfileDoctor(null);
    setBookingDoctor(doctor);
  };

  const closeBooking = () => {
    setBookingDoctor(null);
  };

  const handleBookingComplete = (appointment) => {
    console.log("Completed appointment:", appointment);

    // Later, send the completed appointment to your backend:
    // await axios.post("/api/appointments", appointment);
  };

  const clearFilters = () => {
    setSearchValue("");
    setSelectedSpecialty("All specialties");
    setCurrentPage(1);
  };

  const getPaginationItems = () => {
    if (totalPages <= 7) {
      return Array.from(
        { length: totalPages },
        (_, index) => index + 1
      );
    }

    const items = [1];

    if (currentPage > 4) {
      items.push("left-ellipsis");
    }

    const startPage = Math.max(
      2,
      currentPage - 1
    );

    const endPage = Math.min(
      totalPages - 1,
      currentPage + 1
    );

    for (
      let page = startPage;
      page <= endPage;
      page += 1
    ) {
      items.push(page);
    }

    if (currentPage < totalPages - 3) {
      items.push("right-ellipsis");
    }

    items.push(totalPages);

    return items;
  };

  const changePage = (pageNumber) => {
    if (
      pageNumber < 1 ||
      pageNumber > totalPages ||
      pageNumber === currentPage
    ) {
      return;
    }

    setCurrentPage(pageNumber);

    document
      .getElementById("doctor-directory")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, selectedSpecialty]);

  useEffect(() => {
    if (
      totalPages > 0 &&
      currentPage > totalPages
    ) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (profileDoctor) {
      document.body.style.overflow = "hidden";
    }

    const handleEscape = (event) => {
      if (event.key !== "Escape") return;

      setProfileDoctor(null);
    };

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.body.style.overflow = "";

      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [profileDoctor]);

  return (
    <>
      <section
        className="doctors-middle"
        id="doctor-directory"
        aria-labelledby="doctor-directory-title"
      >
        <div className="doctors-middle__container">
          <div className="doctors-middle__search-row">
            <label className="doctors-middle__search">
              <Search aria-hidden="true" />

              <span className="doctors-middle__sr-only">
                Search doctors
              </span>

              <input
                type="search"
                value={searchValue}
                placeholder="Search doctor, specialty or language"
                autoComplete="off"
                onChange={(event) =>
                  setSearchValue(event.target.value)
                }
              />
            </label>

            <label className="doctors-middle__filter">
              <span className="doctors-middle__sr-only">
                Filter doctors by specialty
              </span>

              <select
                value={selectedSpecialty}
                onChange={(event) =>
                  setSelectedSpecialty(
                    event.target.value
                  )
                }
              >
                {specialtyOptions.map((specialty) => (
                  <option
                    value={specialty}
                    key={specialty}
                  >
                    {specialty}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <header className="doctors-middle__header">
            <div>
              <h2 id="doctor-directory-title">
                {totalDoctors}{" "}
                {totalDoctors === 1
                  ? "specialist"
                  : "specialists"}
              </h2>

              {totalDoctors > 0 && (
                <p>
                  Showing {firstDoctorIndex + 1}–
                  {lastDoctorIndex} of {totalDoctors}
                </p>
              )}
            </div>

            <span className="doctors-middle__prototype">
              Prototype doctor profiles
            </span>
          </header>

          {totalDoctors > 0 ? (
            <>
              <div className="doctors-middle__grid">
                {currentDoctors.map((doctor) => (
                  <article
                    className="doctor-card"
                    key={doctor.id}
                  >
                    <div className="doctor-card__header">
                      <div
                        className={`doctor-card__avatar doctor-card__avatar--${doctor.color}`}
                        aria-hidden="true"
                      >
                        {doctor.initials}
                      </div>

                      <div className="doctor-card__identity">
                        <div className="doctor-card__name">
                          <h3>{doctor.name}</h3>

                          <BadgeCheck
                            aria-label="Profile reviewed"
                          />
                        </div>

                        <p>
                          {doctor.designation}
                        </p>
                      </div>
                    </div>

                    <div className="doctor-card__metadata">
                      <span>
                        {doctor.experience} experience
                      </span>

                      <span>
                        {doctor.languages
                          .slice(0, 2)
                          .join(" · ")}
                      </span>

                      <span>
                        <Video aria-hidden="true" />
                        Video
                      </span>
                    </div>

                    <p className="doctor-card__description">
                      {doctor.description}
                    </p>

                    <div className="doctor-card__availability">
                      <span aria-hidden="true" />

                      <p>
                        Next available:{" "}
                        <strong>
                          {doctor.nextAvailable}
                        </strong>
                      </p>
                    </div>

                    <div className="doctor-card__footer">
                      <div className="doctor-card__price">
                        <strong>
                          {formatPrice(doctor.fee)}
                        </strong>

                        <span>
                          per consultation
                        </span>
                      </div>

                      <div className="doctor-card__actions">
                        <button
                          className="doctor-card__profile-button"
                          type="button"
                          onClick={() =>
                            setProfileDoctor(doctor)
                          }
                        >
                          View profile
                        </button>

                        <button
                          className="doctor-card__booking-button"
                          type="button"
                          onClick={() =>
                            openBooking(doctor)
                          }
                        >
                          Book Slot
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {totalPages > 1 && (
                <nav
                  className="doctors-pagination"
                  aria-label="Doctor list pagination"
                >
                  <button
                    className="doctors-pagination__control"
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() =>
                      changePage(currentPage - 1)
                    }
                  >
                    <span aria-hidden="true">←</span>
                    <span className="doctors-pagination__control-text">
                      Previous
                    </span>
                  </button>

                  <div className="doctors-pagination__pages">
                    {getPaginationItems().map(
                      (item) => {
                        if (
                          typeof item === "string"
                        ) {
                          return (
                            <span
                              className="doctors-pagination__ellipsis"
                              key={item}
                              aria-hidden="true"
                            >
                              …
                            </span>
                          );
                        }

                        return (
                          <button
                            key={item}
                            type="button"
                            className={
                              currentPage === item
                                ? "is-active"
                                : ""
                            }
                            aria-label={`Go to page ${item}`}
                            aria-current={
                              currentPage === item
                                ? "page"
                                : undefined
                            }
                            onClick={() =>
                              changePage(item)
                            }
                          >
                            {item}
                          </button>
                        );
                      }
                    )}
                  </div>

                  <button
                    className="doctors-pagination__control"
                    type="button"
                    disabled={
                      currentPage === totalPages
                    }
                    onClick={() =>
                      changePage(currentPage + 1)
                    }
                  >
                    <span className="doctors-pagination__control-text">
                      Next
                    </span>
                    <span aria-hidden="true">→</span>
                  </button>
                </nav>
              )}
            </>
          ) : (
            <div className="doctors-middle__empty">
              <div>
                <Search aria-hidden="true" />
              </div>

              <h3>No specialists found</h3>

              <p>
                Try another doctor name, specialty
                or language.
              </p>

              <button
                type="button"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      {profileDoctor && (
        <div
          className="doctor-profile-modal"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setProfileDoctor(null);
            }
          }}
        >
          <article
            className="doctor-profile-modal__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="doctor-profile-name"
          >
            <button
              className="doctor-modal-close"
              type="button"
              aria-label="Close doctor profile"
              onClick={() =>
                setProfileDoctor(null)
              }
            >
              <X aria-hidden="true" />
            </button>

            <div className="doctor-profile-modal__header">
              <div
                className={`doctor-card__avatar doctor-card__avatar--${profileDoctor.color}`}
                aria-hidden="true"
              >
                {profileDoctor.initials}
              </div>

              <div>
                <h2 id="doctor-profile-name">
                  {profileDoctor.name}
                </h2>

                <p>
                  {profileDoctor.designation}
                </p>
              </div>
            </div>

            <div className="doctor-profile-modal__details">
              <div>
                <span>Experience</span>
                <strong>
                  {profileDoctor.experience}
                </strong>
              </div>

              <div>
                <span>Consultation fee</span>
                <strong>
                  {formatPrice(
                    profileDoctor.fee
                  )}
                </strong>
              </div>

              <div>
                <span>Languages</span>
                <strong>
                  {profileDoctor.languages.join(", ")}
                </strong>
              </div>

              <div>
                <span>Consultation</span>
                <strong>
                  {profileDoctor.duration} video
                </strong>
              </div>
            </div>

            <div className="doctor-profile-modal__content">
              <h3>About the specialist</h3>
              <p>
                {profileDoctor.description}
              </p>

              <h3>Education</h3>
              <p>{profileDoctor.education}</p>

              <h3>Areas of focus</h3>
              <p>{profileDoctor.focus}</p>
            </div>

            <button
              className="doctor-profile-modal__book"
              type="button"
              onClick={() =>
                openBooking(profileDoctor)
              }
            >
              <Video aria-hidden="true" />
              Book video consultation
            </button>
          </article>
        </div>
      )}

      <SlotBookingModal
        doctor={bookingDoctor}
        isOpen={Boolean(bookingDoctor)}
        onClose={closeBooking}
        onBookingComplete={handleBookingComplete}
      />
    </>
  );
}
