import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@components/ui/Icons";
import { useToast } from "@components/ui/ToastProvider";

export const PlanCompletion = ({ plan, onBack, onHome }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const { addToast } = useToast();

  const validate = () => {
    let tempErrors = {};
    if (!formData.name) tempErrors.name = "Name is required";
    if (!formData.email) tempErrors.email = "Email is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:3001/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            plan: plan.name,
          }),
        });

        if (!response.ok) throw new Error("Failed to submit request");

        setStep(3);
        addToast(`Request for ${plan.name} received!`, "success");
      } catch (error) {
        console.error(error);
        addToast("Failed to submit request. Please try again.", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-akatech-dark pt-28 pb-12 transition-colors duration-500">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-akatech-gold transition-colors text-sm font-bold uppercase tracking-wider"
          >
            <span>←</span> Back
          </button>
          <div className="h-4 w-[1px] bg-gray-300 dark:bg-white/10"></div>
          <span className="text-gray-400 dark:text-gray-500 text-sm">
            Step {step} of 3
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-akatech-card border border-akatech-gold/30 p-6 sticky top-28 shadow-xl dark:shadow-none"
            >
              <div className="text-akatech-gold text-xs font-bold uppercase tracking-widest mb-2">
                Selected Package
              </div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-2">
                {plan.name}
              </h2>
              <div className="flex items-baseline gap-1 mb-6 border-b border-gray-100 dark:border-white/10 pb-6 whitespace-nowrap">
                <span className="text-sm text-akatech-gold">GH₵</span>
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {plan.price}
                </span>
              </div>

              <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-4">
                Included Features:
              </h4>
              <ul className="space-y-3">
                {plan.features.map((feat, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-xs text-gray-600 dark:text-gray-400"
                  >
                    <Icons.Check className="text-akatech-gold w-3 h-3 mt-0.5 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white dark:bg-akatech-card border border-gray-200 dark:border-white/5 p-8"
                >
                  <h3 className="text-2xl font-serif text-gray-900 dark:text-white mb-6">
                    Review & Configuration
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                    You have selected the{" "}
                    <strong className="text-akatech-gold">{plan.name}</strong>{" "}
                    package. This package is designed for{" "}
                    {plan.description.toLowerCase()}
                  </p>

                  <div className="bg-gray-50 dark:bg-black/20 p-6 border-l-2 border-akatech-gold mb-8">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">
                      Next Steps
                    </h4>
                    <ol className="list-decimal list-inside text-sm text-gray-600 dark:text-gray-400 space-y-2">
                      <li>Provide your project details.</li>
                      <li>Our team reviews your requirements (24-48hrs).</li>
                      <li>We send a formal invoice and contract.</li>
                      <li>Project kickoff upon deposit payment.</li>
                    </ol>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => setStep(2)}
                      className="bg-gold-gradient text-black font-bold px-8 py-3 text-sm uppercase tracking-widest hover:shadow-lg transition-all"
                    >
                      Proceed to Details
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white dark:bg-akatech-card border border-gray-200 dark:border-white/5 p-8"
                >
                  <h3 className="text-2xl font-serif text-gray-900 dark:text-white mb-6">
                    Project Details
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          className={`w-full bg-gray-50 dark:bg-black/20 border ${
                            errors.name
                              ? "border-red-500"
                              : "border-gray-200 dark:border-white/10"
                          } p-3 text-gray-900 dark:text-white focus:border-akatech-gold outline-none transition-colors`}
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              name: e.target.value,
                            })
                          }
                        />
                        {errors.name && (
                          <span className="text-red-500 text-xs mt-1">
                            {errors.name}
                          </span>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          className={`w-full bg-gray-50 dark:bg-black/20 border ${
                            errors.email
                              ? "border-red-500"
                              : "border-gray-200 dark:border-white/10"
                          } p-3 text-gray-900 dark:text-white focus:border-akatech-gold outline-none transition-colors`}
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              email: e.target.value,
                            })
                          }
                        />
                        {errors.email && (
                          <span className="text-red-500 text-xs mt-1">
                            {errors.email}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                        Company / Organization
                      </label>
                      <input
                        type="text"
                        className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-3 text-gray-900 dark:text-white focus:border-akatech-gold outline-none transition-colors"
                        value={formData.company}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            company: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                        Project Notes / Requirements
                      </label>
                      <textarea
                        rows="4"
                        className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-3 text-gray-900 dark:text-white focus:border-akatech-gold outline-none transition-colors resize-none"
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            notes: e.target.value,
                          })
                        }
                        placeholder="Briefly describe your project needs..."
                      ></textarea>
                    </div>

                    <div className="flex justify-between items-center pt-4">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-sm font-bold uppercase tracking-wider"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-gold-gradient text-black font-bold px-8 py-3 text-sm uppercase tracking-widest hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-70"
                      >
                        {loading ? "Processing..." : "Confirm Request"}
                        {!loading && <span>→</span>}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-akatech-card border border-akatech-gold/30 p-10 text-center"
                >
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icons.Check className="text-green-500 w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-serif text-gray-900 dark:text-white mb-4">
                    Request Received
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                    Thank you, {formData.name}. We have received your request
                    for the <strong>{plan.name}</strong> package. A confirmation
                    email has been sent to {formData.email}.
                  </p>
                  <button
                    onClick={onHome}
                    className="border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white px-8 py-3 text-sm font-bold uppercase tracking-widest hover:border-akatech-gold hover:text-akatech-gold transition-all"
                  >
                    Return to Home
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
