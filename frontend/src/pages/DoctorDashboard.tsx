import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Activity,
    Users,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Minus,
    Bell,
    Search,
    LogOut,
    ChevronRight,
    Clock,
    Heart,
    Shield
} from "lucide-react";
import { Button } from "../components/ui/Button";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface Patient {
    patient_id: number;
    patient_name: string;
    latest_care_score: number | null;
    care_score_status: string | null;
    connection_status: string;
    last_data_sync: string | null;
}

interface HighRiskPatient {
    patient_id: number;
    patient_name: string;
    care_score: number;
    status: string;
    timestamp: string;
}

interface NotificationStats {
    total: number;
    unread: number;
    critical: number;
}

export const DoctorDashboard = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [highRiskPatients, setHighRiskPatients] = useState<HighRiskPatient[]>([]);
    const [notifications, setNotifications] = useState<NotificationStats>({ total: 0, unread: 0, critical: 0 });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const doctorUserId = localStorage.getItem("userId");
    const doctorName = localStorage.getItem("userName") || "Doctor";

    useEffect(() => {
        if (doctorUserId) {
            fetchDashboardData();
        }
    }, [doctorUserId]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [patientsRes, highRiskRes] = await Promise.all([
                fetch(`${API_BASE}/doctors/dashboard/patients/${doctorUserId}`).catch(() => null),
                fetch(`${API_BASE}/doctors/dashboard/high-risk/${doctorUserId}`).catch(() => null)
            ]);

            if (patientsRes?.ok) {
                const data = await patientsRes.json();
                setPatients(data);
            }

            if (highRiskRes?.ok) {
                const data = await highRiskRes.json();
                setHighRiskPatients(data);
            }

            // Mock notification stats for now
            setNotifications({ total: 12, unread: 3, critical: 1 });
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("userId");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userName");
        navigate("/");
    };

    const getScoreColor = (score: number | null) => {
        if (!score) return "text-zinc-400";
        if (score >= 70) return "text-red-600";
        if (score >= 50) return "text-amber-600";
        if (score >= 30) return "text-blue-600";
        return "text-emerald-600";
    };

    const getStatusBadge = (status: string | null) => {
        if (!status) return { bg: "bg-zinc-100", text: "text-zinc-600", label: "Unknown" };
        switch (status.toLowerCase()) {
            case "high":
                return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "High Risk" };
            case "moderate":
                return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Moderate" };
            case "mild":
                return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "Mild" };
            default:
                return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Stable" };
        }
    };

    const getTrendIcon = (status: string | null) => {
        if (!status) return <Minus className="w-4 h-4 text-zinc-400" />;
        if (status === "High" || status === "Moderate") {
            return <TrendingUp className="w-4 h-4 text-red-500" />;
        }
        return <TrendingDown className="w-4 h-4 text-emerald-500" />;
    };

    const filteredPatients = patients.filter(p =>
        p.patient_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
                    <span className="text-zinc-500">Loading dashboard...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50">
            {/* Navigation */}
            <nav className="bg-white border-b border-zinc-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                            <Activity className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-lg font-bold text-zinc-900">Pulse AI</span>
                        <span className="text-xs px-2 py-1 bg-zinc-100 text-zinc-600 rounded-full font-medium">
                            Clinical Dashboard
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-zinc-500 hover:text-zinc-900 transition-colors">
                            <Bell className="w-5 h-5" />
                            {notifications.unread > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                            )}
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm font-medium text-zinc-900">{doctorName}</p>
                                <p className="text-xs text-zinc-500">Healthcare Provider</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-zinc-500 hover:text-zinc-900 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Patient Monitoring</h1>
                    <p className="text-zinc-500 mt-1">Clinical surveillance and risk triage dashboard</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Patients</span>
                            <Users className="w-5 h-5 text-zinc-400" />
                        </div>
                        <p className="text-3xl font-bold text-zinc-900">{patients.length}</p>
                        <p className="text-xs text-zinc-500 mt-1">Active connections</p>
                    </div>

                    <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">High Risk</span>
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                        </div>
                        <p className="text-3xl font-bold text-red-600">{highRiskPatients.length}</p>
                        <p className="text-xs text-zinc-500 mt-1">Require attention</p>
                    </div>

                    <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Alerts Today</span>
                            <Bell className="w-5 h-5 text-zinc-400" />
                        </div>
                        <p className="text-3xl font-bold text-zinc-900">{notifications.total}</p>
                        <p className="text-xs text-zinc-500 mt-1">{notifications.unread} unread</p>
                    </div>

                    <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">System Status</span>
                            <Shield className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-lg font-semibold text-zinc-900">Active</span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">Real-time monitoring</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* High Risk Patients Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-zinc-100">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                    <h2 className="text-lg font-bold text-zinc-900">Priority Alerts</h2>
                                </div>
                                <p className="text-xs text-zinc-500 mt-1">Patients requiring immediate attention</p>
                            </div>

                            <div className="divide-y divide-zinc-100">
                                {highRiskPatients.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <Shield className="w-12 h-12 text-emerald-200 mx-auto mb-3" />
                                        <p className="text-zinc-900 font-medium">All Clear</p>
                                        <p className="text-sm text-zinc-500">No high-risk patients detected</p>
                                    </div>
                                ) : (
                                    highRiskPatients.slice(0, 5).map((patient) => (
                                        <div
                                            key={patient.patient_id}
                                            className="p-4 hover:bg-zinc-50 transition-colors cursor-pointer"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                                        <Heart className="w-5 h-5 text-red-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-zinc-900">{patient.patient_name}</p>
                                                        <p className="text-xs text-zinc-500">
                                                            <Clock className="w-3 h-3 inline mr-1" />
                                                            {new Date(patient.timestamp).toLocaleTimeString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`text-2xl font-bold ${getScoreColor(patient.care_score)}`}>
                                                        {patient.care_score}
                                                    </span>
                                                    <p className="text-xs text-red-600 font-medium">{patient.status} Risk</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Patient List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-zinc-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-bold text-zinc-900">All Patients</h2>
                                        <p className="text-xs text-zinc-500 mt-1">Complete patient registry with health status</p>
                                    </div>
                                    <div className="relative">
                                        <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            placeholder="Search patients..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10 pr-4 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-zinc-50 border-b border-zinc-100">
                                        <tr>
                                            <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                                Patient
                                            </th>
                                            <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                                CareScore
                                            </th>
                                            <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                                Trend
                                            </th>
                                            <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                                Last Sync
                                            </th>
                                            <th className="px-6 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                        {filteredPatients.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center">
                                                    <Users className="w-12 h-12 text-zinc-200 mx-auto mb-3" />
                                                    <p className="text-zinc-900 font-medium">No patients found</p>
                                                    <p className="text-sm text-zinc-500">
                                                        {searchQuery ? "Try adjusting your search" : "Patients will appear here once connected"}
                                                    </p>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredPatients.map((patient) => {
                                                const statusBadge = getStatusBadge(patient.care_score_status);
                                                return (
                                                    <tr
                                                        key={patient.patient_id}
                                                        className="hover:bg-zinc-50 transition-colors cursor-pointer"
                                                    >
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center font-medium text-zinc-600">
                                                                    {patient.patient_name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <span className="font-medium text-zinc-900">{patient.patient_name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`text-2xl font-bold ${getScoreColor(patient.latest_care_score)}`}>
                                                                {patient.latest_care_score ?? "—"}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                                                                {statusBadge.label}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {getTrendIcon(patient.care_score_status)}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-zinc-500">
                                                            {patient.last_data_sync
                                                                ? new Date(patient.last_data_sync).toLocaleDateString()
                                                                : "Never"}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <button className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors">
                                                                <ChevronRight className="w-5 h-5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="mt-8 p-4 bg-zinc-100 border border-zinc-200 rounded-xl">
                    <p className="text-xs text-zinc-500 text-center">
                        <strong>Clinical Decision Support Only.</strong> Pulse AI provides risk monitoring and early warning detection.
                        It does not provide medical diagnoses or treatment recommendations. All clinical decisions remain the responsibility of the healthcare provider.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default DoctorDashboard;
