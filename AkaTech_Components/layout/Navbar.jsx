import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icons } from "@components/ui/Icons";
import { Logo } from "@components/ui/Logo";
import PropTypes from "prop-types";

/**
 * Navbar component that handles navigation, authentication state display, and theme toggling.
 *
 * @component
 * @param {Object} props
 * @param {Function} props.toggleAuth - Function to toggle the authentication modal.
 * @param {boolean} props.isLoggedIn - Current authentication status.
 * @param {Object} props.user - Current user object.
 * @param {string} props.user.name - User's name.
 * @param {string} props.user.avatar - URL to user's avatar image.
 * @param {string} props.mode - Current theme mode ('light', 'dark', 'system').
 * @param {Function} props.cycleTheme - Function to cycle through theme modes.
 * @param {Function} props.onViewChange - Function to handle view changes (routing).
 */
export const Navbar = ({
  toggleAuth,
  isLoggedIn,
  user,
  mode,
  cycleTheme,
  onViewChange,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNav = (target) => {
    if (target === "portfolio") {
      onViewChange("portfolio");
      window.scrollTo(0, 0);
    } else {
      onViewChange("landing");
      setTimeout(() => {
        const element = document.getElementById(target);
        if (element) element.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
    setMobileOpen(false);
  };

  const getThemeIcon = () => {
    switch (mode) {
      case "light":
        return <Icons.Sun size={20} />;
      case "dark":
        return <Icons.Moon size={20} />;
      default:
        return <Icons.Monitor size={20} />;
    }
  };

  const getThemeLabel = () => {
    switch (mode) {
      case "light":
        return "Light Mode";
      case "dark":
        return "Dark Mode";
      default:
        return "System/Auto";
    }
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 dark:bg-akatech-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-akatech-gold/20 py-4 shadow-lg dark:shadow-none"
          : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto flex justify-between items-center">
        <div
          onClick={() => handleNav("landing")}
          className="flex items-center gap-4 group cursor-pointer"
        >
          <Logo className="w-14 h-14 md:w-20 md:h-20 drop-shadow-lg transition-all duration-500 group-hover:scale-110" />
          <div className="flex flex-col">
            <span className="text-lg md:text-xl font-serif font-bold tracking-wide text-gray-900 dark:text-white leading-none transition-colors duration-500 group-hover:text-akatech-gold">
              AKATECH
            </span>
            <span className="text-[9px] md:text-[10px] tracking-[0.3em] text-akatech-gold font-bold uppercase mt-1">
              IT Solutions
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          {["Services", "Portfolio", "Pricing"].map((item) => (
            <button
              key={item}
              onClick={() => handleNav(item.toLowerCase())}
              className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-akatech-gold dark:text-gray-400 dark:hover:text-akatech-gold transition-colors duration-300 relative group"
            >
              {item}
              <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-akatech-gold transition-all duration-300 group-hover:w-full"></span>
            </button>
          ))}
          <button
            onClick={() => handleNav("contact")}
            className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-akatech-gold dark:text-gray-400 dark:hover:text-akatech-gold transition-colors duration-300"
          >
            Contact
          </button>

          <button
            onClick={cycleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-akatech-gold transition-colors duration-300 flex items-center gap-2 group relative"
            title={`Current: ${getThemeLabel()}. Click to cycle.`}
            aria-label={`Current theme is ${getThemeLabel()}. Click to switch theme.`}
          >
            {getThemeIcon()}
            <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {getThemeLabel()}
            </span>
          </button>

          {isLoggedIn ? (
            <div className="flex items-center gap-3 ml-4 pl-6 border-l border-gray-300 dark:border-white/10">
              <button
                onClick={toggleAuth}
                className="flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded bg-gradient-to-br from-akatech-gold to-akatech-goldDark flex items-center justify-center text-black font-bold text-xs ring-2 ring-transparent group-hover:ring-akatech-goldLight transition-all">
                  {user?.name?.[0] || "U"}
                </div>
              </button>
            </div>
          ) : (
            <button
              onClick={toggleAuth}
              className="ml-4 bg-transparent border border-akatech-gold text-akatech-gold px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-akatech-gold hover:text-black transition-all duration-300"
            >
              Client Login
            </button>
          )}
        </div>

        <div className="md:hidden flex items-center gap-4">
          <button
            onClick={cycleTheme}
            className="text-gray-600 dark:text-akatech-gold p-2"
            aria-label={`Current theme is ${getThemeLabel()}. Click to switch theme.`}
          >
            {getThemeIcon()}
          </button>
          <button
            className="text-akatech-gold"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <Icons.X /> : <Icons.Menu />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-akatech-card border-b border-gray-200 dark:border-akatech-gold/20 overflow-hidden"
          >
            <div className="flex flex-col p-6 space-y-6">
              <button
                onClick={() => handleNav("services")}
                className="text-left text-gray-600 dark:text-gray-300 text-sm uppercase tracking-widest py-2"
              >
                Services
              </button>
              <button
                onClick={() => handleNav("portfolio")}
                className="text-left text-gray-600 dark:text-gray-300 text-sm uppercase tracking-widest py-2"
              >
                Portfolio
              </button>
              <button
                onClick={() => handleNav("pricing")}
                className="text-left text-gray-600 dark:text-gray-300 text-sm uppercase tracking-widest py-2"
              >
                Pricing
              </button>
              <div className="flex items-center justify-between border-t border-gray-200 dark:border-white/10 pt-4">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  Theme: {getThemeLabel()}
                </span>
                <button
                  onClick={cycleTheme}
                  className="text-akatech-gold p-2 border border-akatech-gold/30 rounded"
                >
                  {getThemeIcon()}
                </button>
              </div>
              <button
                onClick={() => {
                  toggleAuth();
                  setMobileOpen(false);
                }}
                className="text-akatech-gold font-bold text-left text-sm uppercase tracking-widest"
              >
                {isLoggedIn ? "Go to Dashboard" : "Client Login"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

Navbar.propTypes = {
  toggleAuth: PropTypes.func.isRequired,
  isLoggedIn: PropTypes.bool,
  user: PropTypes.shape({
    name: PropTypes.string,
    avatar: PropTypes.string,
  }),
  mode: PropTypes.oneOf(["light", "dark", "system"]),
  cycleTheme: PropTypes.func.isRequired,
  onViewChange: PropTypes.func.isRequired,
};

Navbar.defaultProps = {
  isLoggedIn: false,
  user: null,
  mode: "system",
};
