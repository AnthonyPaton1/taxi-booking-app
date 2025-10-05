"use client";

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
        <h2 id="faq-heading" className="text-4xl font-bold text-blue-700 mb-8">
          Frequently Asked Questions
        </h2>

        <Accordion
          type="single"
          collapsible
          className="text-left space-y-2"
          aria-label="Frequently Asked Questions"
        >
          {faqItems.map(({ id, question, answer }) => (
            <AccordionItem key={id} value={id}>
              <AccordionTrigger className="text-blue-700 text-lg">
                {question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-900">
                {answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FaqSection;

const faqItems = [
  {
    id: "item-1",
    question: "Why use NEAT?",
    answer:
      "NEAT is designed for you to book your accessible transport in advance. By booking in advance you get more control over pricing structures, and your journeys are submitted to a bank of drivers who bid for them.",
  },
  {
    id: "item-2",
    question: "Is this a private app?",
    answer:
      "No. NEAT is open to everyone who needs accessible vehicles with modifications.",
  },
  {
    id: "item-3",
    question: "How does the bidding system work?",
    answer:
      "You post required trips. These appear in nominated drivers’ dashboards, where they can place bids. You accept bids based on price, availability, and rating.",
  },
  {
    id: "item-4",
    question: "Is NEAT available in my area?",
    answer: "We are rolling out region by region.",
  },
  {
    id: "item-5",
    question: "How do I choose drivers?",
    answer:
      "From your dashboard, you can see who has placed bids on your journey. You then choose the best option for you. Drivers are notified of successful and unsuccessful bids.",
  },
  {
    id: "item-6",
    question: "Can I add urgent journeys ad hoc?",
    answer:
      "Yes. Urgent journeys can be posted any time. They will appear in the drivers' dashboards marked as 'Urgent' for immediate bidding.",
  },
  {
    id: "item-7",
    question: "Is there an after-journey reporting system?",
    answer:
      "Yes. Drivers, carers, and support workers can fill out a feedback form after each journey to report any issues or concerns.",
  },
  {
    id: "item-8",
    question: "What does it cost?",
    answer:
      "NEAT is completely free to use. Drivers pay a flat rate of £100 per month, and 25% of that is given back to care companies to benefit service users through activities like parties or hobby groups.",
  },
  {
    id: "driver-1",
    question: "How much does it cost to join NEAT as a driver?",
    answer:
      "It’s a flat fee of £100 per month — giving you access to multiple care providers in your area as well as public needs. No commission, no hidden costs.",
  },
  {
    id: "driver-2",
    question: "How do I sign up?",
    answer:
      "As long as you are a verified WAV driver, and licenced in your local council, you can sign up to the platform.",
  },
  {
    id: "driver-3",
    question: "What’s in it for me?",
    answer:
      "Less paperwork, more work. NEAT lets you bid on jobs in advance, manage your schedule, and build a reputation that attracts more bookings — all in one dashboard.",
  },
];
