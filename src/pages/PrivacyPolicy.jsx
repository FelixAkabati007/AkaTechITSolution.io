import React from "react";
import { motion } from "framer-motion";

export const PrivacyPolicy = ({ onHome }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-akatech-dark pt-28 pb-12 transition-colors duration-500">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <button
            onClick={onHome}
            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-akatech-gold transition-colors text-sm font-bold uppercase tracking-wider"
          >
            <span>←</span> Back to Home
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="prose dark:prose-invert max-w-none"
        >
          <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-white mb-2">
            Privacy Policy
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Last Updated: December 15, 2023
          </p>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              1. Introduction
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              AkaTech IT Solutions ("we", "us", or "our") respects your
              privacy and is committed to protecting your personal data.
              This privacy policy will inform you as to how we look after
              your personal data when you visit our website and tell you
              about your privacy rights and how the law protects you.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              2. The Data We Collect
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              We may collect, use, store and transfer different kinds of
              personal data about you which we have grouped together
              follows:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-400">
              <li>
                <strong>Identity Data</strong> includes first name, last
                name, username or similar identifier.
              </li>
              <li>
                <strong>Contact Data</strong> includes billing address,
                delivery address, email address and telephone numbers.
              </li>
              <li>
                <strong>Technical Data</strong> includes internet protocol
                (IP) address, browser type and version, time zone setting
                and location.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              3. How We Use Your Data
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              We will only use your personal data when the law allows us
              to. Most commonly, we will use your personal data in the
              following circumstances:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-400">
              <li>
                Where we need to perform the contract we are about to
                enter into or have entered into with you.
              </li>
              <li>
                Where it is necessary for our legitimate interests (or
                those of a third party) and your interests and fundamental
                rights do not override those interests.
              </li>
              <li>
                Where we need to comply with a legal or regulatory
                obligation.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              4. Your Legal Rights
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Under certain circumstances, you have rights under data
              protection laws (such as GDPR and CCPA) in relation to your
              personal data, including the right to request access,
              correction, erasure, restriction, transfer, to object to
              processing, to portability of data and (where the lawful
              ground of processing is consent) to withdraw consent.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              5. Contact Us
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              If you have any questions about this privacy policy or our
              privacy practices, please contact us at:{" "}
              <span className="text-akatech-gold">
                Akatechitsolutions@outlook.com
              </span>
              .
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
};
