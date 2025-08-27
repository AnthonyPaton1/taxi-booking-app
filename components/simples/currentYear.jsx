"use client";
import { useEffect, useState } from "react";

export default function CurrentYear() {
  const [year, setYear] = useState("");

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return <>{year}</>;
}
