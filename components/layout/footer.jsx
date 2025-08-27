import Link from "next/link";
import Image from "next/image";
//import logo from "@/assets/images/logo-black.png";
import CurrentYear from "../simples/currentYear";

function Footer() {
  return (
    <footer
      className="bg-blue-700 text-white py-6 mt-auto border-blue-500"
      aria-label="Footer"
    >
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-center md:justify-between px-4 text-center md:text-left">
        {/* Logo */}
        <div className="mb-4 md:mb-0">
          {/* <Image
            src={logo}
            alt="Accessible Venues logo"
            className="h-8 w-auto mx-auto md:mx-0"
          /> */}
        </div>

        {/* Footer Navigation */}
        <nav aria-label="Footer navigation" className="mb-4 md:mb-0">
          <ul className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2">
            <li>
              <Link
                href=""
                className="hover:underline focus:outline-none focus:ring-2 focus:ring-white"
              >
                Terms of Service
              </Link>
            </li>
            <li>
              <Link
                href="/venues/privacy"
                className="hover:underline focus:outline-none focus:ring-2 focus:ring-white"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href=""
                className="hover:underline focus:outline-none focus:ring-2 focus:ring-white"
              >
                How It Works
              </Link>
            </li>
            <li>
              <Link
                href=""
                className="hover:underline focus:outline-none focus:ring-2 focus:ring-white"
              >
                Contact Us
              </Link>
            </li>
          </ul>
        </nav>

        {/* Copyright */}
        <div className="text-sm">
          &copy; <CurrentYear /> NEAT Bookings App. All rights reserved.
        </div>
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
    </footer>
  );
}

export default Footer;
