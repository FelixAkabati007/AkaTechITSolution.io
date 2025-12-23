import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader, X, AlertCircle, History } from "lucide-react";
import PropTypes from "prop-types";
import { useDebounce } from "@hooks/useDebounce";

/**
 * SearchButton component providing a luxury, responsive search experience.
 *
 * Features:
 * - Expandable search input with animation
 * - Debounced search execution (300ms)
 * - Input validation (minimum characters)
 * - Loading state indication
 * - Recent searches persistence
 * - Accessibility support (ARIA)
 * - Keyboard navigation
 *
 * @component
 * @param {Object} props
 * @param {Function} props.onSearch - Callback function triggered on search (debounced or manual). Receives (query, type).
 * @param {string} [props.className] - Additional CSS classes.
 * @param {string} [props.placeholder="Search..."] - Input placeholder text.
 * @param {number} [props.minChars=2] - Minimum characters required to trigger search.
 * @param {Array} [props.results] - Array of search results to display in a dropdown (optional).
 * @param {boolean} [props.autoSearch=true] - Whether to trigger search automatically after debounce.
 */
export const SearchButton = ({
  onSearch,
  className = "",
  placeholder = "Search...",
  minChars = 2,
  results = [],
  autoSearch = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  const debouncedQuery = useDebounce(query, 300);

  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Load state from sessionStorage on mount
  useEffect(() => {
    const savedQuery = sessionStorage.getItem("akatech_search_query");
    if (savedQuery) setQuery(savedQuery);

    const savedRecent = localStorage.getItem("akatech_recent_searches");
    if (savedRecent) {
      try {
        setRecentSearches(JSON.parse(savedRecent));
      } catch (e) {
        console.error("Failed to parse recent searches", e);
      }
    }
  }, []);

  // Save query to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("akatech_search_query", query);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle auto-search via debounce
  useEffect(() => {
    if (autoSearch && debouncedQuery.trim().length >= minChars) {
      handleSearch(debouncedQuery, "auto");
    }
  }, [debouncedQuery]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setError("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const validate = (val) => {
    if (!val.trim()) {
      setError("Please enter a search term.");
      return false;
    }
    if (val.trim().length < minChars) {
      setError(`Please enter at least ${minChars} characters.`);
      return false;
    }
    setError("");
    return true;
  };

  const handleSearch = async (searchQuery, type = "manual") => {
    if (!validate(searchQuery)) return;

    setIsSearching(true);

    // Add to recent searches if manual or distinct
    if (type === "manual" && !recentSearches.includes(searchQuery)) {
      const newRecent = [searchQuery, ...recentSearches].slice(0, 5);
      setRecentSearches(newRecent);
      localStorage.setItem(
        "akatech_recent_searches",
        JSON.stringify(newRecent)
      );
    }

    if (onSearch) {
      await onSearch(searchQuery);
    }

    // Simulate delay if no promise returned (UX feedback)
    if (!onSearch?.then) {
      await new Promise((r) => setTimeout(r, 500));
    }

    setIsSearching(false);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    handleSearch(query, "manual");
  };

  const handleClear = () => {
    setQuery("");
    setError("");
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center ${className}`}
    >
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-akatech-gold dark:hover:text-akatech-gold transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-white/5"
            aria-label="Open search"
            aria-expanded="false"
          >
            <Search className="w-5 h-5" />
          </motion.button>
        ) : (
          <motion.form
            initial={{ width: 40, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onSubmit={handleManualSubmit}
            className="flex items-center relative"
            role="search"
            aria-label="Site search"
          >
            <div className="relative w-full">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (error) validate(e.target.value);
                }}
                placeholder={placeholder}
                className={`w-full h-10 pl-10 pr-10 bg-white/10 dark:bg-black/20 backdrop-blur-md border rounded-full text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-all shadow-lg ${
                  error
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/50"
                    : "border-gray-200 dark:border-akatech-gold/30 focus:border-akatech-gold focus:ring-akatech-gold/50"
                }`}
                aria-invalid={!!error}
                aria-errormessage={error ? "search-error" : undefined}
              />

              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {isSearching ? (
                  <Loader className="w-4 h-4 text-akatech-gold animate-spin" />
                ) : query ? (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                ) : null}
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-12 left-0 w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2 flex items-center gap-2 text-xs text-red-600 dark:text-red-400 shadow-lg z-50"
                  id="search-error"
                  role="alert"
                >
                  <AlertCircle className="w-3 h-3" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Recent Searches / Results Dropdown */}
            <AnimatePresence>
              {isOpen &&
                !error &&
                !isSearching &&
                (recentSearches.length > 0 || results.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-12 left-0 w-full bg-white dark:bg-akatech-card border border-gray-200 dark:border-akatech-gold/20 rounded-lg shadow-xl overflow-hidden z-40"
                  >
                    {results.length > 0 ? (
                      <div className="py-2">
                        <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                          Results
                        </div>
                        {results.map((result, idx) => (
                          <button
                            key={idx}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors truncate"
                            onClick={() => {
                              setQuery(result.title || result);
                              handleSearch(result.title || result, "manual");
                            }}
                          >
                            {result.title || result}
                          </button>
                        ))}
                      </div>
                    ) : (
                      recentSearches.length > 0 &&
                      !query && (
                        <div className="py-2">
                          <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-gray-400 font-bold flex items-center gap-1">
                            <History className="w-3 h-3" /> Recent
                          </div>
                          {recentSearches.map((term, idx) => (
                            <button
                              key={idx}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors truncate"
                              onClick={() => {
                                setQuery(term);
                                handleSearch(term, "manual");
                              }}
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      )
                    )}
                  </motion.div>
                )}
            </AnimatePresence>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

SearchButton.propTypes = {
  onSearch: PropTypes.func,
  className: PropTypes.string,
  placeholder: PropTypes.string,
  minChars: PropTypes.number,
  results: PropTypes.array,
  autoSearch: PropTypes.bool,
};
