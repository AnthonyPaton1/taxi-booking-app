import Link from "next/link";
import { Users, Calendar, Search, CheckCircle, Car, Shield, Clock, Star } from "lucide-react";

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-blue-900 mb-4">How NEAT Transport Works</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A simple, transparent platform connecting care companies with qualified accessible transport drivers.
          </p>
        </div>

        {/* What is NEAT? */}
        <section className="mb-16">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-blue-900 mb-6">What is NEAT Transport?</h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              NEAT Transport is a <strong>marketplace platform</strong> that connects care companies with independent, qualified drivers who specialize in accessible transport. We're not a taxi company – we're a bridge between those who need accessible transport and the drivers who provide it.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              Our mission is simple: make accessible transport <strong>easier to book</strong>, <strong>more transparent</strong>, and <strong>fairer for everyone</strong> – especially vulnerable passengers and the drivers who care for them.
            </p>
          </div>
        </section>

        {/* For Care Companies */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-blue-900 mb-3">For Care Companies</h2>
            <p className="text-gray-600">Book accessible transport for your residents in 4 simple steps</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-900">Sign Up</h3>
              </div>
              <p className="text-gray-600">
                Create your business account. Set up areas, coordinators, and house managers to match your organizational structure.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-semibold text-gray-900">Book a Journey</h3>
              </div>
              <p className="text-gray-600">
                Enter pickup/dropoff details, accessibility needs, and passenger requirements. Choose between instant or advanced bookings.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-semibold text-gray-900">Review Bids</h3>
              </div>
              <p className="text-gray-600">
                For advanced bookings, qualified drivers bid on your job. Compare prices, ratings, and driver profiles to choose the best fit.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-orange-600">4</span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-6 h-6 text-orange-600" />
                <h3 className="text-xl font-semibold text-gray-900">Accept & Track</h3>
              </div>
              <p className="text-gray-600">
                Accept your preferred driver. Get confirmation, track the journey, and maintain full audit trails for CQC compliance.
              </p>
            </div>
          </div>
        </section>

        {/* Booking Types */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-blue-900 mb-3">Two Types of Bookings</h2>
            <p className="text-gray-600">Choose the right option for your needs</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Advanced Bookings */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg shadow-md p-8 border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-8 h-8 text-blue-600" />
                <h3 className="text-2xl font-bold text-blue-900">Advanced Bookings</h3>
              </div>
              <p className="text-gray-700 mb-4">
                <strong>48+ hours in advance</strong>
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Drivers compete by submitting bids</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Compare prices and driver profiles</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Choose the driver that best fits your needs</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Lower prices due to advance planning</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Guaranteed driver availability</span>
                </li>
              </ul>
            </div>

            {/* Instant Bookings */}
            <div className="bg-gradient-to-br from-orange-50 to-white rounded-lg shadow-md p-8 border-2 border-orange-200">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-8 h-8 text-orange-600" />
                <h3 className="text-2xl font-bold text-orange-900">Instant Bookings</h3>
              </div>
              <p className="text-gray-700 mb-4">
                <strong>Within 48 hours</strong>
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">For urgent transport needs</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Available drivers can accept immediately</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">First-come, first-served basis</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Transparent pricing shown upfront</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Quick confirmation</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* For Drivers */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-blue-900 mb-3">For Drivers</h2>
            <p className="text-gray-600">Grow your business with fair, transparent opportunities</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Register */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">Register & Verify</h3>
              <p className="text-gray-600 text-center">
                Complete your profile with credentials (DBS, insurance, licenses). We verify everything to maintain trust and safety.
              </p>
            </div>

            {/* Browse */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Search className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">Browse & Bid</h3>
              <p className="text-gray-600 text-center">
                See available jobs that match your vehicle and capabilities. Bid competitively on advanced bookings or accept instant jobs.
              </p>
            </div>

            {/* Earn */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Car className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">Drive & Earn</h3>
              <p className="text-gray-600 text-center">
                Complete the journey, provide excellent service, and build your reputation. You set your rates – we don't take a cut (for now).
              </p>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-blue-900 mb-3">Why NEAT Transport?</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <Shield className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Verified Drivers</h3>
              <p className="text-gray-600">
                All drivers are DBS checked, fully insured, and licensed by their local authority. We don't compromise on safety.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <Star className="w-10 h-10 text-yellow-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Transparent Pricing</h3>
              <p className="text-gray-600">
                No hidden fees. See all bids and prices upfront. Drivers compete fairly, eliminating exploitative pricing.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <CheckCircle className="w-10 h-10 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">CQC Compliant</h3>
              <p className="text-gray-600">
                Full audit trails, incident reporting, and booking records maintained for care sector compliance requirements.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <Users className="w-10 h-10 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Accessibility First</h3>
              <p className="text-gray-600">
                Designed for wheelchair users, passengers with sensory needs, and those requiring specialized support.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <Clock className="w-10 h-10 text-orange-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-gray-600">
                Emergency support line available around the clock for active bookings. We're here when you need us.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <Car className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fair to Drivers</h3>
              <p className="text-gray-600">
                Drivers are independent contractors who set their own rates. We're not Uber – we don't exploit drivers.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join care companies and drivers across the UK who are making accessible transport better for everyone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition shadow-lg"
            >
              Sign Up as Care Company
            </Link>
            <Link
              href="/auth/signup"
              className="bg-blue-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-400 transition border-2 border-white"
            >
              Register as Driver
            </Link>
          </div>
        </section>

        {/* FAQ Teaser */}
        <section className="mt-16 text-center">
          <p className="text-gray-600 mb-4">Have more questions?</p>
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 text-blue-600 hover:underline font-medium text-lg"
          >
            View Frequently Asked Questions →
          </Link>
        </section>

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