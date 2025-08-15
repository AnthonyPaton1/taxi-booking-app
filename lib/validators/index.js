import { z } from "zod";

export const rideRequestValidator = z.object({
  pickupTime: z.string().transform((val) => new Date(val)),
  returnTime: z.string().optional(),
  pickupLocation: z.string().min(3, "Pickup location is required"),
  dropoffLocation: z.string().min(3, "Drop-off location is required"),
  wheelchairAccess: z.boolean(),
  highRoof: z.boolean(),
  carerPresent: z.boolean(),
  notes: z.string().max(300, "Notes too long").optional(),
});

export const updateRideRequestValidator = rideRequestValidator.extend({
  id: z.string().min(1, "Id is required").optional(),
});

export const bidValidatorSchema = z.object({
  jobId: z.string().min(1),
  driverId: z.string().min(1),
  price: z.number().min(5, "Minimum fare is £5"),
  message: z.string().max(200).optional(),
});

export const vehicleValidatorSchema = z.object({
  name: z.string().min(1),
  vehicle: z.string().min(2),
  passengers: z.number().min(1),
  accessibility: z.string().min(1), // e.g. 'wheelchair', 'hoist'
  carer: z.boolean(),
  price: z.number().min(0),
});

export const statusValidatorSchema = z.object({
  status: z.enum([
    "ready_now",
    "running_late_15",
    "running_late_30",
    "trip_completed",
  ]),
});

export const paymentMethodSchema = z
  .object({
    type: z.string().min(1, "Payment method is required"),
  })
  .refine((data) => paymentMethods.includes(data.type), {
    path: ["type"],
    message: "Invalid payment method",
  });
