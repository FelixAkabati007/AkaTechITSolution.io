import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icons } from "@components/ui/Icons";
import { WEBSITE_SAMPLES } from "@lib/data";

/**
 * Hero section component showcasing the brand's value proposition and sample works.
 * Features an auto-rotating showcase of website samples and animated floating elements.
 *
 * @component
 */
export const Hero = () => {
  const [currentSample, setCurrentSample] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSample((prev) => (prev + 1) % WEBSITE_SAMPLES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-12 overflow-hidden bg-hero-glow-light dark:bg-hero-glow transition-colors duration-300">
      <div
        className="absolute inset-0 z-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(#C5A059 1px, transparent 1px), linear-gradient(90deg, #C5A059 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      ></div>

      <div className="container mx-auto px-4 relative z-10 grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-left"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-[1px] w-16 bg-gradient-to-r from-akatech-gold to-transparent"></div>
            <span className="text-akatech-gold text-xs font-bold tracking-[0.3em] uppercase">
              Est. 2023 | Ghana
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-5xl lg:text-7xl font-serif font-bold leading-[1.1] mb-6 text-black transition-colors duration-300">
            Digital <br />
            <span className="gold-text-clip">Excellence</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg mb-10 max-w-lg font-light leading-relaxed border-l-2 border-akatech-gold/30 pl-6 transition-colors duration-300">
            <strong className="font-bold text-black">
              AkaTech IT Solutions
            </strong>{" "}
            engineers premium software architectures, blending elegance with
            high-performance computing for visionary businesses.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="#pricing" className="btn-primary">
              View Packages
            </a>
            <a href="#contact" className="btn-outline">
              Our Work
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative flex justify-center h-[500px] md:h-[650px] items-center scale-[0.85] sm:scale-100 transition-transform duration-300 mt-8 md:mt-0"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="hidden md:flex absolute top-10 -left-4 md:-left-16 z-10 p-4 rounded-2xl shadow-2xl items-center gap-4 border border-gray-200/50 dark:border-white/10 backdrop-blur-xl bg-gradient-to-br from-white/80 to-white/40 dark:from-white/10 dark:to-transparent group transition-all duration-300"
          >
            <div className="w-12 h-12 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <img
                src="https://static.vecteezy.com/system/resources/thumbnails/047/247/457/small_2x/3d-code-icon-programming-code-symbols-software-and-web-development-icon-png.png"
                alt="Code"
                loading="lazy"
                className="w-full h-full object-contain drop-shadow-lg transform group-hover:rotate-12 transition-transform duration-500"
              />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-bold text-gray-900 dark:text-white tracking-wide">
                Clean Code
              </div>
              <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                React & Next.js
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            whileHover={{ scale: 1.05 }}
            className="hidden md:flex absolute top-1/2 -right-4 md:-right-16 z-10 p-4 rounded-2xl shadow-[0_10px_40px_-10px_rgba(197,160,89,0.3)] items-center gap-4 border border-akatech-gold/30 bg-white/90 dark:bg-[#0a0a0a]/80 backdrop-blur-md group"
          >
            <div className="w-12 h-12 rounded-full border border-akatech-gold/30 p-0.5 relative overflow-hidden group-hover:border-akatech-gold transition-colors duration-500">
              <div className="absolute inset-0 bg-akatech-gold/10 animate-pulse"></div>
              <img
                src="/analytics-3d.jpg"
                alt="Analytics"
                loading="lazy"
                className="w-full h-full rounded-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
              />
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-serif font-bold text-gray-900 dark:text-white mb-0.5">
                Analytics
              </div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest">
                Real-time Data
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
            whileHover={{ scale: 1.05 }}
            className="hidden md:flex absolute bottom-20 -left-6 md:-left-20 z-10 p-4 rounded-2xl shadow-2xl items-center gap-4 border border-gray-200/50 dark:border-white/20 bg-white/80 dark:bg-white/10 backdrop-blur-2xl group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="w-12 h-12 flex items-center justify-center relative z-10">
              <img
                src="/ui-ux-3d.png"
                alt="UI/UX"
                loading="lazy"
                className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] transform group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="hidden sm:block relative z-10">
              <div className="text-sm font-bold text-gray-900 dark:text-white tracking-wide">
                UI Design
              </div>
              <div className="text-[10px] text-gray-500 font-light tracking-wider">
                Pixel Perfect
              </div>
            </div>
          </motion.div>

          <div className="relative w-[280px] h-[580px] md:w-[320px] md:h-[650px] bg-black rounded-[55px] device-frame z-20 shadow-2xl overflow-hidden transition-all duration-500">
            <div className="absolute top-24 -left-[2px] w-[3px] h-8 bg-gray-700 rounded-l-md"></div>
            <div className="absolute top-36 -left-[2px] w-[3px] h-16 bg-gray-700 rounded-l-md"></div>
            <div className="absolute top-28 -right-[2px] w-[3px] h-20 bg-gray-700 rounded-r-md"></div>

            <div className="absolute top-0 left-0 right-0 h-full w-full rounded-[48px] border-[8px] border-black overflow-hidden bg-black">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-9 bg-black rounded-full z-50 flex items-center justify-center gap-4 pointer-events-none">
                <div className="w-2 h-2 rounded-full bg-[#1a1a1a]/80"></div>
              </div>

              <div className="w-full h-full relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSample}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full h-full bg-white dark:bg-akatech-dark"
                  >
                    {WEBSITE_SAMPLES[currentSample].content}
                  </motion.div>
                </AnimatePresence>

                <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/10 to-transparent z-40 rounded-[40px] opacity-50"></div>

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-50">
                  {WEBSITE_SAMPLES.map((_, idx) => (
                    <div
                      key={idx}
                      onClick={() => setCurrentSample(idx)}
                      className={`w-1.5 h-1.5 rounded-full cursor-pointer transition-all shadow-sm ${
                        idx === currentSample ? "bg-white w-4" : "bg-white/50"
                      }`}
                    ></div>
                  ))}
                </div>

                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/50 rounded-full z-50"></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-akatech-gold/50">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        >
          <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
        </svg>
      </div>
    </section>
  );
};
