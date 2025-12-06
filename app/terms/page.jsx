import Link from "next/link";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="border-b border-gray-200 pb-6 mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">Terms & Conditions</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        {/* Introduction */}
        <section className="mb-8">
          <p className="text-gray-700 leading-relaxed">
            Welcome to NEAT Transport. These Terms and Conditions ("Terms") govern your use of our accessible transport booking platform. By accessing or using our services, you agree to be bound by these Terms.
          </p>
          <p className="text-gray-700 leading-relaxed mt-4">
            Please read these Terms carefully before using the platform. If you do not agree with any part of these Terms, you must not use our services.
          </p>
        </section>

        {/* Table of Contents */}
        <nav className="bg-blue-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">Contents</h2>
          <ol className="space-y-2 text-blue-700">
            <li><a href="#definitions" className="hover:underline">1. Definitions</a></li>
            <li><a href="#platform-overview" className="hover:underline">2. Platform Overview</a></li>
            <li><a href="#user-accounts" className="hover:underline">3. User Accounts and Registration</a></li>
            <li><a href="#user-roles" className="hover:underline">4. User Roles and Responsibilities</a></li>
            <li><a href="#booking-terms" className="hover:underline">5. Booking Terms</a></li>
            <li><a href="#driver-terms" className="hover:underline">6. Driver Terms</a></li>
            <li><a href="#payment-terms" className="hover:underline">7. Payment Terms</a></li>
            <li><a href="#cancellations" className="hover:underline">8. Cancellations and Refunds</a></li>
            <li><a href="#conduct" className="hover:underline">9. User Conduct and Prohibited Activities</a></li>
            <li><a href="#liability" className="hover:underline">10. Liability and Insurance</a></li>
            <li><a href="#complaints" className="hover:underline">11. Complaints and Disputes</a></li>
            <li><a href="#intellectual-property" className="hover:underline">12. Intellectual Property</a></li>
            <li><a href="#data-protection" className="hover:underline">13. Data Protection</a></li>
            <li><a href="#termination" className="hover:underline">14. Termination and Suspension</a></li>
            <li><a href="#changes" className="hover:underline">15. Changes to Terms</a></li>
            <li><a href="#governing-law" className="hover:underline">16. Governing Law</a></li>
            <li><a href="#contact" className="hover:underline">17. Contact Information</a></li>
          </ol>
        </nav>

        {/* 1. Definitions */}
        <section id="definitions" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Definitions</h2>
          <ul className="space-y-2 text-gray-700">
            <li><strong>"Platform"</strong> refers to the NEAT Transport website and services</li>
            <li><strong>"User"</strong> means any person using the Platform</li>
            <li><strong>"Business"</strong> refers to care companies and organizations using the Platform</li>
            <li><strong>"Admin"</strong> is the head office user with full business oversight</li>
            <li><strong>"Coordinator"</strong> manages specific geographical areas within a Business</li>
            <li><strong>"Manager"</strong> manages individual care homes/houses and creates bookings</li>
            <li><strong>"Driver"</strong> is an independent private hire vehicle operator providing transport services</li>
            <li><strong>"Passenger"</strong> is the individual being transported</li>
            <li><strong>"Booking"</strong> refers to a transport request made through the Platform</li>
          </ul>
        </section>

        {/* 2. Platform Overview */}
        <section id="platform-overview" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Platform Overview</h2>
          <p className="text-gray-700 mb-4">
            NEAT Transport is a marketplace platform that connects care companies with independent private hire vehicle (PHV) drivers specializing in accessible transport. We are NOT a taxi firm and do NOT employ drivers.
          </p>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Our Role</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>We provide the technology platform to facilitate bookings</li>
            <li>We verify driver credentials and vehicle compliance</li>
            <li>We maintain booking records for audit purposes (CQC compliance)</li>
            <li>We facilitate communication between Businesses and Drivers</li>
            <li>We do NOT provide the transport service itself</li>
            <li>We do NOT control driver schedules, pricing, or vehicle operations</li>
          </ul>
        </section>

        {/* 3. User Accounts and Registration */}
        <section id="user-accounts" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts and Registration</h2>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Account Creation</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>You must be 18 years or older to create an account</li>
            <li>Public users, you Sign up using your oAuth Google Account</li>
            <li>Businesses and Drivers sign up by registering themselves and creating their account</li>
            <li>You must provide accurate and complete information</li>
            <li>You are responsible for maintaining account security</li>
            <li>You must not share your login credentials</li>
            <li>You must notify us immediately of any unauthorized access</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Driver Registration Requirements</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Valid UK driving licence</li>
            <li>Local authority private hire vehicle licence</li>
            <li>Enhanced DBS check (valid and current)</li>
            <li>Public liability insurance</li>
            <li>Comprehensive vehicle insurance</li>
            <li>Vehicle meets accessibility standards (where applicable)</li>
            <li>English language proficiency</li>
            <li>Health declaration</li>
          </ul>
          <p className="text-gray-700 mt-4">
            <strong>Important:</strong> Drivers must maintain valid credentials at all times. We reserve the right to suspend accounts if credentials expire or become invalid.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Business Registration Requirements</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Valid business registration</li>
            <li>CQC registration (where applicable for care providers)</li>
            <li>Authorized representative must create the account</li>
            <li>Accurate business address and contact details</li>
          </ul>
        </section>

        {/* 4. User Roles and Responsibilities */}
        <section id="user-roles" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Roles and Responsibilities</h2>
          
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Public</h3>
<ul className="list-disc pl-6 space-y-2 text-gray-700">
  <li>Full oversight of your own account</li>
  <li>Book transport for yourself or family members</li>
  <li>Save passenger profiles for quick repeat bookings</li>
  <li>Compare driver quotes and choose the best fit</li>
  <li>Access your complete booking history</li>
  <li>Rate and review drivers after journeys</li>
  <li>Your account can be deleted at any time</li>
  <li>We reserve the right to store your information for a period of no more than 6 months after deletion</li>
</ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-3">Admin (Business - Head Office)</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Full oversight of business account</li>
            <li>Onboard Coordinators and Managers</li>
            <li>View all bookings and audit trails</li>
            <li>Manage business settings and areas</li>
            <li>Review incident reports</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Coordinator (Business - Area Managers)</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Oversee specific geographical areas</li>
            <li>Onboard Managers for houses within their area</li>
            <li>Monitor bookings within their area</li>
            <li>Review incident reports for their area</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Manager (Business - House Managers)</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Create bookings for residents/passengers</li>
            <li>Provide accurate passenger information and accessibility needs</li>
            <li>Review and accept driver estimates</li>
            <li>Communicate any special requirements</li>
            <li>Submit incident reports when necessary</li>
            <li>Ensure passenger is ready for pickup</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Driver</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Maintain valid credentials and insurance</li>
            <li>Bid on All Bookings that match their capabilities</li>
            <li>Accept Instant Bookings they can fulfill</li>
            <li>Arrive on time and notify if delayed</li>
            <li>Provide safe and professional transport</li>
            <li>Accommodate accessibility needs as specified</li>
            <li>Submit incident reports if issues arise</li>
            <li>Comply with all private hire vehicle regulations</li>
          </ul>
        </section>

        
        {/* 5. Booking Terms */}
        <section id="booking-terms" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Booking Terms</h2>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">How Bookings Work</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>All bookings receive quotes from qualified drivers</li>
            <li>Earlier submissions give more drivers time to respond</li>
            <li>You compare prices, ratings, and driver profiles</li>
            <li>Choose the driver that best fits your needs</li>
            <li>Once accepted, the booking becomes a contract between you and the driver</li>
            <li>Quote period closes when you accept a driver</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Booking Information Requirements</h3>
          <p className="text-gray-700 mb-2">You must provide accurate information:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Pickup and dropoff addresses with postcodes</li>
            <li>Date and time of journey</li>
            <li>Number of passengers and wheelchair users</li>
            <li>All accessibility requirements and support needs</li>
            <li>Passenger details (for audit trail)</li>
            <li>Any special instructions or medical considerations</li>
          </ul>
          <p className="text-gray-700 mt-4">
            <strong>Important:</strong> Failure to provide accurate accessibility information may result in service issues and additional charges.
          </p>
        </section>

        {/* 6. Driver Terms */}
        <section id="driver-terms" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Driver Terms</h2>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Independent Contractor Status</h3>
          <p className="text-gray-700 mb-4">
            Drivers are independent contractors, NOT employees of NEAT Transport. Drivers:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Set their own working hours and availability</li>
            <li>Determine their own bid prices for All Bookings</li>
            <li>Maintain their own insurance and vehicle</li>
            <li>Are responsible for their own tax and National Insurance</li>
            <li>Have direct contractual relationships with Businesses for each booking</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Driver Obligations</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Only bid on/accept bookings you can fulfill</li>
            <li>Arrive within agreed timeframe</li>
            <li>Contact passenger/manager if delayed</li>
            <li>Ensure vehicle is clean and accessible as advertised</li>
            <li>Treat all passengers with dignity and respect</li>
            <li>Follow passenger care plans and accessibility requirements</li>
            <li>Complete journey safely and professionally</li>
            <li>Submit incident reports for any issues during transport</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Bidding Guidelines</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Bids must be genuine and competitive</li>
            <li>Once a bid is accepted, you are committed to the booking</li>
            <li>You may withdraw a bid before acceptance without penalty</li>
            <li>Repeated no-shows or cancellations may result in account suspension</li>
          </ul>
        </section>

  {/* 7. Payment Terms */}
<section id="payment-terms" className="mb-8">
  <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Payment Terms</h2>
  
  <h3 className="text-xl font-semibold text-gray-800 mb-3">Driver Subscription Model</h3>
  <p className="text-gray-700 mb-4">
    NEAT Transport operates on a subscription model. Drivers pay a monthly fee to access the platform and keep 100% of passenger fares. Passengers never pay platform fees.
  </p>

   {/* Pre-Launch Free Access */}
<div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
  <h4 className="font-bold text-gray-900 mb-2">Phase 1 - Post-Launch Free Access</h4>
  <p className="text-gray-700">
    We aim to keep the app free for as long as possible for all drivers (Founding Drivers). 
    This gives you access to the whole app and all its benefits, including our intelligent matching 
    algorithm that connects you with passengers based on their specific accessibility needs.
  </p>
  <p className="text-gray-700 mt-3">
    As the app grows and it becomes necessary to cover operational costs (hosting, insurance, support), 
    we will move to a subscription-based model via PayPal starting at <strong>just £4 per day</strong> (£125/month), 
    which will automatically reduce with loyalty after 12 and 24 months.
  </p>
  <p className="text-gray-700 mt-3">
    We will provide <strong>30 days written notice</strong> before subscription fees commence.
  </p>
</div>

{/* Subscription Tiers */}
<div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
  <h4 className="font-bold text-gray-900 mb-3">Phase 2 - Subscription Tiers</h4>
  
  <div className="space-y-4">
    {/* Founding Driver */}
    <div>
      <p className="font-semibold text-gray-900 mb-1">
        👑 Founding Driver <span className="text-sm font-normal text-gray-600">(Limited to First 100 Drivers)</span>
      </p>
      <p className="text-gray-700 ml-6">
        <strong>£99/month locked forever</strong> - your rate is guaranteed for the lifetime of your account. 
        You will never be subject to future rate increases, even as standard pricing changes.
      </p>
    </div>

    {/* Standard Driver */}
    <div>
      <p className="font-semibold text-gray-900 mb-1">
        Standard Driver
      </p>
      <p className="text-gray-700 ml-6 mb-2">
        <strong>£125/month</strong> (just £4/day) for new drivers. Your price automatically reduces with loyalty:
      </p>
      <div className="ml-12 space-y-1 text-gray-700">
        <p>• <strong>Months 1-11:</strong> £125/month</p>
        <p>• <strong>After 12 months:</strong> £115/month (automatic upgrade)</p>
        <p>• <strong>After 24 months:</strong> £105/month (automatic upgrade)</p>
      </div>
      <p className="text-gray-700 ml-6 mt-2 text-sm italic">
        Tier upgrades happen automatically - no action needed from you.
      </p>
    </div>
  </div>
  
  <div className="mt-4 p-3 bg-white rounded border border-blue-200">
    <p className="text-sm text-gray-700">
      <strong>💡 Why subscriptions?</strong> Unlike Uber's 25-30% commission, our flat monthly fee means 
      you keep 100% of your fares. Average drivers earn <strong>£400-600 more per month</strong> on NEAT 
      compared to commission-based platforms.
    </p>
  </div>
</div>
 

  {/* When Subscriptions Activate */}
  <h4 className="font-semibold text-gray-800 mb-2">When Subscriptions Become Active:</h4>
  <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
    <li>Founding Driver rate (£99/month) available to first 100 subscribers</li>
    <li>Standard rate (£125/month) applies to all subsequent drivers</li>
    <li>Loyalty tier upgrades apply automatically based on subscription start date</li>
    <li>30 days written notice provided to all active drivers</li>
  </ul>

  {/* Payment Terms */}
  <h4 className="font-semibold text-gray-800 mb-2">Payment Terms:</h4>
  <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
    <li>Subscriptions are billed monthly via PayPal</li>
    <li>First payment due upon subscription activation</li>
    <li>Auto-renewal on the same day each month</li>
    <li>Cancel anytime through your PayPal account</li>
    <li>No per-ride commissions - keep 100% of passenger fares</li>
  </ul>

  {/* Cancellation Policy */}
  <h4 className="font-semibold text-gray-800 mb-2">Cancellation Policy:</h4>
  <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
    <li>Cancel anytime, no cancellation fees</li>
    <li>Access continues until end of current billing period</li>
    <li>No refunds for partial months</li>
    <li>Re-subscribing after cancellation starts new subscription period (tier progress resets)</li>
  </ul>

  {/* Our Commitment */}
  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
    <p className="text-gray-700">
      <strong>Our Promise:</strong> We are building a sustainable platform, not a profit-extraction machine. 
      Our flat subscription model means you keep 100% of your fares - no commission on rides, ever. 
      This creates a fair, transparent marketplace where drivers earn more and passengers pay less.
    </p>
  </div>
</section>

      {/* 8. Cancellations and Refunds */}
        <section id="cancellations" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cancellations and Refunds</h2>
          
          <p className="text-gray-700 mb-4">
            We understand things happen beyond everyone's control. We urge all parties to cancel as soon as possible to maintain fairness for everyone on the platform.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">Cancellation by User (Business or Public)</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>More than 24 hours notice:</strong> Free cancellation</li>
            <li><strong>12-24 hours notice:</strong> Cancellation fee may apply at driver's discretion</li>
            <li><strong>Less than 12 hours notice:</strong> 100% cancellation fee (payable to driver)</li>
            <li><strong>No-show:</strong> Full fare plus waiting time charges</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Cancellation by Driver</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>More than 24 hours notice:</strong> No penalty (booking returned to available pool)</li>
            <li><strong>Less than 24 hours notice:</strong> Account warning; repeated cancellations may result in suspension</li>
            <li><strong>Emergency situations:</strong> Must contact user immediately; no penalty if genuine emergency</li>
            <li><strong>No-show:</strong> Serious breach; immediate account review and potential termination</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Cancellation of Subscription</h3>
          <div className="space-y-3">
            <p className='text-gray-700'>Subscription fees are generally <strong>non-refundable</strong>. However, we understand that 
exceptional circumstances may arise. If you believe you are entitled to a refund 
due to platform issues, billing errors, or other extraordinary situations, please 
contact support using the contact form below, giving as much detail and information as possible. Refunds are reviewed on a case-by-case basis at our discretion.</p>


<p className='text-gray-700'>Standard cancellations do not qualify for refunds. You may cancel anytime and 
retain access until the end of your current billing period.</p>
            
          </div>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Force Majeure</h3>
          <p className="text-gray-700">
            Either party may cancel without penalty in cases of extreme weather, road closures, medical emergencies, or other circumstances beyond reasonable control.
          </p>
        </section>

        {/* 9. User Conduct and Prohibited Activities */}
        <section id="conduct" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">9. User Conduct and Prohibited Activities</h2>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">All Users Must NOT:</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Provide false or misleading information</li>
            <li>Impersonate another person or entity</li>
            <li>Engage in fraudulent activity</li>
            <li>Abuse, harass, or discriminate against other users</li>
            <li>Violate any applicable laws or regulations</li>
            <li>Attempt to hack, disrupt, or damage the Platform</li>
            <li>Use the Platform for any illegal purpose</li>
            <li>Share login credentials or allow unauthorized access</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Driver-Specific Prohibitions:</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Operating without valid credentials or insurance</li>
            <li>Driving under the influence of alcohol or drugs</li>
            <li>Using an unsafe or unsuitable vehicle</li>
            <li>Refusing service based on protected characteristics</li>
            <li>Taking alternative routes without passenger consent (except for safety)</li>
            <li>Recording passengers without explicit consent</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Safeguarding</h3>
          <p className="text-gray-700">
            All users must comply with safeguarding requirements. Any concerns about passenger welfare must be reported immediately through the incident reporting system.
          </p>
        </section>

        {/* 10. Liability and Insurance */}
        <section id="liability" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Liability and Insurance</h2>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Platform Liability</h3>
          <p className="text-gray-700 mb-4">
            NEAT Transport is a marketplace platform. We:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>ARE NOT LIABLE</strong> for driver conduct, vehicle condition, or transport services</li>
            <li><strong>ARE NOT LIABLE</strong> for accidents, injuries, or property damage during transport</li>
            <li><strong>ARE NOT LIABLE</strong> for delays, cancellations, or no-shows by drivers</li>
            <li><strong>ARE NOT LIABLE</strong> for disputes between Businesses and Drivers</li>
            <li><strong>DO NOT GUARANTEE</strong> driver availability or service quality</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Driver Insurance Requirements</h3>
          <p className="text-gray-700 mb-4">
            Drivers MUST maintain:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Comprehensive vehicle insurance covering private hire operations</li>
            <li>Public liability insurance (minimum £5 million coverage)</li>
            <li>Valid insurance certificates uploaded to the platform</li>
            <li>Insurance that covers passengers with accessibility needs</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Liability Between Driver and Business</h3>
          <p className="text-gray-700">
            The transport contract is directly between the Driver and Business. Any claims for injury, damage, or loss must be pursued between those parties and their insurers.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Platform Warranty Disclaimer</h3>
          <p className="text-gray-700">
            The Platform is provided "as is" without warranties of any kind. We do not warrant that the Platform will be uninterrupted, error-free, or secure.
          </p>
        </section>

        {/* 11. Complaints and Disputes */}
        <section id="complaints" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Complaints and Disputes</h2>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Incident Reporting</h3>
          <p className="text-gray-700 mb-4">
            All incidents during transport must be reported through the platform's incident reporting system within 24 hours.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">Complaint Process</h3>
          <ol className="list-decimal pl-6 space-y-2 text-gray-700">
            <li>Submit a complaint via our contact form or email</li>
            <li>Provide booking reference and detailed description</li>
            <li>We will acknowledge within 2 business days</li>
            <li>We will investigate and respond within 10 business days</li>
            <li>If unresolved, escalate to our senior management team</li>
          </ol>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Dispute Resolution</h3>
          <p className="text-gray-700">
            For disputes between Businesses and Drivers, we recommend:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>First attempt direct resolution between parties</li>
            <li>If unsuccessful, contact us to mediate (non-binding)</li>
            <li>Consider alternative dispute resolution (ADR) services</li>
            <li>As a last resort, pursue legal action through appropriate courts</li>
          </ul>
        </section>

        {/* 12. Intellectual Property */}
        <section id="intellectual-property" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Intellectual Property</h2>
          <p className="text-gray-700 mb-4">
            All content on the Platform, including but not limited to text, graphics, logos, software, and design, is owned by NEAT Transport or our licensors and protected by UK and international intellectual property laws.
          </p>
          <p className="text-gray-700">
            You may not copy, modify, distribute, sell, or reverse engineer any part of the Platform without our written permission.
          </p>
        </section>

        {/* 13. Data Protection */}
        <section id="data-protection" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Data Protection</h2>
          <p className="text-gray-700 mb-4">
            We process personal data in accordance with UK GDPR and the Data Protection Act 2018. For full details on how we collect, use, and protect your data, please see our <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
          </p>
          <p className="text-gray-700">
            By using the Platform, you consent to our data processing practices as described in our Privacy Policy.
          </p>
        </section>

        {/* 14. Termination and Suspension */}
        <section id="termination" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Termination and Suspension</h2>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Account Termination</h3>
          <p className="text-gray-700 mb-4">
            You may close your account at any time by contacting us. We may suspend or terminate your account if:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>You breach these Terms</li>
            <li>Your credentials expire or become invalid (drivers)</li>
            <li>You engage in fraudulent or illegal activity</li>
            <li>You repeatedly cancel bookings or fail to honor commitments</li>
            <li>We receive serious complaints about your conduct</li>
            <li>Required by law or regulatory authority</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Effect of Termination</h3>
          <p className="text-gray-700">
            Upon termination, you will lose access to the Platform. Outstanding bookings may be honored or cancelled at our discretion. Booking history will be retained for legal and compliance purposes.
          </p>
        </section>

        {/* 15. Changes to Terms */}
        <section id="changes" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Changes to Terms</h2>
          <p className="text-gray-700">
            We may update these Terms from time to time. We will notify you of material changes by email or through a notice on the Platform. Continued use of the Platform after changes constitutes acceptance of the updated Terms.
          </p>
        </section>

        {/* 16. Governing Law */}
        <section id="governing-law" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Governing Law</h2>
          <p className="text-gray-700">
            These Terms are governed by the laws of England and Wales. Any disputes will be subject to the exclusive jurisdiction of the courts of England and Wales.
          </p>
        </section>

        {/* 17. Contact Information */}
        <section id="contact" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">17. Contact Information</h2>
          <p className="text-gray-700 mb-4">
            If you have any questions about these Terms, please contact us:
          </p>
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-700"><strong>NEAT Transport</strong></p>
            <p className="text-gray-700">Email: <a href="mailto:legal@neattransport.co.uk" className="text-blue-600 hover:underline">legal@neattransport.co.uk</a></p>
            <p className="text-gray-700">Support: <a href="mailto:support@neattransport.co.uk" className="text-blue-600 hover:underline">support@neattransport.co.uk</a></p>
          </div>
        </section>

        {/* Footer Navigation */}
        <div className="border-t border-gray-200 pt-6 mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link href="/" className="text-blue-600 hover:underline">
              ← Back to Home
            </Link>
            <div className="flex gap-4">
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
              <Link href="/cookies" className="text-blue-600 hover:underline">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}