"use client";

import Link from "next/link";
import {
    Activity,
    LayoutDashboard,
    LineChart,
    Bell,
    PlusCircle,
    HelpCircle,
    Settings,
    LogOut,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Info
} from "lucide-react";

const sidebarLinks = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { href: "/dashboard/insights", label: "Insights", icon: <LineChart size={20} /> },
    { href: "/dashboard/escalations", label: "Escalations", icon: <Bell size={20} /> },
    { href: "/dashboard/manual-entry", label: "Manual Entry", icon: <PlusCircle size={20} /> },
    { href: "/about", label: "About", icon: <HelpCircle size={20} /> }
];

const insights = [
    {
        type: "warning",
        title: "Sleep Duration Declining",
        description: "Your average sleep duration has decreased by 22% over the past week compared to your baseline of 7.5 hours.",
        recommendation: "Try to maintain a consistent sleep schedule. Consider reducing screen time before bed.",
        timestamp: "2 hours ago",
        metric: "Sleep",
        current: 5.8,
        baseline: 7.5
    },
    {
        type: "info",
        title: "HRV Variability Noted",
        description: "Your heart rate variability has been lower than usual for the past 3 days, which may indicate elevated stress.",
        recommendation: "Consider incorporating relaxation techniques like deep breathing or meditation.",
        timestamp: "4 hours ago",
        metric: "HRV",
        current: 38,
        baseline: 45
    },
    {
        type: "success",
        title: "Activity Levels Stable",
        description: "Despite other changes, your daily step count has remained within normal range.",
        recommendation: "Keep up the good work with your physical activity routine.",
        timestamp: "1 day ago",
        metric: "Activity",
        current: 7800,
        baseline: 8500
    },
    {
        type: "info",
        title: "Breathing Rate Slightly Elevated",
        description: "Your resting breathing rate is 7% higher than your usual baseline.",
        recommendation: "This may be related to stress or activity. Monitor for persistence.",
        timestamp: "1 day ago",
        metric: "Breathing",
        current: 16,
        baseline: 15
    }
];

export default function InsightsPage() {
    const getInsightIcon = (type: string) => {
        switch (type) {
            case "warning": return <AlertTriangle size={20} style={{ color: "var(--color-accent-warning)" }} />;
            case "success": return <TrendingUp size={20} style={{ color: "var(--color-accent-secondary)" }} />;
            default: return <Info size={20} style={{ color: "var(--color-accent-primary)" }} />;
        }
    };

    const getInsightBorderColor = (type: string) => {
        switch (type) {
            case "warning": return "var(--color-accent-warning)";
            case "success": return "var(--color-accent-secondary)";
            default: return "var(--color-accent-primary)";
        }
    };

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
                            className={`sidebar-link ${link.href === "/dashboard/insights" ? "active" : ""}`}
                        >
                            {link.icon}
                            {link.label}
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
                        Health Insights
                    </h1>
                    <p style={{ color: "var(--color-gray-500)" }}>
                        AI-generated observations about your health patterns
                    </p>
                </div>

                {/* Insights Summary */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "var(--space-4)",
                    marginBottom: "var(--space-8)"
                }}>
                    <div className="card card-flat" style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "var(--text-4xl)", fontWeight: "var(--font-bold)", color: "var(--color-accent-warning)" }}>
                            2
                        </div>
                        <div style={{ fontSize: "var(--text-sm)", color: "var(--color-gray-500)" }}>
                            Attention Items
                        </div>
                    </div>
                    <div className="card card-flat" style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "var(--text-4xl)", fontWeight: "var(--font-bold)", color: "var(--color-accent-primary)" }}>
                            2
                        </div>
                        <div style={{ fontSize: "var(--text-sm)", color: "var(--color-gray-500)" }}>
                            Observations
                        </div>
                    </div>
                    <div className="card card-flat" style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "var(--text-4xl)", fontWeight: "var(--font-bold)", color: "var(--color-accent-secondary)" }}>
                            1
                        </div>
                        <div style={{ fontSize: "var(--text-sm)", color: "var(--color-gray-500)" }}>
                            Positive Notes
                        </div>
                    </div>
                </div>

                {/* Insights List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                    {insights.map((insight, i) => (
                        <div
                            key={i}
                            className="card"
                            style={{
                                borderLeft: `4px solid ${getInsightBorderColor(insight.type)}`,
                                opacity: 0,
                                animation: `fadeInUp 0.5s ease-out ${i * 0.1}s forwards`
                            }}
                        >
                            <div style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "var(--space-4)"
                            }}>
                                <div style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "var(--radius-lg)",
                                    backgroundColor: "var(--color-gray-100)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0
                                }}>
                                    {getInsightIcon(insight.type)}
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                        marginBottom: "var(--space-2)"
                                    }}>
                                        <h4 style={{ margin: 0 }}>{insight.title}</h4>
                                        <span style={{
                                            fontSize: "var(--text-xs)",
                                            color: "var(--color-gray-400)"
                                        }}>
                                            {insight.timestamp}
                                        </span>
                                    </div>

                                    <p style={{
                                        fontSize: "var(--text-sm)",
                                        color: "var(--color-gray-600)",
                                        marginBottom: "var(--space-4)"
                                    }}>
                                        {insight.description}
                                    </p>

                                    <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center"
                                    }}>
                                        <div style={{
                                            padding: "var(--space-3)",
                                            backgroundColor: "var(--color-gray-50)",
                                            borderRadius: "var(--radius-md)",
                                            fontSize: "var(--text-sm)"
                                        }}>
                                            <strong>Recommendation:</strong> {insight.recommendation}
                                        </div>

                                        <div style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "var(--space-4)"
                                        }}>
                                            <div style={{ textAlign: "right" }}>
                                                <div style={{ fontSize: "var(--text-xs)", color: "var(--color-gray-400)" }}>
                                                    Current
                                                </div>
                                                <div style={{ fontWeight: "var(--font-semibold)" }}>
                                                    {insight.current}
                                                </div>
                                            </div>
                                            {insight.current < insight.baseline ? (
                                                <TrendingDown size={16} style={{ color: "var(--color-accent-warning)" }} />
                                            ) : (
                                                <TrendingUp size={16} style={{ color: "var(--color-accent-secondary)" }} />
                                            )}
                                            <div style={{ textAlign: "left" }}>
                                                <div style={{ fontSize: "var(--text-xs)", color: "var(--color-gray-400)" }}>
                                                    Baseline
                                                </div>
                                                <div style={{ fontWeight: "var(--font-semibold)" }}>
                                                    {insight.baseline}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
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
