import Link from "next/link";
import Image from "next/image";
//import logo from "@/assets/images/logo-black.png";
import CurrentYear from "../simples/currentYear";

function Footer() {
  return (
    <footer
      className="bg-blue-700 text-white py-10 mt-auto border-t border-blue-600"
      aria-label="Footer"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-4">More from NEAT</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            We’re building a suite of tools to support accessible living and
            ethical business — explore what else is available:
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto mb-10">
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
              mobility aids, sensory tools, and more, hand-picked by carers for
              carers.
            </p>
            <a
              href="/ecomm"
              className="text-blue-600 font-medium hover:underline"
            >
              Visit Store →
            </a>
          </div>
        </div>
        {/* Legal Links */}
<div className="border-t border-blue-600 pt-6 pb-4">
  <nav className="flex flex-wrap justify-center gap-6 text-sm" aria-label="Legal links">
    <Link
      href="/privacy"
      className="text-blue-100 hover:text-white hover:underline transition"
    >
      Privacy Policy
    </Link>
    <Link
      href="/terms"
      className="text-blue-100 hover:text-white hover:underline transition"
    >
      Terms & Conditions
    </Link>
    <Link
      href="/cookies"
      className="text-blue-100 hover:text-white hover:underline transition"
    >
      Cookie Policy
    </Link>
    <Link
      href="/contact"
      className="text-blue-100 hover:text-white hover:underline transition"
    >
      Contact Us
    </Link>
    <Link
      href="/how-it-works"
      className="text-blue-100 hover:text-white hover:underline transition"
    >
      How It Works
    </Link>
    <Link
      href="/faq"
      className="text-blue-100 hover:text-white hover:underline transition"
    >
      FAQ
    </Link>
  </nav>
</div>

{/* Copyright - move this below the legal links */}
<div className="text-sm text-blue-100 text-center mt-6">
  © <CurrentYear /> NEAT Transport. All rights reserved.
</div>

       

      {/* Trust Message */}
      <div className="mt-6 text-center text-sm text-white px-4">
        🔒 This site is protected by advanced browser security headers and{" "}
        <a
          href="https://www.cloudflare.com/learning/ddos/what-is-cloudflare/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Cloudflare
        </a>{" "}
        for enhanced privacy and performance.
      </div>
      </div> 
    </footer>
  );
}

export default Footer;
