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
    Heart,
    Droplet,
    ThermometerSun,
    CheckCircle2,
    AlertCircle
} from "lucide-react";

const sidebarLinks = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { href: "/dashboard/insights", label: "Insights", icon: <LineChart size={20} /> },
    { href: "/dashboard/escalations", label: "Escalations", icon: <Bell size={20} /> },
    { href: "/dashboard/manual-entry", label: "Manual Entry", icon: <PlusCircle size={20} /> },
    { href: "/about", label: "About", icon: <HelpCircle size={20} /> }
];

const symptomOptions = [
    "Fatigue",
    "Headache",
    "Dizziness",
    "Shortness of breath",
    "Chest discomfort",
    "Nausea",
    "Poor concentration",
    "Muscle aches",
    "Gas/Bloating",
    "Poor appetite"
];

export default function ManualEntryPage() {
    const [formData, setFormData] = useState({
        bpSystolic: "",
        bpDiastolic: "",
        bloodSugar: "",
        symptoms: [] as string[]
    });
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const handleSymptomToggle = (symptom: string) => {
        setFormData(prev => ({
            ...prev,
            symptoms: prev.symptoms.includes(symptom)
                ? prev.symptoms.filter(s => s !== symptom)
                : [...prev.symptoms, symptom]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validation
        if (!formData.bpSystolic && !formData.bpDiastolic && !formData.bloodSugar && formData.symptoms.length === 0) {
            setError("Please enter at least one measurement or symptom.");
            return;
        }

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));

        setSubmitted(true);

        // Reset after showing success
        setTimeout(() => {
            setSubmitted(false);
            setFormData({
                bpSystolic: "",
                bpDiastolic: "",
                bloodSugar: "",
                symptoms: []
            });
        }, 3000);
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
                            className={`sidebar-link ${link.href === "/dashboard/manual-entry" ? "active" : ""}`}
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
                        Manual Entry
                    </h1>
                    <p style={{ color: "var(--color-gray-500)" }}>
                        Enter health measurements not captured by your wearables
                    </p>
                </div>

                {submitted && (
                    <div className="alert alert-success" style={{ marginBottom: "var(--space-6)" }}>
                        <CheckCircle2 size={24} style={{ color: "var(--color-accent-secondary)" }} />
                        <div className="alert-content">
                            <div className="alert-title">Data Recorded</div>
                            <div className="alert-message">
                                Your health data has been saved and will be included in your next CareScore calculation.
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="alert alert-warning" style={{ marginBottom: "var(--space-6)" }}>
                        <AlertCircle size={24} style={{ color: "var(--color-accent-warning)" }} />
                        <div className="alert-content">
                            <div className="alert-message">{error}</div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "var(--space-6)"
                    }}>
                        {/* Blood Pressure */}
                        <div className="card">
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "var(--space-3)",
                                marginBottom: "var(--space-6)"
                            }}>
                                <div style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "var(--radius-lg)",
                                    backgroundColor: "var(--color-accent-primary-10)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    <Heart size={20} style={{ color: "var(--color-accent-primary)" }} />
                                </div>
                                <div>
                                    <h4 style={{ margin: 0 }}>Blood Pressure</h4>
                                    <span style={{ fontSize: "var(--text-sm)", color: "var(--color-gray-500)" }}>
                                        mmHg
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "var(--space-4)", alignItems: "center" }}>
                                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                                    <label className="form-label">Systolic</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="120"
                                        value={formData.bpSystolic}
                                        onChange={e => setFormData(prev => ({ ...prev, bpSystolic: e.target.value }))}
                                    />
                                </div>
                                <span style={{
                                    fontSize: "var(--text-2xl)",
                                    color: "var(--color-gray-300)",
                                    marginTop: "var(--space-6)"
                                }}>
                                    /
                                </span>
                                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                                    <label className="form-label">Diastolic</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="80"
                                        value={formData.bpDiastolic}
                                        onChange={e => setFormData(prev => ({ ...prev, bpDiastolic: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div style={{
                                marginTop: "var(--space-4)",
                                padding: "var(--space-3)",
                                backgroundColor: "var(--color-gray-50)",
                                borderRadius: "var(--radius-md)",
                                fontSize: "var(--text-xs)",
                                color: "var(--color-gray-500)"
                            }}>
                                Normal: Below 120/80 mmHg
                            </div>
                        </div>

                        {/* Blood Sugar */}
                        <div className="card">
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "var(--space-3)",
                                marginBottom: "var(--space-6)"
                            }}>
                                <div style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "var(--radius-lg)",
                                    backgroundColor: "var(--color-accent-secondary-10)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    <Droplet size={20} style={{ color: "var(--color-accent-secondary)" }} />
                                </div>
                                <div>
                                    <h4 style={{ margin: 0 }}>Blood Sugar</h4>
                                    <span style={{ fontSize: "var(--text-sm)", color: "var(--color-gray-500)" }}>
                                        mg/dL
                                    </span>
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Glucose Level</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="100"
                                    value={formData.bloodSugar}
                                    onChange={e => setFormData(prev => ({ ...prev, bloodSugar: e.target.value }))}
                                />
                            </div>

                            <div style={{
                                marginTop: "var(--space-4)",
                                padding: "var(--space-3)",
                                backgroundColor: "var(--color-gray-50)",
                                borderRadius: "var(--radius-md)",
                                fontSize: "var(--text-xs)",
                                color: "var(--color-gray-500)"
                            }}>
                                Fasting: 70-100 mg/dL | After meal: Below 140 mg/dL
                            </div>
                        </div>
                    </div>

                    {/* Symptoms */}
                    <div className="card" style={{ marginTop: "var(--space-6)" }}>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "var(--space-3)",
                            marginBottom: "var(--space-6)"
                        }}>
                            <div style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "var(--radius-lg)",
                                backgroundColor: "var(--color-accent-warning-10)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                                <ThermometerSun size={20} style={{ color: "var(--color-accent-warning)" }} />
                            </div>
                            <div>
                                <h4 style={{ margin: 0 }}>Symptoms</h4>
                                <span style={{ fontSize: "var(--text-sm)", color: "var(--color-gray-500)" }}>
                                    Select any symptoms you're experiencing
                                </span>
                            </div>
                        </div>

                        <div style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "var(--space-2)"
                        }}>
                            {symptomOptions.map((symptom, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => handleSymptomToggle(symptom)}
                                    style={{
                                        padding: "var(--space-2) var(--space-4)",
                                        borderRadius: "var(--radius-full)",
                                        border: `1px solid ${formData.symptoms.includes(symptom) ? "var(--color-accent-primary)" : "var(--color-gray-300)"}`,
                                        backgroundColor: formData.symptoms.includes(symptom) ? "var(--color-accent-primary-10)" : "transparent",
                                        color: formData.symptoms.includes(symptom) ? "var(--color-accent-primary)" : "var(--color-gray-600)",
                                        fontSize: "var(--text-sm)",
                                        cursor: "pointer",
                                        transition: "all var(--transition-fast)"
                                    }}
                                >
                                    {symptom}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Submit */}
                    <div style={{
                        marginTop: "var(--space-8)",
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "var(--space-4)"
                    }}>
                        <button type="button" className="btn btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            <PlusCircle size={16} />
                            Save Entry
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
