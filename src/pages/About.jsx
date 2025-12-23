import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Icons } from "@components/ui/Icons";
import { PORTFOLIO_DATA } from "../lib/data";
import { mockService } from "../lib/mockData";

export const About = () => {
  const [locked, setLocked] = useState({});
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [syncError, setSyncError] = useState(null);

  useEffect(() => {
    const checkSubscriptionStatus = () => {
      try {
        const subscriptions = mockService.getSubscriptions();
        const active = subscriptions.some((sub) => sub.status === "active");
        setHasActiveSubscription(active);
        setSyncError(null);
      } catch (error) {
        console.error("Failed to sync subscription status:", error);
        setSyncError("Sync failed");
      }
    };

    // Initial check
    checkSubscriptionStatus();

    // Listen for updates
    const handleSubscriptionUpdate = () => {
      checkSubscriptionStatus();
    };

    window.addEventListener("subscriptionUpdated", handleSubscriptionUpdate);

    // Also listen for storage changes in case of multi-tab
    window.addEventListener("storage", handleSubscriptionUpdate);

    return () => {
      window.removeEventListener(
        "subscriptionUpdated",
        handleSubscriptionUpdate
      );
      window.removeEventListener("storage", handleSubscriptionUpdate);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-akatech-dark pt-28 pb-12 transition-colors duration-500">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-akatech-card rounded-2xl p-6 md:p-12 shadow-sm border border-gray-200 dark:border-white/5 mb-12 flex flex-col md:flex-row gap-8 items-center md:items-start"
        >
          <div className="w-32 h-32 md:w-48 md:h-48 shrink-0 rounded-full overflow-hidden border-4 border-akatech-gold/20 relative">
            <img
              src="/felix-akabati.webp"
              alt="Felix Akabati"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-2">
              {PORTFOLIO_DATA.profile.name}
            </h1>
            <p className="text-akatech-gold font-bold uppercase tracking-widest text-xs md:text-sm mb-6">
              {PORTFOLIO_DATA.profile.title}
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 max-w-2xl text-sm md:text-base">
              {PORTFOLIO_DATA.profile.bio}
            </p>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start text-xs md:text-sm text-gray-500 dark:text-gray-400 font-mono">
              <span className="flex items-center gap-2">
                <Icons.Users size={16} /> {PORTFOLIO_DATA.profile.location}
              </span>
              <span className="flex items-center gap-2">
                <Icons.Mail size={16} /> {PORTFOLIO_DATA.profile.email}
              </span>
              <span className="flex items-center gap-2">
                <Icons.Smartphone size={16} /> {PORTFOLIO_DATA.profile.phone}
              </span>
            </div>

            <div className="mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
              <button className="bg-gold-gradient text-black font-bold px-6 py-3 rounded-none uppercase tracking-widest text-xs hover:shadow-lg transition-all">
                Contact Me
              </button>
            </div>
          </div>
        </motion.div>

        {/* Skills Section */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl md:text-3xl font-serif text-gray-900 dark:text-white">
              Technical Skills
            </h2>
            <div className="h-[1px] bg-gray-200 dark:bg-white/10 flex-1"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PORTFOLIO_DATA.skills.map((skillGroup, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-akatech-card p-6 border border-gray-200 dark:border-white/5 hover:border-akatech-gold/30 transition-all rounded-lg"
              >
                <h3 className="text-akatech-gold font-bold uppercase tracking-wider text-xs mb-4">
                  {skillGroup.category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skillGroup.items.map((item, i) => (
                    <span
                      key={i}
                      className="bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 px-3 py-1 text-sm rounded-full border border-gray-200 dark:border-transparent"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl md:text-3xl font-serif text-gray-900 dark:text-white">
              Featured Projects
            </h2>
            <div className="h-[1px] bg-gray-200 dark:bg-white/10 flex-1"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {PORTFOLIO_DATA.projects.map((project, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="group bg-white dark:bg-akatech-card border border-gray-200 dark:border-white/5 overflow-hidden hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-300"
              >
                <div className="h-48 overflow-hidden relative">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                  <img
                    loading="lazy"
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-akatech-gold transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed line-clamp-2">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.tags.map((tag, t) => (
                      <span
                        key={t}
                        className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-500 tracking-wider"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() =>
                      setLocked((prev) => ({ ...prev, [idx]: !prev[idx] }))
                    }
                    className="text-akatech-gold text-xs font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2"
                  >
                    {locked[idx] ? (
                      <>
                        Locked <Icons.Lock className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        View Project <span className="text-lg">→</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Experience & Education */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-2xl font-serif text-gray-900 dark:text-white">
                Experience
              </h2>
              <div className="h-[1px] bg-gray-200 dark:bg-white/10 flex-1"></div>
            </div>
            <div className="space-y-8 border-l border-gray-200 dark:border-white/10 pl-8 ml-2">
              {PORTFOLIO_DATA.experience.map((exp, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[37px] top-1.5 w-4 h-4 rounded-full border-4 border-gray-50 dark:border-akatech-dark bg-akatech-gold"></div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                    {exp.role}
                  </h4>
                  <div className="text-akatech-gold text-xs uppercase font-bold tracking-wider mb-2">
                    {exp.company} | {exp.period}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-2xl font-serif text-gray-900 dark:text-white">
                Education
              </h2>
              <div className="h-[1px] bg-gray-200 dark:bg-white/10 flex-1"></div>
            </div>
            <div className="space-y-8 border-l border-gray-200 dark:border-white/10 pl-8 ml-2">
              {PORTFOLIO_DATA.education.map((edu, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[37px] top-1.5 w-4 h-4 rounded-full border-4 border-gray-50 dark:border-akatech-dark bg-gray-400 dark:bg-gray-600"></div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                    {edu.degree}
                  </h4>
                  <div className="text-akatech-gold text-xs uppercase font-bold tracking-wider mb-2">
                    {edu.school}
                  </div>
                  <p className="text-gray-500 dark:text-gray-500 text-xs font-mono">
                    {edu.period === "2023" && hasActiveSubscription
                      ? "Present"
                      : edu.period}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
