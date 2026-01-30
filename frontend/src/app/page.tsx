"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Shield,
  Brain,
  Bell,
  TrendingUp,
  Heart,
  Zap,
  ChevronRight,
  ArrowRight,
  BarChart3,
  Clock,
  Users,
  CheckCircle2
} from "lucide-react";

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: <Activity size={24} />,
      title: "Continuous Monitoring",
      description: "Connect your wearables and smart rings for 24/7 health tracking. We collect heart rate, HRV, sleep, and activity data."
    },
    {
      icon: <Brain size={24} />,
      title: "Personalized Baseline",
      description: "Our AI learns YOUR normal patterns over time. No one-size-fits-all thresholds—just you."
    },
    {
      icon: <TrendingUp size={24} />,
      title: "Drift Detection",
      description: "We detect sustained changes in your health signals, not random one-off readings."
    },
    {
      icon: <Shield size={24} />,
      title: "CareScore™",
      description: "A single 0-100 score that summarizes your overall health stability with full explainability."
    },
    {
      icon: <Bell size={24} />,
      title: "Smart Escalation",
      description: "Calm, progressive notifications. We never diagnose—we help you know when to see a doctor."
    },
    {
      icon: <Heart size={24} />,
      title: "Human-in-the-Loop",
      description: "You're always in control. Review recommendations, add context, and make informed decisions."
    }
  ];

  const stats = [
    { value: "24/7", label: "Continuous Monitoring" },
    { value: "0-100", label: "CareScore Scale" },
    { value: "<5min", label: "Alert Response" },
    { value: "100%", label: "Non-Diagnostic" }
  ];

  return (
    <main>
      {/* Navigation */}
      <nav className="nav">
        <div className="container nav-inner">
          <Link href="/" className="nav-logo">
            <Activity size={24} />
            <span>Pulse AI</span>
          </Link>

          <div className="nav-links">
            <Link href="#features" className="nav-link">Features</Link>
            <Link href="#how-it-works" className="nav-link">How it Works</Link>
            <Link href="/about" className="nav-link">About</Link>
            <Link href="/dashboard" className="btn btn-primary btn-sm">
              Open Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" ref={heroRef}>
        <div className="container">
          <div
            className="hero-content"
            style={{
              opacity: 1 - scrollY / 600,
              transform: `translateY(${scrollY * 0.2}px)`
            }}
          >
            <div className="hero-eyebrow">
              <Zap size={16} />
              <span>Early Warning, Not Diagnosis</span>
            </div>

            <h1 className="hero-title">
              Your Health, Understood
            </h1>

            <p className="hero-subtitle">
              Pulse AI learns your unique health patterns and alerts you when something
              changes. We detect drift, not disease—empowering you to take action early.
            </p>

            <div className="hero-actions">
              <Link href="/dashboard" className="btn btn-primary btn-lg">
                Get Started
                <ArrowRight size={18} />
              </Link>
              <Link href="#how-it-works" className="btn btn-secondary btn-lg">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{
        backgroundColor: "var(--color-gray-50)",
        padding: "var(--space-12) 0",
        borderTop: "1px solid var(--color-gray-200)",
        borderBottom: "1px solid var(--color-gray-200)"
      }}>
        <div className="container">
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "var(--space-8)",
            textAlign: "center"
          }}>
            {stats.map((stat, i) => (
              <div key={i} style={{
                opacity: 0,
                animation: `fadeInUp 0.6s ease-out ${i * 0.1}s forwards`
              }}>
                <div style={{
                  fontSize: "var(--text-4xl)",
                  fontWeight: "var(--font-bold)",
                  color: "var(--color-black)",
                  letterSpacing: "-0.02em",
                  marginBottom: "var(--space-2)"
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-gray-500)"
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "var(--space-16)" }}>
            <h2 style={{ marginBottom: "var(--space-4)" }}>
              Designed for Your Wellbeing
            </h2>
            <p style={{
              fontSize: "var(--text-lg)",
              maxWidth: "600px",
              margin: "0 auto",
              color: "var(--color-gray-500)"
            }}>
              Every feature is built with care, prioritizing explainability and
              human agency over algorithmic black boxes.
            </p>
          </div>

          <div className="feature-grid">
            {features.map((feature, i) => (
              <div
                key={i}
                className="card feature-card"
                style={{
                  opacity: 0,
                  animation: `fadeInUp 0.6s ease-out ${i * 0.1}s forwards`
                }}
              >
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h4 className="feature-title">{feature.title}</h4>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="section" style={{ backgroundColor: "var(--color-gray-50)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "var(--space-16)" }}>
            <h2 style={{ marginBottom: "var(--space-4)" }}>
              How Pulse AI Works
            </h2>
            <p style={{
              fontSize: "var(--text-lg)",
              maxWidth: "600px",
              margin: "0 auto",
              color: "var(--color-gray-500)"
            }}>
              A simple, transparent process that puts you in control.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "var(--space-8)"
          }}>
            {[
              {
                step: "01",
                title: "Connect Your Devices",
                description: "Link your smartwatch, smart ring, or manually enter health data. We support all major wearables.",
                icon: <Clock size={32} />
              },
              {
                step: "02",
                title: "Learn Your Baseline",
                description: "Over 14 days, our AI learns your personalized health patterns—your unique normal.",
                icon: <BarChart3 size={32} />
              },
              {
                step: "03",
                title: "Monitor & Alert",
                description: "When we detect sustained changes, we alert you calmly with actionable insights.",
                icon: <Bell size={32} />
              }
            ].map((item, i) => (
              <div key={i} style={{
                textAlign: "center",
                padding: "var(--space-8)",
                opacity: 0,
                animation: `fadeInUp 0.6s ease-out ${i * 0.15}s forwards`
              }}>
                <div style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "var(--radius-xl)",
                  backgroundColor: "var(--color-white)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto var(--space-6)",
                  boxShadow: "var(--shadow-md)",
                  color: "var(--color-accent-primary)"
                }}>
                  {item.icon}
                </div>
                <div style={{
                  fontSize: "var(--text-sm)",
                  fontWeight: "var(--font-semibold)",
                  color: "var(--color-accent-primary)",
                  marginBottom: "var(--space-2)"
                }}>
                  Step {item.step}
                </div>
                <h4 style={{ marginBottom: "var(--space-3)" }}>{item.title}</h4>
                <p style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-gray-500)",
                  lineHeight: "var(--leading-relaxed)"
                }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CareScore Section */}
      <section className="section">
        <div className="container">
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "var(--space-16)",
            alignItems: "center"
          }}>
            <div>
              <div style={{
                fontSize: "var(--text-sm)",
                fontWeight: "var(--font-semibold)",
                color: "var(--color-accent-primary)",
                marginBottom: "var(--space-4)",
                textTransform: "uppercase",
                letterSpacing: "0.05em"
              }}>
                Introducing
              </div>
              <h2 style={{ marginBottom: "var(--space-6)" }}>
                CareScore™
              </h2>
              <p style={{
                fontSize: "var(--text-lg)",
                color: "var(--color-gray-600)",
                marginBottom: "var(--space-8)",
                lineHeight: "var(--leading-relaxed)"
              }}>
                A single score from 0-100 that tells you how stable your health is.
                Fully transparent, fully explainable.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                {[
                  { range: "0-30", status: "Stable", color: "var(--color-accent-secondary)" },
                  { range: "31-50", status: "Mild changes", color: "var(--color-accent-primary)" },
                  { range: "51-70", status: "Moderate attention", color: "var(--color-accent-warning)" },
                  { range: "71-100", status: "Consult recommended", color: "var(--color-accent-danger)" }
                ].map((item, i) => (
                  <div key={i} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-4)"
                  }}>
                    <div style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: item.color
                    }} />
                    <span style={{
                      fontWeight: "var(--font-semibold)",
                      minWidth: "70px"
                    }}>
                      {item.range}
                    </span>
                    <span style={{ color: "var(--color-gray-600)" }}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}>
              <div style={{
                width: "280px",
                height: "280px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--color-gray-100) 0%, var(--color-white) 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.08)",
                border: "1px solid var(--color-gray-200)"
              }}>
                <div style={{
                  fontSize: "4rem",
                  fontWeight: "var(--font-bold)",
                  color: "var(--color-accent-secondary)",
                  lineHeight: 1,
                  letterSpacing: "-0.02em"
                }}>
                  42
                </div>
                <div style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-gray-500)",
                  marginTop: "var(--space-2)"
                }}>
                  CareScore
                </div>
                <div className="badge badge-mild" style={{ marginTop: "var(--space-3)" }}>
                  Stable
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section" style={{ backgroundColor: "var(--color-black)" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h2 style={{ color: "var(--color-white)", marginBottom: "var(--space-4)" }}>
            Ready to understand your health?
          </h2>
          <p style={{
            color: "var(--color-gray-400)",
            fontSize: "var(--text-lg)",
            maxWidth: "500px",
            margin: "0 auto var(--space-8)"
          }}>
            Start your journey toward proactive health awareness. No diagnosis,
            just early warnings.
          </p>
          <Link href="/dashboard" className="btn btn-accent btn-lg">
            Open Dashboard
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: "var(--space-16) 0",
        borderTop: "1px solid var(--color-gray-200)"
      }}>
        <div className="container">
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              color: "var(--color-gray-500)"
            }}>
              <Activity size={20} />
              <span style={{ fontWeight: "var(--font-semibold)" }}>Pulse AI</span>
            </div>
            <p style={{
              fontSize: "var(--text-sm)",
              color: "var(--color-gray-400)"
            }}>
              © 2024 Pulse AI. Early warning, not diagnosis.
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}
