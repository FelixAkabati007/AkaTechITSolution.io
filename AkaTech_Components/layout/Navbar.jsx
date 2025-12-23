import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icons } from "@components/ui/Icons";
import { Logo } from "@components/ui/Logo";
import { Avatar } from "@components/ui/Avatar";
import { SearchButton } from "@components/ui/SearchButton";
import { Button } from "@components/ui/Button";
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
 * @param {string} props.user.avatarUrl - URL to user's avatar image.
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
    if (target === "about") {
      onViewChange("about");
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center relative">
        <div
          onClick={() => handleNav("landing")}
          className="flex items-center gap-2 md:gap-4 group cursor-pointer transition-all duration-500"
        >
          <Logo className="w-10 h-10 md:w-16 md:h-16 drop-shadow-[0_0_10px_rgba(197,160,89,0.3)] group-hover:drop-shadow-[0_0_15px_rgba(197,160,89,0.5)] transition-all duration-500" />
          <div className="hidden md:flex flex-col">
            <span
              className={`text-lg md:text-xl font-serif font-bold tracking-wide leading-none transition-colors duration-500 group-hover:text-akatech-gold whitespace-nowrap ${
                isScrolled
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-900 dark:text-gray-900"
              }`}
            >
              AKATECH
            </span>
            <span className="text-[9px] md:text-[10px] tracking-[0.3em] text-akatech-gold font-bold uppercase mt-1 whitespace-nowrap">
              IT Solutions
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-2 lg:space-x-6">
          <SearchButton
            onSearch={(q) => console.log("Searching:", q)}
            className="mr-2"
          />

          {["Services", "About", "Pricing"].map((item) => (
            <button
              key={item}
              onClick={() => handleNav(item.toLowerCase())}
              className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-akatech-gold dark:text-gray-400 dark:hover:text-akatech-gold transition-colors duration-300 relative group px-2 py-1"
            >
              {item}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-akatech-gold transition-all duration-300 group-hover:w-full"></span>
            </button>
          ))}
          <button
            onClick={() => handleNav("contact")}
            className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-akatech-gold dark:text-gray-400 dark:hover:text-akatech-gold transition-colors duration-300 px-2 py-1"
          >
            Contact
          </button>

          <div className="w-px h-6 bg-gray-300 dark:bg-white/10 mx-2" />

          <button
            onClick={cycleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-akatech-gold transition-colors duration-300 flex items-center gap-2 group relative"
            title={`Current: ${getThemeLabel()}. Click to cycle.`}
            aria-label={`Current theme is ${getThemeLabel()}. Click to switch theme.`}
          >
            {getThemeIcon()}
          </button>

          {isLoggedIn ? (
            <div className="flex items-center gap-3 ml-2">
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
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAuth}
              className="ml-2 !py-2 !px-4"
            >
              Client Login
            </Button>
          )}
        </div>

        <div className="md:hidden flex items-center gap-2">
          <SearchButton onSearch={(q) => console.log("Searching:", q)} />
          <button
            onClick={cycleTheme}
            className="text-gray-600 dark:text-akatech-gold p-3 min-w-[48px] min-h-[48px] flex items-center justify-center"
            aria-label={`Current theme is ${getThemeLabel()}. Click to switch theme.`}
          >
            {getThemeIcon()}
          </button>
          <button
            className="text-akatech-gold p-3 min-w-[48px] min-h-[48px] flex items-center justify-center"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileOpen ? <Icons.X size={24} /> : <Icons.Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-akatech-card border-b border-gray-200 dark:border-akatech-gold/20 overflow-hidden shadow-xl"
          >
            <div className="flex flex-col p-6 space-y-2">
              <button
                onClick={() => handleNav("services")}
                className="text-left text-gray-600 dark:text-gray-300 text-sm uppercase tracking-widest py-4 border-b border-gray-100 dark:border-white/5 active:bg-gray-50 dark:active:bg-white/5 transition-colors"
              >
                Services
              </button>
              <button
                onClick={() => handleNav("about")}
                className="text-left text-gray-600 dark:text-gray-300 text-sm uppercase tracking-widest py-4 border-b border-gray-100 dark:border-white/5 active:bg-gray-50 dark:active:bg-white/5 transition-colors"
              >
                About
              </button>
              <button
                onClick={() => handleNav("pricing")}
                className="text-left text-gray-600 dark:text-gray-300 text-sm uppercase tracking-widest py-4 border-b border-gray-100 dark:border-white/5 active:bg-gray-50 dark:active:bg-white/5 transition-colors"
              >
                Pricing
              </button>
              <div className="flex items-center justify-between border-t border-gray-200 dark:border-white/10 pt-6 mt-4">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  Theme: {getThemeLabel()}
                </span>
                <button
                  onClick={cycleTheme}
                  className="text-akatech-gold p-3 min-w-[44px] min-h-[44px] border border-akatech-gold/30 rounded flex items-center justify-center"
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
    avatarUrl: PropTypes.string,
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
