import React, { useState } from "react";
import { Icons } from "../ui/Icons";
import { useToast } from "../ui/ToastProvider";

export const Contact = () => {
  const { addToast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    addToast("Message sent successfully!", "success");
  };

  return (
    <section
      id="contact"
      className="py-16 md:py-24 bg-white dark:bg-black relative overflow-hidden transition-colors duration-500"
    >
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gray-50 dark:from-[#1a1a1a] to-transparent"></div>

      <div className="container mx-auto px-4 relative z-10 grid md:grid-cols-2 gap-12 md:gap-16">
        <div>
          <span className="text-akatech-gold text-xs font-bold tracking-[0.2em] uppercase mb-3 block">
            Get in Touch
          </span>
          <h2 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white mb-6 transition-colors duration-500">
            Start Your Transformation
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-10 leading-relaxed max-w-md transition-colors duration-500">
            Ready to elevate your digital presence? Contact our team in Ejisu or
            reach out for remote consultation globally.
          </p>

          <div className="space-y-8 border-l border-akatech-gold/30 pl-8">
            <div>
              <h4 className="text-gray-900 dark:text-white font-bold mb-1 uppercase tracking-wider text-xs transition-colors duration-500">
                Headquarters
              </h4>
              <p className="text-gray-500">Ejisu, Ashanti Region, Ghana</p>
            </div>
            <div>
              <h4 className="text-gray-900 dark:text-white font-bold mb-1 uppercase tracking-wider text-xs transition-colors duration-500">
                Phone
              </h4>
              <p className="text-akatech-gold text-lg font-serif">
                +233 24 402 7477
              </p>
              <p className="text-akatech-gold text-lg font-serif">
                +233 20 282 4663
              </p>
            </div>
            <div>
              <h4 className="text-gray-900 dark:text-white font-bold mb-1 uppercase tracking-wider text-xs transition-colors duration-500">
                Email
              </h4>
              <p className="text-gray-500">info@Akatech.com</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-akatech-card p-8 md:p-10 border border-gray-200 dark:border-akatech-gold/10 relative shadow-xl dark:shadow-none transition-colors duration-500">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gold-gradient opacity-10 blur-xl"></div>
          {submitted ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 text-green-500 mb-4">
                <Icons.Check size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Message Sent
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Thank you for reaching out. We will get back to you shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 text-sm text-akatech-gold hover:underline font-bold uppercase tracking-wider"
              >
                Send Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder="NAME"
                  className="bg-gray-50 dark:bg-akatech-dark w-full p-4 text-base text-gray-900 dark:text-white border-b border-gray-300 dark:border-white/20 focus:border-akatech-gold outline-none placeholder-gray-500 dark:placeholder-gray-600 transition-colors"
                  required
                />
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="EMAIL"
                  className="bg-gray-50 dark:bg-akatech-dark w-full p-4 text-base text-gray-900 dark:text-white border-b border-gray-300 dark:border-white/20 focus:border-akatech-gold outline-none placeholder-gray-500 dark:placeholder-gray-600 transition-colors"
                  required
                />
              </div>
              <input
                type="text"
                name="subject"
                placeholder="SUBJECT"
                className="bg-gray-50 dark:bg-akatech-dark w-full p-4 text-base text-gray-900 dark:text-white border-b border-gray-300 dark:border-white/20 focus:border-akatech-gold outline-none placeholder-gray-500 dark:placeholder-gray-600 transition-colors"
                required
              />
              <textarea
                rows="4"
                name="message"
                placeholder="MESSAGE"
                className="bg-gray-50 dark:bg-akatech-dark w-full p-4 text-base text-gray-900 dark:text-white border-b border-gray-300 dark:border-white/20 focus:border-akatech-gold outline-none placeholder-gray-500 dark:placeholder-gray-600 transition-colors resize-none"
                required
              ></textarea>
              <button className="bg-gray-900 dark:bg-white text-white dark:text-black font-bold uppercase tracking-[0.2em] text-xs px-10 py-4 w-full hover:bg-gold-gradient hover:text-black transition-all duration-300 min-h-[48px]">
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
