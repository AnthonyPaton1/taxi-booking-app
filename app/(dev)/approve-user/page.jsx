// app/(dev)/approve-user/page.jsx
"use client";

import { useState } from "react";
import { approveUser } from "@/app/actions/auth/approveUser";

export default function ApproveUserDevPage() {
  const [id, setId] = useState("");
  const [status, setStatus] = useState("");

  const handleApprove = async () => {
    setStatus("Approving...");
    try {
      const user = await approveUser(id);
      setStatus(`✅ User ${user.email} approved.`);
    } catch (err) {
      setStatus(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">Approve User (Dev Tool)</h1>
      <input
        type="text"
        placeholder="Enter RegisterInterest ID"
        value={id}
        onChange={(e) => setId(e.target.value)}
        className="border px-2 py-1 mr-2"
      />
      <button
        onClick={handleApprove}
        className="bg-blue-600 text-white px-4 py-1 rounded"
      >
        Approve
      </button>
      <p className="mt-2 text-sm">{status}</p>
    </div>
  );
}