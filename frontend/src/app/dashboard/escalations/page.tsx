"use client";

import Link from "next/link";
import { useState } from "react";
import {
    Activity,
    LayoutDashboard,
    LineChart,
    Bell,
    PlusCircle,
    HelpCircle,
    Settings,
    LogOut,
    AlertTriangle,
    AlertCircle,
    Info,
    CheckCircle2,
    X,
    Calendar,
    Phone
} from "lucide-react";

const sidebarLinks = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { href: "/dashboard/insights", label: "Insights", icon: <LineChart size={20} /> },
    { href: "/dashboard/escalations", label: "Escalations", icon: <Bell size={20} /> },
    { href: "/dashboard/manual-entry", label: "Manual Entry", icon: <PlusCircle size={20} /> },
    { href: "/about", label: "About", icon: <HelpCircle size={20} /> }
];

const escalations = [
    {
        id: 1,
        level: 2,
        title: "Health Changes Detected",
        message: "Your recent health readings show patterns that differ from your usual baseline. This doesn't mean something is wrong, but it's worth paying attention to. Consider reviewing your recent activities, sleep, and stress levels.",
        timestamp: "Today, 2:30 PM",
        acknowledged: false,
        healthSummary: {
            careScore: 54,
            keySignals: [
                { signal: "Sleep Duration", current: 5.8, baseline: 7.5, deviation: "moderate" },
                { signal: "HRV", current: 38, baseline: 45, deviation: "mild" }
            ]
        }
    },
    {
        id: 2,
        level: 1,
        title: "Health Insights Available",
        message: "We've noticed some changes in your health data. Your body might be adapting to new conditions or activities. Continue monitoring and take note of how you feel.",
        timestamp: "Yesterday, 10:15 AM",
        acknowledged: true,
        actionTaken: "dismissed"
    },
    {
        id: 3,
        level: 1,
        title: "Baseline Learning Complete",
        message: "We've finished learning your personalized health baseline. You'll now receive more accurate alerts based on YOUR normal patterns.",
        timestamp: "3 days ago",
        acknowledged: true,
        actionTaken: "dismissed"
    }
];

export default function EscalationsPage() {
    const [escalationList, setEscalationList] = useState(escalations);

    const getLevelIcon = (level: number) => {
        switch (level) {
            case 3: return <AlertTriangle size={24} style={{ color: "var(--color-accent-danger)" }} />;
            case 2: return <AlertCircle size={24} style={{ color: "var(--color-accent-warning)" }} />;
            default: return <Info size={24} style={{ color: "var(--color-accent-primary)" }} />;
        }
    };

    const getLevelLabel = (level: number) => {
        switch (level) {
            case 3: return { text: "Consultation Recommended", class: "badge-high" };
            case 2: return { text: "Attention Needed", class: "badge-moderate" };
            default: return { text: "Awareness", class: "badge-mild" };
        }
    };

    const handleAcknowledge = (id: number, action: string) => {
        setEscalationList(prev =>
            prev.map(e =>
                e.id === id ? { ...e, acknowledged: true, actionTaken: action } : e
            )
        );
    };

    const activeEscalations = escalationList.filter(e => !e.acknowledged);
    const pastEscalations = escalationList.filter(e => e.acknowledged);

    return (
        <div className="dashboard">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <Activity size={24} style={{ color: "var(--color-accent-primary)" }} />
                    <span>Pulse AI</span>
                </div>

                <nav className="sidebar-nav">
                    {sidebarLinks.map((link, i) => (
                        <Link
                            key={i}
                            href={link.href}
                            className={`sidebar-link ${link.href === "/dashboard/escalations" ? "active" : ""}`}
                        >
                            {link.icon}
                            {link.label}
                            {link.href === "/dashboard/escalations" && activeEscalations.length > 0 && (
                                <span style={{
                                    marginLeft: "auto",
                                    backgroundColor: "var(--color-accent-danger)",
                                    color: "white",
                                    fontSize: "var(--text-xs)",
                                    padding: "2px 6px",
                                    borderRadius: "var(--radius-full)"
                                }}>
                                    {activeEscalations.length}
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>

                <div style={{
                    marginTop: "auto",
                    paddingTop: "var(--space-8)",
                    borderTop: "1px solid var(--color-gray-200)"
                }}>
                    <Link href="/settings" className="sidebar-link">
                        <Settings size={20} />
                        Settings
                    </Link>
                    <Link href="/" className="sidebar-link">
                        <LogOut size={20} />
                        Exit Dashboard
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <div style={{ marginBottom: "var(--space-8)" }}>
                    <h1 style={{ fontSize: "var(--text-3xl)", marginBottom: "var(--space-2)" }}>
                        Escalations
                    </h1>
                    <p style={{ color: "var(--color-gray-500)" }}>
                        Health alerts and recommendations that need your attention
                    </p>
                </div>

                {/* Active Escalations */}
                {activeEscalations.length > 0 && (
                    <>
                        <h4 style={{ marginBottom: "var(--space-4)" }}>Active Alerts</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", marginBottom: "var(--space-8)" }}>
                            {activeEscalations.map((escalation, i) => {
                                const levelInfo = getLevelLabel(escalation.level);
                                return (
                                    <div
                                        key={escalation.id}
                                        className={`card ${escalation.level === 3 ? "alert-danger" : escalation.level === 2 ? "alert-warning" : ""}`}
                                        style={{
                                            opacity: 0,
                                            animation: `fadeInUp 0.5s ease-out ${i * 0.1}s forwards`
                                        }}
                                    >
                                        <div style={{ display: "flex", gap: "var(--space-4)" }}>
                                            <div style={{ flexShrink: 0 }}>
                                                {getLevelIcon(escalation.level)}
                                            </div>

                                            <div style={{ flex: 1 }}>
                                                <div style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "flex-start",
                                                    marginBottom: "var(--space-2)"
                                                }}>
                                                    <div>
                                                        <span className={`badge ${levelInfo.class}`} style={{ marginBottom: "var(--space-2)" }}>
                                                            {levelInfo.text}
                                                        </span>
                                                        <h4 style={{ margin: 0 }}>{escalation.title}</h4>
                                                    </div>
                                                    <span style={{ fontSize: "var(--text-xs)", color: "var(--color-gray-400)" }}>
                                                        {escalation.timestamp}
                                                    </span>
                                                </div>

                                                <p style={{
                                                    fontSize: "var(--text-sm)",
                                                    color: "var(--color-gray-600)",
                                                    marginBottom: "var(--space-4)"
                                                }}>
                                                    {escalation.message}
                                                </p>

                                                {escalation.healthSummary && (
                                                    <div style={{
                                                        backgroundColor: "var(--color-gray-50)",
                                                        borderRadius: "var(--radius-lg)",
                                                        padding: "var(--space-4)",
                                                        marginBottom: "var(--space-4)"
                                                    }}>
                                                        <div style={{
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            marginBottom: "var(--space-3)"
                                                        }}>
                                                            <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-semibold)" }}>
                                                                Health Summary
                                                            </span>
                                                            <span style={{ fontSize: "var(--text-sm)" }}>
                                                                CareScore: <strong>{escalation.healthSummary.careScore}</strong>
                                                            </span>
                                                        </div>
                                                        <div style={{ display: "flex", gap: "var(--space-4)" }}>
                                                            {escalation.healthSummary.keySignals.map((signal, j) => (
                                                                <div key={j} style={{
                                                                    flex: 1,
                                                                    fontSize: "var(--text-xs)",
                                                                    padding: "var(--space-2)",
                                                                    backgroundColor: "var(--color-white)",
                                                                    borderRadius: "var(--radius-md)"
                                                                }}>
                                                                    <div style={{ color: "var(--color-gray-500)", marginBottom: "2px" }}>
                                                                        {signal.signal}
                                                                    </div>
                                                                    <div>
                                                                        <strong>{signal.current}</strong>
                                                                        <span style={{ color: "var(--color-gray-400)" }}> / {signal.baseline}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div style={{ display: "flex", gap: "var(--space-3)" }}>
                                                    {escalation.level >= 2 && (
                                                        <button
                                                            className="btn btn-primary btn-sm"
                                                            onClick={() => handleAcknowledge(escalation.id, "scheduled")}
                                                        >
                                                            <Calendar size={14} />
                                                            Schedule Doctor Visit
                                                        </button>
                                                    )}
                                                    <button
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => handleAcknowledge(escalation.id, "dismissed")}
                                                    >
                                                        <CheckCircle2 size={14} />
                                                        Acknowledge
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                {activeEscalations.length === 0 && (
                    <div className="card" style={{
                        textAlign: "center",
                        padding: "var(--space-12)",
                        marginBottom: "var(--space-8)"
                    }}>
                        <CheckCircle2 size={48} style={{ color: "var(--color-accent-secondary)", marginBottom: "var(--space-4)" }} />
                        <h4>All Clear</h4>
                        <p style={{ color: "var(--color-gray-500)", margin: 0 }}>
                            No active alerts. You're all caught up!
                        </p>
                    </div>
                )}

                {/* Past Escalations */}
                {pastEscalations.length > 0 && (
                    <>
                        <h4 style={{ marginBottom: "var(--space-4)", color: "var(--color-gray-500)" }}>
                            Past Alerts
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                            {pastEscalations.map((escalation) => (
                                <div
                                    key={escalation.id}
                                    className="card"
                                    style={{ opacity: 0.6, padding: "var(--space-4)" }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                                        <CheckCircle2 size={16} style={{ color: "var(--color-accent-secondary)" }} />
                                        <span style={{ flex: 1, fontSize: "var(--text-sm)" }}>{escalation.title}</span>
                                        <span style={{ fontSize: "var(--text-xs)", color: "var(--color-gray-400)" }}>
                                            {escalation.timestamp}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>

            <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
        </div>
    );
}
