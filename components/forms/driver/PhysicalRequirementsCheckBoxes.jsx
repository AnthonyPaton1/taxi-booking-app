"use client";

export default function PhysicalRequirementsCheckboxes({ formData, setFormData }) {
  const options = [
    "Low step access",
    "Rear access",
    "Side access",
    "Portable ramp required",
    "High roof vehicle",
    "Large boot for wheelchair",
    "Electric scooter storage",
    "Oxygen tank space",
    "Double wheelchair access",
    "Hydraulic tail-lift",
  ];

  const handleChange = (e) => {
    const { value, checked } = e.target;
    const current = formData.physicalRequirements || [];

    setFormData((prev) => ({
      ...prev,
      physicalRequirements: checked
        ? [...current, value]
        : current.filter((item) => item !== value),
    }));
  };

  return (
    <fieldset className="space-y-4 mt-6" aria-labelledby="physical-reqs-label">
      <legend
        id="physical-reqs-label"
        className="text-lg font-semibold text-blue-900"
      >
        Physical Vehicle Requirements
      </legend>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map((label) => (
          <div key={label} className="flex items-center">
            <input
              type="checkbox"
              id={label}
              value={label}
              checked={formData.physicalRequirements?.includes(label) || false}
              onChange={handleChange}
              className="mr-2"
              aria-label={label}
            />
            <label htmlFor={label} className="text-gray-700">
              {label}
            </label>
          </div>
        ))}
      </div>
    </fieldset>
  );
}
