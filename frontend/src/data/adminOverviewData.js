const periodDefinitions = {
  "7d": {
    label: "Last 7 days",
    labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"],
    appointments: [4, 6, 3, 5, 7, 4, 6],
    newPatients: [2, 3, 1, 2, 4, 2, 3],
    netRevenue: [3600, 6000, 2400, 4800, 7200, 3600, 6000],
    completed: 26,
    upcoming: 5,
    cancelled: 3,
    noShow: 1,
    refunded: 3600,
    patientsWithBookings: 28,
    returningPatients: 7,
  },

  "30d": {
    label: "Last 30 days",
    labels: ["Days 1–5", "Days 6–10", "Days 11–15", "Days 16–20", "Days 21–25", "Days 26–30"],
    appointments: [12, 16, 14, 18, 20, 22],
    newPatients: [6, 8, 7, 10, 11, 12],
    netRevenue: [12000, 16800, 14400, 19200, 21600, 24000],
    completed: 80,
    upcoming: 10,
    cancelled: 8,
    noShow: 4,
    refunded: 9600,
    patientsWithBookings: 75,
    returningPatients: 20,
  },

  "3m": {
    label: "Last 3 months",
    labels: ["Month 1", "Month 2", "Month 3"],
    appointments: [74, 90, 102],
    newPatients: [32, 38, 54],
    netRevenue: [84000, 103200, 108000],
    completed: 214,
    upcoming: 20,
    cancelled: 24,
    noShow: 8,
    refunded: 28800,
    patientsWithBookings: 168,
    returningPatients: 48,
  },

  "1y": {
    label: "Last 1 year",
    labels: [
      "Month 1",
      "Month 2",
      "Month 3",
      "Month 4",
      "Month 5",
      "Month 6",
      "Month 7",
      "Month 8",
      "Month 9",
      "Month 10",
      "Month 11",
      "Month 12",
    ],
    appointments: [18, 22, 24, 34, 44, 54, 64, 74, 90, 102, 110, 124],
    newPatients: [8, 10, 12, 18, 22, 26, 30, 32, 38, 54, 58, 66],
    netRevenue: [
      18000,
      21600,
      24000,
      36000,
      48000,
      60000,
      72000,
      84000,
      103200,
      108000,
      120000,
      136800,
    ],
    completed: 690,
    upcoming: 34,
    cancelled: 36,
    noShow: 24,
    refunded: 43200,
    patientsWithBookings: 310,
    returningPatients: 96,
  },
};

const sum = (values) =>
  values.reduce((total, value) => total + value, 0);

const createOverview = (period, definition) => {
  const netRevenue = sum(definition.netRevenue);
  const fertilityRevenue = Math.round(netRevenue * 0.5);
  const andrologyRevenue = Math.round(netRevenue * 0.3);

  return {
    period: {
      value: period,
      label: definition.label,
      currency: "INR",
    },

    // Current account totals do not change with the period filter.
    users: {
      totalPatients: 420,
      newPatients: sum(definition.newPatients),
      patientsWithBookings: definition.patientsWithBookings,
      returningPatients: definition.returningPatients,
    },

    doctors: {
      total: 15,
      active: 12,
      pendingVerification: 3,
    },

    appointments: {
      total: sum(definition.appointments),
      completed: definition.completed,
      upcoming: definition.upcoming,
      cancelled: definition.cancelled,
      noShow: definition.noShow,
    },

    revenue: {
      captured: netRevenue + definition.refunded,
      refunded: definition.refunded,
      net: netRevenue,
    },

    trend: definition.labels.map((label, index) => ({
      key: `${period}-${index}`,
      label,
      netRevenue: definition.netRevenue[index],
      appointments: definition.appointments[index],
      newPatients: definition.newPatients[index],
    })),

    specialties: [
      {
        name: "Male fertility",
        netRevenue: fertilityRevenue,
      },
      {
        name: "Andrology",
        netRevenue: andrologyRevenue,
      },
      {
        name: "Urology",
        netRevenue:
          netRevenue - fertilityRevenue - andrologyRevenue,
      },
    ],
  };
};

export const adminOverviewData = Object.fromEntries(
  Object.entries(periodDefinitions).map(([period, definition]) => [
    period,
    createOverview(period, definition),
  ])
);

export async function getAdminOverview(period, { signal } = {}) {
  /*
  Replace the demo implementation below with your backend:

  const response = await fetch(
    `/api/admin/overview?period=${encodeURIComponent(period)}`,
    {
      credentials: "include",
      signal,
    }
  );

  if (!response.ok) {
    throw new Error("Unable to load business analytics.");
  }

  const result = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.message || "Overview data is unavailable.");
  }

  return result.data;
  */

  if (signal?.aborted) {
    throw new DOMException("Request cancelled.", "AbortError");
  }

  const overview = adminOverviewData[period];

  if (!overview) {
    throw new Error("Invalid date range.");
  }

  return overview;
}