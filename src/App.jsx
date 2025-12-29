import React, { useState, useEffect, Suspense, lazy } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastProvider } from "@components/ui/ToastProvider";
import { SyncStatusProvider } from "@components/ui/SyncStatusProvider";
import { Toaster } from "react-hot-toast";
import { ScrollProgress } from "@components/ui/ScrollProgress";
import { ShowcaseNav } from "@components/ui/ShowcaseNav";
import { Navbar } from "@components/layout/Navbar";
import { Hero } from "@components/sections/Hero";
import { Services } from "@components/sections/Services";
import { Recommendations } from "@components/sections/Recommendations";
import { Pricing } from "@components/sections/Pricing";
import { Contact } from "@components/sections/Contact";
import { Footer } from "@components/layout/Footer";
import { AuthModal } from "@components/ui/AuthModal";
import { FloatingAssistant } from "@components/ui/FloatingAssistant";
import { CookieConsent } from "@components/ui/CookieConsent";
import AdinkraBackground from "@components/ui/AdinkraBackground";
import { useTheme } from "./hooks/useTheme";
import { Analytics } from "@vercel/analytics/react";

// Lazy load pages
const Dashboard = lazy(() =>
  import("./pages/Dashboard").then((module) => ({ default: module.Dashboard }))
);
const About = lazy(() =>
  import("./pages/About").then((module) => ({ default: module.About }))
);
const ComponentsPage = lazy(() =>
  import("./pages/ComponentsPage").then((module) => ({
    default: module.ComponentsPage,
  }))
);
const DocsPage = lazy(() =>
  import("./pages/DocsPage").then((module) => ({ default: module.DocsPage }))
);
const ThemesPage = lazy(() =>
  import("./pages/ThemesPage").then((module) => ({
    default: module.ThemesPage,
  }))
);
const PerformancePage = lazy(() =>
  import("./pages/PerformancePage").then((module) => ({
    default: module.PerformancePage,
  }))
);
const Careers = lazy(() =>
  import("./pages/Careers").then((module) => ({ default: module.Careers }))
);
const PrivacyPolicy = lazy(() =>
  import("./pages/PrivacyPolicy").then((module) => ({
    default: module.PrivacyPolicy,
  }))
);
const CookiePolicy = lazy(() =>
  import("./pages/CookiePolicy").then((module) => ({
    default: module.CookiePolicy,
  }))
);
const TermsOfService = lazy(() =>
  import("./pages/TermsOfService").then((module) => ({
    default: module.TermsOfService,
  }))
);
const PlanCompletion = lazy(() =>
  import("./pages/PlanCompletion").then((module) => ({
    default: module.PlanCompletion,
  }))
);

export default function App() {
  const [view, setView] = useState("landing"); // landing | dashboard | portfolio | plan-completion | careers | privacy | cookie | terms
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const { mode, cycleTheme } = useTheme();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Session expired");
        })
        .then((data) => setUser(data.user))
        .catch(() => {
          localStorage.removeItem("token");
          setUser(null);
        });
    }
  }, []);

  const handleLogin = (email, password) => {
    return fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: email, password }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || errData.message || "Login failed");
        }
        return res.json();
      })
      .then((data) => {
        localStorage.setItem("token", data.token);
        setUser(data.user);
        setAuthModalOpen(false);
        // Correctly route to dashboard for both admin and client
        // The Dashboard component handles the inner routing based on role
        setView("dashboard");
      });
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  const handleLogout = () => {
    setUser(null);
    setView("landing");
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setView("plan-completion");
    window.scrollTo(0, 0);
  };

  const handleNavigate = (newView) => {
    setView(newView);
    window.scrollTo(0, 0);
    if (newView !== "plan-completion") setSelectedPlan(null);
  };

  const handleGoogleLogin = (tokenResponse) => {
    fetch("/api/signup/verify-google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: tokenResponse.access_token }),
    })
      .then(async (res) => {
        if (res.ok) return res.json();
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          errData.error || errData.details || "Google auth failed"
        );
      })
      .then((data) => {
        localStorage.setItem("token", data.token);
        setUser(data.user);
        setAuthModalOpen(false);
        setView("dashboard");
      })
      .catch((err) => {
        console.error("Google Login Error:", err);
      });
  };

  const googleClientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    "336631405778-sngll5qo5a8mo57ifn9ru8ol1m7r7cgs.apps.googleusercontent.com";

  if (!googleClientId) {
    console.error(
      "Critical Error: VITE_GOOGLE_CLIENT_ID is missing in environment variables."
    );
  }

  useEffect(() => {
    if (googleClientId) {
      // Debug log to ensure Client ID is loaded (masked for security)
      console.log(
        "Google Client ID loaded:",
        googleClientId.substring(0, 10) + "..."
      );
    }
  }, [googleClientId]);

  return (
    <GoogleOAuthProvider
      clientId={googleClientId}
      onScriptLoadError={() =>
        console.error("Google Sign-In script failed to load")
      }
    >
      <div className={`min-h-screen ${mode} transition-colors duration-300`}>
        <Analytics />
        <ToastProvider>
          <SyncStatusProvider>
            <div className="bg-white dark:bg-akatech-black text-gray-900 dark:text-white min-h-screen transition-colors duration-300">
              {/* <AdinkraBackground /> */}
              <img
                src="/background-accent.jpg"
                alt=""
                className="fixed bottom-0 left-0 pointer-events-none w-[300px] md:w-[500px] opacity-100 z-0"
              />
              {view === "landing" && <ScrollProgress />}
              {view !== "dashboard" && (
                <Navbar
                  toggleAuth={() =>
                    view === "dashboard"
                      ? setView("landing")
                      : user
                      ? setView("dashboard")
                      : setAuthModalOpen(true)
                  }
                  isLoggedIn={!!user}
                  user={user}
                  mode={mode}
                  cycleTheme={cycleTheme}
                  onViewChange={handleNavigate}
                />
              )}
              {view === "landing" && (
                <>
                  <Hero />
                  <Services />
                  <Recommendations />
                  <Pricing onSelectPlan={handleSelectPlan} />
                  <Contact />
                </>
              )}
              <Suspense
                fallback={
                  <div className="min-h-screen flex items-center justify-center bg-white dark:bg-akatech-dark">
                    <div className="w-12 h-12 border-4 border-akatech-gold border-t-transparent rounded-full animate-spin"></div>
                  </div>
                }
              >
                {view === "dashboard" && user && (
                  <Dashboard
                    user={user}
                    onLogout={handleLogout}
                    onUserUpdate={handleUserUpdate}
                  />
                )}

                {view === "about" && <About />}
                {view === "components" && <ComponentsPage />}
                {view === "docs" && <DocsPage />}
                {view === "themes" && (
                  <ThemesPage mode={mode} cycleTheme={cycleTheme} />
                )}
                {view === "performance" && <PerformancePage />}

                {view === "careers" && (
                  <Careers onHome={() => handleNavigate("landing")} />
                )}

                {view === "privacy" && (
                  <PrivacyPolicy onHome={() => handleNavigate("landing")} />
                )}

                {view === "cookie" && (
                  <CookiePolicy onHome={() => handleNavigate("landing")} />
                )}

                {view === "terms" && (
                  <TermsOfService onHome={() => handleNavigate("landing")} />
                )}

                {view === "plan-completion" && selectedPlan && (
                  <PlanCompletion
                    plan={selectedPlan}
                    onBack={() => handleNavigate("landing")}
                    onNavigate={handleNavigate}
                    onUserUpdate={handleUserUpdate}
                  />
                )}
              </Suspense>
              <Footer onNavigate={handleNavigate} />
              {view === "landing" && (
                <Suspense fallback={null}>
                  <FloatingAssistant />
                </Suspense>
              )}
              <CookieConsent />
              <AuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                onLogin={handleLogin}
                onGoogleLogin={handleGoogleLogin}
              />
              <Toaster position="top-center" />
            </div>
          </SyncStatusProvider>
        </ToastProvider>
      </div>
    </GoogleOAuthProvider>
  );
}
