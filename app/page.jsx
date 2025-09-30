"use client";

import React from "react";
import Cards from "@/components/layout/Cards";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import WaitlistForm from "@/components/forms/WaitListForm";
import FaqSection from "@/components/sections/FrequentlyAskedQuestion";
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
        <div className="text-center">
          <h2 className="font-bold text-4xl text-blue-800 mb-2 ">
            How It Works
          </h2>
          <p className="text-gray-900 text-center mb-8 mx-auto">
            NEAT helps you manage, assign, and track non-emergency accessible
            journeys — all in one seamless dashboard.
          </p>
        </div>

        <Cards>
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <CalendarDays size={20} />
                Pre-book All Your Journeys
              </CardTitle>
            </CardHeader>
            <CardContent>
              Your nominated drivers will see all available journeys days and
              weeks ahead.
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Gavel size={20} />
                Bidding System
              </CardTitle>
            </CardHeader>
            <CardContent>
              Drivers place bids on your bookings — you choose the best option
              for your service users.
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <LayoutDashboard size={20} />
                Dashboards
              </CardTitle>
            </CardHeader>
            <CardContent>
              Selected and approved bids appear in your dashboard, each driver
              gets a similar view in their dashboard too.
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <ScrollText size={20} />
                Audit
              </CardTitle>
            </CardHeader>
            <CardContent>
              A secure, reliable audit trail keeps everything transparent and
              traceable.
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <UserCheck size={20} />
                Local & Trusted
              </CardTitle>
            </CardHeader>
            <CardContent>
              NEAT lets you invite and manage verified accessible drivers within
              your network.
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <SlidersHorizontal size={20} />
                Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              NEAT gives you back full control of prices, fares, and transport
              decisions.
            </CardContent>
          </Card>
        </Cards>
      </section>

      <section className="bg-blue-100 py-20">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-semibold text-blue-800 mb-4 text-center">
            <b>Our Mission: NEAT Transport</b>
          </h2>
          <p className="text-gray-700 mb-6 text-center">
            <b>NEAT</b> stands for <b>Non-Emergency Accessible Transport</b> —
            but it means so much more than that.
          </p>

          <ul className="text-gray-700 text-left list-disc list-inside space-y-2">
            <li>
              <b>N</b>eeds-based support for every individual
            </li>
            <li>
              <b>E</b>mpathy for visible and invisible disabilities
            </li>
            <li>
              <b>A</b>ccessibility as a non-negotiable, not a luxury
            </li>
            <li>
              <b>T</b>ransport that adapts to people — not the other way around
            </li>
          </ul>

          {/* Align the last lines to left for smoother reading */}
          <div className="mt-6 text-left text-gray-700 space-y-3">
            <p>
              Whether you’re booking a wheelchair-accessible minibus, need a
              quiet ride with no conversation, or prefer a familiar female
              driver — <b>NEAT is designed for you.</b>
            </p>
            <p>This is transport that listens.</p>
            <p>
              <b>This is NEAT.</b>
            </p>
          </div>
        </div>
      </section>
      <FaqSection className="mt-20" />
    </main>
  );
};

export default HomePage;
