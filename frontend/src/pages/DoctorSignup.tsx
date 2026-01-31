import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    Stethoscope,
    ArrowLeft,
    ArrowRight,
    Activity,
    Loader2,
    CheckCircle2,
    User,
    Building,
    Mail,
    Lock,
    Phone,
    MapPin,
    Briefcase,
    FileText
} from "lucide-react";
import { Button } from "../components/ui/Button";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface DoctorFormData {
    // Account
    email: string;
    password: string;
    name: string;
    phone: string;
    // Professional
    full_name: string;
    specialization: string;
    qualification: string;
    license_number: string;
    // Hospital
    hospital_name: string;
    hospital_address: string;
    city: string;
    state: string;
    emergency_contact: string;
}

const specializations = [
    "General Practice",
    "Cardiology",
    "Pulmonology",
    "Internal Medicine",
    "Geriatrics",
    "Endocrinology",
    "Neurology",
    "Nephrology",
    "Oncology",
    "Other"
];

export const DoctorSignup = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState<DoctorFormData>({
        email: "",
        password: "",
        name: "",
        phone: "",
        full_name: "",
        specialization: "",
        qualification: "",
        license_number: "",
        hospital_name: "",
        hospital_address: "",
        city: "",
        state: "",
        emergency_contact: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === "name") {
            setFormData(prev => ({ ...prev, full_name: value }));
        }
    };

    const isStep1Valid = formData.email && formData.password && formData.name && formData.phone;
    const isStep2Valid = formData.specialization && formData.qualification;
    const isStep3Valid = formData.hospital_name && formData.city;

    const handleSubmit = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${API_BASE}/auth/register/doctor`, {
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
            localStorage.setItem("userRole", "doctor");
            localStorage.setItem("userName", data.user.name);

            navigate("/doctor-dashboard");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { number: 1, title: "Account", icon: User },
        { number: 2, title: "Professional", icon: Briefcase },
        { number: 3, title: "Practice", icon: Building }
    ];

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

            <main className="max-w-2xl mx-auto px-6 py-12">
                {/* Title */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center mx-auto mb-6">
                        <Stethoscope className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Healthcare Provider Registration</h1>
                    <p className="text-zinc-500 mt-2">Join Pulse AI to monitor and support your patients' health</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-4 mb-10">
                    {steps.map((s, index) => (
                        <div key={s.number} className="flex items-center">
                            <div className={`
                flex items-center gap-2 px-4 py-2 rounded-full transition-colors
                ${step === s.number
                                    ? "bg-zinc-900 text-white"
                                    : step > s.number
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-zinc-100 text-zinc-400"
                                }
              `}>
                                {step > s.number ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                    <s.icon className="w-4 h-4" />
                                )}
                                <span className="text-sm font-medium">{s.title}</span>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`w-8 h-px mx-2 ${step > s.number ? "bg-emerald-300" : "bg-zinc-200"}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Form */}
                <div className="bg-zinc-50 rounded-2xl border border-zinc-200 p-8">
                    {/* Step 1: Account Details */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-zinc-900 mb-6">Account Information</h2>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">Full Name</label>
                                    <div className="relative">
                                        <User className="w-5 h-5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Dr. John Smith"
                                            className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-xl text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">Email Address</label>
                                    <div className="relative">
                                        <Mail className="w-5 h-5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="doctor@hospital.com"
                                            className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-xl text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="w-5 h-5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+91 98765 43210"
                                            className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-xl text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">Password</label>
                                    <div className="relative">
                                        <Lock className="w-5 h-5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-xl text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={() => setStep(2)}
                                disabled={!isStep1Valid}
                                className="w-full h-12 bg-zinc-900 text-white hover:bg-zinc-800 disabled:bg-zinc-300 disabled:cursor-not-allowed rounded-xl"
                            >
                                Continue <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    )}

                    {/* Step 2: Professional Details */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-zinc-900 mb-6">Professional Information</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">Specialization</label>
                                    <select
                                        name="specialization"
                                        value={formData.specialization}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                    >
                                        <option value="">Select your specialization</option>
                                        {specializations.map(spec => (
                                            <option key={spec} value={spec}>{spec}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">Qualification</label>
                                    <div className="relative">
                                        <FileText className="w-5 h-5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            name="qualification"
                                            value={formData.qualification}
                                            onChange={handleChange}
                                            placeholder="MBBS, MD, etc."
                                            className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-xl text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">Medical License Number</label>
                                    <input
                                        type="text"
                                        name="license_number"
                                        value={formData.license_number}
                                        onChange={handleChange}
                                        placeholder="MCI-XXXXX"
                                        className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    onClick={() => setStep(1)}
                                    variant="outline"
                                    className="flex-1 h-12 border-zinc-200 text-zinc-700 hover:bg-zinc-100 rounded-xl"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                                </Button>
                                <Button
                                    onClick={() => setStep(3)}
                                    disabled={!isStep2Valid}
                                    className="flex-1 h-12 bg-zinc-900 text-white hover:bg-zinc-800 disabled:bg-zinc-300 disabled:cursor-not-allowed rounded-xl"
                                >
                                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Practice Details */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-zinc-900 mb-6">Practice Information</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">Hospital / Clinic Name</label>
                                    <div className="relative">
                                        <Building className="w-5 h-5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            name="hospital_name"
                                            value={formData.hospital_name}
                                            onChange={handleChange}
                                            placeholder="City General Hospital"
                                            className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-xl text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">Practice Address</label>
                                    <div className="relative">
                                        <MapPin className="w-5 h-5 text-zinc-400 absolute left-3 top-3" />
                                        <textarea
                                            name="hospital_address"
                                            value={formData.hospital_address}
                                            onChange={handleChange}
                                            placeholder="Full address"
                                            rows={2}
                                            className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-xl text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            placeholder="Mumbai"
                                            className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">State</label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            placeholder="Maharashtra"
                                            className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">Emergency Contact</label>
                                    <div className="relative">
                                        <Phone className="w-5 h-5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="tel"
                                            name="emergency_contact"
                                            value={formData.emergency_contact}
                                            onChange={handleChange}
                                            placeholder="+91 98765 43210"
                                            className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-xl text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-4">
                                <Button
                                    onClick={() => setStep(2)}
                                    variant="outline"
                                    className="flex-1 h-12 border-zinc-200 text-zinc-700 hover:bg-zinc-100 rounded-xl"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!isStep3Valid || loading}
                                    className="flex-1 h-12 bg-zinc-900 text-white hover:bg-zinc-800 disabled:bg-zinc-300 disabled:cursor-not-allowed rounded-xl"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Creating Account...
                                        </>
                                    ) : (
                                        <>
                                            Complete Registration <CheckCircle2 className="w-4 h-4 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Terms */}
                <p className="text-xs text-zinc-500 text-center mt-6">
                    By registering, you agree to our Terms of Service and Privacy Policy.
                    Pulse AI is a clinical decision support tool and does not replace professional medical judgment.
                </p>
            </main>
        </div>
    );
};

export default DoctorSignup;
