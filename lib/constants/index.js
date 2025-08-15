export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Taxi-App";
export const APP_DESCRIPTION =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
  "An online bidding service for non-emergency transportation for accessible users";
export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

export const pickUpAddressDefaultvalues = {
  fullName: "",
  streetAddress: "",
  city: "",
  postCode: "",
};
export const dropOffAddressDefaultvalues = {
  fullName: "",
  streetAddress: "",
  city: "",
  postCode: "",
};

export const paymentMethods = process.env.PAYMENT_METHODS
  ? process.env.PAYMENT_METHODS.split(",").map((m) => m.trim())
  : ["PayPal", "Stripe"];
export const DEFAULT_PAYMENT_METHOD =
  process.env.DEFAULT_PAYMENT_METHOD || "PayPal";

export const PAGE_SIZE = Number(process.env.PAGE_SIZE) || 12;

export const vehicleDefaultValues = {
  id: "",
  name: "",
  vehicle: "",
  passengers: 0,
  accessibility: "",
  carer: "false",
  userId: "",
  price: 0,
};

export const bidSystem = {
  id: "",
  rideRequestId: "",
  name: "",
  amountCents: 0,
  message: "",
  userId: "",
  driverId: "",
  status: "pending",
  message: "",
  createdAt: "",
};

// lib/constants/index.js

/** Enums mirrored from Prisma (keep in sync if schema changes) */
export const ROLES = ["COORDINATOR", "MANAGER", "DRIVER"];
export const BID_STATUS = ["PENDING", "ACCEPTED", "DECLINED"];
export const FEEDBACK_TYPES = ["NOTE", "COMPLAINT"];

/** ---------- Form defaults (UI-friendly) ---------- */
export const rideRequestDefaults = {
  pickupTime: "", // ISO string from <input type="datetime-local">
  returnTime: "", // optional
  pickupLocation: "",
  dropoffLocation: "",
  wheelchairAccess: false,
  highRoof: false,
  carerPresent: false,
  notes: "",
  // optional extras if you expose them in forms
  distanceKm: "", // number-like string; coerce in validator
  passengersName: "",
  additionalNeeds: "",
};

export const bidDefaults = {
  rideRequestId: "",
  amountCents: "", // number-like string; coerce in validator
  message: "",
};

export const autoBidDefaults = {
  minDistanceKm: "",
  maxDistanceKm: "",
  minAmountCents: "",
  maxAmountCents: "",
  active: true,
};

export const tripFeedbackDefaults = {
  rideId: "",
  type: "NOTE", // "NOTE" | "COMPLAINT"
  message: "",
};

export const invoiceCreateDefaults = {
  rideId: "", // optional; you may set it later
  amountCents: "",
  currency: "GBP",
  notes: "",
};

export const invoiceUpdateDefaults = {
  id: "",
  paid: false,
  paidAt: "", // ISO string if you expose it
  notes: "",
};

export const userUpdateDefaults = {
  name: "",
  phone: "",
  role: "DRIVER", // "COORDINATOR" | "MANAGER" | "DRIVER"
};

/** ---------- Minimal DTO helpers (safe to send to server actions) ---------- */
// These normalize empty strings to undefined/null so Zod coercions behave nicely.
export const normalizeRideRequest = (v) => ({
  pickupTime: v.pickupTime,
  returnTime: v.returnTime || undefined,
  pickupLocation: v.pickupLocation?.trim(),
  dropoffLocation: v.dropoffLocation?.trim(),
  wheelchairAccess: !!v.wheelchairAccess,
  highRoof: !!v.highRoof,
  carerPresent: !!v.carerPresent,
  notes: v.notes?.trim() || undefined,
  distanceKm: v.distanceKm === "" ? undefined : v.distanceKm,
  passengersName: v.passengersName?.trim() || undefined,
  additionalNeeds: v.additionalNeeds?.trim() || undefined,
});

export const normalizeBid = (v) => ({
  rideRequestId: v.rideRequestId,
  amountCents: v.amountCents,
  message: v.message?.trim() || undefined,
});

export const normalizeAutoBid = (v) => ({
  minDistanceKm: v.minDistanceKm,
  maxDistanceKm: v.maxDistanceKm,
  minAmountCents: v.minAmountCents,
  maxAmountCents: v.maxAmountCents,
  active: !!v.active,
});

export const normalizeTripFeedback = (v) => ({
  rideId: v.rideId,
  type: FEEDBACK_TYPES.includes(v.type) ? v.type : "NOTE",
  message: v.message?.trim(),
});

export const normalizeInvoiceCreate = (v) => ({
  rideId: v.rideId || undefined,
  amountCents: v.amountCents,
  currency: (v.currency || "GBP").toUpperCase(),
  notes: v.notes?.trim() || undefined,
});

export const normalizeInvoiceUpdate = (v) => ({
  id: v.id,
  paid: !!v.paid,
  paidAt: v.paidAt || undefined,
  notes: v.notes?.trim() || undefined,
});

export const normalizeUserUpdate = (v) => ({
  name: v.name?.trim() || undefined,
  phone: v.phone?.trim() || undefined,
  role: ROLES.includes(v.role) ? v.role : undefined,
});
