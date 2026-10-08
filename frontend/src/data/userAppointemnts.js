export const userAppointments = [
  {
    id: "QYX-1024",
    patientId: "USER-001",
    doctor: "Dr. Arjun Mehta",
    specialty: "Male fertility specialist",
    initials: "AM",
    date: "2026-10-08",
    time: "2:30 PM",
    duration: "30 minutes",
    status: "upcoming",
    roomAvailable: true,
    type: "Video consultation",
    purpose: "Initial fertility consultation",
    fee: 1200,
    paymentStatus: "Paid",

    patient: {
      name: "Rahul Sharma",
      email: "rahul@example.com",
      mobile: "+91 9876543210",
    },

    notes: "First consultation to discuss my concerns.",

    bookingResponses: [
      {
        questionId: "reason",
        question: "What brings you to this consultation?",
        answer: "We have been trying to conceive for eight months.",
      },
      {
        questionId: "duration",
        question: "How long have you had this concern?",
        answer: "Around eight months.",
      },
      {
        questionId: "previous-consultation",
        question: "Have you consulted a specialist before?",
        answer: "No, this is my first consultation.",
      },
      {
        questionId: "previous-reports",
        question: "Do you have previous reports to discuss?",
        answer: "No reports yet.",
      },
    ],

    sessionSummary: null,
    prescription: null,
  },

  {
    id: "QYX-1025",
    patientId: "USER-002",
    doctor: "Dr. Rohan Verma",
    specialty: "Andrology",
    initials: "RV",
    date: "2026-10-12",
    time: "11:00 AM",
    duration: "30 minutes",
    status: "upcoming",
    roomAvailable: false,
    type: "Video consultation",
    purpose: "Report discussion",
    fee: 1000,
    paymentStatus: "Paid",

    patient: {
      name: "Amit Kumar",
      email: "amit@example.com",
      mobile: "+91 9876543211",
    },

    notes: "I would like to discuss my recent reports.",

    bookingResponses: [
      {
        questionId: "reason",
        question: "What brings you to this consultation?",
        answer: "I need help understanding my recent test results.",
      },
      {
        questionId: "duration",
        question: "How long have you had this concern?",
        answer: "Around three months.",
      },
      {
        questionId: "previous-consultation",
        question: "Have you consulted a specialist before?",
        answer: "Yes, I consulted a specialist last month.",
      },
      {
        questionId: "previous-reports",
        question: "Do you have previous reports to discuss?",
        answer: "Yes, I have a recent semen analysis report.",
      },
    ],

    sessionSummary: null,
    prescription: null,
  },
];

export const appointmentStatusLabels = {
  upcoming: "Upcoming",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const formatAppointmentDate = (date) =>
  new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const formatAppointmentFee = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);