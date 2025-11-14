"use client";

import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600">
            Everything you need to know about NEAT Transport
          </p>
        </div>

        {/* Quick Links */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <p className="text-sm text-gray-700 mb-3">Jump to section:</p>
          <div className="flex flex-wrap gap-3">
            <a href="#general" className="text-blue-600 hover:underline text-sm font-medium">
              General
            </a>
            <a href="#care-companies" className="text-blue-600 hover:underline text-sm font-medium">
              For Care Companies
            </a>
            <a href="#drivers" className="text-blue-600 hover:underline text-sm font-medium">
              For Drivers
            </a>
            <a href="#bookings" className="text-blue-600 hover:underline text-sm font-medium">
              Bookings & Bidding
            </a>
            <a href="#safety" className="text-blue-600 hover:underline text-sm font-medium">
              Safety & Compliance
            </a>
          </div>
        </div>

        {/* General Questions */}
        <section id="general" className="mb-12">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">General Questions</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {generalFAQs.map(({ id, question, answer }) => (
              <AccordionItem key={id} value={id} className="bg-white rounded-lg border border-gray-200">
                <AccordionTrigger className="text-blue-700 text-lg px-6 hover:no-underline">
                  {question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 px-6 pb-4">
                  {answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Care Companies */}
        <section id="care-companies" className="mb-12">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">For Care Companies</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {careCompaniesFAQs.map(({ id, question, answer }) => (
              <AccordionItem key={id} value={id} className="bg-white rounded-lg border border-gray-200">
                <AccordionTrigger className="text-blue-700 text-lg px-6 hover:no-underline">
                  {question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 px-6 pb-4">
                  {answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Drivers */}
        <section id="drivers" className="mb-12">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">For Drivers</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {driverFAQs.map(({ id, question, answer }) => (
              <AccordionItem key={id} value={id} className="bg-white rounded-lg border border-gray-200">
                <AccordionTrigger className="text-blue-700 text-lg px-6 hover:no-underline">
                  {question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 px-6 pb-4">
                  {answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Bookings */}
        <section id="bookings" className="mb-12">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">Bookings & Bidding</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {bookingFAQs.map(({ id, question, answer }) => (
              <AccordionItem key={id} value={id} className="bg-white rounded-lg border border-gray-200">
                <AccordionTrigger className="text-blue-700 text-lg px-6 hover:no-underline">
                  {question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 px-6 pb-4">
                  {answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Safety */}
        <section id="safety" className="mb-12">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">Safety & Compliance</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {safetyFAQs.map(({ id, question, answer }) => (
              <AccordionItem key={id} value={id} className="bg-white rounded-lg border border-gray-200">
                <AccordionTrigger className="text-blue-700 text-lg px-6 hover:no-underline">
                  {question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 px-6 pb-4">
                  {answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 text-center text-white mt-16">
          <h3 className="text-2xl font-bold mb-4">Still Have Questions?</h3>
          <p className="mb-6 text-blue-100">
            Can't find what you're looking for? Get in touch with our team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              Contact Support
            </Link>
            <Link
              href="/how-it-works"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-400 transition border-2 border-white"
            >
              How It Works
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================
// FAQ DATA
// ============================================

const generalFAQs = [
  {
    id: "gen-1",
    question: "What is NEAT Transport?",
    answer: "NEAT stands for Non-Emergency Accessible Transport. We're a marketplace platform connecting care companies with independent, qualified drivers who specialize in accessible transport. We're NOT a taxi company – we're the bridge between those who need transport and the drivers who provide it.",
  },
  {
    id: "gen-2",
    question: "Who can use NEAT Transport?",
    answer: "NEAT is designed for for everyone from care companies, residential homes, and organizations to the general public that need to book accessible transport for their residents, service users, family members or yourself. Drivers who are licensed private hire vehicle operators can also register to offer their services through our platform.",
  },
  {
    id: "gen-3",
    question: "Is NEAT available in my area?",
    answer: "We're rolling out region by region across the UK. Our platform connects you with drivers licensed in your local council area. Check your dashboard to see available drivers in your region, or contact us to request coverage in your area.",
  },
  {
    id: "gen-4",
    question: "What makes NEAT different from other transport services?",
    answer: "NEAT is built specifically for the care sector with accessibility at its core. We offer transparent pricing through competitive bidding, full CQC compliance with audit trails, comprehensive accessibility options (wheelchair access, quiet environment, familiar drivers, etc.), and we treat drivers fairly – they're independent contractors who set their own rates.",
  },
  {
    id: "gen-5",
    question: "How much does NEAT cost?",
    answer: "For care companies: NEAT is currently and always will be free to use. Drivers: Payment processing is not yet implemented. When it launches, pricing will be announced in advance. There are NO hidden fees or commission charges on bookings.",
  },
];

const careCompaniesFAQs = [
  {
    id: "care-1",
    question: "How do I sign up my care company?",
    answer: "Create an account on our platform and provide your business details and contact information. You can then set up your organizational structure with coordinators (for different areas) and managers (for individual houses).",
  },
  {
    id: "care-2",
    question: "Can I manage multiple care homes?",
    answer: "Yes! NEAT is designed for multi-site operations. You can set up areas with coordinators who oversee managers at different houses. Each manager can create bookings for their specific residents.",
  },
  {
    id: "care-3",
    question: "How do I book transport for residents?",
    answer: "Log in to your dashboard, enter the pickup/dropoff details, date/time, passenger count, and any accessibility requirements. Choose between Advanced Bookings (48+ hours ahead with bidding) or Instant Bookings (urgent, within 48 hours).",
  },
  {
    id: "care-4",
    question: "What accessibility options can I specify?",
    answer: "You can specify wheelchair requirements, assistance needs, quiet environment, no conversation, visual schedules, assistance animals, familiar driver preferences, female driver only, sign language support, medication on board, and more. We store these as passenger profiles for recurring bookings.",
  },
  {
    id: "care-5",
    question: "Do you maintain records for CQC compliance?",
    answer: "Yes! Every booking creates a full audit trail showing who made the booking, when, which driver was assigned, and any incident reports. All records are stored securely and can be exported for inspections.",
  },
  {
    id: "care-6",
    question: "What if I need to cancel a booking?",
    answer: "Cancellations made 24+ hours in advance are free. 12-24 hours notice incurs a 50% fee (currently under consultation). Less than 12 hours is 100%. Emergency cancellations (illness, hospital admission) are handled case-by-case. Cancel through your dashboard or call our emergency line.",
  },
];

const driverFAQs = [
  {
    id: "driver-1",
    question: "Who can become a NEAT driver?",
    answer: "You must be: A licensed private hire vehicle (PHV) operator with your local council, DBS checked (enhanced), Have valid public liability and comprehensive vehicle insurance, Have an accessible vehicle (wheelchair accessible or other adaptations), and Be able to provide safe, professional transport for vulnerable passengers.",
  },
  {
    id: "driver-2",
    question: "How do I sign up as a driver?",
    answer: "Register on our platform with your details, vehicle information, and accessibility features. We verify your credentials by contacting your local council directly – you don't need to upload documents. Once verified, you can start bidding on jobs immediately.",
  },
  {
    id: "driver-3",
    question: "How do I get paid?",
    answer: "Payment is currently arranged directly between you and the care company or passenger. We do not and will never take a % of the ride as a fee.",
  },
  {
    id: "driver-4",
    question: "Can I set my own rates?",
    answer: "Yes! You're an independent contractor, not an employee. For Advanced Bookings and Instant Bookings, you submit bids with your own pricing.",
  },
  {
    id: "driver-5",
    question: "What if I need to cancel a job?",
    answer: "You can withdraw bids before they're accepted with no penalty. After acceptance, cancellations 24+ hours ahead have no penalty but will affect your rating. Less than 24 hours results in a warning. No-shows are treated seriously and may result in account suspension.",
  },
  {
    id: "driver-6",
    question: "How does NEAT verify my credentials?",
    answer: "We contact your local council to verify your private hire license, DBS status, and vehicle registration. This protects both drivers (from sharing sensitive docs) and care companies (from fraudulent credentials).",
  },
];

const bookingFAQs = [
  {
    id: "book-1",
    question: "What's the difference between Advanced and Instant Bookings?",
    answer: "Advanced Bookings: Made 48+ hours in advance, drivers bid competitively, you choose the best option, typically lower prices. Instant Bookings: Needed within 48 hours, for urgent needs, first available driver accepts, may be higher priced due to urgency.",
  },
  {
    id: "book-2",
    question: "How does the bidding system work?",
    answer: "For Advanced Bookings: Post your journey with all details, qualified drivers see it and submit bids, you receive notifications when bids come in, review bids (price, driver rating, vehicle type), accept your preferred driver. The winning driver is notified immediately.",
  },
  {
    id: "book-3",
    question: "Can I request specific drivers?",
    answer: "Yes! You can add 'familiar driver only' to your accessibility requirements. This helps build relationships between drivers and passengers with autism or anxiety. You can also see past drivers in your booking history and look for their bids on new jobs.",
  },
  {
    id: "book-4",
    question: "What if no drivers bid on my Advanced Booking?",
    answer: "This is rare but can happen during peak times. Options: Convert to an Instant Booking for immediate dispatch, adjust the pickup time if flexible, or contact our support team who can reach out to drivers directly.",
  },
  {
    id: "book-5",
    question: "Can I book return journeys?",
    answer: "Yes! When creating a booking, check the 'Return Journey' option and specify the return time. This appears as a single booking with two legs, making it easier for drivers to bid on both at once.",
  },
  {
    id: "book-6",
    question: "How do I track my bookings?",
    answer: "Your dashboard shows all bookings with status indicators: Pending (awaiting bids), Accepted (driver assigned), In Progress (pickup time approaching), Completed, or Cancelled. You'll receive email notifications at key stages.",
  },
];

const safetyFAQs = [
  {
    id: "safe-1",
    question: "How are drivers vetted?",
    answer: "All drivers must: Pass enhanced DBS checks, Hold valid private hire vehicle licenses, Carry public liability insurance (£5m minimum), Have comprehensive vehicle insurance, Be verified by their local council, and Maintain current credentials (we check regularly).",
  },
  {
    id: "safe-2",
    question: "What if there's an incident during transport?",
    answer: "Drivers and managers can submit incident reports immediately through the platform. Reports go to coordinators and admins for review. All incidents are logged for safeguarding and CQC purposes. For emergencies, call 999 first, then report through NEAT.",
  },
  {
    id: "safe-3",
    question: "Is my data secure?",
    answer: "Yes. We comply with UK GDPR. We collect minimal passenger data (initials only, not full names), all data is encrypted in transit and at rest, hosted on secure Cloudflare infrastructure, and we maintain strict access controls. Full details in our Privacy Policy.",
  },
  {
    id: "safe-4",
    question: "What insurance covers the journey?",
    answer: "Drivers carry their own comprehensive insurance covering private hire operations and public liability (minimum £5m). NEAT is a platform only – the insurance contract is between the driver and their insurer. Always verify the driver has valid insurance before travel.",
  },
  {
    id: "safe-5",
    question: "Can I file a complaint about a driver?",
    answer: "Yes. Use the incident reporting system or contact form. Include: Booking ID, driver name, date/time, detailed description of issue. We investigate all complaints within 10 business days. Serious issues (safety concerns, discrimination) are escalated immediately.",
  },
  {
    id: "safe-6",
    question: "What safeguarding measures are in place?",
    answer: "Enhanced DBS checks for all drivers, incident reporting system with admin oversight, audit trails for all bookings and actions, CQC-compliant record keeping, direct council verification of credentials, and 24/7 emergency support line for active bookings.",
  },
];