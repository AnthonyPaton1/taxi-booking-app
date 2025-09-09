"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";

const statStyles =
  "flex flex-col items-center justify-center p-4 rounded-lg shadow bg-white";

const AdminStats = () => {
  const [stats, setStats] = useState({
    coordinators: 0,
    managers: 0,
    houses: 0,
    drivers: 0,
  });

  useEffect(() => {
    // This is mock data for now. Replace with real fetch later.
    setStats({
      coordinators: 5,
      managers: 13,
      houses: 48,
      drivers: 15,
    });
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className={statStyles}>
        <CardContent className="text-center">
          <h3 className="text-xl font-semibold text-blue-700">Coordinators</h3>
          <p className="text-3xl font-bold">{stats.coordinators}</p>
        </CardContent>
      </Card>

      <Card className={statStyles}>
        <CardContent className="text-center">
          <h3 className="text-xl font-semibold text-blue-700">Managers</h3>
          <p className="text-3xl font-bold">{stats.managers}</p>
        </CardContent>
      </Card>

      <Card className={statStyles}>
        <CardContent className="text-center">
          <h3 className="text-xl font-semibold text-blue-700">Houses</h3>
          <p className="text-3xl font-bold">{stats.houses}</p>
        </CardContent>
      </Card>

      <Card className={statStyles}>
        <CardContent className="text-center">
          <h3 className="text-xl font-semibold text-blue-700">Drivers</h3>
          <p className="text-3xl font-bold">{stats.drivers}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStats;
