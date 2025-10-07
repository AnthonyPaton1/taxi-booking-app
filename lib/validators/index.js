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
  role: z.enum(["COORDINATOR", "MANAGER", "DRIVER", "PUBLIC", "ADMIN"]).optional(),
});

export const AdminOnboardingSchema = z.object({
  businessName: z.string().min(1),
  type: z.literal(["CARE"]),
  address1: z.string().min(1),
  city: z.string().min(1),
  postcode: z.string().min(1),
  contactNumber: z.string().min(1),
  contactEmail: z.string().email(),
  website: z.string().url().optional(),

  coordinators: z.array(
    z.object({
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().min(1),
      area: z.string().optional(), 
    })
  ),
});

export const CoordinatorOnboardingSchema = z.object({
  companyId: z.string().min(1), // link back to company

  contactNumber: z.string().min(1),
  contactEmail: z.string().email(),

  managers: z.array(
    z.object({
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().min(1),
      area: z.string().optional(),
    })
  ),
});

export const ManagerOnboardingSchema = z.object({
  companyId: z.string().min(1), // optional if pulled from session
  contactNumber: z.string().min(1),
  contactEmail: z.string().email(),

  houses: z.array(
    z.object({
      label: z.string().min(1),
      line1: z.string().min(1),
      city: z.string().min(1),
      postcode: z.string().min(1),
      notes: z.string().optional(),
      internalId: z.string().min(1),
      pin: z.string().min(1),
      loginName: z.string().min(1),
      managerEmail: z.string().email(), // required to link house to a manager
    })
  ),
});

export const DriverOnboardingSchema = z.object({
  name: z.string(),
  vehicleType: z.enum(["CAR", "VAN", "WAV", "MINIBUS"]),
  vehicleReg: z.string(),
  licenceNumber: z.string(),
  localPostcode: z.string(),
  radiusMiles: z.number().min(5),
  phone: z.string(),

  // Compliance
  ukDrivingLicence: z.boolean(),
  localAuthorityRegistered: z.boolean(),
  dbsChecked: z.boolean(),
  publicLiabilityInsurance: z.boolean(),
  fullyCompInsurance: z.boolean(),
  healthCheckPassed: z.boolean(),
  englishProficiency: z.boolean(),

  // Vehicle amenities
  amenities: z.array(z.string()).optional(),

  // Accessibility & matching options
  wheelchairAccess: z.boolean(),
  doubleWheelchairAccess: z.boolean(),
  highRoof: z.boolean(),
  carerPresent: z.boolean(),
  passengerCount: z.number().min(0),
  wheelchairUsers: z.number().min(0),
  nonWAVvehicle: z.boolean(),
  femaleDriverOnly: z.boolean(),
  quietEnvironment: z.boolean(),
  assistanceRequired: z.boolean(),
  noConversation: z.boolean(),
  electricScooterStorage: z.boolean(),
  visualSchedule: z.boolean(),
  assistanceAnimal: z.boolean(),
  familiarDriverOnly: z.boolean(),
  escortRequired: z.boolean(),
  signLanguageRequired: z.boolean(),
  textOnlyCommunication: z.boolean(),
  translationSupport: z.boolean(),
  noScents: z.boolean(),
  seatTransferHelp: z.boolean(),
  mobilityAidStorage: z.boolean(),
  firstAidTrained: z.boolean(),
  conditionAwareness: z.boolean(),
  medicationOnBoard: z.boolean(),

  // Optional string fields
  specificMusic: z.boolean().optional(),
  preferredLanguage: z.string().optional(),
  medicalConditions: z.string().optional(),
  additionalNeeds: z.string().optional(),

  // Optional numeric fields
  ageOfPassenger: z.number().optional().nullable(),
});

 export const HouseSchema = z.object({
  label: z.string().min(1),
  notes: z.string().optional(),
  internalId: z.string().min(1),
  pin: z.string().min(1),
  loginName: z.string().min(1),
});
