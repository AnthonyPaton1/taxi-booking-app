//app/contact
"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, Clock, Send, MessageSquare } from "lucide-react";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    category: "general",
    message: "",
  });
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus("success");
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          category: "general",
          message: "",
        });
      } else {
        setStatus("error");
      }
    } catch (error) {
  console.error("Error creating booking:", error);
  toast.error("Unable to create booking. Please try again or contact support.");
}
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're here to help. Get in touch with our team for support, questions, or feedback.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Email Us</h3>
                  <a href="mailto:support@neattransport.co.uk" className="text-blue-600 hover:underline">
                    support@neattransport.co.uk
                  </a>
                  <p className="text-sm text-gray-600 mt-1">We typically respond within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4 mb-6">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Call Us</h3>
                  <a href="tel:+441234567890" className="text-blue-600 hover:underline">
                    +44 (0) 1234 567 890
                  </a>
                  <p className="text-sm text-gray-600 mt-1">Mon-Fri: 9am - 5pm GMT</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Office Hours</h3>
                  <p className="text-gray-700">Monday - Friday</p>
                  <p className="text-gray-700">9:00 AM - 5:00 PM GMT</p>
                  <p className="text-sm text-gray-600 mt-1">Closed on UK public holidays</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Quick Links
              </h3>
              <div className="space-y-3">
                <Link href="/faq" className="block text-blue-700 hover:text-blue-900 hover:underline">
                  → Frequently Asked Questions
                </Link>
                <Link href="/how-it-works" className="block text-blue-700 hover:text-blue-900 hover:underline">
                  → How NEAT Transport Works
                </Link>
                <Link href="/privacy" className="block text-blue-700 hover:text-blue-900 hover:underline">
                  → Privacy Policy
                </Link>
                <Link href="/terms" className="block text-blue-700 hover:text-blue-900 hover:underline">
                  → Terms & Conditions
                </Link>
              </div>
            </div>

            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
              <h3 className="font-semibold text-red-900 mb-2">🚨 Emergency Support</h3>
              <p className="text-sm text-red-800 mb-3">
                For urgent booking issues or emergencies during transport:
              </p>
              <a href="tel:+441234567890" className="font-bold text-red-900 text-lg hover:underline">
                +44 (0) 1234 567 890
              </a>
              <p className="text-xs text-red-700 mt-2">Available 24/7 for active bookings</p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>

              {status === "success" && (
                <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <p className="text-green-800 font-medium">
                    ✅ Message sent successfully! We'll get back to you soon.
                  </p>
                </div>
              )}

              {status === "error" && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <p className="text-red-800 font-medium">
                    ❌ Something went wrong. Please try again or email us directly.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block font-medium text-gray-700 mb-2">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Smith"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block font-medium text-gray-700 mb-2">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+44 1234 567890"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="category" className="block font-medium text-gray-700 mb-2">
                    Enquiry Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="general">General Enquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="booking">Booking Issue</option>
                    <option value="driver">Driver Registration</option>
                    <option value="business">Business Account</option>
                    <option value="complaint">Complaint</option>
                    <option value="feedback">Feedback</option>
                    <option value="partnership">Partnership Opportunity</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="subject" className="block font-medium text-gray-700 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief summary of your enquiry"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block font-medium text-gray-700 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Please provide as much detail as possible..."
                  />
                  <p className="text-sm text-gray-500 mt-1">Minimum 10 characters</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    By submitting this form, you agree to our{" "}
                    <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>. 
                    We'll use your information only to respond to your enquiry.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {status === "sending" ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="text-blue-600 hover:underline">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

