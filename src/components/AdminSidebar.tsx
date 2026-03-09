"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Users,
  MapPin,
  CalendarDays,
  TrendingUp,
  FileBarChart2,
  AlertTriangle,
  PackageSearch,
  Locate,
  Clock,
  Flame,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useDispatch } from "react-redux";
import { logout } from "@/store/authSlice";

const allMenuItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/admin/dashboard",
    description: "Overview & Analytics",
    roles: ["admin", "hr", "manager"],
  },
  {
    icon: Users,
    label: "Employees",
    href: "/admin/employees",
    description: "Manage All Employees",
    roles: ["admin", "hr", "manager"],
  },
  {
    icon: MapPin,
    label: "Live Tracking",
    href: "/admin/live-tracking",
    description: "Real-Time GPS Map",
    roles: ["admin", "hr", "manager"],
  },
  {
    icon: CalendarDays,
    label: "Attendance",
    href: "/admin/attendance",
    description: "Punch In/Out Records",
    roles: ["admin", "hr", "manager"],
  },
  {
    icon: CalendarDays,
    label: "Leave Management",
    href: "/admin/leave",
    description: "Leaves & Holidays",
    roles: ["admin", "hr"],
  },
  {
    icon: TrendingUp,
    label: "Performance",
    href: "/admin/performance",
    description: "Scoring & Rankings",
    roles: ["admin", "hr", "manager"],
  },
  {
    icon: FileBarChart2,
    label: "Reports",
    href: "/admin/reports",
    description: "Download & Analytics",
    roles: ["admin", "hr", "manager"],
  },
  {
    icon: AlertTriangle,
    label: "Anomalies",
    href: "/admin/anomalies",
    description: "Smart Detection Alerts",
    roles: ["admin", "hr"],
  },
  {
    icon: PackageSearch,
    label: "Stock Intelligence",
    href: "/admin/stock-intelligence",
    description: "Sales & Stock Insights",
    roles: ["admin", "hr"],
  },
  {
    icon: Locate,
    label: "Geo-Fencing",
    href: "/admin/geo-fencing",
    description: "Home Location & Zones",
    roles: ["admin", "hr"],
  },
  {
    icon: Clock,
    label: "Working Hours",
    href: "/admin/working-hours",
    description: "Shifts & Break Policies",
    roles: ["admin", "hr"],
  },
  {
    icon: Flame,
    label: "Heat Map",
    href: "/admin/heat-map",
    description: "Activity Density Map",
    roles: ["admin", "hr", "manager"],
  },
];

export function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const role = user?.role ?? "admin";
  const menuItems = allMenuItems.filter((item) =>
    item.roles.includes(role)
  );

  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  const getUserInitials = (name?: string) => {
    if (!name) return role === "hr" ? "HR" : "AD";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const roleLabel =
    role === "admin" ? "Admin Access" : role === "hr" ? "HR Access" : "Manager Access";

  const motionProps = isMobileView
    ? {
        initial: { x: -300 },
        animate: { x: open ? 0 : -300 },
        transition: { type: "spring" as const, stiffness: 300, damping: 30 },
      }
    : ({} as const);

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-40 md:hidden bg-white/90 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all"
        onClick={() => setOpen(!open)}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-6 w-6 text-orange-500" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="h-6 w-6 text-orange-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      {/* Sidebar */}
      <motion.aside
        {...motionProps}
        className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-orange-100 overflow-y-auto z-30 md:relative md:z-auto shadow-xl flex flex-col"
      >
        {/* Header / Logo */}
        <div
          className="p-5 border-b border-orange-100 bg-gradient-to-br from-orange-500 to-orange-600 cursor-pointer flex-shrink-0"
          onClick={() => router.push("/admin/dashboard")}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md">
              <span className="text-orange-500 font-black text-lg">E</span>
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">
                Eashwa
              </h2>
              <p className="text-orange-100 text-xs font-medium">
                Live Tracking Admin
              </p>
            </div>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="p-3 mx-3 mt-4 bg-orange-50 rounded-xl border border-orange-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-orange-200">
              <AvatarImage src={user?.profilePicture} />
              <AvatarFallback className="bg-orange-500 text-white font-semibold text-sm">
                {getUserInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate text-gray-800">
                {user?.name || "Administrator"}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <Shield className="h-3 w-3 text-orange-500" />
                <p className="text-xs text-orange-600 font-medium">{roleLabel}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4 space-y-0.5 flex-1 overflow-y-auto">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Navigation
          </p>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (pathname.startsWith(item.href) && item.href !== "/admin/dashboard");
            const isHovered = hoveredItem === item.href;

            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  onMouseEnter={() => setHoveredItem(item.href)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="block relative group"
                >
                  <motion.div
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                        : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                    }`}
                    whileHover={{ x: isActive ? 0 : 3 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-white" : "text-gray-500 group-hover:text-orange-500"}`} />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium block">{item.label}</span>
                      <span className={`text-xs block truncate ${isActive ? "text-orange-100" : "text-gray-400"}`}>
                        {item.description}
                      </span>
                    </div>
                    {(isActive || isHovered) && (
                      <ChevronRight className={`h-3.5 w-3.5 flex-shrink-0 ${isActive ? "text-white" : "text-orange-400"}`} />
                    )}
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* System Status & Logout */}
        <div className="p-3 border-t border-orange-100 flex-shrink-0 space-y-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-100">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-xs font-medium text-green-700">All systems operational</p>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start border-orange-200 text-gray-600 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-200 group"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span className="font-medium">Logout</span>
          </Button>
        </div>
      </motion.aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {open && isMobileView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 md:hidden"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
