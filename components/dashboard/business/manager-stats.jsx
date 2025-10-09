"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";

const statStyles =
  "flex flex-col items-center justify-center p-4 rounded-lg shadow bg-white";

const ManagerStats = () => {
  const [stats, setStats] = useState({
    ActiveBids: 10,
    bids: 50,
    houses: 4,
    drivers: 15,
  });

  useEffect(() => {
    // This is mock data for now. Replace with real fetch later.
    setStats({
     ActiveBids,
      Bids,
      houses: 48,
      drivers: 15,
    });
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
     

      <Card className={statStyles}>
        <CardContent className="text-center">
          <h3 className="text-xl font-semibold text-blue-700">Bids</h3>
          <p className="text-3xl font-bold">{stats.bids}</p>
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

export default ManagerStats;