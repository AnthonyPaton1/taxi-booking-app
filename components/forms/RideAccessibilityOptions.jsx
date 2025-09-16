"use client";

export default function RideAccessibilityOptions({ formData, setFormData }) {
  const handleCheckbox = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const options = [
    {
      title: "Mobility",
      fields: [
        { name: "wheelchairAccess", label: "Wheelchair access required" },
        { name: "assistanceRequired", label: "Assistance storing wheelchair" },
        { name: "assistanceAnimal", label: "Travelling with assistance animal" },
        { name: "nonWAVvehicle", label: "I do not need a WAV vehicle" },
        { name: "carerPresent", label: "Carer will be present" },
        { name: "familiarDriverOnly", label: "I require a familiar driver" },
      ],
    },
    {
      title: "Sensory & Neurodiversity",
      fields: [
        { name: "quietEnvironment", label: "Quiet environment preferred" },
        { name: "noConversation", label: "No conversation during trip" },
        { name: "visualSchedule", label: "Visual schedule provided" },
      ],
    },
    {
      title: "Safety & Health",
      fields: [
        { name: "medicationOnBoard", label: "Bringing medication on board" },
        { name: "escortRequired", label: "Escort is required" },
      ],
    },
    {
      title: "Communication Preferences",
      fields: [
        { name: "femaleDriverOnly", label: "Female driver only" },
        { name: "signLanguageRequired", label: "Sign language support" },
        { name: "textOnlyCommunication", label: "Text-only communication" },
      ],
    },
  ];

  return (
    <div className="space-y-4 mt-6">
      <h3 className="text-lg font-semibold text-blue-900">
        Accessibility & Support Options
      </h3>

      {options.map((group) => (
        <fieldset
          key={group.title}
          className="border border-gray-200 p-4 rounded"
          aria-labelledby={`${group.title.toLowerCase().replace(/\s+/g, "-")}-legend`}
        >
          <legend
            id={`${group.title.toLowerCase().replace(/\s+/g, "-")}-legend`}
            className="text-md font-semibold text-gray-700 mb-2"
          >
            {group.title}
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {group.fields.map(({ name, label }) => (
              <div key={name} className="flex items-center">
                <input
                  type="checkbox"
                  id={name}
                  name={name}
                  checked={formData[name] || false}
                  onChange={handleCheckbox}
                  className="mr-2"
                  aria-label={label}
                />
                <label htmlFor={name} className="text-gray-700">
                  {label}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}