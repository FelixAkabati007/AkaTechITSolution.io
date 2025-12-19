import React, { useState, Suspense, lazy } from "react";
import { ToastProvider } from "@components/ui/ToastProvider";
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

// Lazy load pages
const Dashboard = lazy(() =>
  import("./pages/Dashboard").then((module) => ({ default: module.Dashboard }))
);
const Portfolio = lazy(() =>
  import("./pages/Portfolio").then((module) => ({ default: module.Portfolio }))
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

  const handleLogin = (email, password) => {
    // Check for specific admin credentials or legacy admin email pattern
    const isAdmin =
      (email === "JohnDoe@gmail.com" && password === "qwerty12345") ||
      email.includes("admin");

    const mockUser = {
      name: email.split("@")[0],
      email: email,
      avatarUrl: "https://via.placeholder.com/40",
      isAdmin: isAdmin,
    };
    setUser(mockUser);
    setAuthModalOpen(false);
    setView("dashboard");
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

  return (
    <ToastProvider>
      <div className="font-sans antialiased relative">
        {/* Global Background Decoration */}
        <img
          src="/background-accent.jpg"
          alt=""
          aria-hidden="true"
          className="fixed bottom-0 left-0 w-[150px] md:w-[250px] lg:w-[350px] opacity-50 z-[5] pointer-events-none transition-all duration-500 ease-in-out mix-blend-multiply dark:mix-blend-screen select-none"
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

          {view === "portfolio" && <Portfolio />}
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
              onHome={() => handleNavigate("landing")}
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
        />
      </div>
    </ToastProvider>
  );
}
