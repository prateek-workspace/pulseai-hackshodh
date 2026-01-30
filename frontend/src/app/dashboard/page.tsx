"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Activity,
    Heart,
    Moon,
    Footprints,
    Wind,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    CheckCircle2,
    ChevronRight,
    LayoutDashboard,
    LineChart,
    Bell,
    PlusCircle,
    HelpCircle,
    Settings,
    LogOut,
    RefreshCw
} from "lucide-react";

// Mock data for demonstration
const mockCareScore = {
    score: 47,
    status: "mild",
    components: {
        severity: 15.2,
        persistence: 12.0,
        crossSignal: 11.0,
        manualModifier: 8.8
    },
    explanation: "Your sleep duration has decreased over the past week, and your HRV is slightly lower than your baseline. These changes are mild and worth monitoring.",
    confidence: 78,
    stability: 65,
    driftScore: 32
};

const mockMetrics = [
    {
        label: "Heart Rate",
        value: 78,
        unit: "bpm",
        baseline: 72,
        icon: <Heart size={20} />,
        trend: "up",
        change: "+8%"
    },
    {
        label: "HRV",
        value: 38,
        unit: "ms",
        baseline: 45,
        icon: <Activity size={20} />,
        trend: "down",
        change: "-16%"
    },
    {
        label: "Sleep",
        value: 5.8,
        unit: "hrs",
        baseline: 7.5,
        icon: <Moon size={20} />,
        trend: "down",
        change: "-23%"
    },
    {
        label: "Activity",
        value: 6240,
        unit: "steps",
        baseline: 8500,
        icon: <Footprints size={20} />,
        trend: "down",
        change: "-27%"
    },
    {
        label: "Breathing",
        value: 16,
        unit: "/min",
        baseline: 15,
        icon: <Wind size={20} />,
        trend: "up",
        change: "+7%"
    }
];

const mockTrends = [
    { date: "Jan 20", careScore: 28 },
    { date: "Jan 21", careScore: 30 },
    { date: "Jan 22", careScore: 32 },
    { date: "Jan 23", careScore: 35 },
    { date: "Jan 24", careScore: 38 },
    { date: "Jan 25", careScore: 42 },
    { date: "Jan 26", careScore: 45 },
    { date: "Jan 27", careScore: 47 }
];

const sidebarLinks = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { href: "/dashboard/insights", label: "Insights", icon: <LineChart size={20} /> },
    { href: "/dashboard/escalations", label: "Escalations", icon: <Bell size={20} /> },
    { href: "/dashboard/manual-entry", label: "Manual Entry", icon: <PlusCircle size={20} /> },
    { href: "/about", label: "About", icon: <HelpCircle size={20} /> }
];

export default function Dashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [careScore, setCareScore] = useState(mockCareScore);

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "stable": return "var(--color-accent-secondary)";
            case "mild": return "var(--color-accent-primary)";
            case "moderate": return "var(--color-accent-warning)";
            case "high": return "var(--color-accent-danger)";
            default: return "var(--color-gray-500)";
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case "stable": return "badge-stable";
            case "mild": return "badge-mild";
            case "moderate": return "badge-moderate";
            case "high": return "badge-high";
            default: return "";
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
                            className={`sidebar-link ${link.href === "/dashboard" ? "active" : ""}`}
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
                {/* Header */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "var(--space-8)"
                }}>
                    <div>
                        <h1 style={{ fontSize: "var(--text-3xl)", marginBottom: "var(--space-2)" }}>
                            Dashboard
                        </h1>
                        <p style={{ color: "var(--color-gray-500)" }}>
                            Your health overview at a glance
                        </p>
                    </div>
                    <button className="btn btn-secondary" onClick={() => setIsLoading(true)}>
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </div>

                {/* Alert Banner (if high CareScore) */}
                {careScore.score > 50 && (
                    <div className={`alert ${careScore.score > 70 ? "alert-danger" : "alert-warning"}`}
                        style={{ marginBottom: "var(--space-6)" }}>
                        <AlertCircle size={24} style={{
                            color: careScore.score > 70 ? "var(--color-accent-danger)" : "var(--color-accent-warning)"
                        }} />
                        <div className="alert-content">
                            <div className="alert-title">
                                {careScore.score > 70
                                    ? "Consider Consulting a Healthcare Provider"
                                    : "Health Changes Detected"
                                }
                            </div>
                            <div className="alert-message">
                                {careScore.explanation}
                            </div>
                        </div>
                        <button className="btn btn-sm btn-secondary">
                            View Details
                            <ChevronRight size={14} />
                        </button>
                    </div>
                )}

                {/* CareScore Card */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 2fr",
                    gap: "var(--space-6)",
                    marginBottom: "var(--space-8)"
                }}>
                    {/* Main Score */}
                    <div className="card card-elevated" style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "var(--space-10)",
                        background: `linear-gradient(135deg, var(--color-white) 0%, var(--color-gray-50) 100%)`
                    }}>
                        <div style={{
                            fontSize: "var(--text-sm)",
                            fontWeight: "var(--font-medium)",
                            color: "var(--color-gray-500)",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            marginBottom: "var(--space-4)"
                        }}>
                            CareScore
                        </div>

                        <div style={{
                            width: "180px",
                            height: "180px",
                            borderRadius: "50%",
                            background: `conic-gradient(
                ${getStatusColor(careScore.status)} ${careScore.score * 3.6}deg,
                var(--color-gray-200) ${careScore.score * 3.6}deg
              )`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative"
                        }}>
                            <div style={{
                                width: "150px",
                                height: "150px",
                                borderRadius: "50%",
                                backgroundColor: "var(--color-white)",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                                <div style={{
                                    fontSize: "var(--text-5xl)",
                                    fontWeight: "var(--font-bold)",
                                    color: getStatusColor(careScore.status),
                                    lineHeight: 1
                                }}>
                                    {careScore.score}
                                </div>
                                <div style={{
                                    fontSize: "var(--text-xs)",
                                    color: "var(--color-gray-400)"
                                }}>
                                    out of 100
                                </div>
                            </div>
                        </div>

                        <div className={`badge ${getStatusBadgeClass(careScore.status)}`} style={{ marginTop: "var(--space-4)" }}>
                            {careScore.status.charAt(0).toUpperCase() + careScore.status.slice(1)} Risk
                        </div>
                    </div>

                    {/* Score Breakdown */}
                    <div className="card">
                        <h4 style={{ marginBottom: "var(--space-6)" }}>Score Breakdown</h4>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)" }}>
                            {/* Components */}
                            <div>
                                <div style={{ fontSize: "var(--text-sm)", color: "var(--color-gray-500)", marginBottom: "var(--space-4)" }}>
                                    Components
                                </div>
                                {[
                                    { label: "Severity", value: careScore.components.severity, max: 40 },
                                    { label: "Persistence", value: careScore.components.persistence, max: 25 },
                                    { label: "Cross-Signal", value: careScore.components.crossSignal, max: 20 },
                                    { label: "Manual Input", value: careScore.components.manualModifier, max: 10 }
                                ].map((comp, i) => (
                                    <div key={i} style={{ marginBottom: "var(--space-3)" }}>
                                        <div style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            fontSize: "var(--text-sm)",
                                            marginBottom: "var(--space-1)"
                                        }}>
                                            <span>{comp.label}</span>
                                            <span style={{ fontWeight: "var(--font-semibold)" }}>
                                                {comp.value.toFixed(1)}/{comp.max}
                                            </span>
                                        </div>
                                        <div style={{
                                            height: "4px",
                                            backgroundColor: "var(--color-gray-200)",
                                            borderRadius: "var(--radius-full)"
                                        }}>
                                            <div style={{
                                                height: "100%",
                                                width: `${(comp.value / comp.max) * 100}%`,
                                                backgroundColor: "var(--color-accent-primary)",
                                                borderRadius: "var(--radius-full)",
                                                transition: "width var(--transition-slow)"
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Additional Metrics */}
                            <div>
                                <div style={{ fontSize: "var(--text-sm)", color: "var(--color-gray-500)", marginBottom: "var(--space-4)" }}>
                                    Additional Metrics
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                                    <div className="card card-flat" style={{ padding: "var(--space-4)" }}>
                                        <div style={{ fontSize: "var(--text-xs)", color: "var(--color-gray-500)" }}>
                                            Confidence
                                        </div>
                                        <div style={{ fontSize: "var(--text-xl)", fontWeight: "var(--font-bold)" }}>
                                            {careScore.confidence}%
                                        </div>
                                    </div>
                                    <div className="card card-flat" style={{ padding: "var(--space-4)" }}>
                                        <div style={{ fontSize: "var(--text-xs)", color: "var(--color-gray-500)" }}>
                                            Stability
                                        </div>
                                        <div style={{ fontSize: "var(--text-xl)", fontWeight: "var(--font-bold)" }}>
                                            {careScore.stability}%
                                        </div>
                                    </div>
                                    <div className="card card-flat" style={{ padding: "var(--space-4)" }}>
                                        <div style={{ fontSize: "var(--text-xs)", color: "var(--color-gray-500)" }}>
                                            Drift Score
                                        </div>
                                        <div style={{ fontSize: "var(--text-xl)", fontWeight: "var(--font-bold)" }}>
                                            {careScore.driftScore}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Explanation */}
                        <div style={{
                            marginTop: "var(--space-6)",
                            padding: "var(--space-4)",
                            backgroundColor: "var(--color-gray-50)",
                            borderRadius: "var(--radius-lg)"
                        }}>
                            <div style={{
                                fontSize: "var(--text-xs)",
                                fontWeight: "var(--font-semibold)",
                                color: "var(--color-gray-600)",
                                marginBottom: "var(--space-2)"
                            }}>
                                What Changed?
                            </div>
                            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-gray-600)", margin: 0 }}>
                                {careScore.explanation}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Current Metrics */}
                <h4 style={{ marginBottom: "var(--space-4)" }}>Current Readings</h4>
                <div className="metric-grid" style={{ marginBottom: "var(--space-8)" }}>
                    {mockMetrics.map((metric, i) => (
                        <div key={i} className="card metric-card">
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: "var(--space-3)"
                            }}>
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "var(--space-2)",
                                    color: "var(--color-gray-500)"
                                }}>
                                    {metric.icon}
                                    <span className="metric-label" style={{ margin: 0 }}>{metric.label}</span>
                                </div>
                            </div>
                            <div className="metric-value">
                                {metric.value}
                                <span style={{
                                    fontSize: "var(--text-base)",
                                    fontWeight: "var(--font-normal)",
                                    color: "var(--color-gray-400)",
                                    marginLeft: "var(--space-1)"
                                }}>
                                    {metric.unit}
                                </span>
                            </div>
                            <div className={`metric-change ${metric.trend === "up" ? "positive" : "negative"}`}>
                                {metric.trend === "up" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                {metric.change} vs baseline ({metric.baseline})
                            </div>
                        </div>
                    ))}
                </div>

                {/* Trends Chart */}
                <div className="chart-container">
                    <div className="chart-header">
                        <h4 className="chart-title">CareScore Trend (Last 7 Days)</h4>
                        <div style={{ display: "flex", gap: "var(--space-2)" }}>
                            <button className="btn btn-sm btn-ghost">7D</button>
                            <button className="btn btn-sm btn-secondary">14D</button>
                            <button className="btn btn-sm btn-ghost">30D</button>
                        </div>
                    </div>

                    {/* Simple chart visualization */}
                    <div style={{
                        display: "flex",
                        alignItems: "flex-end",
                        gap: "var(--space-4)",
                        height: "200px",
                        padding: "var(--space-4) 0"
                    }}>
                        {mockTrends.map((point, i) => (
                            <div key={i} style={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "var(--space-2)"
                            }}>
                                <div style={{
                                    width: "100%",
                                    height: `${point.careScore * 2}px`,
                                    backgroundColor: point.careScore > 50
                                        ? "var(--color-accent-warning)"
                                        : point.careScore > 30
                                            ? "var(--color-accent-primary)"
                                            : "var(--color-accent-secondary)",
                                    borderRadius: "var(--radius-sm)",
                                    transition: "height var(--transition-slow)"
                                }} />
                                <div style={{
                                    fontSize: "var(--text-xs)",
                                    color: "var(--color-gray-400)"
                                }}>
                                    {point.date.split(" ")[1]}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
