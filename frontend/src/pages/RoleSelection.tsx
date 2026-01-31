import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    User,
    Stethoscope,
    Heart,
    ArrowRight,
    Activity,
    CheckCircle2
} from "lucide-react";
import { Button } from "../components/ui/Button";

interface RoleOption {
    id: "patient" | "doctor" | "caretaker";
    title: string;
    subtitle: string;
    description: string;
    icon: React.ReactNode;
    features: string[];
    color: string;
}

export const RoleSelection = () => {
    const [selectedRole, setSelectedRole] = useState<"patient" | "doctor" | "caretaker" | null>(null);
    const navigate = useNavigate();

    const roles: RoleOption[] = [
        {
            id: "patient",
            title: "Patient",
            subtitle: "Personal Health Monitoring",
            description: "Track your health metrics and receive personalized insights",
            icon: <User className="w-8 h-8" />,
            features: [
                "Personal health dashboard",
                "CareScore monitoring",
                "Connect with doctors",
                "Wearable data sync"
            ],
            color: "zinc"
        },
        {
            id: "doctor",
            title: "Healthcare Provider",
            subtitle: "Clinical Surveillance",
            description: "Monitor patients and provide clinical guidance at scale",
            icon: <Stethoscope className="w-8 h-8" />,
            features: [
                "Patient monitoring dashboard",
                "Clinical triage tools",
                "Health trend analysis",
                "Alert notifications"
            ],
            color: "zinc"
        },
        {
            id: "caretaker",
            title: "Family / Caretaker",
            subtitle: "Peace of Mind",
            description: "Keep an eye on your loved ones' health status",
            icon: <Heart className="w-8 h-8" />,
            features: [
                "Simplified status view",
                "Real-time health alerts",
                "Emergency notifications",
                "Easy communication"
            ],
            color: "zinc"
        }
    ];

    const handleContinue = () => {
        if (selectedRole === "patient") {
            navigate("/signup/patient");
        } else if (selectedRole === "doctor") {
            navigate("/signup/doctor");
        } else if (selectedRole === "caretaker") {
            navigate("/signup/caretaker");
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b border-zinc-100">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                            <Activity className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-lg font-bold text-zinc-900">Pulse AI</span>
                    </Link>
                    <Link
                        to="/login"
                        className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                        Already have an account? <span className="font-medium text-zinc-900">Sign in</span>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-6 py-16">
                {/* Title */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-zinc-900 tracking-tight">
                        Choose your role
                    </h1>
                    <p className="text-lg text-zinc-500 mt-3 max-w-xl mx-auto">
                        Select how you'll be using Pulse AI. You can change this later in settings.
                    </p>
                </div>

                {/* Role Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    {roles.map((role) => (
                        <button
                            key={role.id}
                            onClick={() => setSelectedRole(role.id)}
                            className={`
                relative text-left p-8 rounded-2xl border-2 transition-all duration-200
                ${selectedRole === role.id
                                    ? "border-zinc-900 bg-zinc-50 shadow-lg"
                                    : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-md"
                                }
              `}
                        >
                            {/* Selection Indicator */}
                            {selectedRole === role.id && (
                                <div className="absolute top-4 right-4">
                                    <div className="w-6 h-6 bg-zinc-900 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                            )}

                            {/* Icon */}
                            <div className={`
                w-16 h-16 rounded-xl flex items-center justify-center mb-6
                ${selectedRole === role.id
                                    ? "bg-zinc-900 text-white"
                                    : "bg-zinc-100 text-zinc-600"
                                }
              `}>
                                {role.icon}
                            </div>

                            {/* Content */}
                            <h3 className="text-xl font-bold text-zinc-900 mb-1">{role.title}</h3>
                            <p className="text-sm text-zinc-500 mb-4">{role.description}</p>

                            {/* Features */}
                            <ul className="space-y-2">
                                {role.features.map((feature, index) => (
                                    <li key={index} className="flex items-center gap-2 text-sm text-zinc-600">
                                        <div className={`w-1.5 h-1.5 rounded-full ${selectedRole === role.id ? "bg-zinc-900" : "bg-zinc-400"}`} />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </button>
                    ))}
                </div>

                {/* Continue Button */}
                <div className="flex justify-center">
                    <Button
                        onClick={handleContinue}
                        disabled={!selectedRole}
                        className={`
              h-14 px-12 text-lg rounded-full transition-all
              ${selectedRole
                                ? "bg-zinc-900 text-white hover:bg-zinc-800 shadow-xl shadow-zinc-900/20"
                                : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                            }
            `}
                    >
                        Continue as {selectedRole ? roles.find(r => r.id === selectedRole)?.title : "..."}
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                </div>

                {/* Info Note */}
                <div className="mt-12 max-w-2xl mx-auto">
                    <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-xl">
                        <h4 className="font-semibold text-zinc-900 mb-2">Why do we ask?</h4>
                        <p className="text-sm text-zinc-600 leading-relaxed">
                            Different roles have different dashboards and permissions. Patients see their personal health data,
                            doctors see aggregated patient monitoring tools, and caretakers see simplified status updates.
                            This ensures everyone gets the right information for their needs while maintaining privacy and security.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RoleSelection;
