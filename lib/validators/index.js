// lib/validators/index.js
import { int, z } from "zod";

/** Helpers */
const toBool = z.preprocess((v) => {
  if (typeof v === "string")
    return ["on", "true", "1", "yes"].includes(v.toLowerCase());
  if (typeof v === "number") return v === 1;
  return Boolean(v);
}, z.boolean());

export const HouseSchema = z.object({
  label: z.string().min(1, "House label is required"),
  line1: z.string().min(1, "Address is required"),      
  city: z.string().min(1, "City is required"),          
  postcode: z.string().min(1, "Postcode is required"),  
  notes: z.string().optional().nullable(),
  lat: z.number(),                                      
  lng: z.number(), 
})


export const DriverOnboardingSchema = z.object({
  // Driver core fields
  name: z.string().min(1, "Name is required"),
  vehicleType: z.enum(["CAR", "VAN", "WAV", "MINIBUS"]),
  vehicleReg: z.string().min(1, "Vehicle registration is required"),
  localPostcode: z.string().min(1, "Postcode is required"),
  radiusMiles: z.number().min(5).max(100),
  phone: z.string().min(1, "Phone is required"),
  amenities: z.array(z.string()).optional().default([]),

  // Compliance fields (will go in DriverCompliance table)
  licenceNumber: z.string().min(1, "Licence number is required"),
  ukDrivingLicence: z.boolean(),
  localAuthorityRegistered: z.boolean(),
  dbsChecked: z.boolean(),
  publicLiabilityInsurance: z.boolean(),
  fullyCompInsurance: z.boolean(),
  healthCheckPassed: z.boolean(),
  englishProficiency: z.boolean(),

  // Accessibility fields (will go in AccessibilityProfile table)
  wheelchairAccess: z.boolean().default(false),
  doubleWheelchairAccess: z.boolean().default(false),
  highRoof: z.boolean().default(false),
  seatTransferHelp: z.boolean().default(false),
  mobilityAidStorage: z.boolean().default(false),
  electricScooterStorage: z.boolean().default(false),
  
  passengerCount: z.number().min(0).default(0),
  wheelchairUsers: z.number().min(0).default(0),
  ageOfPassenger: z.number().optional().nullable(),
  carerPresent: z.boolean().default(false),
  escortRequired: z.boolean().default(false),
  
  quietEnvironment: z.boolean().default(false),
  noConversation: z.boolean().default(false),
  noScents: z.boolean().default(false),
  specificMusic: z.string().optional().nullable(), // Changed to string!
  visualSchedule: z.boolean().default(false),
  
  signLanguageRequired: z.boolean().default(false),
  textOnlyCommunication: z.boolean().default(false),
  preferredLanguage: z.string().optional().nullable(),
  translationSupport: z.boolean().default(false),
  
  assistanceRequired: z.boolean().default(false),
  assistanceAnimal: z.boolean().default(false),
  familiarDriverOnly: z.boolean().default(false),
  femaleDriverOnly: z.boolean().default(false),
  nonWAVvehicle: z.boolean().default(false),
  
  medicationOnBoard: z.boolean().default(false),
  medicalConditions: z.string().optional().nullable(),
  firstAidTrained: z.boolean().default(false),
  conditionAwareness: z.boolean().default(false),
  
  additionalNeeds: z.string().optional().nullable(),
});

// NEW: Public Booking Schema
export const PublicBookingSchema = z.object({
  // Booking details
  pickupLocation: z.string().min(1, "Pickup location is required"),
  dropoffLocation: z.string().min(1, "Dropoff location is required"),
  pickupPostcode: z.string().min(1, "Pickup postcode is required"),
  dropoffPostcode: z.string().min(1, "Dropoff postcode is required"),
  pickupDate: z.string().min(1, "Pickup date is required"),
  pickupTime: z.string().min(1, "Pickup time is required"),
  returnTime: z.string().optional().nullable(),
  roundTrip: z.boolean().default(false),
  
  // Passengers
  passengerCount: z.number().min(1).max(15),
  wheelchairUsers: z.number().min(0).max(6),
  initials: z.array(z.string()).optional().default([]),
  
  // Accessibility (same as driver schema)
  wheelchairAccess: z.boolean().default(false),
  doubleWheelchairAccess: z.boolean().default(false),
  highRoof: z.boolean().default(false),
  seatTransferHelp: z.boolean().default(false),
  mobilityAidStorage: z.boolean().default(false),
  electricScooterStorage: z.boolean().default(false),
  
  carerPresent: z.boolean().default(false),
  escortRequired: z.boolean().default(false),
  ageOfPassenger: z.number().optional().nullable(),
  
  quietEnvironment: z.boolean().default(false),
  noConversation: z.boolean().default(false),
  noScents: z.boolean().default(false),
  specificMusic: z.string().optional().nullable(),
  visualSchedule: z.boolean().default(false),
  
  signLanguageRequired: z.boolean().default(false),
  textOnlyCommunication: z.boolean().default(false),
  preferredLanguage: z.string().optional().nullable(),
  translationSupport: z.boolean().default(false),
  
  assistanceRequired: z.boolean().default(false),
  assistanceAnimal: z.boolean().default(false),
  familiarDriverOnly: z.boolean().default(false),
  femaleDriverOnly: z.boolean().default(false),
  nonWAVvehicle: z.boolean().default(false),
  
  medicationOnBoard: z.boolean().default(false),
  medicalConditions: z.string().optional().nullable(),
  firstAidTrained: z.boolean().default(false),
  conditionAwareness: z.boolean().default(false),
  
  additionalNeeds: z.string().optional().nullable(),
});
// Keep the public schema for direct public bookings (legacy/future feature)
// This is for public users booking directly without going through a care home
export const RideRequestSchema = PublicBookingSchema;


export const BusinessBookingSchema = z.object({
  // Required business-specific fields
  residentId: z.string().min(1, "Resident is required"),
  houseId: z.string().min(1, "House is required"),
  
  // Journey details
  pickupLocation: z.string().min(1, "Pickup location is required"),
  dropoffLocation: z.string().min(1, "Dropoff location is required"),
  pickupPostcode: z.string().min(1, "Pickup postcode is required"),
  dropoffPostcode: z.string().min(1, "Dropoff postcode is required"),
  pickupDate: z.string().min(1, "Pickup date is required"),
  pickupTime: z.string().min(1, "Pickup time is required"),
  returnTime: z.string().optional().nullable(),
  roundTrip: z.boolean().default(false),
  
  // Passengers
  passengerCount: z.number().min(1).max(15),
  wheelchairUsers: z.number().min(0).max(6),
  
  // Accessibility
  wheelchairAccess: z.boolean().default(false),
  doubleWheelchairAccess: z.boolean().default(false),
  highRoof: z.boolean().default(false),
  seatTransferHelp: z.boolean().default(false),
  mobilityAidStorage: z.boolean().default(false),
  electricScooterStorage: z.boolean().default(false),
  
  carerPresent: z.boolean().default(false),
  escortRequired: z.boolean().default(false),
  ageOfPassenger: z.number().optional().nullable(),
  
  // Sensory needs
  quietEnvironment: z.boolean().default(false),
  noConversation: z.boolean().default(false),
  noScents: z.boolean().default(false),
  specificMusic: z.string().optional().nullable(),
  visualSchedule: z.boolean().default(false),
  
  // Communication
  signLanguageRequired: z.boolean().default(false),
  textOnlyCommunication: z.boolean().default(false),
  preferredLanguage: z.string().optional().nullable(),
  translationSupport: z.boolean().default(false),
  
  // Special requirements
  assistanceRequired: z.boolean().default(false),
  assistanceAnimal: z.boolean().default(false),
  familiarDriverOnly: z.boolean().default(false),
  femaleDriverOnly: z.boolean().default(false),
  nonWAVvehicle: z.boolean().default(false),
  
  // Medical
  medicationOnBoard: z.boolean().default(false),
  medicalConditions: z.string().optional().nullable(),
  firstAidTrained: z.boolean().default(false),
  conditionAwareness: z.boolean().default(false),
  
  // Notes
  additionalNeeds: z.string().optional().nullable(),
  managerNotes: z.string().optional().nullable(), // Internal notes not visible to drivers
  
  // Business/auditing
  createdBy: z.string().min(1, "Manager name is required for audit trail"),
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
  type: z.enum(["CARE", "TAXI"]),
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().optional().transform(val => {
    if (!val || val === "") return null;
    // Add https:// if missing
    if (!val.startsWith("http://") && !val.startsWith("https://")) {
      return `https://${val}`;
    }
    return val;
  })
  .pipe(z.string().url().nullable()), // ✅ Allow empty string
  address1: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().min(1),
  coordinators: z.array(
    z.object({
      name: z.string().min(1),
      email: z.string().email(),
      area: z.string().min(1, "Area is required"), // ✅ Made required
    })
  ).optional().default([]),
});

export const CoordinatorOnboardingSchema = z.object({
  companyId: z.string().min(1), // link back to company
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
  managerEmail: z.string().email(),
  name: z.string().min(1),
  area: z.string().min(1),
  houses: z.array(HouseSchema).min(1, "At least one house is required"),
});



