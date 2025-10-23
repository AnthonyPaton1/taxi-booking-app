import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="border-b border-gray-200 pb-6 mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        {/* Introduction */}
        <section className="mb-8">
          <p className="text-gray-700 leading-relaxed">
            NEAT Transport ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our accessible transport booking platform.
          </p>
          <p className="text-gray-700 leading-relaxed mt-4">
            We comply with the UK General Data Protection Regulation (GDPR) and the Data Protection Act 2018.
          </p>
        </section>

        {/* Table of Contents */}
        <nav className="bg-blue-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">Contents</h2>
          <ol className="space-y-2 text-blue-700">
            <li><a href="#data-collection" className="hover:underline">1. Information We Collect</a></li>
            <li><a href="#how-we-use" className="hover:underline">2. How We Use Your Information</a></li>
            <li><a href="#legal-basis" className="hover:underline">3. Legal Basis for Processing</a></li>
            <li><a href="#data-sharing" className="hover:underline">4. Information Sharing</a></li>
            <li><a href="#data-retention" className="hover:underline">5. Data Retention</a></li>
            <li><a href="#your-rights" className="hover:underline">6. Your Rights</a></li>
            <li><a href="#security" className="hover:underline">7. Data Security</a></li>
            <li><a href="#cookies" className="hover:underline">8. Cookies</a></li>
            <li><a href="#third-party" className="hover:underline">9. Third-Party Services</a></li>
            <li><a href="#children" className="hover:underline">10. Children's Privacy</a></li>
            <li><a href="#changes" className="hover:underline">11. Changes to This Policy</a></li>
            <li><a href="#contact" className="hover:underline">12. Contact Us</a></li>
          </ol>
        </nav>

        {/* 1. Information We Collect */}
        <section id="data-collection" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Personal Information</h3>
          <p className="text-gray-700 mb-3">We collect the following types of personal information:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Account Information:</strong> Name, email address, phone number, role (Admin, Coordinator, Manager, Driver)</li>
            <li><strong>Business Information:</strong> Company name, address, registration details (for business accounts)</li>
            <li><strong>Driver Information:</strong> License number, vehicle details, accessibility features, insurance details, DBS check status</li>
            <li><strong>Booking Information:</strong> Pickup/dropoff locations, postcodes, date and time, passenger count</li>
            <li><strong>Accessibility Needs:</strong> Wheelchair requirements, assistance needs, communication preferences, medical considerations</li>
            <li><strong>Passenger Initials:</strong> For audit purposes (we do NOT collect full resident names for privacy)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Automatically Collected Information</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
            <li><strong>Usage Data:</strong> Pages visited, features used, time spent on platform</li>
            <li><strong>Location Data:</strong> Approximate location (for service availability)</li>
          </ul>
        </section>

        {/* 2. How We Use Your Information */}
        <section id="how-we-use" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
          <p className="text-gray-700 mb-3">We use your information for:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Service Delivery:</strong> Processing bookings, matching passengers with appropriate drivers, coordinating accessible transport</li>
            <li><strong>Communication:</strong> Booking confirmations, driver notifications, service updates</li>
            <li><strong>Safety & Compliance:</strong> Verifying driver credentials, maintaining audit trails (CQC compliance), incident reporting</li>
            <li><strong>Platform Improvement:</strong> Analyzing usage patterns, improving matching algorithms, enhancing accessibility features</li>
            <li><strong>Legal Obligations:</strong> Complying with care sector regulations, responding to legal requests</li>
            <li><strong>Account Management:</strong> User authentication, password resets, role-based access control</li>
          </ul>
        </section>

        {/* 3. Legal Basis for Processing */}
        <section id="legal-basis" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Legal Basis for Processing</h2>
          <p className="text-gray-700 mb-3">Under GDPR, we process your data based on:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Contract Performance:</strong> Processing bookings and providing transport services</li>
            <li><strong>Legitimate Interests:</strong> Platform security, fraud prevention, service improvement</li>
            <li><strong>Legal Obligation:</strong> CQC compliance, safeguarding requirements, tax/accounting obligations</li>
            <li><strong>Consent:</strong> Marketing communications (where applicable)</li>
            <li><strong>Vital Interests:</strong> Emergency situations involving passenger safety</li>
          </ul>
        </section>

        {/* 4. Information Sharing */}
        <section id="data-sharing" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Information Sharing</h2>
          <p className="text-gray-700 mb-3">We share your information with:</p>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Within the Platform</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Drivers:</strong> Receive booking details (pickup/dropoff, time, accessibility needs) - NOT full passenger names</li>
            <li><strong>Care Company Staff:</strong> Managers see bookings for their houses; Coordinators oversee their areas; Admins have full oversight</li>
            <li><strong>Audit Trail:</strong> All booking actions are logged with user initials for CQC compliance</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Third-Party Service Providers</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Hosting:</strong> Cloudflare (infrastructure and security)</li>
            <li><strong>Payment Processing:</strong> PayPal (for future payment features)</li>
            <li><strong>Email Services:</strong> For booking confirmations and notifications</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Legal Requirements</h3>
          <p className="text-gray-700">
            We may disclose information if required by law, court order, or regulatory authority (e.g., CQC, police investigations).
          </p>
        </section>

        {/* 5. Data Retention */}
        <section id="data-retention" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Retention</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Active Accounts:</strong> Data retained while account is active and for 12 months after last activity</li>
            <li><strong>Booking Records:</strong> Retained for 7 years (CQC compliance requirement)</li>
            <li><strong>Incident Reports:</strong> Retained for 7 years (legal and insurance purposes)</li>
            <li><strong>Driver Credentials:</strong> Retained while driver is active, plus 3 years for insurance purposes</li>
            <li><strong>Marketing Data:</strong> Until consent is withdrawn or account deleted</li>
          </ul>
        </section>

        {/* 6. Your Rights */}
        <section id="your-rights" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights Under GDPR</h2>
          <p className="text-gray-700 mb-3">You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Access:</strong> Request a copy of your personal data</li>
            <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
            <li><strong>Erasure:</strong> Request deletion of your data (subject to legal obligations)</li>
            <li><strong>Restrict Processing:</strong> Limit how we use your data</li>
            <li><strong>Data Portability:</strong> Receive your data in a machine-readable format</li>
            <li><strong>Object:</strong> Object to processing based on legitimate interests</li>
            <li><strong>Withdraw Consent:</strong> Withdraw consent for marketing communications</li>
            <li><strong>Complain:</strong> Lodge a complaint with the Information Commissioner's Office (ICO)</li>
          </ul>
          <p className="text-gray-700 mt-4">
            To exercise your rights, contact us at: <a href="mailto:privacy@neattransport.co.uk" className="text-blue-600 hover:underline">privacy@neattransport.co.uk</a>
          </p>
        </section>

        {/* 7. Data Security */}
        <section id="security" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Security</h2>
          <p className="text-gray-700 mb-3">We implement appropriate security measures:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Encryption:</strong> All data transmitted using HTTPS/TLS encryption</li>
            <li><strong>Authentication:</strong> Secure password hashing, role-based access control</li>
            <li><strong>Infrastructure:</strong> Hosted on secure Cloudflare infrastructure</li>
            <li><strong>Access Controls:</strong> Limited staff access to personal data on need-to-know basis</li>
            <li><strong>Regular Audits:</strong> Security reviews and vulnerability assessments</li>
            <li><strong>Incident Response:</strong> Procedures for data breach notification within 72 hours</li>
          </ul>
        </section>

        {/* 8. Cookies */}
        <section id="cookies" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies</h2>
          <p className="text-gray-700 mb-3">We use cookies for:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Essential Cookies:</strong> Authentication, session management (required for platform to function)</li>
            <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
            <li><strong>Analytics Cookies:</strong> Understand how users interact with the platform (with your consent)</li>
          </ul>
          <p className="text-gray-700 mt-4">
            For more details, see our <Link href="/cookies" className="text-blue-600 hover:underline">Cookie Policy</Link>.
          </p>
        </section>

        {/* 9. Third-Party Services */}
        <section id="third-party" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Third-Party Services</h2>
          <p className="text-gray-700">
            Our platform may contain links to third-party websites or services. We are not responsible for their privacy practices. Please review their privacy policies before providing any personal information.
          </p>
        </section>

        {/* 10. Children's Privacy */}
        <section id="children" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Children's Privacy</h2>
          <p className="text-gray-700">
            Our platform is designed for use by care professionals and drivers (18+). We do not knowingly collect personal information from children under 18. Bookings for vulnerable adults and children are made by authorized care staff, and we only collect passenger initials (not full names) for privacy protection.
          </p>
        </section>

        {/* 11. Changes to This Policy */}
        <section id="changes" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to This Policy</h2>
          <p className="text-gray-700">
            We may update this Privacy Policy from time to time. We will notify you of any material changes by email or through a notice on our platform. The "Last updated" date at the top indicates when changes were last made.
          </p>
        </section>

        {/* 12. Contact Us */}
        <section id="contact" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
          <p className="text-gray-700 mb-4">
            If you have any questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-700"><strong>NEAT Transport</strong></p>
            <p className="text-gray-700">Email: <a href="mailto:privacy@neattransport.co.uk" className="text-blue-600 hover:underline">privacy@neattransport.co.uk</a></p>
            <p className="text-gray-700">Data Protection Officer: <a href="mailto:dpo@neattransport.co.uk" className="text-blue-600 hover:underline">dpo@neattransport.co.uk</a></p>
            <p className="text-gray-700 mt-4">
              <strong>Information Commissioner's Office (ICO):</strong><br />
              If you're not satisfied with our response, you can contact the ICO:<br />
              <a href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://ico.org.uk/make-a-complaint/</a>
            </p>
          </div>
        </section>

        {/* Footer Navigation */}
        <div className="border-t border-gray-200 pt-6 mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link href="/" className="text-blue-600 hover:underline">
              ← Back to Home
            </Link>
            <div className="flex gap-4">
              <Link href="/terms" className="text-blue-600 hover:underline">
                Terms & Conditions
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