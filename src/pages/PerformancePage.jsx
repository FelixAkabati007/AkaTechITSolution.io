import React, { useEffect, useState } from "react";
import { LazyPreview } from "@components/ui/LazyPreview";

export const PerformancePage = () => {
  const [metrics, setMetrics] = useState(null);
  useEffect(() => {
    fetch("/api/quality/metrics")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setMetrics(d))
      .catch(() => {});
  }, []);
  return (
    <section className="py-16 md:py-20 bg-gray-50 dark:bg-akatech-card border-t border-gray-200 dark:border-white/5">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white mb-6">
          Performance
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Previews are lazy-mounted via IntersectionObserver. Library builds are
          tree-shakable, and animations use reduced motion when preferred.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="p-6 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-akatech-dark">
            <div className="text-xs uppercase text-gray-500 mb-2">Files</div>
            <div className="text-3xl font-bold">{metrics?.files ?? "—"}</div>
          </div>
          <div className="p-6 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-akatech-dark">
            <div className="text-xs uppercase text-gray-500 mb-2">Lines</div>
            <div className="text-3xl font-bold">{metrics?.lines ?? "—"}</div>
          </div>
          <div className="p-6 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-akatech-dark">
            <div className="text-xs uppercase text-gray-500 mb-2">TODO/FIXME</div>
            <div className="text-3xl font-bold">{metrics?.todo ?? "—"}</div>
          </div>
        </div>
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="p-6 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-akatech-dark">
              <div className="text-sm font-bold mb-2">API & Logging</div>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>fetch calls: {metrics.fetch}</li>
                <li>console usage: {metrics.console}</li>
              </ul>
            </div>
            <div className="p-6 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-akatech-dark">
              <div className="text-sm font-bold mb-2">Security Signals</div>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>unsalted hash: {metrics.insecureHash}</li>
                <li>token in localStorage: {metrics.tokenLocalStorage}</li>
              </ul>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="p-6 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-akatech-dark"
            >
              <LazyPreview>
                <div className="h-32 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center text-xs text-gray-500">
                  Deferred preview {i + 1}
                </div>
              </LazyPreview>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
