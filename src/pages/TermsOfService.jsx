import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const TermsOfService = ({ onHome }) => {
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-akatech-dark pt-28 pb-12 transition-colors duration-500">
      <div className="container mx-auto px-4 max-w-3xl relative">
        <div className="mb-8">
          <button
            onClick={onHome}
            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-akatech-gold transition-colors text-sm font-bold uppercase tracking-wider"
          >
            <span>←</span> Back to Home
          </button>
        </div>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="prose dark:prose-invert max-w-none prose-headings:font-serif prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-600 dark:prose-p:text-gray-400 prose-a:text-akatech-gold hover:prose-a:text-akatech-gold/80"
        >
          <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-sm text-gray-500 mb-8 font-mono">
            Last Updated: December 15, 2023
          </p>

          <section className="mb-10">
            <h3>1. Introduction</h3>
            <p>
              Welcome to AkaTech IT Solutions. By accessing our website
              and using our services, you agree to comply with and be
              bound by the following terms and conditions. Please review
              these terms carefully. If you do not agree to these terms,
              you should not use this site or our services.
            </p>
          </section>

          <section className="mb-10">
            <h3>2. User Responsibilities</h3>
            <p>
              When using our digital products and services, you agree to:
            </p>
            <ul>
              <li>
                Provide accurate and complete information when creating an
                account or requesting services.
              </li>
              <li>
                Maintain the confidentiality of your account credentials.
              </li>
              <li>
                Use our services only for lawful purposes and in
                accordance with these Terms.
              </li>
              <li>
                Not engage in any conduct that restricts or inhibits
                anyone's use or enjoyment of the website.
              </li>
            </ul>
          </section>

          <section className="mb-10">
            <h3>3. Intellectual Property</h3>
            <p>
              The content, organization, graphics, design, compilation,
              magnetic translation, digital conversion, and other matters
              related to the Site are protected under applicable
              copyrights, trademarks, and other proprietary (including but
              not limited to intellectual property) rights. The copying,
              redistribution, use, or publication by you of any such
              matters or any part of the Site is strictly prohibited.
            </p>
          </section>

          <section className="mb-10">
            <h3>4. Service Packages & Payments</h3>
            <p>
              <strong>Pricing:</strong> All prices for our service
              packages (Startup, Enterprise, Premium) are quoted in Ghana
              Cedis (GHS) unless otherwise stated.
            </p>
            <p>
              <strong>Payment Terms:</strong> A deposit may be required to
              commence work on custom projects. Final payment terms will
              be specified in your service contract.
            </p>
            <p>
              <strong>Refunds:</strong> Refunds are handled on a
              case-by-case basis as outlined in your specific service
              agreement.
            </p>
          </section>

          <section className="mb-10">
            <h3>5. Limitation of Liability</h3>
            <p>
              In no event will AkaTech IT Solutions be liable for any
              incidental, indirect, consequential, or special damages of
              any kind, or any damages whatsoever, including, without
              limitation, those resulting from loss of profit, loss of
              contracts, goodwill, data, information, income, anticipated
              savings, or business relationships, whether or not advised
              of the possibility of such damage, arising out of or in
              connection with the use of this website or any linked
              websites.
            </p>
          </section>

          <section className="mb-10">
            <h3>6. Governing Law</h3>
            <p>
              These Terms shall be governed by and construed in accordance
              with the laws of the Republic of Ghana. Any disputes arising
              under or in connection with these Terms shall be subject to
              the exclusive jurisdiction of the Ghanaian courts.
            </p>
          </section>

          <section className="mb-10">
            <h3>7. Changes to Terms</h3>
            <p>
              We reserve the right to modify these terms at any time. You
              should check this page periodically. The changes will appear
              on the Site and will be effective when we post the changes.
              Your continued use of the Site means you agree to the
              updated terms.
            </p>
          </section>

          <section className="mb-10 border-t border-gray-200 dark:border-white/10 pt-8">
            <h3>Contact Information</h3>
            <p>
              If you have any questions regarding these Terms of Service,
              please contact us at:{" "}
              <a href="mailto:Akatechitsolutions@outlook.com">Akatechitsolutions@outlook.com</a>
            </p>
          </section>
        </motion.article>

        <AnimatePresence>
          {showTopBtn && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              onClick={scrollToTop}
              className="fixed bottom-8 right-8 bg-akatech-gold text-black p-3 rounded-full shadow-lg hover:bg-white transition-colors z-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-akatech-gold"
              aria-label="Back to Top"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
