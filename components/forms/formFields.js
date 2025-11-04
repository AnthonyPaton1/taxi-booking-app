// components/forms/formFields.js
const formFields = [
  {
    id: "adminName",
    label: "Your Full Name",
    type: "text",
    required: false, 
  },
  {
    id: "businessName",
    label: "Business Name",
    type: "text",
    required: true,
  },
  {
    id: "contactEmail",
    label: "Business Email Address",
    type: "email",
    required: true,
  },
  {
    id: "contactNumber",
    label: "Business Contact Number",
    type: "tel",
    required: true,
  },
];

export default formFields;
