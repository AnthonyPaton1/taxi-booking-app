import Link from "next/link";

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="border-b border-gray-200 pb-6 mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">Cookie Policy</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        {/* Introduction */}
        <section className="mb-8">
          <p className="text-gray-700 leading-relaxed mb-4">
            This Cookie Policy explains how NEAT Transport ("we", "our", or "us") uses cookies and similar technologies on our platform. By using our services, you consent to the use of cookies as described in this policy.
          </p>
          <p className="text-gray-700 leading-relaxed">
            This policy should be read alongside our <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link> and <Link href="/terms" className="text-blue-600 hover:underline">Terms & Conditions</Link>.
          </p>
        </section>

        {/* Table of Contents */}
        <nav className="bg-blue-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">Contents</h2>
          <ol className="space-y-2 text-blue-700">
            <li><a href="#what-are-cookies" className="hover:underline">1. What Are Cookies?</a></li>
            <li><a href="#how-we-use" className="hover:underline">2. How We Use Cookies</a></li>
            <li><a href="#types-of-cookies" className="hover:underline">3. Types of Cookies We Use</a></li>
            <li><a href="#third-party" className="hover:underline">4. Third-Party Cookies</a></li>
            <li><a href="#managing-cookies" className="hover:underline">5. Managing Your Cookie Preferences</a></li>
            <li><a href="#updates" className="hover:underline">6. Updates to This Policy</a></li>
            <li><a href="#contact" className="hover:underline">7. Contact Us</a></li>
          </ol>
        </nav>

        {/* 1. What Are Cookies? */}
        <section id="what-are-cookies" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. What Are Cookies?</h2>
          <p className="text-gray-700 mb-4">
            Cookies are small text files that are stored on your device (computer, tablet, or mobile phone) when you visit a website. They help the website remember information about your visit, making it easier and more useful for you.
          </p>
          <p className="text-gray-700 mb-4">
            Cookies can be:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Session cookies:</strong> Temporary cookies that expire when you close your browser</li>
            <li><strong>Persistent cookies:</strong> Remain on your device for a set period or until you delete them</li>
            <li><strong>First-party cookies:</strong> Set by the website you're visiting (NEAT Transport)</li>
            <li><strong>Third-party cookies:</strong> Set by external services we use (e.g., analytics providers)</li>
          </ul>
        </section>

        {/* 2. How We Use Cookies */}
        <section id="how-we-use" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Cookies</h2>
          <p className="text-gray-700 mb-4">
            We use cookies to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Keep you signed in to your account</li>
            <li>Remember your preferences and settings</li>
            <li>Understand how you use our platform</li>
            <li>Improve platform performance and user experience</li>
            <li>Ensure security and prevent fraud</li>
            <li>Comply with legal requirements</li>
          </ul>
        </section>

        {/* 3. Types of Cookies We Use */}
        <section id="types-of-cookies" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Types of Cookies We Use</h2>

          {/* Essential Cookies */}
          <div className="mb-6 border-l-4 border-blue-600 pl-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Essential Cookies (Strictly Necessary)</h3>
            <p className="text-gray-700 mb-3">
              These cookies are essential for the platform to function and cannot be disabled. Without them, you cannot use our services.
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-2 pr-4">Cookie Name</th>
                    <th className="text-left py-2 pr-4">Purpose</th>
                    <th className="text-left py-2">Duration</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-b border-gray-200">
                    <td className="py-2 pr-4 font-mono text-xs">next-auth.session-token</td>
                    <td className="py-2 pr-4">Authentication - keeps you logged in</td>
                    <td className="py-2">30 days</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 pr-4 font-mono text-xs">next-auth.csrf-token</td>
                    <td className="py-2 pr-4">Security - prevents cross-site request forgery</td>
                    <td className="py-2">Session</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 pr-4 font-mono text-xs">next-auth.callback-url</td>
                    <td className="py-2 pr-4">Navigation - redirects you after login</td>
                    <td className="py-2">Session</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              <strong>Legal basis:</strong> Essential for contract performance (providing our services)
            </p>
          </div>

          {/* Functional Cookies */}
          <div className="mb-6 border-l-4 border-green-600 pl-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Functional Cookies</h3>
            <p className="text-gray-700 mb-3">
              These cookies enhance your experience by remembering your choices and preferences.
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-2 pr-4">Cookie Name</th>
                    <th className="text-left py-2 pr-4">Purpose</th>
                    <th className="text-left py-2">Duration</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-b border-gray-200">
                    <td className="py-2 pr-4 font-mono text-xs">user_preferences</td>
                    <td className="py-2 pr-4">Remembers your dashboard layout preferences</td>
                    <td className="py-2">1 year</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 pr-4 font-mono text-xs">accessibility_settings</td>
                    <td className="py-2 pr-4">Stores accessibility preferences (font size, contrast)</td>
                    <td className="py-2">1 year</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 pr-4 font-mono text-xs">booking_filters</td>
                    <td className="py-2 pr-4">Remembers your booking filter preferences</td>
                    <td className="py-2">30 days</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              <strong>Legal basis:</strong> Legitimate interests (improving user experience)
            </p>
          </div>

          {/* Analytics Cookies */}
          <div className="mb-6 border-l-4 border-purple-600 pl-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Analytics Cookies</h3>
            <p className="text-gray-700 mb-3">
              These cookies help us understand how visitors use our platform so we can improve it. All data is anonymized.
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-2 pr-4">Cookie Name</th>
                    <th className="text-left py-2 pr-4">Purpose</th>
                    <th className="text-left py-2">Duration</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-b border-gray-200">
                    <td className="py-2 pr-4 font-mono text-xs">_ga</td>
                    <td className="py-2 pr-4">Google Analytics - distinguishes users</td>
                    <td className="py-2">2 years</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 pr-4 font-mono text-xs">_gid</td>
                    <td className="py-2 pr-4">Google Analytics - distinguishes users</td>
                    <td className="py-2">24 hours</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 pr-4 font-mono text-xs">_gat</td>
                    <td className="py-2 pr-4">Google Analytics - throttles request rate</td>
                    <td className="py-2">1 minute</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              <strong>Legal basis:</strong> Consent (you can opt out via cookie preferences)
            </p>
            <div className="mt-3 p-3 bg-blue-50 rounded">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> Analytics cookies are only set if you accept them via our cookie banner or preferences.
              </p>
            </div>
          </div>

          {/* Security Cookies */}
          <div className="mb-6 border-l-4 border-red-600 pl-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Security Cookies</h3>
            <p className="text-gray-700 mb-3">
              These cookies help us detect and prevent security threats and fraudulent activity.
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-2 pr-4">Cookie Name</th>
                    <th className="text-left py-2 pr-4">Purpose</th>
                    <th className="text-left py-2">Duration</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-b border-gray-200">
                    <td className="py-2 pr-4 font-mono text-xs">__cf_bm</td>
                    <td className="py-2 pr-4">Cloudflare - bot management and security</td>
                    <td className="py-2">30 minutes</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 pr-4 font-mono text-xs">cf_clearance</td>
                    <td className="py-2 pr-4">Cloudflare - security challenge verification</td>
                    <td className="py-2">30 minutes</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              <strong>Legal basis:</strong> Legitimate interests (platform security and fraud prevention)
            </p>
          </div>
        </section>

        {/* 4. Third-Party Cookies */}
        <section id="third-party" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Third-Party Cookies</h2>
          <p className="text-gray-700 mb-4">
            We use the following third-party services that may set cookies:
          </p>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Cloudflare</h3>
              <p className="text-gray-700 text-sm mb-2">
                <strong>Purpose:</strong> Content delivery, DDoS protection, and security
              </p>
              <p className="text-gray-700 text-sm mb-2">
                <strong>Privacy Policy:</strong> <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://www.cloudflare.com/privacypolicy/</a>
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Google Analytics</h3>
              <p className="text-gray-700 text-sm mb-2">
                <strong>Purpose:</strong> Website analytics (only with your consent)
              </p>
              <p className="text-gray-700 text-sm mb-2">
                <strong>Privacy Policy:</strong> <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://policies.google.com/privacy</a>
              </p>
              <p className="text-gray-700 text-sm">
                <strong>Opt-out:</strong> <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Analytics Opt-out Browser Add-on</a>
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">PayPal (Future)</h3>
              <p className="text-gray-700 text-sm mb-2">
                <strong>Purpose:</strong> Payment processing (when implemented)
              </p>
              <p className="text-gray-700 text-sm">
                <strong>Privacy Policy:</strong> <a href="https://www.paypal.com/uk/webapps/mpp/ua/privacy-full" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://www.paypal.com/uk/webapps/mpp/ua/privacy-full</a>
              </p>
            </div>
          </div>
        </section>

        {/* 5. Managing Your Cookie Preferences */}
        <section id="managing-cookies" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Managing Your Cookie Preferences</h2>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Cookie Banner</h3>
          <p className="text-gray-700 mb-4">
            When you first visit our platform, you'll see a cookie banner asking you to accept or reject non-essential cookies. You can change your preferences at any time.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">Browser Settings</h3>
          <p className="text-gray-700 mb-4">
            You can also control cookies through your browser settings:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
            <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
            <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
            <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
            <li><strong>Edge:</strong> Settings → Cookies and site permissions → Manage and delete cookies</li>
          </ul>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <p className="text-yellow-900">
              <strong>⚠️ Important:</strong> Blocking essential cookies will prevent you from using key features of the platform, including logging in and making bookings.
            </p>
          </div>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Do Not Track (DNT)</h3>
          <p className="text-gray-700">
            We respect Do Not Track browser signals. If you enable DNT, we will not set analytics cookies (though essential and security cookies will still be used).
          </p>
        </section>

        {/* 6. Updates to This Policy */}
        <section id="updates" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Updates to This Policy</h2>
          <p className="text-gray-700">
            We may update this Cookie Policy from time to time to reflect changes in our practices or for legal reasons. We will notify you of significant changes via email or a notice on our platform. The "Last updated" date at the top indicates when changes were last made.
          </p>
        </section>

        {/* 7. Contact Us */}
        <section id="contact" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Contact Us</h2>
          <p className="text-gray-700 mb-4">
            If you have any questions about our use of cookies, please contact us:
          </p>
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-700"><strong>NEAT Transport</strong></p>
            <p className="text-gray-700">Email: <a href="mailto:privacy@neattransport.co.uk" className="text-blue-600 hover:underline">privacy@neattransport.co.uk</a></p>
            <p className="text-gray-700 mt-4">
              For more information about how we handle your personal data, see our <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
            </p>
          </div>
        </section>

        {/* Quick Reference Guide */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Quick Cookie Reference</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-blue-900 mb-2">✅ Essential (Always On)</p>
              <p className="text-gray-700">Authentication, security, basic functionality</p>
            </div>
            <div>
              <p className="font-semibold text-green-700 mb-2">🔧 Functional (Recommended)</p>
              <p className="text-gray-700">Preferences, settings, improved experience</p>
            </div>
            <div>
              <p className="font-semibold text-purple-700 mb-2">📊 Analytics (Optional)</p>
              <p className="text-gray-700">Usage statistics, platform improvement</p>
            </div>
            <div>
              <p className="font-semibold text-red-700 mb-2">🔒 Security (Recommended)</p>
              <p className="text-gray-700">Fraud prevention, bot detection</p>
            </div>
          </div>
        </div>

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
              <Link href="/terms" className="text-blue-600 hover:underline">
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}