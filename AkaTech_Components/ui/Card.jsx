import React from "react";
import { motion } from "framer-motion";
import PropTypes from "prop-types";

export const Card = ({
  children,
  className = "",
  glass = true,
  hoverEffect = false,
  ...props
}) => {
  const baseStyles = "rounded-xl overflow-hidden relative";
  const glassStyles =
    "bg-white/70 dark:bg-black/40 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-xl";
  const solidStyles =
    "bg-white dark:bg-akatech-card border border-gray-100 dark:border-white/5 shadow-lg";

  return (
    <motion.div
      initial={hoverEffect ? { y: 0 } : undefined}
      whileHover={
        hoverEffect
          ? {
              y: -5,
              transition: { duration: 0.3 },
              boxShadow: "0 20px 40px -5px rgba(197, 160, 89, 0.15)",
            }
          : undefined
      }
      className={`${baseStyles} ${glass ? glassStyles : solidStyles} ${className}`}
      {...props}
    >
      {/* Decorative gradient blob for glass cards */}
      {glass && (
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-akatech-gold/10 rounded-full blur-3xl pointer-events-none" />
      )}
      
      <div className="relative z-10 p-6">{children}</div>
    </motion.div>
  );
};

Card.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  glass: PropTypes.bool,
  hoverEffect: PropTypes.bool,
};
