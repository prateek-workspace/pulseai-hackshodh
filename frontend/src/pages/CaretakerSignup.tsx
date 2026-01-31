import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    Heart,
    ArrowLeft,
    Activity,
    Loader2,
    Bell,
    Users,
    User,
    Mail,
    Phone,
    Lock
} from "lucide-react";
import { Button } from "../components/ui/Button";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface CaretakerFormData {
    email: string;
    password: string;
    name: string;
    phone: string;
    full_name: string;
    relationship_type: string;
    notification_preference: string;
}

const relationshipTypes = [
    { value: "family", label: "Family Member" },
    { value: "spouse", label: "Spouse / Partner" },
    { value: "child", label: "Son / Daughter" },
    { value: "parent", label: "Parent" },
    { value: "sibling", label: "Sibling" },
    { value: "professional", label: "Professional Caregiver" },
    { value: "friend", label: "Close Friend" },
    { value: "other", label: "Other" }
];

export const CaretakerSignup = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState<CaretakerFormData>({
        email: "",
        password: "",
        name: "",
        phone: "",
        full_name: "",
        relationship_type: "family",
        notification_preference: "all"
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === "name") {
            setFormData(prev => ({ ...prev, full_name: value }));
        }
    };

    const isFormValid = formData.email && formData.password && formData.name && formData.phone;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${API_BASE}/auth/register/caretaker`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || "Registration failed");
            }

            const data = await response.json();

            localStorage.setItem("userId", data.user.id.toString());
            localStorage.setItem("userRole", "caretaker");
            localStorage.setItem("userName", data.user.name);

            navigate("/caretaker-dashboard");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b border-zinc-100">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                            <Activity className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-lg font-bold text-zinc-900">Pulse AI</span>
                    </div>
                    <Link
                        to="/get-started"
                        className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Link>
                </div>
            </header>

            <main className="max-w-lg mx-auto px-6 py-12">
                {/* Title */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center mx-auto mb-6">
                        <Heart className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Family & Caretaker</h1>
                    <p className="text-zinc-500 mt-2">Stay connected with your loved one's health</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-zinc-50 rounded-2xl border border-zinc-200 p-8">
                    <div className="space-y-5">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">Your Name</label>
                            <div className="relative">
                                <User className="w-5 h-5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="John Doe"
                                    className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-xl text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="w-5 h-5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="john@example.com"
                                    className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-xl text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">Phone Number</label>
                            <div className="relative">
                                <Phone className="w-5 h-5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    placeholder="+91 98765 43210"
                                    className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-xl text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="w-5 h-5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-xl text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Relationship */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                <Users className="inline w-4 h-4 mr-1" />
                                Relationship to Patient
                            </label>
                            <select
                                name="relationship_type"
                                value={formData.relationship_type}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                            >
                                {relationshipTypes.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Notification Preferences */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                <Bell className="inline w-4 h-4 mr-1" />
                                Notification Preference
                            </label>
                            <select
                                name="notification_preference"
                                value={formData.notification_preference}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                            >
                                <option value="all">All Updates</option>
                                <option value="critical_only">Critical Alerts Only</option>
                                <option value="daily_summary">Daily Summary</option>
                            </select>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <Button
                            type="submit"
                            disabled={!isFormValid || loading}
                            className="w-full h-12 bg-zinc-900 text-white hover:bg-zinc-800 disabled:bg-zinc-300 disabled:cursor-not-allowed rounded-xl"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    <Heart className="w-4 h-4 mr-2" />
                                    Create Account
                                </>
                            )}
                        </Button>
                    </div>
                </form>

                {/* Info Note */}
                <div className="mt-8 p-6 bg-zinc-50 border border-zinc-200 rounded-xl">
                    <h4 className="font-semibold text-zinc-900 mb-2">What happens next?</h4>
                    <p className="text-sm text-zinc-600 leading-relaxed">
                        After creating your account, you'll receive a connection code to share with your loved one.
                        Once they accept your request in their Pulse AI app, you'll be able to see their simplified health status
                        and receive alerts when something needs attention.
                    </p>
                </div>

                {/* Terms */}
                <p className="text-xs text-zinc-500 text-center mt-6">
                    By registering, you agree to our Terms of Service and Privacy Policy.
                </p>
            </main>
        </div>
    );
};

export default CaretakerSignup;
