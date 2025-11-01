"use client";

import React from "react";
import Cards from "@/components/layout/Cards";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import WaitlistForm from "@/components/forms/WaitListForm";
import FaqSection from "@/components/layout/FrequentlyAskedQuestion";
import {
  ScrollText,
  Gavel,
  CalendarDays,
  LayoutDashboard,
  SlidersHorizontal,
  UserCheck,
} from "lucide-react";
import InfoBoxes from "@/components/layout/InfoBoxes";

const HomePage = () => {
  return (
    <main className="w-full min-h-screen bg-white py-20 px-4 ">
      {/* HERO SECTION */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          {/* Left Column */}
          <div className="w-full md:w-1/2">
            <h1 className="text-6xl md:text-7xl font-extrabold text-blue-700 mb-4 tracking-tight">
              NEAT
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-blue-800 mb-4">
              Non-Emergency Accessible Transport
            </h2>
            <p className="text-gray-700 text-lg md:text-xl font-medium leading-relaxed">
              An ethical booking and bidding platform connecting people with
              verified, accessible transport providers — giving you confidence,
              control, and care every step of the way.
            </p>
          </div>

          {/* Right Column */}
          <div className="w-full md:w-1/2">
            <WaitlistForm />
          </div>
        </div>
      </section>
      <section className="mt-10">
        <InfoBoxes />
      </section>

      {/* HOW IT WORKS SECTION */}
<section className="w-full bg-blue-100 py-20 px-4 mt-10">
  <div className="container mx-auto">
    <div className="text-center mb-12">
      <h2 className="font-bold text-4xl text-blue-800 mb-4">
        How It Works
      </h2>
      <p className="text-gray-900 text-lg max-w-3xl mx-auto">
        NEAT connects care companies with qualified accessible transport drivers through a simple, transparent platform.
      </p>
    </div>

    <Cards>
      <Card className="hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <CalendarDays size={20} />
            Book in Advance or Instantly
          </CardTitle>
        </CardHeader>
        <CardContent>
          Book journeys 48+ hours ahead with competitive driver bidding, or use Instant Bookings for urgent transport needs within 48 hours.
        </CardContent>
      </Card>

      <Card className="hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Gavel size={20} />
            Transparent Bidding
          </CardTitle>
        </CardHeader>
        <CardContent>
          For advanced bookings, qualified drivers submit competitive bids. You compare prices, ratings, and vehicle types to choose the best fit for your residents.
        </CardContent>
      </Card>

      <Card className="hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <LayoutDashboard size={20} />
            Role-Based Dashboards
          </CardTitle>
        </CardHeader>
        <CardContent>
          Admins oversee everything, coordinators manage areas, managers book for their houses, and drivers see available jobs — everyone gets the right view.
        </CardContent>
      </Card>

      <Card className="hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <ScrollText size={20} />
            Full Audit Trails
          </CardTitle>
        </CardHeader>
        <CardContent>
          Every booking, bid, and incident is logged with timestamps and user details. CQC-compliant records are always ready for inspection.
        </CardContent>
      </Card>

      <Card className="hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <UserCheck size={20} />
            Council-Verified Drivers
          </CardTitle>
        </CardHeader>
        <CardContent>
          All drivers are verified directly through their local council — checking DBS status, licenses, and insurance. No fake credentials, no document hassles.
        </CardContent>
      </Card>

      <Card className="hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <SlidersHorizontal size={20} />
            You Stay in Control
          </CardTitle>
        </CardHeader>
        <CardContent>
          Choose your drivers, set your budgets, and specify accessibility needs. NEAT gives you transparency and control without the middleman markup.
        </CardContent>
      </Card>
    </Cards>
    </div>
    </section>



{/* VISUAL SEPARATOR - Gradient transition */}
<div className="w-full h-16 bg-gradient-to-b from-blue-100 to-white"></div>

{/* MISSION SECTION - White background for better readability */}
<section className="bg-white py-20">
  <div className="max-w-3xl mx-auto px-4">
    {/* Optional: Add subtle card for emphasis */}
    <div className="bg-white border-2 border-blue-200 rounded-lg p-8 shadow-sm">
      <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-4 text-center">
        Our Mission: NEAT Transport
      </h2>
      <p className="text-gray-800 mb-6 text-center text-lg">
        <strong>NEAT</strong> stands for <strong>Non-Emergency Accessible Transport</strong> —
        but it means so much more than that.
      </p>

      <ul className="text-gray-800 text-left list-disc list-inside space-y-3 mb-6 text-lg">
        <li>
          <strong>N</strong>eeds-based support for every individual
        </li>
        <li>
          <strong>E</strong>mpathy for visible and invisible disabilities
        </li>
        <li>
          <strong>A</strong>ccessibility as a non-negotiable, not a luxury
        </li>
        <li>
          <strong>T</strong>ransport that adapts to people — not the other way around
        </li>
      </ul>

      <div className="mt-6 text-left text-gray-800 space-y-4 text-lg">
        <p>
          Whether you're booking a wheelchair-accessible minibus, need a
          quiet ride with no conversation, or prefer a familiar female
          driver — <strong>NEAT is designed for you.</strong>
        </p>
        <p className="text-blue-900 font-medium">This is transport that listens.</p>
        <p className="text-blue-900 text-xl font-bold">This is NEAT.</p>
      </div>
    </div>
  </div>
</section>

{/* VISUAL SEPARATOR before FAQ */}
<div className="w-full h-16 bg-gradient-to-b from-white to-gray-50"></div>

{/* FAQ SECTION */}
<FaqSection className="bg-gray-50" />
    </main>
  );
};

export default HomePage;
