import React from "react";
import { PROJECT_TYPES } from "@lib/constants";
import { Icons } from "@components/ui/Icons";
import { Button } from "@components/ui/Button";

export const Pricing = ({ onSelectPlan }) => (
  <section
    id="pricing"
    className="py-16 md:py-24 bg-white dark:bg-akatech-dark border-t border-gray-200 dark:border-white/5 transition-colors duration-500"
  >
    <div className="container mx-auto px-4">
      <div className="text-center mb-12 md:mb-20">
        <span className="text-akatech-gold text-xs font-bold tracking-[0.2em] uppercase mb-3 block">
          Investment
        </span>
        <h2 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white mb-4 transition-colors duration-500">
          Project Pricing
        </h2>
        <p className="text-gray-500 text-sm">Transparent pricing in Ghana Cedis (GHS)</p>
      </div>

      <div className="grid grid-cols-1 gap-12 max-w-6xl mx-auto">
        {PROJECT_TYPES.map((category, idx) => (
          <div
            key={idx}
            className="bg-gray-50 dark:bg-akatech-card rounded-xl p-6 md:p-8 border border-gray-200 dark:border-white/5"
          >
            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-white/10 pb-4">
              {category.category}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {category.items.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-3 hover:bg-white dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                  onClick={() => onSelectPlan && onSelectPlan(item)}
                >
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {item.name}
                  </span>
                  <span className="text-akatech-gold font-bold">
                    GH₵ {item.price.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Button
          onClick={() => onSelectPlan && onSelectPlan(null)}
          size="lg"
          variant="primary"
        >
          Start Your Project
        </Button>
      </div>
    </div>
  </section>
);
