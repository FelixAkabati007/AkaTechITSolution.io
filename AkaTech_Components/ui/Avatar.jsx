import React, { useState } from "react";

export const Avatar = ({ src, fallback, alt, size = "md", className = "" }) => {
  const [error, setError] = useState(false);

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-base",
    lg: "w-24 h-24 text-3xl",
    xl: "w-32 h-32 text-4xl",
  };

  if (src && !error) {
    // Basic check to filter out obviously invalid URLs before attempting load
    const isValidUrl =
      (src.startsWith("http") || src.startsWith("/")) &&
      !src.includes("example.com");

    if (isValidUrl) {
      return (
        <img
          src={src}
          alt={alt || fallback}
          referrerPolicy="no-referrer"
          onError={() => setError(true)}
          className={`${sizeClasses[size]} rounded-full object-cover border border-gray-200 dark:border-white/10 ${className}`}
        />
      );
    }
  }

  return (
    <div
      className={`${sizeClasses[size]} bg-akatech-gold rounded-full flex items-center justify-center text-white font-bold shrink-0 ${className}`}
    >
      {fallback ? fallback.charAt(0).toUpperCase() : "?"}
    </div>
  );
};
