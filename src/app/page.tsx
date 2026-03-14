"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  MapPin,
  Radio,
  Users,
  BarChart3,
  Shield,
  Zap,
  ChevronRight,
  LogIn,
  LayoutDashboard,
  Navigation,
  Clock,
  Globe,
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, authToken } = useSelector(
    (state: RootState) => state.auth
  );

  const [secretClickCount, setSecretClickCount] = useState(0);
  const [showAdminButton, setShowAdminButton] = useState(false);
  const secretTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Animated dots for banner
  const [dots, setDots] = useState<
    { id: number; x: number; y: number; size: number; opacity: number }[]
  >([]);

  useEffect(() => {
    const generated = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 3,
      opacity: Math.random() * 0.4 + 0.1,
    }));
    setDots(generated);
  }, []);

  // Secret click handler — triple-click the signal icon
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

  const features = [
    {
      icon: <Navigation className="w-6 h-6" />,
      title: "Real-Time GPS",
      desc: "Track every field employee on a live map with second-by-second precision.",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Team Overview",
      desc: "See your entire workforce at a glance — active, idle, or off-route.",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Smart Reports",
      desc: "Automated attendance, distance, and performance analytics.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Geo-Fencing",
      desc: "Set zones and get instant alerts when boundaries are crossed.",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "History Playback",
      desc: "Replay any employee's route for any given day, anytime.",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Alerts",
      desc: "Push notifications for check-ins, deviations, and SOS events.",
    },
  ];

  return (
    <div
      className="min-h-screen bg-white font-sans overflow-x-hidden"
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
    >
      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-md shadow-orange-200">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">
              Eashwa
            </span>
          </div>

          {/* Nav Links */}
          {/* <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
            <a href="#features" className="hover:text-orange-500 transition-colors">Features</a>
            <a href="#about" className="hover:text-orange-500 transition-colors">About</a>
            <a href="#contact" className="hover:text-orange-500 transition-colors">Contact</a>
          </div> */}

          {/* Right side — secret trigger */}
          <div className="flex items-center gap-3">
            {/* Hidden secret trigger: tiny signal icon, visually subtle */}
            <button
              onClick={handleSecretClick}
              aria-label=""
              className="w-6 h-6 flex items-center justify-center transition-opacity cursor-default select-none"
              tabIndex={-1}
            >
              <Radio className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {/* Admin button — revealed after triple click */}
            {showAdminButton && (
              <button
                onClick={handleAdminNav}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-md shadow-orange-200 transition-all duration-200 animate-fade-in"
              >
                {isAuthenticated && authToken ? (
                  <>
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Login
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO BANNER ── */}
      <section className="relative pt-16 min-h-[92vh] flex items-center overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50">
        {/* Decorative orbs */}
        <div className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-orange-400/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-[360px] h-[360px] rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

        {/* Animated tracking dots */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {dots.map((dot) => (
            <span
              key={dot.id}
              className="absolute rounded-full bg-orange-400 animate-pulse"
              style={{
                left: `${dot.x}%`,
                top: `${dot.y}%`,
                width: dot.size,
                height: dot.size,
                opacity: dot.opacity,
                animationDelay: `${dot.id * 0.3}s`,
                animationDuration: `${2 + (dot.id % 3)}s`,
              }}
            />
          ))}
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(#f97316 1px, transparent 1px), linear-gradient(90deg, #f97316 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 grid grid-cols-1 lg:grid-cols-2 items-center gap-12 xl:gap-20">
          {/* Text */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 tracking-wide uppercase">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping" />
              Live Now
            </div>

            <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-[1.08] tracking-tight mb-6">
              Track Your{" "}
              <span className="text-orange-500">Field Team</span>{" "}
              Live.
            </h1>

            <p className="text-lg text-gray-500 leading-relaxed max-w-lg mx-auto lg:mx-0 mb-10">
              Eashwa gives managers a real-time bird's-eye view of every field
              employee — their location, route, and status — from any device,
              anywhere.
            </p>

            {/* <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <button className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-orange-200 transition-all duration-200 hover:scale-105 text-sm">
                Get Started Free
                <ChevronRight className="w-4 h-4" />
              </button>
              <button className="flex items-center justify-center gap-2 bg-white hover:bg-orange-50 text-gray-700 font-semibold px-7 py-3.5 rounded-xl border border-gray-200 transition-all duration-200 text-sm">
                Watch Demo
              </button>
            </div> */}

            {/* Social proof */}
            <div className="flex items-center gap-6 mt-10 justify-center lg:justify-start">
              <div className="text-center lg:text-left">
                <p className="text-2xl font-extrabold text-gray-900">500+</p>
                <p className="text-xs text-gray-400 font-medium">Companies</p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="text-center lg:text-left">
                <p className="text-2xl font-extrabold text-gray-900">12k+</p>
                <p className="text-xs text-gray-400 font-medium">Employees Tracked</p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="text-center lg:text-left">
                <p className="text-2xl font-extrabold text-gray-900">99.9%</p>
                <p className="text-xs text-gray-400 font-medium">Uptime</p>
              </div>
            </div>
          </div>

          {/* Map Card mockup */}
          <div className="w-full">
            <div className="relative bg-white rounded-3xl shadow-2xl shadow-orange-100 border border-orange-100 overflow-hidden" style={{ aspectRatio: "4/3" }}>
              {/* Fake map bg */}
              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage:
                    "linear-gradient(#f97316 1px, transparent 1px), linear-gradient(90deg, #f97316 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/60 via-white/40 to-amber-50/60" />

              {/* Ping markers */}
              {[
                { top: "30%", left: "25%", label: "Raj K.", delay: "0s" },
                { top: "55%", left: "60%", label: "Priya S.", delay: "0.5s" },
                { top: "20%", left: "65%", label: "Amit D.", delay: "1s" },
              ].map((m, i) => (
                <div
                  key={i}
                  className="absolute flex flex-col items-center"
                  style={{ top: m.top, left: m.left }}
                >
                  <div className="relative">
                    <span
                      className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-60"
                      style={{ animationDelay: m.delay }}
                    />
                    <div className="relative w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-300 border-2 border-white">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <span className="mt-1 text-[10px] font-bold text-gray-700 bg-white px-2 py-0.5 rounded-full shadow-sm border border-gray-100 whitespace-nowrap">
                    {m.label}
                  </span>
                </div>
              ))}

              {/* Status bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm px-5 py-3 flex items-center justify-between border-t border-orange-100">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs font-semibold text-gray-600">
                    3 active employees
                  </span>
                </div>
                <span className="text-xs text-gray-400">Updated just now</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-orange-500 font-semibold text-sm uppercase tracking-widest mb-3">
              What We Offer
            </p>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
              Everything you need to manage
              <br />
              <span className="text-orange-500">your field force</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="group p-7 rounded-2xl border border-gray-100 hover:border-orange-200 bg-white hover:bg-orange-50/40 transition-all duration-300 hover:shadow-xl hover:shadow-orange-100 hover:-translate-y-1 cursor-default"
              >
                <div className="w-12 h-12 bg-orange-100 group-hover:bg-orange-500 text-orange-500 group-hover:text-white rounded-xl flex items-center justify-center mb-5 transition-all duration-300 shadow-sm">
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <section id="about" className="py-20 bg-orange-500 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <Globe className="w-10 h-10 text-white/60 mx-auto mb-5" />
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
            Know where your team is,
            <br />
            at every moment.
          </h2>
          <p className="text-orange-100 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Eashwa Live Tracking is built for businesses that run on field
            operations — FMCG, logistics, healthcare, services, and more.
          </p>
          {/* <button className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 text-sm">
            Start Free Trial
            <ChevronRight className="w-4 h-4" />
          </button> */}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer id="contact" className="bg-gray-950 text-white">
        {/* Middle bar */}
        <div className="border-b border-white/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg tracking-tight">
                  Eashwa<span className="text-orange-500">.</span>
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Real-time field employee tracking & management for modern teams.
              </p>
            </div>

            {/* Product */}
            <div>
              <p className="font-semibold text-sm mb-4 text-gray-300 uppercase tracking-wider">
                Product
              </p>
              <ul className="space-y-2.5 text-sm text-gray-400">
                {["Features", "Pricing", "Integrations", "Changelog"].map((l) => (
                  <li key={l}>
                    <a href="#" className="hover:text-orange-400 transition-colors">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="font-semibold text-sm mb-4 text-gray-300 uppercase tracking-wider">
                Company
              </p>
              <ul className="space-y-2.5 text-sm text-gray-400">
                {["About", "Blog", "Careers", "Press"].map((l) => (
                  <li key={l}>
                    <a href="#" className="hover:text-orange-400 transition-colors">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <p className="font-semibold text-sm mb-4 text-gray-300 uppercase tracking-wider">
                Get In Touch
              </p>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li>support@eashwa.in</li>
                <li>+91 98765 43210</li>
                <li className="pt-2">
                  <div className="flex gap-3">
                    {["Twitter", "LinkedIn", "YouTube"].map((s) => (
                      <a
                        key={s}
                        href="#"
                        className="text-xs bg-white/5 hover:bg-orange-500 px-3 py-1.5 rounded-lg transition-colors duration-200"
                      >
                        {s}
                      </a>
                    ))}
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Eashwa Technologies. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-orange-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-orange-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.25s ease forwards; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}