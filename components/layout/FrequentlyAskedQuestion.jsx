"use client";

import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FaqSection = () => {
  return (
    <section
      className="w-full bg-white py-20 px-4"
      aria-labelledby="faq-heading"
      role="region"
    >
      <div className="max-w-3xl mx-auto text-center">
        <h2 id="faq-heading" className="text-4xl font-bold text-blue-700 mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-gray-600 mb-8">
          Quick answers to common questions. <Link href="/faq" className="text-blue-600 hover:underline">View all FAQs →</Link>
        </p>

        <Accordion
          type="single"
          collapsible
          className="text-left space-y-2"
          aria-label="Frequently Asked Questions"
        >
          {faqItems.map(({ id, question, answer }) => (
            <AccordionItem key={id} value={id}>
              <AccordionTrigger className="text-blue-700 text-lg hover:no-underline">
                {question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                {answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-8">
          <Link
            href="/faq"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            View All FAQs
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;

// Condensed FAQ items for homepage (most important questions only)
const faqItems = [
  {
    id: "item-1",
    question: "What is NEAT Transport?",
    answer:
      "NEAT is a marketplace platform connecting care companies with independent, qualified drivers who specialize in accessible transport. We're NOT a taxi company – we provide the technology to make accessible transport booking transparent, fair, and compliant with CQC requirements.",
  },
  {
    id: "item-2",
    question: "How does the bidding system work?",
    answer:
      "For bookings made 48+ hours in advance, you post the journey details and qualified drivers submit competitive bids. You review the bids (comparing price, ratings, and vehicle type) and choose the best option for your residents. For urgent bookings (within 48 hours), available drivers can accept immediately.",
  },
  {
    id: "item-3",
    question: "Who can use NEAT?",
    answer:
      "NEAT is designed for care companies, residential homes, and organizations booking transport for residents or service users. Independent private hire drivers with wheelchair accessible vehicles (or other adaptations) can register to offer their services.",
  },
  {
    id: "item-4",
    question: "What accessibility options are available?",
    answer:
      "You can specify wheelchair requirements, quiet environment, no conversation, visual schedules, assistance animals, familiar driver preferences, female driver only, sign language support, medication on board, and many more options tailored to individual needs.",
  },
  {
    id: "item-5",
    question: "Is NEAT compliant with CQC requirements?",
    answer:
      "Yes! We maintain full audit trails showing who booked what and when, incident reporting systems for safeguarding, secure record keeping for inspections, and driver verification through local councils (enhanced DBS, licenses, insurance).",
  },
  {
    id: "item-6",
    question: "How much does it cost?",
    answer:
      "For care companies: NEAT is currently free to use. Drivers set their own rates through competitive bidding on Advanced Bookings. Payment processing will be implemented later with clear pricing announced in advance.",
  },
  {
    id: "item-7",
    question: "How are drivers verified?",
    answer:
      "We verify all drivers by contacting their local council directly to confirm: enhanced DBS checks, private hire vehicle licenses, vehicle registration, and insurance coverage. Drivers don't upload documents – we verify credentials at source for maximum security.",
  },
  {
    id: "item-8",
    question: "Can I book urgent transport?",
    answer:
      "Yes! Instant Bookings are for urgent needs within 48 hours. Available drivers see the booking immediately and can accept on a first-come basis. For planned journeys, Advanced Bookings (48+ hours ahead) offer better pricing through competitive bidding.",
  },
];