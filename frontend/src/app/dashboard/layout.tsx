import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard - Pulse AI",
    description: "Monitor your health metrics and CareScore in real-time",
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
