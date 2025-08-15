// lib/validators/index.js
import { z } from "zod";

/** Helpers */
const toBool = z.preprocess((v) => {
  if (typeof v === "string")
    return ["on", "true", "1", "yes"].includes(v.toLowerCase());
  if (typeof v === "number") return v === 1;
  return Boolean(v);
}, z.boolean());

/** ---------- RideRequest (Prisma: RideRequest) ---------- */
export const RideRequestSchema = z.object({
  pickupTime: z.coerce.date(),
  returnTime: z.coerce.date().optional(),
  pickupLocation: z.string().min(3, "Pickup location is required"),
  dropoffLocation: z.string().min(3, "Drop-off location is required"),
  wheelchairAccess: toBool.default(false),
  highRoof: toBool.default(false),
  carerPresent: toBool.default(false),
  notes: z.string().max(300, "Notes too long").optional(),
  // Optional precomputed bits if you ever add them in forms:
  distanceKm: z.coerce.number().positive().optional(),
  passengersName: z.string().max(100).optional(),
  additionalNeeds: z.string().max(300).optional(),
});

export const UpdateRideRequestSchema = RideRequestSchema.extend({
  id: z.string().min(1, "Id is required"),
});

/** ---------- Bid (Prisma: Bid) ---------- */
export const BidSchema = z.object({
  rideRequestId: z.string().min(1, "rideRequestId is required"),
  amountCents: z.coerce.number().int().positive("Amount must be > 0"),
  message: z.string().max(300).optional(),
});

/** ---------- AutoBid (Prisma: AutoBid) ---------- */
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

/** ---------- TripFeedback (Prisma: TripFeedback) ---------- */
export const TripFeedbackSchema = z.object({
  rideId: z.string().min(1),
  // NOTE: userId comes from session; don’t accept from client
  type: z.enum(["NOTE", "COMPLAINT"]).default("NOTE"),
  message: z.string().min(1).max(1000),
});

/** ---------- Invoice (Prisma: Invoice) ---------- */
export const InvoiceCreateSchema = z.object({
  // driverId from session/role in most cases; accept explicitly if admin-only endpoint
  rideId: z.string().min(1).optional(), // invoices can be detached until a ride links
  amountCents: z.coerce.number().int().positive(),
  currency: z.string().length(3).default("GBP"),
  notes: z.string().max(300).optional(),
});

export const InvoiceUpdateSchema = z.object({
  id: z.string().min(1),
  paid: toBool.optional(),
  paidAt: z.coerce.date().optional(),
  notes: z.string().max(300).optional(),
});

/** ---------- User (Prisma: User) ---------- */
export const UserUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().min(7).max(30).optional(),
  role: z.enum(["COORDINATOR", "MANAGER", "DRIVER"]).optional(),
});
