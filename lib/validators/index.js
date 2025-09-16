// lib/validators/index.js
import { int, z } from "zod";

/** Helpers */
const toBool = z.preprocess((v) => {
  if (typeof v === "string")
    return ["on", "true", "1", "yes"].includes(v.toLowerCase());
  if (typeof v === "number") return v === 1;
  return Boolean(v);
}, z.boolean());

export const RideRequestSchema = z
  .object({
    pickupTime: z.coerce.date(),
    returnTime: z.coerce.date().optional(),

    pickupLocation: z.string().min(3, "Pickup location is required").trim(),
    dropoffLocation: z.string().min(3, "Drop-off location is required").trim(),

    wheelchairAccess: toBool.default(false),
    highRoof: toBool.default(false),
    carerPresent: toBool.default(false),
    nonWAVvehicle: toBool.default(false),
    femaleDriverOnly: toBool.default(false),
    quietEnvironment: toBool.default(false),
    assistanceRequired: toBool.default(false),
    noConversation: toBool.default(false),
    visualSchedule: toBool.default(false),
    escortRequired: toBool.default(false),
    signLanguageRequired: toBool.default(false),
    textOnlyCommunication: toBool.default(false),
    medicationOnBoard: toBool.default(false),
    assistanceAnimal: toBool.default(false),

    passengerCount: z.coerce.number().int().min(1).max(15).default(1),
    wheelchairUsers: z.coerce.number().int().min(0).max(6).default(1),

    ageOfPassenger: z.coerce.number().int().min(0).optional(),
    specificMusic: z.string().max(100).optional(),
    preferredLanguage: z.string().max(50).default("English"),
    medicalConditions: z.string().max(300).optional(),

    notes: z.string().max(300).optional(),
    additionalNeeds: z.string().max(300).optional(),

    specialRequests: z.array(z.string()).optional(),
    distanceKm: z.coerce.number().positive().optional(),
    passengersName: z.string().max(100).optional(),
  })

  .refine((data) => data.wheelchairUsers <= data.passengerCount, {
    path: ["wheelchairUsers"],
    message: "Wheelchair users cannot exceed total passengers",
  })

  .refine((data) => !data.returnTime || data.returnTime >= data.pickupTime, {
    message: "Return time must be after pickup time",
    path: ["returnTime"],
  });

export const UpdateRideRequestSchema = RideRequestSchema.safeExtend({
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
  role: z.enum(["COORDINATOR", "MANAGER", "DRIVER", "PUBLIC"]).optional(),
});

export const OnboardingSchema = z.object({
  businessName: z.string().min(1),
  addressLine1: z.string().min(1),
  city: z.string().min(1),
  postcode: z.string().min(1),
  website: z
    .string()
    .regex(
      /^(https?:\/\/)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(\/\S*)?$/,
      "Must be a valid website"
    ),
  contactNumber: z.string().min(5),
  contactEmail: z.string().email(),
  coordinators: z.array(
    z.object({
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().min(5),
      areas: z.string().min(1),
    })
  ),
});
