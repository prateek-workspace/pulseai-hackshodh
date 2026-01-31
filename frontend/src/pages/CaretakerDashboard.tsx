import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Activity,
    Heart,
    Bell,
    LogOut,
    Shield,
    AlertTriangle,
    Clock,
    Phone,
    CheckCircle2
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface PatientStatus {
    patient_id: number;
    patient_name: string;
    care_score: number | null;
    status: string;
    last_updated: string;
    has_alert: boolean;
}

export const CaretakerDashboard = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState<PatientStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [alerts, setAlerts] = useState(0);

    const caretakerUserId = localStorage.getItem("userId");
    const caretakerName = localStorage.getItem("userName") || "Caretaker";

    useEffect(() => {
        if (caretakerUserId) {
            fetchPatientStatuses();
        }
    }, [caretakerUserId]);

    const fetchPatientStatuses = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/caretakers/dashboard/patients/${caretakerUserId}`);
            if (response.ok) {
                const data = await response.json();
                setPatients(data);
                setAlerts(data.filter((p: PatientStatus) => p.has_alert).length);
            }
        } catch (error) {
            console.error("Failed to fetch patient statuses:", error);
            // Mock data for demonstration
            setPatients([
                {
                    patient_id: 1,
                    patient_name: "Mom",
                    care_score: 28,
                    status: "Stable",
                    last_updated: new Date().toISOString(),
                    has_alert: false
                }
            ]);
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

    const getStatusDisplay = (score: number | null, status: string) => {
        if (!score) return { icon: Shield, color: "text-zinc-400", bg: "bg-zinc-100", label: "No Data" };
        if (score >= 70) return { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-100", label: "Needs Attention" };
        if (score >= 50) return { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-100", label: "Monitor Closely" };
        if (score >= 30) return { icon: Activity, color: "text-blue-600", bg: "bg-blue-100", label: "Slight Change" };
        return { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100", label: "All Good" };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
                    <span className="text-zinc-500">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50">
            {/* Navigation */}
            <nav className="bg-white border-b border-zinc-200 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                            <Activity className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-lg font-bold text-zinc-900">Pulse AI</span>
                        <span className="text-xs px-2 py-1 bg-zinc-100 text-zinc-600 rounded-full font-medium">
                            Family View
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-zinc-500 hover:text-zinc-900 transition-colors">
                            <Bell className="w-5 h-5" />
                            {alerts > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                            )}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-zinc-500 hover:text-zinc-900 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Welcome Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-zinc-900">Welcome, {caretakerName}</h1>
                    <p className="text-zinc-500 mt-1">Here's how your loved ones are doing today</p>
                </div>

                {/* Alert Banner */}
                {alerts > 0 && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            <div>
                                <p className="font-medium text-red-900">{alerts} patient{alerts > 1 ? 's' : ''} need{alerts === 1 ? 's' : ''} attention</p>
                                <p className="text-sm text-red-700">Review the status below and consider reaching out</p>
                            </div>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                            <Phone className="w-4 h-4" />
                            Call Now
                        </button>
                    </div>
                )}

                {/* Patient Cards */}
                <div className="space-y-4">
                    {patients.length === 0 ? (
                        <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center">
                            <Heart className="w-16 h-16 text-zinc-200 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-zinc-900 mb-2">No Connections Yet</h3>
                            <p className="text-zinc-500 max-w-md mx-auto">
                                You'll see your loved ones' health status here once they connect their Pulse AI account with yours.
                            </p>
                        </div>
                    ) : (
                        patients.map((patient) => {
                            const statusDisplay = getStatusDisplay(patient.care_score, patient.status);
                            const StatusIcon = statusDisplay.icon;

                            return (
                                <div
                                    key={patient.patient_id}
                                    className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${patient.has_alert ? "border-red-200" : "border-zinc-200"
                                        }`}
                                >
                                    {/* Status Header */}
                                    <div className={`px-6 py-4 ${statusDisplay.bg}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <StatusIcon className={`w-6 h-6 ${statusDisplay.color}`} />
                                                <span className={`text-lg font-semibold ${statusDisplay.color}`}>
                                                    {statusDisplay.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-zinc-500">
                                                <Clock className="w-4 h-4" />
                                                Updated {new Date(patient.last_updated).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Patient Info */}
                                    <div className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center">
                                                    <Heart className="w-8 h-8 text-zinc-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-zinc-900">{patient.patient_name}</h3>
                                                    <p className="text-zinc-500">Connected patient</p>
                                                </div>
                                            </div>

                                            {/* CareScore Display */}
                                            <div className="text-right">
                                                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Health Score</p>
                                                <div className="flex items-baseline gap-1">
                                                    <span className={`text-4xl font-bold ${statusDisplay.color}`}>
                                                        {patient.care_score ?? "—"}
                                                    </span>
                                                    <span className="text-zinc-400">/100</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quick Actions */}
                                        <div className="mt-6 pt-6 border-t border-zinc-100 flex gap-3">
                                            <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition-colors">
                                                <Phone className="w-4 h-4" />
                                                Call
                                            </button>
                                            <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition-colors">
                                                <Bell className="w-4 h-4" />
                                                Send Reminder
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Help Section */}
                <div className="mt-8 p-6 bg-white rounded-xl border border-zinc-200">
                    <h3 className="font-semibold text-zinc-900 mb-3">Understanding Health Scores</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                            <span className="text-zinc-600">0-30: All Good</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                            <span className="text-zinc-600">31-50: Slight Change</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-500" />
                            <span className="text-zinc-600">51-70: Monitor Closely</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <span className="text-zinc-600">71-100: Needs Attention</span>
                        </div>
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="mt-6 p-4 bg-zinc-100 border border-zinc-200 rounded-xl">
                    <p className="text-xs text-zinc-500 text-center">
                        <strong>For Awareness Only.</strong> This dashboard provides simplified health status updates.
                        It does not provide medical advice. When in doubt, always contact a healthcare professional.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default CaretakerDashboard;
