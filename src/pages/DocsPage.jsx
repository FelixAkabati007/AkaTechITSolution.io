import React from "react";
import { jsPDF } from "jspdf";

export const DocsPage = () => {
  return (
    <section className="py-16 md:py-20 bg-gray-50 dark:bg-akatech-card border-t border-gray-200 dark:border-white/5">
      <div className="container mx-auto">
        <h2 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white mb-6">
          Onboarding & Purchase Guide
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 bg-white dark:bg-akatech-dark rounded-xl border border-gray-200 dark:border-white/10">
            <h3 className="font-bold text-sm mb-3 text-gray-900 dark:text-white">
              Step-by-Step Purchase Workflow
            </h3>
            <ol className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
              <li>Open Pricing and choose a package.</li>
              <li>Click Get Started to launch the signup wizard.</li>
              <li>Sign in with Google to verify identity.</li>
              <li>Fill project details and confirm.</li>
              <li>Complete signup; an invoice is generated.</li>
              <li>Pay via bank transfer or mobile money.</li>
              <li>Receive confirmation; project activates.</li>
            </ol>
          </div>
          <div className="p-6 bg-white dark:bg-akatech-dark rounded-xl border border-gray-200 dark:border-white/10">
            <h3 className="font-bold text-sm mb-3 text-gray-900 dark:text-white">
              Package Options & Pricing
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              See available categories and sample prices under Project Types.
              Final pricing appears in the invoice.
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-akatech-dark rounded-xl border border-gray-200 dark:border-white/10">
            <h3 className="font-bold text-sm mb-3 text-gray-900 dark:text-white">
              Payment Methods
            </h3>
            <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
              <li>
                Bank Transfer: use bank details shown on the billing page.
              </li>
              <li>
                Mobile Money: send to the number displayed and include
                reference.
              </li>
              <li>
                Avoid entering card details in the app; use secure gateways
                only.
              </li>
            </ul>
          </div>
          <div className="p-6 bg-white dark:bg-akatech-dark rounded-xl border border-gray-200 dark:border-white/10">
            <h3 className="font-bold text-sm mb-3 text-gray-900 dark:text-white">
              Account Creation & Authentication
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Sign in with Google. Admins are recognized by configured admin
              email. Session tokens are stored securely server-side when
              configured.
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-akatech-dark rounded-xl border border-gray-200 dark:border-white/10">
            <h3 className="font-bold text-sm mb-3 text-gray-900 dark:text-white">
              Post-Purchase Activation
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              After payment confirmation, your project moves to in-progress. You
              will see real-time status updates via the sync indicator.
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-akatech-dark rounded-xl border border-gray-200 dark:border-white/10">
            <h3 className="font-bold text-sm mb-3 text-gray-900 dark:text-white">
              Troubleshooting
            </h3>
            <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
              <li>
                If Google Sign-In fails, retry and ensure pop-ups are allowed.
              </li>
              <li>
                If project options fail to load, defaults are used
                automatically.
              </li>
              <li>
                Payments for requested invoices are disabled until admin
                approval.
              </li>
            </ul>
          </div>
          <div className="p-6 bg-white dark:bg-akatech-dark rounded-xl border border-gray-200 dark:border-white/10">
            <h3 className="font-bold text-sm mb-3 text-gray-900 dark:text-white">
              Navbar Props
            </h3>
            <pre className="text-[11px] bg-black/80 text-white p-3 rounded overflow-auto">
              <code>{`interface NavbarProps {
  toggleAuth: () => void;
  isLoggedIn: boolean;
  user?: { name?: string; avatar?: string } | null;
  mode: 'system' | 'light' | 'dark';
  cycleTheme: () => void;
  onViewChange: (view: 'landing' | 'portfolio') => void;
  icons?: { Sun?: Comp; Moon?: Comp; Monitor?: Comp; Menu?: Comp; X?: Comp };
  logo?: React.ReactNode;
}`}</code>
            </pre>
          </div>
          <div className="p-6 bg-white dark:bg-akatech-dark rounded-xl border border-gray-200 dark:border-white/10">
            <h3 className="font-bold text-sm mb-3 text-gray-900 dark:text-white">
              ScrollProgress
            </h3>
            <pre className="text-[11px] bg-black/80 text-white p-3 rounded overflow-auto">
              <code>{`<ScrollProgress className="fixed top-0" />`}</code>
            </pre>
          </div>
          <div className="p-6 bg-white dark:bg-akatech-dark rounded-xl border border-gray-200 dark:border-white/10">
            <h3 className="font-bold text-sm mb-3 text-gray-900 dark:text-white">
              Logo
            </h3>
            <pre className="text-[11px] bg-black/80 text-white p-3 rounded overflow-auto">
              <code>{`<Logo src="/path/logo.png" alt="Brand" className="w-12 h-12" />`}</code>
            </pre>
          </div>
          <div className="p-6 bg-white dark:bg-akatech-dark rounded-xl border border-gray-200 dark:border-white/10">
            <h3 className="font-bold text-sm mb-3 text-gray-900 dark:text-white">
              ToastProvider
            </h3>
            <pre className="text-[11px] bg-black/80 text-white p-3 rounded overflow-auto">
              <code>{`<ToastProvider>{children}</ToastProvider>`}</code>
            </pre>
            <p className="text-[12px] mt-3 text-gray-600 dark:text-gray-400">
              Note: Use your app's toast hook or callbacks to trigger messages.
            </p>
          </div>
        </div>
        <div className="mt-10 flex gap-4">
          <button
            onClick={() => {
              const doc = new jsPDF();
              doc.setFontSize(16);
              doc.text("AkaTech Onboarding & Purchase Guide", 10, 20);
              doc.setFontSize(12);
              const lines = [
                "Workflow:",
                "1) Choose a package",
                "2) Sign in with Google",
                "3) Fill project details",
                "4) Confirm and receive invoice",
                "5) Pay via bank or mobile money",
                "6) Project activates after confirmation",
                "",
                "Payments:",
                "- Bank transfer or mobile money",
                "- Avoid entering card details in app",
                "",
                "Troubleshooting:",
                "- Retry Google Sign-In and allow pop-ups",
                "- Defaults are used if options fail",
                "- Requested invoices require admin approval",
              ];
              let y = 30;
              lines.forEach((l) => {
                doc.text(l, 10, y);
                y += 8;
              });
              doc.save("akatech-onboarding-guide.pdf");
            }}
            className="px-4 py-2 rounded-lg bg-akatech-gold text-white text-sm font-bold"
            aria-label="Generate PDF of this guide"
          >
            Download PDF
          </button>
          <button
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 text-sm font-bold"
            aria-label="Play onboarding walkthrough"
          >
            Play Walkthrough
          </button>
        </div>
        <div className="mt-6">
          <video
            controls
            className="w-full rounded-xl border border-gray-200 dark:border-white/10"
            aria-label="Video walkthrough of the purchase process"
          >
            <source src="/assets/walkthrough.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </section>
  );
};
