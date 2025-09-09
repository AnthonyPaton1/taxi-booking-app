"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createPublicBooking } from "@/app/actions/createPublicBooking";

const PublicBookingForm = () => {
  const [status, setStatus] = useState("");
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    date: "",
    pickupTime: "",
    returnTime: "",
    roundTrip: false,
    specialRequirements: [],
    passengerCount: 1,
    wheelchairUsers: 0,
  });
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting booking:", formData);
    const res = await createPublicBooking(formData);
    if (res.success) {
      setStatus("Booking submitted!");
      setFormData({
        pickupLocation: "",
        dropoffLocation: "",
        pickupTime: "",
        returnTime: "",
        wheelchairAccess: false,
        highRoof: false,
        carerPresent: false,
        notes: "",
      });
    } else {
      setStatus("Failed to submit booking.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-md space-y-4"
      aria-labelledby="public-booking-form"
    >
      <h2 id="public-booking-form" className="text-xl font-bold text-blue-800">
        Book a Journey
      </h2>

      <div>
        <label htmlFor="from" className="block font-medium text-gray-700">
          Pickup Address
        </label>
        <input
          type="text"
          id="from"
          name="from"
          required
          value={formData.from}
          onChange={handleChange}
          className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="to" className="block font-medium text-gray-700">
          Destination Address
        </label>
        <input
          type="text"
          id="to"
          name="to"
          required
          value={formData.to}
          onChange={handleChange}
          className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block font-medium text-gray-700">
            Journey Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            required
            value={formData.date}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="pickupTime"
            className="block font-medium text-gray-700"
          >
            Pickup Time
          </label>
          <input
            type="time"
            id="pickupTime"
            name="pickupTime"
            required
            value={formData.pickupTime}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Number of Passengers */}
        <div>
          <label
            htmlFor="passengerCount"
            className="block font-medium text-gray-700"
          >
            Number of Passengers
          </label>
          <input
            type="number"
            id="passengerCount"
            name="passengerCount"
            min={1}
            max={8}
            value={formData.passengerCount || 1}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                passengerCount: parseInt(e.target.value, 10) || 1,
              }))
            }
            className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring focus:ring-blue-500"
          />
        </div>

        {/* Number of Wheelchair Users */}
        <div>
          <label
            htmlFor="wheelchairUsers"
            className="block font-medium text-gray-700"
          >
            Wheelchair Users
          </label>
          <input
            type="number"
            id="wheelchairUsers"
            name="wheelchairUsers"
            min={0}
            max={formData.passengerCount || 1}
            value={formData.wheelchairUsers || 0}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                wheelchairUsers: parseInt(e.target.value, 10) || 0,
              }))
            }
            className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Round trip */}
      <div className="flex items-center mt-2">
        <input
          type="checkbox"
          id="roundTrip"
          name="roundTrip"
          checked={formData.roundTrip}
          onChange={handleChange}
          className="mr-2"
        />
        <label htmlFor="roundTrip" className="text-gray-700 font-medium">
          Return Journey?
        </label>
      </div>

      {formData.roundTrip && (
        <div>
          <label
            htmlFor="returnTime"
            className="block font-medium text-gray-700"
          >
            Return Time
          </label>
          <input
            type="time"
            id="returnTime"
            name="returnTime"
            value={formData.returnTime}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring focus:ring-blue-500"
          />
        </div>
      )}
      <div>
        <h3 className="text-md font-semibold text-gray-800 mb-2">
          Special Requirements{" "}
          <span className="text-sm text-gray-500">(Optional)</span>
        </h3>
        <div className="space-y-2">
          {[
            { id: "highRoof", label: "High roof vehicle" },
            { id: "hydraulicLift", label: "Hydraulic lift" },
            { id: "carerIncluded", label: "Carer travelling with me" },
            { id: "assistanceAnimal", label: "Assistance animal on board" },
            {
              id: "wheelchairAccess",
              label: "Wheelchair ramp or lift required",
            },
            { id: "assistance", label: "transfer assistance needed" },
          ].map(({ id, label }) => (
            <div key={id} className="flex items-center">
              <input
                type="checkbox"
                id={id}
                name="specialRequirements"
                value={label}
                checked={formData.specialRequirements?.includes(label) || false}
                onChange={(e) => {
                  const { checked, value } = e.target;
                  setFormData((prev) => {
                    const current = prev.specialRequirements || [];
                    return {
                      ...prev,
                      specialRequirements: checked
                        ? [...current, value]
                        : current.filter((item) => item !== value),
                    };
                  });
                }}
                className="mr-2"
              />
              <label htmlFor={id} className="text-gray-700">
                {label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full bg-blue-700 text-white">
        Submit Booking
      </Button>
    </form>
  );
};

export default PublicBookingForm;
