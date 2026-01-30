/**
 * Pulse AI API Service
 * Handles all communication with the FastAPI backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface HealthDataInput {
    user_id: number;
    source?: string;
    heart_rate?: number;
    hrv?: number;
    sleep_duration?: number;
    sleep_quality?: number;
    activity_level?: number;
    breathing_rate?: number;
    bp_systolic?: number;
    bp_diastolic?: number;
    blood_sugar?: number;
    symptoms?: string;
}

interface CareScoreResponse {
    user_id: number;
    care_score: number;
    status: string;
    components: {
        severity: number;
        persistence: number;
        cross_signal: number;
        manual_modifier: number;
    };
    additional_metrics: {
        drift_score: number;
        confidence: number;
        stability: number;
    };
    contributing_signals: Array<{
        signal: string;
        current: number;
        baseline: number;
        z_score: number;
        level: string;
    }>;
    explanation: string;
    timestamp: string;
}

interface DashboardSummary {
    user: {
        id: number;
        name: string;
        email: string;
    };
    care_score: {
        score: number;
        status: string;
        components: {
            severity: number;
            persistence: number;
            cross_signal: number;
            manual_modifier: number;
        };
        drift_score: number;
        confidence: number;
        stability: number;
        explanation: string;
        updated_at: string;
    } | null;
    current_metrics: Record<string, {
        value: number | null;
        baseline: number | null;
        unit: string;
    }> | null;
    escalations: Array<{
        id: number;
        level: number;
        title: string;
        message: string;
        timestamp: string;
        acknowledged: boolean;
    }>;
    score_trend: Array<{
        date: string;
        score: number;
        status: string;
    }>;
}

interface Insight {
    type: string;
    metric: string;
    title: string;
    description: string;
    current: number;
    baseline: number;
    recommendation: string;
}

class ApiService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const defaultHeaders: HeadersInit = {
            "Content-Type": "application/json",
        };

        const response = await fetch(url, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        return response.json();
    }

    // Health Check
    async healthCheck(): Promise<{ status: string }> {
        return this.request("/health");
    }

    // ============================================
    // Dashboard endpoints
    // ============================================
    
    async getDashboardSummary(userId: number): Promise<DashboardSummary> {
        return this.request(`/dashboard/summary/${userId}`);
    }

    async getHealthTrends(userId: number, days: number = 7): Promise<any> {
        return this.request(`/dashboard/trends/${userId}?days=${days}`);
    }

    async getCareScoreHistory(userId: number, days: number = 30): Promise<any> {
        return this.request(`/dashboard/carescore-history/${userId}?days=${days}`);
    }

    async getInsights(userId: number): Promise<{ insights: Insight[] }> {
        return this.request(`/dashboard/insights/${userId}`);
    }

    async getEscalations(userId: number, includeAcknowledged: boolean = false): Promise<any> {
        return this.request(`/dashboard/escalations/${userId}?include_acknowledged=${includeAcknowledged}`);
    }

    async acknowledgeEscalation(escalationId: number, action: string = "dismissed"): Promise<any> {
        return this.request(`/dashboard/escalations/${escalationId}/acknowledge`, {
            method: "POST",
            body: JSON.stringify({ action }),
        });
    }

    // ============================================
    // User endpoints
    // ============================================
    
    async createUser(email: string, name: string, age?: number): Promise<any> {
        return this.request("/users/", {
            method: "POST",
            body: JSON.stringify({ email, name, age }),
        });
    }

    async getUser(userId: number): Promise<any> {
        return this.request(`/users/${userId}`);
    }

    async getUserByEmail(email: string): Promise<any> {
        return this.request(`/users/email/${email}`);
    }

    // ============================================
    // Auth endpoints
    // ============================================
    
    async onboardUser(
        email: string, 
        name: string, 
        deviceId?: string, 
        deviceName?: string
    ): Promise<any> {
        return this.request("/auth/onboard", {
            method: "POST",
            body: JSON.stringify({ 
                email, 
                name, 
                device_id: deviceId,
                device_name: deviceName 
            }),
        });
    }

    async generateApiKey(
        userId: number, 
        name?: string, 
        deviceId?: string
    ): Promise<any> {
        return this.request("/auth/api-keys/generate", {
            method: "POST",
            body: JSON.stringify({ 
                user_id: userId, 
                name, 
                device_id: deviceId 
            }),
        });
    }

    async listApiKeys(userId: number): Promise<any> {
        return this.request(`/auth/api-keys/${userId}`);
    }

    async revokeApiKey(keyId: number): Promise<any> {
        return this.request(`/auth/api-keys/${keyId}`, {
            method: "DELETE",
        });
    }

    async registerDevice(
        userId: number, 
        deviceId: string, 
        deviceName?: string
    ): Promise<any> {
        return this.request("/auth/devices/register", {
            method: "POST",
            body: JSON.stringify({ 
                user_id: userId, 
                device_id: deviceId, 
                device_name: deviceName 
            }),
        });
    }

    async listDevices(userId: number): Promise<any> {
        return this.request(`/auth/devices/${userId}`);
    }

    // ============================================
    // Health Data endpoints
    // ============================================
    
    async ingestHealthData(data: HealthDataInput): Promise<any> {
        return this.request("/health/ingest", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    async getUserHealthData(userId: number, limit: number = 100): Promise<any> {
        return this.request(`/health/user/${userId}?limit=${limit}`);
    }

    async getLatestReadings(userId: number): Promise<any> {
        return this.request(`/health/user/${userId}/latest`);
    }

    // ============================================
    // Analysis endpoints
    // ============================================
    
    async trainBaseline(userId: number, days: number = 14): Promise<any> {
        return this.request("/analysis/train", {
            method: "POST",
            body: JSON.stringify({ user_id: userId, days }),
        });
    }

    async analyzeHealth(
        userId: number,
        currentData?: Record<string, number>,
        symptoms?: string[]
    ): Promise<any> {
        return this.request("/analysis/analyze", {
            method: "POST",
            body: JSON.stringify({
                user_id: userId,
                current_data: currentData,
                symptoms,
            }),
        });
    }

    async getCareScore(userId: number): Promise<CareScoreResponse> {
        return this.request(`/analysis/carescore/${userId}`);
    }

    async computeCareScore(
        userId: number,
        currentData?: Record<string, number>,
        symptoms?: string[]
    ): Promise<CareScoreResponse> {
        return this.request("/analysis/carescore/compute", {
            method: "POST",
            body: JSON.stringify({
                user_id: userId,
                current_data: currentData,
                symptoms,
            }),
        });
    }

    async getUserStatus(userId: number): Promise<any> {
        return this.request(`/analysis/status/${userId}`);
    }

    // ============================================
    // Gemini AI endpoints
    // ============================================
    
    async generateInsight(prompt: string): Promise<any> {
        return this.request("/generate", {
            method: "POST",
            body: JSON.stringify({ text: prompt }),
        });
    }

    async checkGeminiHealth(): Promise<any> {
        return this.request("/gemini/health");
    }

    // ============================================
    // Demo endpoints
    // ============================================
    
    async generateDemoData(): Promise<any> {
        return this.request("/demo/generate", {
            method: "POST",
        });
    }

    async computeDemoScores(): Promise<any> {
        return this.request("/demo/compute-scores", {
            method: "POST",
        });
    }

    // ============================================
    // Webhook endpoints (for testing)
    // ============================================
    
    async getWebhookSchema(): Promise<any> {
        return this.request("/webhook/schema");
    }

    async getWebhookHealth(): Promise<any> {
        return this.request("/webhook/health");
    }
}

// Export singleton instance
export const api = new ApiService();

// Export types
export type { HealthDataInput, CareScoreResponse, DashboardSummary, Insight };

