import React from "react";
import { motion } from "framer-motion";
import { Icons } from "@components/ui/Icons";
import { RECOMMENDATIONS } from "@lib/data";

export const Recommendations = () => (
  <section className="py-16 md:py-24 bg-gray-50 dark:bg-akatech-dark border-t border-gray-200 dark:border-white/5 transition-colors duration-500">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <span className="text-akatech-gold text-xs font-bold tracking-[0.2em] uppercase mb-3 block">
          Testimonials
        </span>
        <h2 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white mb-4 transition-colors duration-500">
          Client Success Stories
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {RECOMMENDATIONS.map((rec, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            className="bg-gray-50 dark:bg-akatech-card p-8 rounded-xl border border-gray-200 dark:border-white/5 relative shadow-sm dark:shadow-none"
          >
            <Icons.Quote className="text-akatech-gold/20 w-12 h-12 absolute top-6 right-6" />
            <p className="text-gray-600 dark:text-gray-400 mb-6 italic relative z-10 text-sm leading-relaxed">
              "{rec.text}"
            </p>
            <div className="flex items-center gap-4">
              {rec.image ? (
                <img
                  src={rec.image}
                  alt={rec.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-akatech-gold"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-akatech-gold to-akatech-goldDark flex items-center justify-center text-white font-bold text-lg">
                  {rec.name.charAt(0)}
                </div>
              )}
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                  {rec.name}
                </h4>
                <p className="text-akatech-gold text-xs uppercase tracking-wider">
                  {rec.role}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
