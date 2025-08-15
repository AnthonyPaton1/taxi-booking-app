// lib/validators/index.js
import { z } from "zod";

/** Helpers */
const toBool = z.preprocess((v) => {
  if (typeof v === "string")
    return ["on", "true", "1", "yes"].includes(v.toLowerCase());
  if (typeof v === "number") return v === 1;
  return Boolean(v);
}, z.boolean());

/** ----- Ride Requests (matches Prisma RideRequest) ----- */
export const RideRequestSchema = z.object({
  pickupTime: z.coerce.date(),
  returnTime: z.coerce.date().optional(),
  pickupLocation: z.string().min(3, "Pickup location is required"),
  dropoffLocation: z.string().min(3, "Drop-off location is required"),
  wheelchairAccess: toBool.default(false),
  highRoof: toBool.default(false),
  carerPresent: toBool.default(false),
  notes: z.string().max(300, "Notes too long").optional(),
});

export const UpdateRideRequestSchema = RideRequestSchema.extend({
  id: z.string().min(1, "Id is required"),
});

/** ----- Bids (matches Prisma Bid) ----- */
export const BidSchema = z.object({
  rideRequestId: z.string().min(1, "rideRequestId is required"),
  amountCents: z.coerce.number().int().positive("Amount must be > 0"),
  message: z.string().max(300).optional(),
});

// If you temporarily still post legacy fields, keep this and map it to BidSchema in your action.
export const LegacyBidSchema = z.object({
  jobId: z.string().min(1),
  driverId: z.string().min(1),
  price: z.coerce.number().min(5, "Minimum fare is £5"),
  message: z.string().max(200).optional(),
});

/** ----- Auto-bid rules (matches Prisma AutoBid) ----- */
export const AutoBidSchema = z
  .object({
    minDistanceKm: z.coerce.number().nonnegative(),
    maxDistanceKm: z.coerce.number().positive(),
    minAmountCents: z.coerce.number().int().nonnegative(),
    maxAmountCents: z.coerce.number().int().positive(),
    active: toBool.default(true),
  })
  .refine((v) => v.minDistanceKm <= v.maxDistanceKm, {
    message: "Invalid distance range",
  })
  .refine((v) => v.minAmountCents <= v.maxAmountCents, {
    message: "Invalid amount range",
  });

/** ----- Optional: Payment method (keep if you actually use it) ----- */
export const paymentMethods = ["card", "cash", "paypal"]; // adjust to your real list
export const PaymentMethodSchema = z
  .object({ type: z.string().min(1, "Payment method is required") })
  .refine((data) => paymentMethods.includes(data.type), {
    path: ["type"],
    message: "Invalid payment method",
  });
