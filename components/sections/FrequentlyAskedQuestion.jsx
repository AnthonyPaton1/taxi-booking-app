// components/sections/FaqSection.jsx
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FaqSection = () => {
  return (
    <section className="w-full bg-white py-20 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-blue-700 mb-8">
          Frequently Asked Questions
        </h2>

        <Accordion type="single" collapsible className="text-left space-y-2">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-blue-700 text-lg">
              Who can use NEAT?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              NEAT is built for local authorities, care providers, schools, and
              organizations requiring accessible transport for non-emergency
              journeys.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger className="text-blue-700 text-lg">
              Is this a private app?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              Yes. NEAT is private. Care co-ordinators, house managers, and
              support workers will have access by invitation only. Once signed
              up, the care co-ordinator can add properties, managers, and staff
              to your profile.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger className="text-blue-700 text-lg">
              How does the bidding system work?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              House Managers post required trips. These appear in nominated
              drivers’ dashboards, where they can place bids. You accept the
              bids based on price, availability, and rating.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger className="text-blue-700 text-lg">
              Is NEAT available in my area?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              We are rolling out region by region. Join the waitlist to be
              notified when NEAT launches in your area.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger className="text-blue-700 text-lg">
              How do I invite drivers?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              From your dashboard, you can invite trusted drivers via email.
              They’ll need to complete our verification process before being
              approved.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger className="text-blue-700 text-lg">
              Can I add urgent journeys ad hoc?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              Yes. Urgent journeys can be posted any time. They will appear in
              the drivers' dashboards marked as "Urgent" for immediate bidding.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7">
            <AccordionTrigger className="text-blue-700 text-lg">
              Will support workers have access?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              Yes, but access is limited. They can view all bookings for the day
              — including times, drivers, and prices — but cannot post or edit
              journeys.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-8">
            <AccordionTrigger className="text-blue-700 text-lg">
              Is there an after-journey reporting system?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              Yes. Drivers, carers, and support workers can fill out a feedback
              form after each journey to report any issues or concerns.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-9">
            <AccordionTrigger className="text-blue-700 text-lg">
              What does it cost?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              NEAT is completely free for care companies and service users.
              Drivers pay a flat rate of £100 per month, and 25% of that is
              given back to the care providers to benefit their service users —
              such as funding Christmas parties, craft groups, and other
              activities.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="driver-1">
            <AccordionTrigger className="text-blue-700 text-lg">
              How much does it cost to join NEAT as a driver?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              It’s a flat fee of £100 per month — giving you access to multiple
              care providers in your area. No commission, no hidden costs.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="driver-2">
            <AccordionTrigger className="text-blue-700 text-lg">
              Do I need to join separately for each care company?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              No — once you're verified, your profile is visible to all
              companies using NEAT in your area. You can receive bookings from
              multiple providers with a single login.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="driver-3">
            <AccordionTrigger className="text-blue-700 text-lg">
              What’s in it for me?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              Less paperwork, more work. NEAT lets you bid on jobs in advance,
              manage your schedule, and build a reputation that attracts more
              bookings — all in one dashboard.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
};

export default FaqSection;
