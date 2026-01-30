"use client";

import Link from "next/link";
import {
    Activity,
    ArrowLeft,
    Shield,
    Brain,
    Heart,
    AlertTriangle,
    CheckCircle2,
    Users,
    Lock,
    Zap
} from "lucide-react";

export default function AboutPage() {
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
                        <Link href="/" className="nav-link">Home</Link>
                        <Link href="/dashboard" className="btn btn-primary btn-sm">
                            Open Dashboard
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section style={{
                paddingTop: "160px",
                paddingBottom: "var(--space-24)",
                backgroundColor: "var(--color-gray-50)"
            }}>
                <div className="container">
                    <Link
                        href="/"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "var(--space-2)",
                            color: "var(--color-gray-500)",
                            fontSize: "var(--text-sm)",
                            marginBottom: "var(--space-6)"
                        }}
                    >
                        <ArrowLeft size={16} />
                        Back to Home
                    </Link>

                    <h1 style={{
                        fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
                        marginBottom: "var(--space-6)"
                    }}>
                        About Pulse AI
                    </h1>

                    <p style={{
                        fontSize: "var(--text-xl)",
                        color: "var(--color-gray-600)",
                        maxWidth: "700px",
                        lineHeight: "var(--leading-relaxed)"
                    }}>
                        Pulse AI is a continuous clinical surveillance platform that detects
                        health changes early. We learn your unique patterns and alert you when
                        something shifts—without ever diagnosing disease.
                    </p>
                </div>
            </section>

            {/* Mission */}
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
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                marginBottom: "var(--space-4)"
                            }}>
                                Our Mission
                            </div>
                            <h2 style={{ marginBottom: "var(--space-6)" }}>
                                Early Warning, Not Diagnosis
                            </h2>
                            <p style={{
                                fontSize: "var(--text-lg)",
                                color: "var(--color-gray-600)",
                                marginBottom: "var(--space-6)",
                                lineHeight: "var(--leading-relaxed)"
                            }}>
                                We believe that the best healthcare is proactive, not reactive.
                                Pulse AI empowers you with awareness about your health trends,
                                helping you take action before small changes become big problems.
                            </p>
                            <p style={{
                                fontSize: "var(--text-base)",
                                color: "var(--color-gray-500)",
                                lineHeight: "var(--leading-relaxed)"
                            }}>
                                We are not a diagnostic tool. We don't tell you what's wrong—we
                                tell you when something is different. That's a crucial distinction
                                that keeps humans in control of their health decisions.
                            </p>
                        </div>

                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "var(--space-4)"
                        }}>
                            {[
                                { icon: <Brain size={24} />, label: "AI-Powered", desc: "Personalized learning" },
                                { icon: <Shield size={24} />, label: "Non-Diagnostic", desc: "Decision support only" },
                                { icon: <Heart size={24} />, label: "Human-First", desc: "You're always in control" },
                                { icon: <Zap size={24} />, label: "Proactive", desc: "Early detection focus" }
                            ].map((item, i) => (
                                <div key={i} className="card" style={{ textAlign: "center" }}>
                                    <div style={{
                                        width: "48px",
                                        height: "48px",
                                        borderRadius: "var(--radius-lg)",
                                        backgroundColor: "var(--color-gray-100)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        margin: "0 auto var(--space-4)",
                                        color: "var(--color-accent-primary)"
                                    }}>
                                        {item.icon}
                                    </div>
                                    <h5 style={{ marginBottom: "var(--space-1)" }}>{item.label}</h5>
                                    <p style={{
                                        fontSize: "var(--text-sm)",
                                        color: "var(--color-gray-500)",
                                        margin: 0
                                    }}>
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* How CareScore Works */}
            <section className="section" style={{ backgroundColor: "var(--color-gray-50)" }}>
                <div className="container">
                    <div style={{ textAlign: "center", marginBottom: "var(--space-16)" }}>
                        <h2 style={{ marginBottom: "var(--space-4)" }}>
                            The Science Behind CareScore
                        </h2>
                        <p style={{
                            fontSize: "var(--text-lg)",
                            color: "var(--color-gray-500)",
                            maxWidth: "600px",
                            margin: "0 auto"
                        }}>
                            CareScore is a transparent, explainable metric composed of four components.
                        </p>
                    </div>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: "var(--space-4)"
                    }}>
                        {[
                            {
                                score: "0-40",
                                name: "Severity",
                                desc: "How far your signals deviate from your personal baseline, measured in z-scores."
                            },
                            {
                                score: "0-25",
                                name: "Persistence",
                                desc: "How long the deviation has been sustained. Brief spikes are different from ongoing trends."
                            },
                            {
                                score: "0-20",
                                name: "Cross-Signal",
                                desc: "How many signals agree on the drift. Multiple confirming signals increase confidence."
                            },
                            {
                                score: "0-10",
                                name: "Manual Modifier",
                                desc: "Risk from manually entered data like blood pressure, blood sugar, and symptoms."
                            }
                        ].map((item, i) => (
                            <div key={i} className="card" style={{
                                opacity: 0,
                                animation: `fadeInUp 0.5s ease-out ${i * 0.1}s forwards`
                            }}>
                                <div style={{
                                    fontSize: "var(--text-3xl)",
                                    fontWeight: "var(--font-bold)",
                                    color: "var(--color-accent-primary)",
                                    marginBottom: "var(--space-2)"
                                }}>
                                    {item.score}
                                </div>
                                <h5 style={{ marginBottom: "var(--space-3)" }}>{item.name}</h5>
                                <p style={{
                                    fontSize: "var(--text-sm)",
                                    color: "var(--color-gray-500)",
                                    margin: 0,
                                    lineHeight: "var(--leading-relaxed)"
                                }}>
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div style={{
                        marginTop: "var(--space-12)",
                        textAlign: "center"
                    }}>
                        <div style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "var(--space-4)",
                            padding: "var(--space-4) var(--space-8)",
                            backgroundColor: "var(--color-white)",
                            borderRadius: "var(--radius-xl)",
                            boxShadow: "var(--shadow-md)"
                        }}>
                            <span style={{ fontSize: "var(--text-lg)", fontWeight: "var(--font-semibold)" }}>
                                Final CareScore
                            </span>
                            <span style={{ color: "var(--color-gray-400)" }}>=</span>
                            <span>Severity + Persistence + Cross-Signal + Manual</span>
                            <span style={{ color: "var(--color-gray-400)" }}>=</span>
                            <span style={{
                                fontSize: "var(--text-xl)",
                                fontWeight: "var(--font-bold)",
                                color: "var(--color-accent-primary)"
                            }}>
                                0-100
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* What We Don't Do */}
            <section className="section">
                <div className="container container-narrow">
                    <div style={{ textAlign: "center", marginBottom: "var(--space-12)" }}>
                        <h2 style={{ marginBottom: "var(--space-4)" }}>
                            What Pulse AI Does NOT Do
                        </h2>
                        <p style={{ color: "var(--color-gray-500)", fontSize: "var(--text-lg)" }}>
                            Understanding our boundaries is as important as understanding our capabilities.
                        </p>
                    </div>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "var(--space-4)"
                    }}>
                        {[
                            "We do NOT diagnose diseases",
                            "We do NOT replace medical professionals",
                            "We do NOT provide treatment recommendations",
                            "We do NOT make emergency medical decisions"
                        ].map((item, i) => (
                            <div key={i} style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "var(--space-3)",
                                padding: "var(--space-4)",
                                backgroundColor: "rgba(239, 68, 68, 0.05)",
                                borderRadius: "var(--radius-lg)",
                                border: "1px solid rgba(239, 68, 68, 0.1)"
                            }}>
                                <AlertTriangle size={20} style={{ color: "var(--color-accent-danger)", flexShrink: 0 }} />
                                <span style={{ fontSize: "var(--text-sm)", color: "var(--color-gray-700)" }}>
                                    {item}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div style={{
                        marginTop: "var(--space-8)",
                        padding: "var(--space-6)",
                        backgroundColor: "var(--color-accent-secondary-10)",
                        borderRadius: "var(--radius-xl)",
                        border: "1px solid rgba(16, 185, 129, 0.2)"
                    }}>
                        <div style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "var(--space-4)"
                        }}>
                            <CheckCircle2 size={24} style={{ color: "var(--color-accent-secondary)", flexShrink: 0 }} />
                            <div>
                                <h5 style={{ marginBottom: "var(--space-2)" }}>What We DO Provide</h5>
                                <p style={{
                                    fontSize: "var(--text-sm)",
                                    color: "var(--color-gray-600)",
                                    margin: 0,
                                    lineHeight: "var(--leading-relaxed)"
                                }}>
                                    Early awareness of health pattern changes, personalized baseline tracking,
                                    transparent risk scoring, and calm recommendations to consult healthcare
                                    professionals when appropriate. We're a tool for proactive health awareness,
                                    not a replacement for medical care.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Privacy */}
            <section className="section" style={{ backgroundColor: "var(--color-black)" }}>
                <div className="container container-narrow" style={{ textAlign: "center" }}>
                    <Lock size={48} style={{ color: "var(--color-gray-600)", marginBottom: "var(--space-6)" }} />
                    <h2 style={{ color: "var(--color-white)", marginBottom: "var(--space-4)" }}>
                        Your Data, Your Control
                    </h2>
                    <p style={{
                        color: "var(--color-gray-400)",
                        fontSize: "var(--text-lg)",
                        maxWidth: "600px",
                        margin: "0 auto var(--space-8)"
                    }}>
                        We take your health data privacy seriously. Your information is encrypted,
                        never sold, and you can delete it anytime.
                    </p>
                    <Link href="/dashboard" className="btn btn-accent btn-lg">
                        Start Your Health Journey
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
