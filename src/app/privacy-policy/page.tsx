import type { Metadata } from "next";
import {
  Shield,
  Mail,
  Phone,
  MapPin,
  Lock,
  Eye,
  Database,
  Globe,
  Cookie,
  Link2,
  Baby,
  Users,
} from "lucide-react";

// Static metadata so crawlers (and Google Play's privacy-policy link checker)
// get a correctly titled, fully server-rendered page.
export const metadata: Metadata = {
  title: "Privacy Policy — Eashwa Live Tracking",
  description:
    "How Eashwa Live Tracking collects, uses, and protects your data, including location data for field employee tracking.",
};

// Fully static — no client JS, no Redux, no accordion. Every word of the policy
// is present in the server-rendered HTML so it is reliably crawlable.
export const dynamic = "force-static";

const sectionIcons: Record<string, React.ElementType> = {
  introduction: Shield,
  "information-we-collect": Database,
  "how-we-use": Eye,
  "data-retention": Lock,
  "data-security": Lock,
  "data-sharing": Users,
  "employee-rights": Shield,
  "location-privacy": MapPin,
  "international-transfers": Globe,
  cookies: Cookie,
  thirdparty: Link2,
  children: Baby,
  contact: Mail,
};

const sections = [
  {
    id: "introduction",
    title: "Introduction",
    content: `Eashwa Live Tracking ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our employee tracking and management platform.`,
  },
  {
    id: "information-we-collect",
    title: "Information We Collect",
    subsections: [
      {
        subtitle: "Location Data",
        text: "We collect real-time GPS location data from field employees with their consent, including in the background while the app is running. This data is used to monitor field activities, optimize routes, verify attendance, and ensure employee safety.",
      },
      {
        subtitle: "Personal Information",
        text: "Name, email address, phone number, employee ID, department, and job title.",
      },
      {
        subtitle: "Device Information",
        text: "Device type, operating system, device identifiers, and mobile network information.",
      },
      {
        subtitle: "Activity Data",
        text: "Clock-in/clock-out times, break duration, visits data, work hours, and task completion status.",
      },
      {
        subtitle: "Communication Data",
        text: "Messages and communications made through our platform for work-related purposes.",
      },
    ],
  },
  {
    id: "how-we-use",
    title: "How We Use Your Information",
    subsections: [
      {
        subtitle: "Primary Purposes",
        text: "Track employee location and attendance, manage work schedules and assignments, monitor productivity and performance, ensure workplace safety, and optimize field operations.",
      },
      {
        subtitle: "Secondary Purposes",
        text: "Improve our services, conduct analytics on employee performance patterns, comply with legal obligations, and prevent fraudulent activities.",
      },
      {
        subtitle: "Legal Basis",
        text: "We process your information based on contractual necessity, legitimate business interests, compliance with legal obligations, and your explicit consent.",
      },
    ],
  },
  {
    id: "data-retention",
    title: "Data Retention",
    content: `We retain employee tracking data for the duration of employment plus 2 years for legal and compliance purposes. Location data is automatically deleted after 90 days unless longer retention is required by law. You can request deletion of your data subject to legal requirements.`,
  },
  {
    id: "data-security",
    title: "Data Security",
    subsections: [
      {
        subtitle: "Security Measures",
        text: "We employ end-to-end encryption for data transmission, industry-standard SSL/TLS certificates, secure cloud storage with access controls, and regular security audits.",
      },
      {
        subtitle: "Your Responsibility",
        text: "Users are responsible for maintaining the confidentiality of their login credentials and immediately reporting any unauthorized access.",
      },
      {
        subtitle: "Data Breach Protocol",
        text: "In case of a data breach, affected users will be notified within 72 hours with details of the breach and remedial measures.",
      },
    ],
  },
  {
    id: "data-sharing",
    title: "With Whom We Share Your Data",
    subsections: [
      {
        subtitle: "Internal Sharing",
        text: "Authorized personnel within your organization with administrative access only see data relevant to their roles.",
      },
      {
        subtitle: "Third-Party Service Providers",
        text: "We share data with cloud hosting providers, payment processors, and analytics tools. All third parties are bound by confidentiality agreements.",
      },
      {
        subtitle: "Legal Requirements",
        text: "We may disclose information when required by law, court orders, or government requests.",
      },
      {
        subtitle: "We Do NOT Sell Data",
        text: "We never sell or rent personal information to third parties for marketing or commercial purposes.",
      },
    ],
  },
  {
    id: "employee-rights",
    title: "Your Privacy Rights",
    subsections: [
      {
        subtitle: "Access & Portability",
        text: "You have the right to access your personal data and receive a copy in a portable format.",
      },
      {
        subtitle: "Correction",
        text: "You can request correction of inaccurate or incomplete information.",
      },
      {
        subtitle: "Deletion",
        text: "You can request deletion of your data, subject to legal retention requirements.",
      },
      {
        subtitle: "Opt-Out",
        text: "You can opt-out of non-essential tracking features, though some tracking may be required for job duties.",
      },
    ],
  },
  {
    id: "location-privacy",
    title: "Location Privacy & Geofencing",
    subsections: [
      {
        subtitle: "Geofencing Technology",
        text: "We use geofencing to monitor employee presence at designated work locations. Alerts are triggered only when employees enter or exit defined zones.",
      },
      {
        subtitle: "Off-Hours Tracking",
        text: "Location tracking outside scheduled work hours is not active unless explicitly authorized for safety purposes.",
      },
      {
        subtitle: "Personal Time",
        text: "Employees can disable tracking during personal time if organizational policies permit.",
      },
    ],
  },
  {
    id: "international-transfers",
    title: "International Data Transfers",
    content: `If your data is transferred to countries outside your jurisdiction, we ensure adequate safeguards through Standard Contractual Clauses, adequacy decisions, and compliance with GDPR, CCPA, and other privacy regulations.`,
  },
  {
    id: "cookies",
    title: "Cookies & Tracking Technologies",
    subsections: [
      {
        subtitle: "Session Cookies",
        text: "Used to maintain your login session and preferences.",
      },
      {
        subtitle: "Analytical Cookies",
        text: "Help us understand how users interact with our platform to improve functionality.",
      },
      {
        subtitle: "Your Cookie Choices",
        text: "You can disable non-essential cookies through your browser settings, though this may affect functionality.",
      },
    ],
  },
  {
    id: "thirdparty",
    title: "Third-Party Links",
    content: `Our platform may contain links to third-party websites. This Privacy Policy applies only to our platform. We are not responsible for the privacy practices of external websites. Please review their privacy policies before sharing your information.`,
  },
  {
    id: "children",
    title: "Children's Privacy",
    content: `Our platform is not intended for individuals under 18 years old. We do not knowingly collect information from minors. If we discover that a minor has provided information, we will delete it immediately.`,
  },
  {
    id: "contact",
    title: "Contact Us",
    content: `If you have questions about this Privacy Policy or want to exercise your rights, please contact us:`,
    hasContactInfo: true,
  },
];

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "ceo@eashwa.com",
    href: "mailto:ceo@eashwa.com",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+91 77238 66666",
    href: "tel:+917723866666",
  },
  {
    icon: MapPin,
    label: "Address",
    value: "H-133, First Floor, H Block, Sector 63, Noida, Uttar Pradesh 201309",
    href: null,
  },
];

export default function PrivacyPolicy() {
  return (
    <div
      id="top"
      className="min-h-screen bg-white text-slate-900 font-['system-ui']"
    >
      <style>{`
        :root {
          --amber: #f59e0b;
          --amber-light: #fb923c;
          --amber-dark: #d97706;
          --surface: #ffffff;
          --surface-2: #f9fafb;
          --border: rgba(0,0,0,0.08);
          --text-muted: #6b7280;
        }
        * { box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif; }
        .heading { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif; }

        .toc-link {
          position: relative;
          transition: color 0.2s;
          padding-left: 1rem;
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
          font-size: 0.875rem;
          color: #6b7280;
          text-decoration: none;
        }
        .toc-link::before {
          content: '';
          position: absolute;
          left: 0; top: 50%;
          transform: translateY(-50%);
          width: 2px; height: 0;
          background: var(--amber);
          border-radius: 2px;
          transition: height 0.2s;
        }
        .toc-link:hover::before { height: 100%; }
        .toc-link:hover { color: var(--amber-dark); }

        .section-card {
          border: 1px solid var(--border);
          border-radius: 12px;
          background: var(--surface);
          overflow: hidden;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        .section-head {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.875rem;
          padding: 1.125rem 1.5rem;
        }

        .icon-wrap {
          width: 36px; height: 36px;
          border-radius: 8px;
          background: rgba(245,158,11,0.12);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .section-body {
          padding: 0 1.5rem 1.5rem;
          border-top: 1px solid var(--border);
        }

        .subsection-item {
          padding: 0.75rem 1rem;
          border-radius: 8px;
          background: var(--surface-2);
          border-left: 3px solid rgba(245,158,11,0.5);
          margin-bottom: 0.625rem;
        }
        .subsection-item:last-child { margin-bottom: 0; }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(245,158,11,0.12);
          border: 1px solid rgba(245,158,11,0.3);
          border-radius: 100px;
          padding: 0.375rem 1rem;
          font-size: 0.8rem;
          color: var(--amber-dark);
          font-weight: 500;
          letter-spacing: 0.02em;
          margin-bottom: 1.25rem;
        }

        .contact-card {
          display: flex;
          align-items: flex-start;
          gap: 0.875rem;
          padding: 1rem 1.25rem;
          background: var(--surface-2);
          border-radius: 10px;
          border: 1px solid var(--border);
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
        }

        .sticky-nav {
          position: sticky;
          top: 5.5rem;
          max-height: calc(100vh - 7rem);
          overflow-y: auto;
        }

        .update-banner {
          background: linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(245,158,11,0.04) 100%);
          border: 1px solid rgba(245,158,11,0.2);
          border-radius: 10px;
          padding: 1rem 1.25rem;
          font-size: 0.875rem;
          color: #4b5563;
          line-height: 1.6;
        }
      `}</style>

      {/* Navbar */}
      <header
        style={{
          background: "rgba(255,255,255,0.95)",
          borderBottom: "1px solid var(--border)",
        }}
        className="sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 group">
            <div
              style={{
                background: "rgba(245,158,11,0.12)",
                border: "1px solid rgba(245,158,11,0.3)",
                borderRadius: 8,
                padding: "6px",
              }}
            >
              <Shield className="w-5 h-5" style={{ color: "var(--amber-dark)" }} />
            </div>
            <span className="heading text-base font-bold text-slate-900">
              Eashwa
            </span>
            <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
              / Privacy Policy
            </span>
          </a>
          <span
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: "3px 10px",
            }}
          >
            Updated May 2026
          </span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        {/* Hero */}
        <div className="mb-12 max-w-2xl">
          <div className="hero-badge">
            <Lock className="w-3.5 h-3.5" />
            Your data, protected
          </div>
          <h1 className="heading text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
            Privacy <span style={{ color: "var(--amber)" }}>Policy</span>
          </h1>
          <p style={{ color: "#4b5563", lineHeight: 1.7, fontSize: "1.05rem" }}>
            We believe privacy is a right, not a checkbox. Here&apos;s a clear,
            honest explanation of what we collect, why we collect it, and how we
            keep it safe.
          </p>
        </div>

        <div className="flex gap-8 items-start">
          {/* Sidebar TOC – desktop only, plain anchor links (no JS) */}
          <aside className="hidden lg:block w-64 flex-shrink-0 sticky-nav">
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.15em",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                marginBottom: "0.875rem",
              }}
            >
              Contents
            </p>
            <nav className="space-y-0.5">
              {sections.map((s) => {
                const Icon = sectionIcons[s.id] || Shield;
                return (
                  <a key={s.id} href={`#${s.id}`} className="toc-link">
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    {s.title}
                  </a>
                );
              })}
            </nav>
          </aside>

          {/* Main content — every section fully expanded */}
          <div className="flex-1 min-w-0 space-y-3">
            {sections.map((section) => {
              const Icon = sectionIcons[section.id] || Shield;
              return (
                <section
                  key={section.id}
                  id={section.id}
                  className="section-card"
                  style={{ scrollMarginTop: "6rem" }}
                >
                  <div className="section-head">
                    <span className="icon-wrap">
                      <Icon className="w-4 h-4" style={{ color: "var(--amber)" }} />
                    </span>
                    <h2
                      className="heading font-semibold text-slate-900"
                      style={{ fontSize: "0.975rem", margin: 0 }}
                    >
                      {section.title}
                    </h2>
                  </div>

                  <div className="section-body">
                    {section.content && (
                      <p
                        style={{
                          color: "#4b5563",
                          lineHeight: 1.75,
                          fontSize: "0.9rem",
                          paddingTop: "1rem",
                        }}
                      >
                        {section.content}
                      </p>
                    )}

                    {section.subsections && (
                      <div style={{ paddingTop: "1rem" }}>
                        {section.subsections.map((sub, i) => (
                          <div key={i} className="subsection-item">
                            <h3 className="heading font-semibold text-slate-900 text-sm mb-1">
                              {sub.subtitle}
                            </h3>
                            <p
                              style={{
                                color: "#4b5563",
                                fontSize: "0.85rem",
                                lineHeight: 1.65,
                              }}
                            >
                              {sub.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {section.hasContactInfo && (
                      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {contactInfo.map((info, i) => {
                          const Ic = info.icon;
                          const inner = (
                            <div className="contact-card">
                              <div
                                style={{
                                  background: "rgba(245,158,11,0.12)",
                                  borderRadius: 8,
                                  padding: 8,
                                  flexShrink: 0,
                                }}
                              >
                                <Ic
                                  className="w-4 h-4"
                                  style={{ color: "var(--amber)" }}
                                />
                              </div>
                              <div>
                                <p className="heading text-xs font-semibold text-slate-900 mb-0.5">
                                  {info.label}
                                </p>
                                <p style={{ color: "#4b5563", fontSize: "0.82rem" }}>
                                  {info.value}
                                </p>
                              </div>
                            </div>
                          );
                          return info.href ? (
                            <a
                              key={i}
                              href={info.href}
                              style={{ textDecoration: "none" }}
                            >
                              {inner}
                            </a>
                          ) : (
                            <div key={i}>{inner}</div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </section>
              );
            })}

            <div className="mt-6">
              <a
                href="#top"
                style={{
                  fontSize: "0.85rem",
                  color: "var(--amber-dark)",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                ↑ Back to top
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
