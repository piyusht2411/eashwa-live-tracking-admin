"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  Zap,
  ChevronRight,
  LogIn,
  LayoutDashboard,
  Radio,
  Battery,
  Shield,
  Thermometer,
  Wrench,
  IndianRupee,
  Truck,
  Bike,
  CheckCircle2,
  Globe2,
  Award,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import Image from "next/image";
import chiwee from "../../public/images/chiwee logo.jpg"
import from "../../public/images/logo.png"

/* ─────────────────────────────────────────────
   PLACEHOLDER LOGOS
   Replace with <img src="/logos/chilwee.png" />
   and <img src="/logos/ .png" /> once ready
───────────────────────────────────────────── */
function ChilweeLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="44" height="44" rx="11" fill="#16a34a" />
      <rect x="5" y="13" width="27" height="18" rx="4" fill="white" fillOpacity="0.22" stroke="white" strokeWidth="2" />
      <rect x="32" y="18.5" width="5.5" height="7" rx="2" fill="white" fillOpacity="0.75" />
      <rect x="8" y="16" width="18" height="12" rx="2.5" fill="white" />
    </svg>
  );
}

function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="44" height="44" rx="11" fill="#f59e0b" />
      <path d="M27 5 L11 23 H20 L16 39 L34 19 H25 L27 5Z" fill="white" />
    </svg>
  );
}

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, authToken } = useSelector(
    (state: RootState) => state.auth
  );

  const [secretClickCount, setSecretClickCount] = useState(0);
  const [showAdminButton, setShowAdminButton] = useState(false);
  const secretTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSecretClick = () => {
    const next = secretClickCount + 1;
    setSecretClickCount(next);
    if (secretTimerRef.current) clearTimeout(secretTimerRef.current);
    secretTimerRef.current = setTimeout(() => setSecretClickCount(0), 1500);
    if (next >= 3) {
      setShowAdminButton(true);
      setSecretClickCount(0);
    }
  };

  const handleAdminNav = () => {
    if (isAuthenticated && authToken) {
      router.push("/admin/dashboard");
    } else {
      router.push("/login");
    }
  };

  const products = [
    {
      voltage: "48V",
      emoji: "🔋",
      tagline: "Standard City Rider",
      desc: "Perfect for standard electric scooters, offering efficient energy usage and smooth performance for daily commuting.",
      highlight: "Ideal for daily commuters",
    },
    {
      voltage: "60V",
      emoji: "⚡",
      tagline: "Balanced Performer",
      desc: "Designed for balanced performance, providing improved range and stability for regular city travel.",
      highlight: "Best Seller",
      featured: true,
    },
    {
      voltage: "72V",
      emoji: "🚀",
      tagline: "Heavy-Duty Powerhouse",
      desc: "Built for high power and extended range, ideal for heavy-duty usage and demanding conditions.",
      highlight: "Maximum Performance",
    },
  ];

  const whyItems = [
    { icon: <Battery className="w-5 h-5" />, label: "Long-lasting battery life" },
    { icon: <Zap className="w-5 h-5" />, label: "Stable & reliable performance" },
    { icon: <Thermometer className="w-5 h-5" />, label: "Suitable for Indian weather" },
    { icon: <IndianRupee className="w-5 h-5" />, label: "Cost-effective solution" },
    { icon: <Wrench className="w-5 h-5" />, label: "Easy to maintain" },
    { icon: <Shield className="w-5 h-5" />, label: "Backed by global expertise" },
  ];

  const applications = [
    { icon: <Bike className="w-7 h-7" />, label: "Electric Scooters" },
    { icon: <Truck className="w-7 h-7" />, label: "E-Rickshaws" },
    { icon: <Truck className="w-7 h-7" />, label: "Electric Cargo Vehicles" },
    { icon: <Zap className="w-7 h-7" />, label: "Low-Speed EVs" },
  ];

  return (
    <div
      className="min-h-screen bg-white text-gray-900 overflow-x-hidden"
      style={{ fontFamily: "'Sora', 'DM Sans', 'Segoe UI', sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      {/* ── NAVBAR ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrollY > 40 ? "rgba(255,255,255,0.96)" : "transparent",
          backdropFilter: scrollY > 40 ? "blur(16px)" : "none",
          borderBottom: scrollY > 40 ? "1px solid #f3f4f6" : "none",
          boxShadow: scrollY > 40 ? "0 1px 16px rgba(0,0,0,0.06)" : "none",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Dual logo */}
          <div className="flex items-center gap-2.5">
            <Image src={chiwee} width={50} height={50} className="object-contain rounded-md" alt="Chilwee Logo" />
            <span className="text-gray-300 font-light text-lg select-none">×</span>
            <Image src={ } width={50} height={50} className="object-contain rounded-md" alt="Chilwee Logo" />
            <div className="hidden sm:flex items-center gap-2 ml-1">
              <div className="h-5 w-px bg-gray-200" />
              <span className="font-extrabold text-gray-900 text-sm tracking-tight">Chilwee</span>
              <span className="text-amber-500 font-black text-sm">×</span>
              <span className="font-extrabold text-amber-500 text-sm tracking-tight"> </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#contact"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-amber-600 border border-amber-300 hover:border-amber-500 hover:bg-amber-50 px-4 py-2 rounded-lg transition-all duration-200"
            >
              <Phone className="w-3.5 h-3.5" />
              Contact Us
            </a>
            <button
              onClick={handleSecretClick}
              aria-label=""
              className="w-6 h-6 flex items-center justify-center cursor-default select-none"
              tabIndex={-1}
            >
              <Radio className="w-3.5 h-3.5 text-gray-400" />
            </button>
            {showAdminButton && (
              <button
                onClick={handleAdminNav}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 animate-fade-in shadow-md shadow-amber-200"
              >
                {isAuthenticated && authToken ? (
                  <><LayoutDashboard className="w-4 h-4" />Dashboard</>
                ) : (
                  <><LogIn className="w-4 h-4" />Login</>
                )}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-gradient-to-br from-amber-50 via-white to-green-50/40">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_60%,rgba(245,158,11,0.10)_0%,transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(22,163,74,0.06)_0%,transparent_50%)]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100'%3E%3Cpath d='M28 66L0 50V18L28 2l28 16v32z' fill='none' stroke='%23f59e0b' stroke-width='1'/%3E%3C/svg%3E")`,
              backgroundSize: "56px 100px",
            }}
          />
        </div>
        <div className="absolute top-1/2 right-[-60px] -translate-y-1/2 pointer-events-none opacity-[0.05]">
          <Zap style={{ width: 480, height: 480, color: "#f59e0b" }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 border border-amber-300 bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full mb-6 tracking-widest uppercase">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
              Made for India's EV Revolution
            </div>

            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold leading-[1.06] tracking-tight text-gray-900 mb-6">
              Powering India's
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-400">
                Electric Mobility
              </span>
              <br />
              with High-Performance
              <br />
              <span className="relative inline-block">
                EV Batteries
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-amber-400/50 rounded-full" />
              </span>
            </h1>

            <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-md">
              Advanced Lead Acid Battery Solutions for Electric Scooters &
              E-Rickshaws — engineered for India's roads.
            </p>

            <div className="flex flex-wrap gap-2 mb-10">
              {[
                "✓  Reliable Performance Across Indian Conditions",
                "✓  Designed for Daily EV Usage",
                "✓  Trusted Battery Technology",
              ].map((t) => (
                <span
                  key={t}
                  className="text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full font-medium"
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#products"
                className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-amber-200 transition-all duration-200 hover:scale-105 text-sm"
              >
                Get Best Price
                <ChevronRight className="w-4 h-4" />
              </a>
              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 border border-gray-300 hover:border-amber-400 text-gray-600 hover:text-amber-600 font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 text-sm"
              >
                Contact Us
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Hero card */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[420px]">
              <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-2xl shadow-amber-100/80">
                <div className="flex items-center justify-center mb-8">
                  <div className="relative">
                    <div className="w-32 h-20 bg-gradient-to-b from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-xl shadow-amber-300/40">
                      <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-3 h-8 bg-amber-400 rounded-r-lg" />
                      <Battery className="w-12 h-12 text-white/70" />
                    </div>
                    <div className="absolute inset-0 rounded-2xl bg-amber-400/20 blur-2xl -z-10 scale-150" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { val: "48–72V", label: "Range" },
                    { val: "500+", label: "Cycles" },
                    { val: "99.9%", label: "Uptime" },
                  ].map((s) => (
                    <div key={s.label} className="text-center bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <p className="text-amber-600 font-extrabold text-base leading-none mb-1">{s.val}</p>
                      <p className="text-gray-400 text-xs">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
                  <span className="text-green-700 text-xs font-semibold">
                    Trusted by 12,000+ EV Users across India
                  </span>
                </div>
              </div>
              <div className="absolute -top-4 -left-6 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-amber-200 animate-float">
                ⚡ High Performance
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white border border-gray-200 text-gray-700 text-xs font-semibold px-3 py-2 rounded-full shadow-xl animate-float-slow">
                🌡️ Made for Indian Climate
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BRAND SECTION ── */}
      <section className="py-16 bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-gray-400 text-xs uppercase tracking-[0.25em] font-semibold mb-10">
            Official Distributor Partnership
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-10 sm:gap-20">
            {/* Chilwee brand block */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-green-600 flex items-center justify-center shadow-lg shadow-green-200">
                <Image src={chiwee} width={100} height={100} className="object-contain rounded-md" alt="Chilwee Logo" />
              </div>
              <div>
                <p className="font-extrabold text-gray-900 text-2xl tracking-tight">Chilwee</p>
                <p className="text-gray-400 text-xs font-medium mt-0.5">Global Battery Manufacturer</p>
              </div>
            </div>

            {/* Separator */}
            <div className="flex flex-row sm:flex-col items-center gap-3">
              <div className="w-14 h-px sm:w-px sm:h-14 bg-gradient-to-r sm:bg-gradient-to-b from-transparent via-amber-400 to-transparent" />
              <span className="text-3xl font-black text-amber-500">×</span>
              <div className="w-14 h-px sm:w-px sm:h-14 bg-gradient-to-r sm:bg-gradient-to-b from-transparent via-amber-400 to-transparent" />
            </div>

            {/*   brand block */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-gray-200">
                <Image src={ } width={100} height={100} className="object-contain rounded-md" alt="Chilwee Logo" />
              </div>
              <div>
                <p className="font-extrabold text-gray-900 text-2xl tracking-tight"> </p>
                <p className="text-gray-400 text-xs font-medium mt-0.5">Authorized Distributor — India</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-amber-500 text-xs uppercase tracking-[0.25em] font-bold mb-4">About Chilwee</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight text-gray-900 mb-6">
              Global Expertise in
              <br />
              <span className="text-amber-500">EV Battery</span> Manufacturing
            </h2>
            <p className="text-gray-500 leading-relaxed mb-5">
              Chilwee is a well-established name in the battery industry, known for
              delivering reliable and high-quality lead acid batteries for electric
              vehicles. With years of manufacturing expertise, advanced production
              facilities, and continuous innovation, Chilwee has become a trusted
              choice for EV battery solutions.
            </p>
            <p className="text-gray-500 leading-relaxed">
              The brand focuses on performance, durability, and efficiency, making
              its batteries suitable for real-world usage across diverse
              environments.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: <Globe2 className="w-5 h-5" />, title: "Advanced Manufacturing", desc: "State-of-the-art production technology", cls: "text-blue-600 bg-blue-50 border-blue-100 group-hover:bg-blue-600 group-hover:text-white" },
              { icon: <Zap className="w-5 h-5" />, title: "Consistent Performance", desc: "Reliable output in every charge cycle", cls: "text-amber-600 bg-amber-50 border-amber-100 group-hover:bg-amber-500 group-hover:text-white" },
              { icon: <Shield className="w-5 h-5" />, title: "Durable Build", desc: "Long-lasting design for daily use", cls: "text-green-600 bg-green-50 border-green-100 group-hover:bg-green-600 group-hover:text-white" },
              { icon: <Award className="w-5 h-5" />, title: "Globally Trusted", desc: "Used by EV users worldwide", cls: "text-purple-600 bg-purple-50 border-purple-100 group-hover:bg-purple-600 group-hover:text-white" },
            ].map((item, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-default"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 border transition-all duration-300 ${item.cls}`}>
                  {item.icon}
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h4>
                <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section id="products" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-amber-500 text-xs uppercase tracking-[0.25em] font-bold mb-3">Our Products</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
              Reliable EV Battery Solutions
              <br />
              <span className="text-amber-500">for Every Requirement</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {products.map((p, i) => (
              <div
                key={i}
                className={`relative rounded-3xl p-8 border transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${p.featured
                  ? "bg-gradient-to-br from-amber-500 to-amber-600 border-amber-400 shadow-2xl shadow-amber-200 text-white"
                  : "bg-white border-gray-200 hover:border-amber-300 shadow-sm hover:shadow-amber-100"
                  }`}
              >
                {p.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gray-900 text-amber-400 text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                    ⭐ Best Seller
                  </div>
                )}
                <div className="text-4xl mb-4">{p.emoji}</div>
                <div className={`inline-block text-xs font-bold px-2.5 py-1 rounded-lg mb-4 ${p.featured ? "bg-white/20 text-white" : "bg-amber-100 text-amber-700"}`}>
                  {p.highlight}
                </div>
                <h3 className={`text-5xl font-extrabold mb-2 ${p.featured ? "text-white" : "text-amber-500"}`}>{p.voltage}</h3>
                <p className={`font-bold text-lg mb-3 ${p.featured ? "text-white/90" : "text-gray-900"}`}>{p.tagline}</p>
                <p className={`text-sm leading-relaxed ${p.featured ? "text-white/75" : "text-gray-500"}`}>{p.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <p className="text-center text-gray-400 text-sm font-semibold mb-6 uppercase tracking-wider">Core Features Across All Models</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {["Long life cycle performance", "Stable power output", "High energy efficiency", "Strong build quality", "Suitable for Indian roads"].map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span className="text-gray-500 text-xs">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PERFORMANCE & TECH ── */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-3xl p-8 shadow-sm">
              {[
                { label: "Voltage Stability", pct: 96 },
                { label: "Charge Efficiency", pct: 91 },
                { label: "Temperature Resistance", pct: 88 },
                { label: "Cycle Life", pct: 94 },
              ].map((bar) => (
                <div key={bar.label} className="mb-5 last:mb-0">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-600 font-medium">{bar.label}</span>
                    <span className="text-amber-600 font-bold">{bar.pct}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full" style={{ width: `${bar.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <p className="text-amber-500 text-xs uppercase tracking-[0.25em] font-bold mb-4">Technology</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight text-gray-900 mb-6">
              Engineered for Performance
              <br />
              <span className="text-amber-500">& Durability</span>
            </h2>
            <p className="text-gray-500 leading-relaxed mb-5">
              Chilwee batteries are designed to deliver consistent power and reliability in everyday EV usage. With optimized internal structure and robust build quality, these batteries ensure smooth operation and dependable output.
            </p>
            <p className="text-gray-500 leading-relaxed mb-8">
              The technology focuses on maintaining performance over time while handling varying load conditions, making them suitable for both personal and commercial EV applications.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {["Consistent voltage output", "Efficient charge-discharge cycles", "Resistance to temperature variations", "Low maintenance requirements"].map((adv) => (
                <div key={adv} className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span className="text-gray-600 text-sm">{adv}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── APPLICATIONS ── */}
      <section className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-amber-500 text-xs uppercase tracking-[0.25em] font-bold mb-3">Applications</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
              Applications Across
              <br />
              <span className="text-amber-500">Electric Mobility</span>
            </h2>
            <p className="text-gray-400 mt-4 max-w-xl mx-auto">
              Chilwee EV batteries are widely used in different types of electric vehicles, making them a versatile choice for India's growing EV ecosystem.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
            {applications.map((app, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-3 p-7 rounded-2xl bg-white border border-gray-200 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-50 hover:-translate-y-1 transition-all duration-300 group cursor-default"
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 group-hover:bg-amber-500 group-hover:text-white flex items-center justify-center transition-all duration-300">
                  {app.icon}
                </div>
                <span className="text-sm font-semibold text-gray-700 text-center">{app.label}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 text-sm">
            Designed to support both <span className="text-gray-700 font-medium">individual users</span> and <span className="text-gray-700 font-medium">commercial operations</span>.
          </p>
        </div>
      </section>

      {/* ── WHY CHILWEE ── */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-amber-500 text-xs uppercase tracking-[0.25em] font-bold mb-3">Why Us</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
              Why Choose <span className="text-amber-500">Chilwee</span> EV Batteries
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {whyItems.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-amber-300 hover:bg-amber-50 hover:shadow-md transition-all duration-300 group cursor-default"
              >
                <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-600 group-hover:bg-amber-500 group-hover:text-white flex items-center justify-center flex-shrink-0 transition-all duration-300">
                  {item.icon}
                </div>
                <span className="text-gray-700 font-medium text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUALITY BAND ── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-amber-600" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100'%3E%3Cpath d='M28 66L0 50V18L28 2l28 16v32z' fill='none' stroke='%23fff' stroke-width='1'/%3E%3C/svg%3E")`,
            backgroundSize: "56px 100px",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 mb-6 mx-auto">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-6 tracking-tight">
            Built for Long-Term Reliability 🏆
          </h2>
          <p className="text-white/80 text-lg leading-relaxed mb-4 max-w-xl mx-auto">
            Each battery is designed with a focus on long-term usability and consistent performance. The manufacturing process emphasizes quality control and durability to ensure dependable output over time.
          </p>
          <p className="text-white/65 leading-relaxed max-w-lg mx-auto">
            Chilwee batteries are built to handle daily usage demands, making them a practical and reliable energy solution for EV users.
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer id="contact" className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <Image src={chiwee} width={50} height={50} className="object-contain rounded-md" alt="Chilwee Logo" />
              <span className="text-gray-600 font-light">×</span>
              <Image src={ } width={50} height={50} className="object-contain rounded-md" alt="Chilwee Logo" />
            </div>
            <p className="text-white text-sm leading-relaxed mb-5">
              High-performance EV battery solutions for India's growing electric mobility ecosystem.
            </p>
            <div className="flex gap-2">
              {["Twitter", "LinkedIn", "YouTube"].map((s) => (
                <a key={s} href="#" className="text-xs bg-white/5 hover:bg-amber-500 text-gray-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors duration-200">{s}</a>
              ))}
            </div>
          </div>

          <div>
            <p className="font-bold text-xs mb-5 text-gray-300 uppercase tracking-[0.2em]">Products</p>
            <ul className="space-y-3 text-sm text-white">
              {["48V Battery", "60V Battery", "72V Battery", "E-Scooter Batteries", "E-Rickshaw Batteries"].map((l) => (
                <li key={l}><a href="#products" className="hover:text-amber-400 transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-bold text-xs mb-5 text-gray-300 uppercase tracking-[0.2em]">Company</p>
            <ul className="space-y-3 text-sm text-white">
              {["About Chilwee", "Technology", "Quality", "Applications", "Blog"].map((l) => (
                <li key={l}><a href="#about" className="hover:text-amber-400 transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-bold text-xs mb-5 text-gray-300 uppercase tracking-[0.2em]">Get In Touch</p>
            <ul className="space-y-3 text-sm text-white">
              <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />ceo@ .com</li>
              <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />+91 77238 66666</li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>India Operations<br />Authorized Distributor</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white">
          <p>© {new Date().getFullYear()} Chilwee ×  . All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-amber-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-amber-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-5px); }
        }
        .animate-fade-in   { animation: fade-in 0.25s ease forwards; }
        .animate-float      { animation: float 3s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 4s ease-in-out infinite; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}