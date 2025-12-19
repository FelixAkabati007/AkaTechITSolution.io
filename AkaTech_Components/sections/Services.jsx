import { SERVICES } from "@lib/data";

export const Services = () => (
  <section
    id="services"
    className="py-16 md:py-24 bg-gray-50 dark:bg-akatech-card relative transition-colors duration-500"
  >
    <div className="container mx-auto">
      <div className="text-center mb-12 md:mb-20">
        <span className="text-akatech-gold text-xs font-bold tracking-[0.2em] uppercase mb-3 block">
          What We Offer
        </span>
        <h2 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white transition-colors duration-500">
          Our Expertise
        </h2>
        <div className="w-24 h-1 bg-gold-gradient mx-auto mt-6"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {SERVICES.map((service, idx) => (
          <div
            key={idx}
            className="group p-6 md:p-8 border border-gray-200 dark:border-white/5 bg-white dark:bg-akatech-dark hover:border-akatech-gold/40 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden shadow-sm dark:shadow-none rounded-xl"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gold-gradient transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
            <div className="mb-6 text-akatech-gold group-hover:text-black dark:group-hover:text-white transition-colors duration-300">
              <service.icon size={40} strokeWidth={1} />
            </div>
            <h3 className="text-xl font-serif text-gray-900 dark:text-white mb-3 group-hover:text-akatech-gold transition-colors duration-500">
              {service.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-500 text-sm leading-relaxed transition-colors duration-500">
              {service.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
