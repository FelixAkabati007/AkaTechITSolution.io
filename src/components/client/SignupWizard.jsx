import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { Icons } from "@components/ui/Icons";
import { PRICING_PACKAGES } from "../../lib/data";
import { identityService } from "../../lib/IdentityService";

const API_URL = "/api";

const StepPackageSelection = ({ selectedPackage, onSelect }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-4">
        Select Your Package
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PRICING_PACKAGES.map((pkg) => (
          <div
            key={pkg.name}
            onClick={() => onSelect(pkg)}
            className={`cursor-pointer rounded-xl p-6 border-2 transition-all ${
              selectedPackage?.name === pkg.name
                ? "border-akatech-gold bg-akatech-gold/5 dark:bg-akatech-gold/10 transform scale-105"
                : "border-gray-200 dark:border-white/10 hover:border-akatech-gold/50"
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                {pkg.name}
              </h3>
              {selectedPackage?.name === pkg.name && (
                <div className="h-6 w-6 bg-akatech-gold rounded-full flex items-center justify-center text-white">
                  <Icons.Check size={14} />
                </div>
              )}
            </div>
            <div className="text-2xl font-bold text-akatech-gold mb-2">
              GH₵ {pkg.price}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {pkg.description}
            </p>
            <ul className="space-y-2">
              {pkg.features.slice(0, 3).map((feature, idx) => (
                <li
                  key={idx}
                  className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-2"
                >
                  <Icons.Check size={12} className="text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

const StepSignup = ({ onVerify, loading }) => {
  const [error, setError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // 'login' or 'signup'

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-4 text-center">
        {authMode === "signup" ? "Create Account" : "Welcome Back"}
      </h2>

      <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-lg mb-6">
        <button
          onClick={() => setAuthMode("login")}
          className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
            authMode === "login"
              ? "bg-white dark:bg-akatech-card text-akatech-gold shadow-sm"
              : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Login
        </button>
        <button
          onClick={() => setAuthMode("signup")}
          className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
            authMode === "signup"
              ? "bg-white dark:bg-akatech-card text-akatech-gold shadow-sm"
              : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Sign Up
        </button>
      </div>

      <p className="text-gray-500 text-sm mb-6 text-center">
        {authMode === "signup"
          ? "Sign up with Google to verify your identity and get started."
          : "Please sign in with Google to continue."}
      </p>

      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
            <Icons.AlertTriangle size={16} />
            {error}
          </div>
        )}

        {authMode === "signup" && (
          <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10">
            <div className="flex items-center h-5">
              <input
                id="terms"
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="w-4 h-4 text-akatech-gold border-gray-300 rounded focus:ring-akatech-gold"
              />
            </div>
            <label
              htmlFor="terms"
              className="text-sm text-gray-600 dark:text-gray-300"
            >
              I agree to the{" "}
              <a href="#" className="text-akatech-gold hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-akatech-gold hover:underline">
                Privacy Policy
              </a>
              . I understand that my account is subject to approval.
            </label>
          </div>
        )}

        <div
          className={`flex justify-center relative py-8 ${
            authMode === "signup" && !termsAccepted
              ? "opacity-50 pointer-events-none"
              : ""
          }`}
        >
          {loading && (
            <div className="absolute inset-0 z-10 bg-white/50 dark:bg-black/50 flex items-center justify-center rounded-full">
              <div className="w-6 h-6 border-2 border-akatech-gold border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              console.log("Google Login Success:", credentialResponse);
              setError(""); // Clear previous errors
              onVerify("google", {
                token: credentialResponse.credential,
                mode: authMode,
              }).catch((err) => {
                console.error("Google verify error:", err);
                if (
                  err.message &&
                  err.message.toLowerCase().includes("already exists")
                ) {
                  setError(
                    <span>
                      Account already exists.{" "}
                      <button
                        onClick={() => setAuthMode("login")}
                        className="underline font-bold hover:text-red-800"
                      >
                        Switch to Login
                      </button>
                    </span>
                  );
                } else {
                  setError(
                    err.message ||
                      "Google verification failed. Please try again."
                  );
                }
              });
            }}
            onError={() => {
              console.error("Google Login Failed (onError triggered)");
              setError("Google Login Failed. Please try again.");
            }}
            theme="filled_blue"
            shape="pill"
            text={authMode === "signup" ? "signup_with" : "signin_with"}
            logo_alignment="left"
            width="250"
          />
        </div>
      </div>
    </div>
  );
};

const StepDetails = ({
  formData,
  setFormData,
  errors,
  user,
  packages,
  selectedPackage,
  onSelectPackage,
}) => {
  const [identityLoading, setIdentityLoading] = useState(false);
  const [syncedFields, setSyncedFields] = useState([]);

  const handleSyncIdentity = async () => {
    setIdentityLoading(true);
    try {
      const data = await identityService.fetchIdentityData();
      if (data) {
        const updates = {};
        const newSynced = [];

        if (data.name && !user?.name) {
          updates.name = data.name;
          newSynced.push("name");
        }
        if (data.phone) {
          const normalized = identityService.normalizePhone(data.phone);
          if (!formData.phone) {
            updates.phone = normalized;
            newSynced.push("phone");
          }
        }

        if (Object.keys(updates).length > 0) {
          setFormData((prev) => ({ ...prev, ...updates }));
          setSyncedFields(newSynced);
        }
      }
    } catch (e) {
      console.error("Identity sync failed:", e);
    } finally {
      setIdentityLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (syncedFields.includes(name)) {
      setSyncedFields((prev) => prev.filter((f) => f !== name));
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">
          Project Details
        </h2>
        <button
          type="button"
          onClick={handleSyncIdentity}
          disabled={identityLoading}
          className="text-xs font-bold uppercase text-akatech-gold hover:text-akatech-goldDark flex items-center gap-2"
        >
          {identityLoading ? (
            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Icons.RefreshCw size={14} />
          )}
          {identityLoading ? "Syncing..." : "Sync Profile"}
        </button>
      </div>

      {user && (
        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-lg text-sm mb-6 flex items-center gap-3">
          <Icons.Info className="w-5 h-5 flex-shrink-0" />
          <div>
            <span className="font-bold">Identity Verified.</span> Your name and
            email have been locked for security.
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-akatech-card border border-gray-200 dark:border-white/10 rounded-xl p-6 mb-8">
        <label className="block text-xs font-bold uppercase text-gray-500 mb-3">
          Selected Package
        </label>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <div className="font-bold text-lg text-gray-900 dark:text-white">
              {selectedPackage?.name || "No Package Selected"}
            </div>
            <div className="text-akatech-gold font-bold">
              {selectedPackage ? `GH₵ ${selectedPackage.price}` : "-"}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {selectedPackage?.description}
            </div>
          </div>
          <select
            value={selectedPackage?.name || ""}
            onChange={(e) => {
              const pkg = packages.find((p) => p.name === e.target.value);
              if (pkg) onSelectPackage(pkg);
            }}
            className="w-full md:w-auto bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-akatech-gold"
          >
            <option value="" disabled>
              Change Package
            </option>
            {packages.map((pkg) => (
              <option key={pkg.name} value={pkg.name}>
                {pkg.name} - GH₵ {pkg.price}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={!!user?.name}
            className={`w-full bg-white dark:bg-akatech-card border ${
              errors.name
                ? "border-red-500"
                : syncedFields.includes("name")
                ? "border-green-400 bg-green-50 dark:bg-green-900/10"
                : "border-gray-200 dark:border-white/10"
            } rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-akatech-gold disabled:opacity-50 disabled:cursor-not-allowed`}
            placeholder="John Doe"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full bg-white dark:bg-akatech-card border ${
              errors.phone
                ? "border-red-500"
                : syncedFields.includes("phone")
                ? "border-green-400 bg-green-50 dark:bg-green-900/10"
                : "border-gray-200 dark:border-white/10"
            } rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-akatech-gold`}
            placeholder="+233 20 000 0000"
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            disabled={!!user?.email}
            className="w-full bg-white dark:bg-akatech-card border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-akatech-gold disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="john@example.com"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
            Company / Business Name
          </label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            className="w-full bg-white dark:bg-akatech-card border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-akatech-gold"
            placeholder="AkaTech Solutions"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
            Project Description / Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="w-full bg-white dark:bg-akatech-card border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-akatech-gold resize-none"
            placeholder="Tell us about your project requirements..."
          />
        </div>
      </div>
    </div>
  );
};

const StepConfirmation = ({
  formData,
  selectedPackage,
  onConfirm,
  loading,
  error,
}) => {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-4 text-center">
        Review & Confirm
      </h2>

      <div className="bg-white dark:bg-akatech-card border border-gray-200 dark:border-white/10 rounded-xl p-6 space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-white/5">
          <span className="text-gray-500 text-sm">Selected Package</span>
          <span className="font-bold text-gray-900 dark:text-white">
            {selectedPackage?.name}
          </span>
        </div>
        <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-white/5">
          <span className="text-gray-500 text-sm">Price</span>
          <span className="font-bold text-akatech-gold">
            GH₵ {selectedPackage?.price}
          </span>
        </div>
        <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-white/5">
          <span className="text-gray-500 text-sm">Email</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formData.email}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-sm">Contact</span>
          <div className="text-right">
            <div className="font-medium text-gray-900 dark:text-white">
              {formData.name}
            </div>
            <div className="text-xs text-gray-500">{formData.phone}</div>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
        <input
          type="checkbox"
          id="terms"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1"
        />
        <label
          htmlFor="terms"
          className="text-sm text-gray-600 dark:text-gray-300"
        >
          I agree to the{" "}
          <a href="#" className="text-akatech-gold hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-akatech-gold hover:underline">
            Privacy Policy
          </a>
          . I understand that this information will be securely stored and used
          to initiate my project.
        </label>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">
          {error}
        </div>
      )}

      <button
        onClick={onConfirm}
        disabled={!agreed || loading}
        className="w-full bg-akatech-gold text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-akatech-goldDark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Completing Signup..." : "Complete Signup & Pay"}
      </button>
    </div>
  );
};

export const SignupWizard = ({ initialPlan, onBack, onComplete }) => {
  const [step, setStep] = useState(initialPlan ? 2 : 1);
  const [selectedPackage, setSelectedPackage] = useState(initialPlan || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form Data
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
    companyName: "",
    notes: "",
  });

  const [emailVerified, setEmailVerified] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Restore progress from local storage or API if email is entered
  useEffect(() => {
    // Logic to restore could go here
  }, []);

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
    setStep(2);
  };

  const handleEmailVerification = async (action, payload) => {
    setLoading(true);
    try {
      let endpoint;
      if (action === "google") endpoint = "/signup/verify-google";
      else return; // Should not happen

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Verification failed");

      if (action === "google") {
        setEmailVerified(true);
        if (data.email) {
          setFormData((prev) => ({ ...prev, email: data.email }));
        }

        // Try to fetch existing progress
        try {
          const progressRes = await fetch(
            `${API_URL}/signup/progress?email=${data.email || payload.email}`
          );
          if (progressRes.ok) {
            const progressData = await progressRes.json();
            if (progressData.data) {
              setFormData((prev) => ({ ...prev, ...progressData.data }));
              if (progressData.data.selectedPackage) {
                const pkg = PRICING_PACKAGES.find(
                  (p) => p.name === progressData.data.selectedPackage
                );
                if (pkg) setSelectedPackage(pkg);
              }
            }
          }
        } catch (e) {
          console.error("Failed to load progress", e);
        }
        setTimeout(() => setStep(3), 1000);
      }
    } catch (err) {
      console.error("Verification error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async () => {
    if (!formData.email || !emailVerified) return;
    try {
      await fetch(`${API_URL}/signup/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          data: { ...formData, selectedPackage: selectedPackage?.name },
        }),
      });
    } catch (e) {
      console.error("Failed to save progress", e);
    }
  };

  const handleDetailsNext = async () => {
    // Validate
    const errors = {};
    if (!formData.name) errors.name = "Name is required";
    if (!formData.phone) errors.phone = "Phone is required";
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      await saveProgress();
      setStep(4);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/signup/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          finalData: { ...formData, selectedPackage: selectedPackage?.name },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");

      // Save token
      localStorage.setItem("token", data.token);

      if (onComplete) onComplete(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-akatech-dark pt-28 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {["Package", "Sign Up / Log In", "Details", "Confirm"].map(
              (label, idx) => (
                <div
                  key={label}
                  className={`text-xs font-bold uppercase tracking-widest ${
                    step > idx + 1
                      ? "text-green-500"
                      : step === idx + 1
                      ? "text-akatech-gold"
                      : "text-gray-300"
                  }`}
                >
                  {label}
                </div>
              )
            )}
          </div>
          <div className="h-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-akatech-gold"
              initial={{ width: "0%" }}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Back Button */}
        {step > 1 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="mb-6 flex items-center gap-2 text-gray-500 hover:text-akatech-gold transition-colors text-sm font-bold uppercase tracking-wider"
          >
            <span>←</span> Back
          </button>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {step === 1 && (
              <StepPackageSelection
                selectedPackage={selectedPackage}
                onSelect={handlePackageSelect}
              />
            )}
            {step === 2 && (
              <StepSignup
                onVerify={handleEmailVerification}
                loading={loading}
              />
            )}
            {step === 3 && (
              <div>
                <StepDetails
                  formData={formData}
                  setFormData={setFormData}
                  errors={formErrors}
                  user={
                    emailVerified
                      ? { name: formData.name, email: formData.email }
                      : null
                  }
                  packages={PRICING_PACKAGES}
                  selectedPackage={selectedPackage}
                  onSelectPackage={setSelectedPackage}
                />
                <button
                  onClick={handleDetailsNext}
                  className="w-full bg-akatech-gold text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-akatech-goldDark transition-colors mt-8"
                >
                  Continue to Confirmation
                </button>
              </div>
            )}
            {step === 4 && (
              <StepConfirmation
                formData={formData}
                selectedPackage={selectedPackage}
                onConfirm={handleComplete}
                loading={loading}
                error={error}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
