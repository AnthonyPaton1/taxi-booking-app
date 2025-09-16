// app/set-password/page.jsx
"use client";

import { useState } from "react";

export default function SetPasswordPage({ searchParams }) {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const token = searchParams.token;

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await fetch("/api/auth/set-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setMessage(data.message);
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Set Your Password</h1>
      <input
        type="password"
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Save Password</button>
      <p>{message}</p>
    </form>
  );
}