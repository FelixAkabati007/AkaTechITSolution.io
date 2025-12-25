import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGoogleLogin } from "@react-oauth/google";
import { Icons } from "@components/ui/Icons";
import { Logo } from "@components/ui/Logo";
import { useToast } from "@components/ui/ToastProvider";

export const AuthModal = ({
  isOpen,
  onClose,
  onLogin,
  onSignup,
  onGoogleLogin,
}) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { addToast } = useToast();
  const modalRef = useRef(null);

  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      if (onGoogleLogin) {
        onGoogleLogin(tokenResponse);
        addToast("Signed in with Google", "success");
      }
    },
    onError: () => addToast("Google Sign In Failed", "error"),
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Focus Trap
  useEffect(() => {
    if (!isOpen) return;

    const handleTabKey = (e) => {
      if (e.key !== "Tab") return;

      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTabKey);
    return () => document.removeEventListener("keydown", handleTabKey);
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLoginView) {
        await onLogin(email, password);
        addToast(`Welcome back!`, "success");
      } else {
        // Signup with email is disabled/removed as per requirements
        // onSignup(email, password);
        addToast("Please use Google to Sign Up.", "info");
      }
    } catch (error) {
      console.error(error);
      addToast(error.message || "Authentication failed", "error");
    }
  };

  const handleBackdropClick = (e) => {
    // Close if clicked element is NOT interactive
    // Interactive elements: button, input, textarea, select, a, elements with tabindex, or labels
    const isInteractive = e.target.closest(
      "button, input, textarea, select, a, [tabindex], label"
    );

    if (!isInteractive) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 dark:bg-black/90 backdrop-blur-md p-4"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md p-10 relative max-h-[90vh] overflow-y-auto no-scrollbar bg-gradient-to-br from-white via-[#fffbf2] to-[#f5ebd6] dark:from-akatech-card dark:via-[#1c1c1c] dark:to-[#2c2414] border border-akatech-gold/30 dark:border-akatech-gold/50 shadow-[0_20px_50px_-12px_rgba(197,160,89,0.3)] dark:shadow-[0_0_60px_-15px_rgba(197,160,89,0.25)] transition-all duration-500 hover:shadow-[0_25px_60px_-12px_rgba(197,160,89,0.4)] dark:hover:shadow-[0_0_70px_-10px_rgba(197,160,89,0.35)]"
            ref={modalRef}
          >
            <button
              onClick={(e) => {
                e.stopPropagation(); // Explicit close button should definitely work
                onClose();
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-black dark:hover:text-white transition z-10"
              aria-label="Close modal"
            >
              <Icons.X />
            </button>

            <div className="text-center mb-10">
              <Logo className="w-24 h-24 mx-auto mb-4" />
              <h2
                id="modal-title"
                className="text-2xl md:text-3xl font-serif text-gray-900 dark:text-white mb-2 transition-colors duration-500"
              >
                {isLoginView ? "Welcome Back" : "Join AkaTech"}
              </h2>
              <p className="text-akatech-gold text-xs uppercase tracking-widest">
                Access your premium dashboard
              </p>
            </div>

            <button
              onClick={() => googleLogin()}
              className="w-full bg-gray-50 dark:bg-white text-black py-3 mb-6 flex items-center justify-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-200 transition border border-gray-200 dark:border-transparent"
            >
              <Icons.Google className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">
                {isLoginView ? "Sign in with Google" : "Sign up with Google"}
              </span>
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="h-[1px] bg-gray-200 dark:bg-white/10 flex-1"></div>
              <span className="text-gray-400 dark:text-gray-600 text-[10px] uppercase">
                Or
              </span>
              <div className="h-[1px] bg-gray-200 dark:bg-white/10 flex-1"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isLoginView ? (
                <>
                  <div>
                    <label className="block text-[10px] text-akatech-gold uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-akatech-dark border border-gray-300 dark:border-white/10 p-3 text-gray-900 dark:text-white focus:border-akatech-gold outline-none transition-colors"
                      placeholder="name@company.com"
                      required
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-akatech-gold uppercase tracking-wider mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-akatech-dark border border-gray-300 dark:border-white/10 p-3 text-gray-900 dark:text-white focus:border-akatech-gold outline-none transition-colors"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gold-gradient text-black py-3 text-xs font-bold uppercase tracking-widest hover:opacity-90 transition shadow-lg mt-4"
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Secure account creation is now exclusively via Google.
                  </p>
                </div>
              )}
            </form>

            <div className="mt-8 text-center border-t border-gray-100 dark:border-white/5 pt-4 transition-colors duration-500">
              <button
                onClick={() => setIsLoginView(!isLoginView)}
                className="text-gray-500 text-xs hover:text-akatech-gold transition"
              >
                {isLoginView
                  ? "New to AkaTech? Request Access"
                  : "Already a member? Sign In"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
