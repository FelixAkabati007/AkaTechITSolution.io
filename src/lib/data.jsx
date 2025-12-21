import { Icons } from "@components/ui/Icons";

export const PRICING_PACKAGES = [
  {
    name: "Startup Identity",
    price: "2,500",
    description: "Perfect for emerging businesses needing a digital footprint.",
    features: [
      "Responsive Landing Page",
      "Basic SEO Setup",
      "Contact Form Integration",
      "1 Month Support",
      "Domain Setup",
    ],
    recommended: false,
  },
  {
    name: "Enterprise Growth",
    price: "6,500",
    description: "Comprehensive solution for scaling companies.",
    features: [
      "Multi-page CMS Website",
      "Admin Dashboard",
      "Google Analytics",
      "Blog/News Section",
      "Social Media Integration",
      "3 Months Support",
    ],
    recommended: true,
  },
  {
    name: "Premium Commerce",
    price: "12,000+",
    description: "Full-scale custom architecture for high-volume trade.",
    features: [
      "Custom E-commerce / POS",
      "User Authentication",
      "Payment Gateway (Paystack)",
      "Inventory Management",
      "Custom API Development",
      "6 Months Priority Support",
    ],
    recommended: false,
  },
];

export const SERVICES = [
  {
    icon: Icons.Code,
    title: "Web Development",
    desc: "Tailored React & Next.js solutions that outperform template sites. We build fast, responsive, and SEO-optimized web applications.",
  },
  {
    icon: Icons.Server,
    title: "System Architecture",
    desc: "Robust backend infrastructure designed for scalability and security. We engineer systems that grow with your business needs.",
  },
  {
    icon: Icons.ShoppingBag,
    title: "POS Systems",
    desc: "Integrated Point of Sale systems for retail efficiency. Streamline your inventory, sales, and reporting in one unified platform.",
  },
  {
    icon: Icons.Palette,
    title: "Graphic Design",
    desc: "Brand identity, logos, and premium visual assets. We craft distinct visual languages that elevate your market presence.",
  },
];

export const RECOMMENDATIONS = [
  {
    name: "Kweku Adjei",
    role: "CEO, Accra Logistics",
    text: "AkaTech IT Solutions revolutionized our supply chain management. Their local understanding combined with global standards created the perfect system for us.",
    image: "/kweku-adjei.png",
  },
  {
    name: "Armand (Adamu) Forster",
    role: "CEO, KUMBISALY HERITAGE HOTEL AND RESTAURANT",
    text: "Collaborating with the AkaTech has been smooth and efficient. The system they delivered is stable, well‑structured, and perfectly optimized to support our growing guest and restaurant operations.",
    image: "/armand-forster.jpg",
  },
  {
    name: "Tracy Agyemang",
    role: "Owner, The Golden Spoon Bistro",
    text: "The e-commerce platform they built is not just beautiful, but incredibly functional. Our online sales have doubled since the launch.",
    image: "/tracy-agyemang.png",
  },
];

export const WEBSITE_SAMPLES = [
  {
    id: 1,
    name: "Luxe Fashion",
    type: "E-Commerce",
    content: (
      <div className="flex flex-col h-full bg-white pt-12">
        <div className="h-12 flex items-center justify-between px-5 border-b border-gray-50">
          <div className="font-serif font-bold text-lg text-black tracking-tighter">
            LUXE.
          </div>
          <Icons.ShoppingBag size={18} className="text-black" />
        </div>
        <div className="flex-1 overflow-hidden p-4 space-y-4">
          <div className="relative h-44 bg-stone-100 rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-stone-200/50"></div>
            <div className="absolute bottom-4 left-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-black mb-1">
                New Collection
              </div>
              <div className="text-3xl font-serif text-black leading-none">
                Autumn
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-32 bg-gray-50 rounded-lg p-3 flex flex-col justify-end border border-gray-100">
              <div className="h-16 bg-stone-100 rounded-md mb-2"></div>
              <div className="text-xs font-bold text-black">$240.00</div>
            </div>
            <div className="h-32 bg-gray-50 rounded-lg p-3 flex flex-col justify-end border border-gray-100">
              <div className="h-16 bg-stone-100 rounded-md mb-2"></div>
              <div className="text-xs font-bold text-black">$185.00</div>
            </div>
          </div>
        </div>
        <div className="h-16 bg-black text-white flex items-center justify-center font-bold text-xs uppercase tracking-widest">
          Add to Bag
        </div>
      </div>
    ),
  },
  {
    id: 2,
    name: "FinTech Pro",
    type: "SaaS Dashboard",
    content: (
      <div className="flex flex-col h-full bg-[#0f172a] text-white pt-12">
        <div className="h-14 flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-blue-500 rounded-md"></div>
            <span className="font-bold text-sm tracking-wide">FinTech</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600"></div>
        </div>
        <div className="flex-1 px-5 pt-2 space-y-5">
          <div className="p-5 bg-slate-800/50 rounded-2xl border border-slate-700 backdrop-blur-sm">
            <div className="text-xs text-slate-400 mb-2 font-medium">
              Total Balance
            </div>
            <div className="text-3xl font-bold tracking-tight">$42,593.00</div>
            <div className="flex items-center gap-2 mt-2">
              <div className="bg-green-500/10 text-green-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                +12.5%
              </div>
              <span className="text-[10px] text-slate-500">vs last month</span>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-xs font-bold shadow-lg shadow-blue-900/20">
              Send
            </div>
            <div className="flex-1 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-xs font-bold border border-slate-700">
              Receive
            </div>
          </div>
          <div className="space-y-3">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              Recent Activity
            </div>
            <div className="h-14 bg-slate-800/30 rounded-xl flex items-center px-4 gap-4 border border-white/5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs">
                ↓
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold">Income</div>
                <div className="text-[10px] text-slate-500">Today, 9:41 AM</div>
              </div>
              <div className="text-xs font-bold text-emerald-400">+$1,250</div>
            </div>
            <div className="h-14 bg-slate-800/30 rounded-xl flex items-center px-4 gap-4 border border-white/5">
              <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center text-xs">
                ↑
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold">Netflix</div>
                <div className="text-[10px] text-slate-500">Yesterday</div>
              </div>
              <div className="text-xs font-bold text-white">-$14.99</div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    name: "Arch Studio",
    type: "Portfolio",
    content: (
      <div className="flex flex-col h-full bg-[#f0efe9] text-stone-900 pt-12">
        <div className="h-16 flex items-center justify-between px-6">
          <Icons.Menu size={20} className="text-stone-800" />
          <div className="font-serif font-bold text-lg tracking-[0.2em] text-stone-800">
            ARCH.
          </div>
        </div>
        <div className="flex-1 px-6 flex flex-col justify-center pb-10">
          <h2 className="text-5xl font-serif font-bold leading-[0.9] mb-6 text-stone-800">
            Modern <br />
            <span className="text-orange-700 italic">Living</span> <br />
            Spaces.
          </h2>
          <div className="w-12 h-[2px] bg-stone-300 mb-6"></div>
          <p className="text-xs text-stone-500 mb-8 leading-relaxed max-w-[200px]">
            Award-winning architectural visualization and sustainable design
            concepts.
          </p>
          <div className="flex-1 bg-stone-300 rounded-2xl relative overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-stone-800/5 mix-blend-multiply"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 border border-white/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-white text-xs">Play</span>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full bg-white/90 backdrop-blur p-4 flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider">
                The Villa
              </span>
              <span className="text-[10px]">01/04</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

export const PORTFOLIO_DATA = {
  profile: {
    name: "Felix Akabati",
    title: "Software Engineer | System Architect | IT Consultant",
    bio: "Experienced Full Stack Developer with a demonstrated history of working in the computer software industry. Skilled in PHP, Java, Python, JavaScript, and React. Strong engineering professional with a Bachelor of Science focused in Computer Science.",
    image: "20221005_210833.jpg",
    location: "Kumasi, Ashanti Region, Ghana",
    email: "felixakabati007@gmail.com",
    phone: "+233 24 402 7477",
  },
  skills: [
    {
      category: "Languages",
      items: [
        "Java",
        "Python",
        "PHP",
        "JavaScript",
        "TypeScript",
        "SQL",
        "HTML/CSS",
      ],
    },
    {
      category: "Frameworks",
      items: [
        "React",
        "Next.js",
        "Node.js",
        "Laravel",
        "Spring Boot",
        "Tailwind CSS",
      ],
    },
    {
      category: "Tools & DevOps",
      items: ["Git", "Docker", "AWS", "Firebase", "Linux", "VS Code"],
    },
    {
      category: "Professional",
      items: [
        "System Architecture",
        "IT Consultancy",
        "Project Management",
        "Technical Training",
      ],
    },
  ],
  projects: [
    {
      title: "Hotel Management System",
      description:
        "A comprehensive system for managing bookings, guest records, and room inventory, featuring real-time availability tracking and integrated payment processing.",
      tags: ["React", "Node.js", "MongoDB", "Paystack"],
      image:
        "https://v0-felix-akabati-portfolio.vercel.app/images/hotel-management.jpg",
    },
    {
      title: "School Website and Management System",
      description:
        "An integrated platform for schools featuring a public-facing website and a comprehensive management system for student records, grading, and attendance.",
      tags: ["PHP", "Laravel", "MySQL", "Bootstrap"],
      image:
        "https://v0-felix-akabati-portfolio.vercel.app/images/school-website.jpg",
    },
    {
      title: "Restaurant Management System and POS",
      description:
        "Complete restaurant automation system with table reservations, kitchen display integration, inventory control, and robust sales reporting.",
      tags: ["Electron", "React", "SQLite", "Thermal Printing"],
      image:
        "https://v0-felix-akabati-portfolio.vercel.app/images/restaurant-pos.jpg",
    },
    {
      title: "Optical Service and Booking System",
      description:
        "A specialized booking and management system for optical clinics, facilitating appointment scheduling, patient records management, and prescription tracking.",
      tags: ["React", "Node.js", "MongoDB", "Tailwind CSS"],
      image:
        "https://v0-felix-akabati-portfolio.vercel.app/images/optical-service.jpg",
    },
  ],
  experience: [
    {
      role: "Senior Software Engineer",
      company: "AkaTech IT Solutions",
      period: "2023 - Present",
      description:
        "Leading development teams, architecting scalable systems, and providing IT consultancy for enterprise clients.",
    },
    {
      company: "Freelance",
      role: "Full Stack Developer",
      period: "2023 - PRESENT",
      description:
        "Building custom web applications for various clients using React, Node.js, and modern web technologies.",
    },
    {
      role: "Facilitator",
      company: "Ghana Education Service",
      period: "2017 - Present",
      description:
        "Facilitating educational programs and curriculum implementation while integrating technology into learning processes.",
    },
  ],
  education: [
    {
      degree: "B.ED. Information Technology",
      school:
        "Akenten Appiah-Menka University of Skills Training and Entrepreneurial Development",
      period: "PRESENT",
    },
    {
      degree: "Diploma In Basic Education",
      school: "St. John Bosco's College Of Education",
      period: "2015 To 2017",
    },
  ],
};
