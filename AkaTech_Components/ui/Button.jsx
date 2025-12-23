import React from "react";
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import { Loader } from "lucide-react";

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  isLoading = false,
  disabled = false,
  icon: Icon,
  onClick,
  ...props
}) => {
  const baseStyles =
    "relative inline-flex items-center justify-center rounded-lg font-bold uppercase tracking-widest transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group";

  const variants = {
    primary:
      "text-white bg-gradient-to-r from-akatech-goldDark via-akatech-gold to-akatech-goldDark bg-[length:200%_auto] hover:bg-[position:right_center] shadow-lg shadow-akatech-gold/20 hover:shadow-akatech-gold/40 border border-transparent",
    secondary:
      "bg-white dark:bg-white/10 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/20 border border-gray-200 dark:border-white/10 shadow-sm",
    outline:
      "bg-transparent text-akatech-gold border border-akatech-gold/50 hover:border-akatech-gold hover:bg-akatech-gold/10 hover:shadow-[0_0_15px_rgba(197,160,89,0.3)]",
    ghost:
      "bg-transparent text-gray-600 dark:text-gray-400 hover:text-akatech-gold dark:hover:text-akatech-gold hover:bg-gray-100 dark:hover:bg-white/5",
    danger:
      "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20",
  };

  const sizes = {
    sm: "px-4 py-2 text-[10px]",
    md: "px-6 py-3 text-xs",
    lg: "px-8 py-4 text-sm",
    icon: "p-2",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Shine Effect for Primary Buttons */}
      {variant === "primary" && !disabled && (
        <span className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-10" />
      )}

      {isLoading ? (
        <Loader className="w-4 h-4 animate-spin mr-2" />
      ) : Icon ? (
        <Icon className={`w-4 h-4 ${children ? "mr-2" : ""}`} />
      ) : null}
      
      <span className="relative z-0 flex items-center gap-2">
        {children}
      </span>
    </motion.button>
  );
};

Button.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(["primary", "secondary", "outline", "ghost", "danger"]),
  size: PropTypes.oneOf(["sm", "md", "lg", "icon"]),
  className: PropTypes.string,
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
  icon: PropTypes.elementType,
  onClick: PropTypes.func,
};
