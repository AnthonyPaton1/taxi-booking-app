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

      {/* HOW IT WORKS SECTION */}
      <section className="w-full bg-blue-50 py-20 px-4 mt-10">
        <div className="text-center">
          <h2 className="font-bold text-4xl text-blue-700 mb-2 ">
            How It Works
          </h2>
          <p className="text-gray-600 text-center mb-8 mx-auto">
            NEAT helps you manage, assign, and track non-emergency accessible
            journeys — all in one seamless dashboard.
          </p>
        </div>

        <Cards>
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
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
              <CardTitle className="flex items-center gap-2 text-blue-700">
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
              <CardTitle className="flex items-center gap-2 text-blue-700">
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
              <CardTitle className="flex items-center gap-2 text-blue-700">
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
              <CardTitle className="flex items-center gap-2 text-blue-700">
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
              <CardTitle className="flex items-center gap-2 text-blue-700">
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
      <section>
        <FaqSection />
      </section>
      <section className="w-full bg-blue-50 py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-blue-700 mb-6">
            More from NEAT
          </h2>
          <p className="text-gray-800 mb-12 max-w-2xl mx-auto">
            We’re building a suite of tools to support accessible living and
            ethical business — explore what else is available:
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Venues App */}
            <div className="bg-white rounded-lg shadow-md p-6 text-left hover:shadow-lg transition">
              <h3 className="text-2xl font-semibold text-blue-700 mb-2">
                Discover Accessible Venues
              </h3>
              <p className="text-gray-700 mb-4">
                Discover, list, and review accessible venues across the UK.
                Perfect for families, carers, and organisations looking for
                inclusive spaces.
              </p>
              <a
                href="https://www.discoveraccessiblevenues.co.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-medium hover:underline"
              >
                Explore Venues →
              </a>
            </div>

            {/* E-commerce App */}
            <div className="bg-white rounded-lg shadow-md p-6 text-left hover:shadow-lg transition">
              <h3 className="text-2xl font-semibold text-blue-700 mb-2">
                Ethical E-commerce App
              </h3>
              <p className="text-gray-700 mb-4">
                Coming soon — a curated store featuring inclusive products,
                mobility aids, sensory tools, and more, hand-picked by carers
                for carers.
              </p>
              <a
                href="/ecomm"
                className="text-blue-600 font-medium hover:underline"
              >
                Visit Store →
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
