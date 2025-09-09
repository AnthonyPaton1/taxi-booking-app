"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import EvidenceUploader from "@/components/simples/singleImageUploader";

export default function NewIncidentForm() {
  const router = useRouter();
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [formData, setFormData] = useState({
    time: new Date().toISOString().slice(0, 16), // yyyy-MM-ddTHH:mm
    type: "",
    description: "",
    emergency: false,
    actionsTaken: "",
    followUp: false,
    file: null,
  });

  const handleChange = (e) => {
    const { id, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [id]: checked }));
    } else if (type === "file") {
      setFormData((prev) => ({ ...prev, file: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null) {
        payload.append(key, value);
      }
    });

    const res = await fetch("/api/incidents", {
      method: "POST",
      body: payload,
    });

    if (res.ok) {
      router.push("/dashboard/incidents");
    } else {
      alert("Something went wrong.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6 text-blue-800">
        Report an Incident
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-medium">Time of Incident</label>
        <Input
          type="datetime-local"
          id="time"
          value={formData.time}
          onChange={handleChange}
          required
        />

        <label className="block text-sm font-medium">Type of Incident</label>
        <select
          id="type"
          value={formData.type}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        >
          <option value="">Select Type</option>
          <option value="Personal Injury">Personal Injury</option>
          <option value="Vehicle Damage">Vehicle Damage</option>
          <option value="Other">Other</option>
        </select>

        <label className="block text-sm font-medium">Description</label>
        <Textarea
          id="description"
          placeholder="Describe the incident in detail"
          value={formData.description}
          onChange={handleChange}
          required
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            id="emergency"
            checked={formData.emergency}
            onChange={handleChange}
          />
          Emergency Services Required?
        </label>

        <label className="block text-sm font-medium">Actions Taken</label>
        <Textarea
          id="actionsTaken"
          placeholder="What action was taken?"
          value={formData.actionsTaken}
          onChange={handleChange}
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            id="followUp"
            checked={formData.followUp}
            onChange={handleChange}
          />
          Follow-up Needed
        </label>

        <label className="block text-sm font-medium">
          Upload Evidence (optional)
        </label>

        <EvidenceUploader onUploadComplete={(url) => setEvidenceUrl(url)} />
        <EvidenceUploader onUploadComplete={(url) => setEvidenceUrl(url)} />

        <Button
          type="submit"
          className="bg-blue-700 text-white hover:bg-blue-800 w-full"
        >
          Submit Incident Report
        </Button>
      </form>
    </div>
  );
}
