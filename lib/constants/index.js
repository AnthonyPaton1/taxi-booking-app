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
