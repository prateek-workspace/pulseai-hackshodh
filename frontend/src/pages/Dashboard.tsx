import { useEffect, useState } from "react";
import { dashboardService, authService, DashboardSummary, TrendData } from "../lib/api";
import { Card, CardHeader, CardTitle, CardValue } from "../components/ui/Card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Activity, ShieldCheck, TrendingUp, AlertCircle, ArrowRight, RefreshCw, Cloud, Watch, Users, Heart, Stethoscope } from "lucide-react";
import { clsx } from "clsx";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface DisplayData {
  date: string;
  heartRate: number;
  hrv?: number;
  sleepDuration?: number;
  activityLevel?: number;
}

interface CareTeamMember {
  id: number;
  name: string;
  role: "doctor" | "caretaker";
  specialization?: string;
  status: string;
}

interface HealthSuggestion {
  suggestions: string[];
  disclaimer: string;
  source: string;
}

export const Dashboard = () => {
  const [data, setData] = useState<DisplayData[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [careTeam, setCareTeam] = useState<CareTeamMember[]>([]);
  const [healthSuggestions, setHealthSuggestions] = useState<HealthSuggestion | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const userId = authService.getUserId();

  useEffect(() => {
    if (userId) {
      loadDashboardData();
    } else {
      setIsLoading(false);
    }
  }, [userId]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setSyncError(null);

    try {
      // Fetch real data from API
      const [summaryData, trendsData] = await Promise.all([
        dashboardService.getSummary(userId!).catch(() => null),
        dashboardService.getTrends(userId!, 60).catch(() => null)
      ]);

      if (summaryData && summaryData.care_score && summaryData.care_score.score !== null) {
        setSummary(summaryData);
        setHasData(true);

        // Convert trends to display format
        if (trendsData && trendsData.trends.length > 0) {
          const displayData = trendsData.trends.map((t: TrendData) => ({
            date: t.date,
            heartRate: t.heart_rate || 0,
            hrv: t.hrv || 0,
            sleepDuration: t.sleep_duration || 0,
            activityLevel: t.activity_level || 0
          }));
          setData(displayData);
        }

        // Fetch health suggestions from CareScore API
        try {
          const suggestionsRes = await fetch(`${API_BASE}/care-score/suggestions/${userId}`);
          if (suggestionsRes.ok) {
            const suggestions = await suggestionsRes.json();
            setHealthSuggestions(suggestions);
          }
        } catch (e) {
          console.error("Failed to fetch health suggestions:", e);
        }

        // Fetch care team
        try {
          const careTeamRes = await fetch(`${API_BASE}/patients/care-team/${userId}`);
          if (careTeamRes.ok) {
            const team = await careTeamRes.json();
            setCareTeam(team);
          }
        } catch (e) {
          console.error("Failed to fetch care team:", e);
        }
      } else {
        setHasData(false);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setHasData(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncData = async () => {
    setIsSyncing(true);
    setSyncError(null);

    try {
      // Trigger CareScore calculation for existing data
      const response = await fetch(`${API_BASE}/care-score/calculate/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to calculate CareScore");
      }

      const result = await response.json();

      // Set suggestions if returned
      if (result.suggestions) {
        setHealthSuggestions({
          suggestions: result.suggestions,
          disclaimer: result.disclaimer || "These are general wellness suggestions only.",
          source: "gemini"
        });
      }

      // Reload dashboard data
      await loadDashboardData();
    } catch (err: any) {
      setSyncError(err.message || "Sync failed. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
        Loading your health data...
      </div>
    );
  }

  // No user logged in
  if (!userId) {
    return (
      <div className="p-12 text-center">
        <Activity className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Please Sign In</h2>
        <p className="text-gray-500 mb-6">Sign in to view your health dashboard</p>
        <Link to="/login">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  // No data state - prompt to sync
  if (!hasData) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Clinical Surveillance</h1>
          <p className="text-gray-500 mt-1">Real-time monitoring and drift detection.</p>
        </div>

        {/* Empty State Card */}
        <Card className="p-12 text-center">
          <Watch className="w-20 h-20 text-gray-200 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">No Health Data Yet</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            Sync your wearable device or manually input your health data to get started with personalized health monitoring and CareScore analysis.
          </p>

          {syncError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm max-w-md mx-auto">
              {syncError}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={handleSyncData}
              disabled={isSyncing}
              className="gap-2"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Sync & Calculate CareScore
                </>
              )}
            </Button>
            <Link to="/sync">
              <Button variant="outline" className="gap-2">
                <Cloud className="w-4 h-4" />
                Connect Wearable
              </Button>
            </Link>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-4">Or manually add health data</p>
            <Link to="/add-data">
              <Button variant="outline" className="text-sm">
                Add Health Metrics Manually
              </Button>
            </Link>
          </div>
        </Card>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <Activity className="w-8 h-8 text-zinc-400 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">CareScore™</h3>
            <p className="text-sm text-gray-500">
              Our AI analyzes your vitals to generate a comprehensive health drift score.
            </p>
          </Card>
          <Card className="p-6">
            <TrendingUp className="w-8 h-8 text-zinc-400 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Trend Analysis</h3>
            <p className="text-sm text-gray-500">
              Track patterns over 60 days to detect clinical drift before it becomes serious.
            </p>
          </Card>
          <Card className="p-6">
            <ShieldCheck className="w-8 h-8 text-zinc-400 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Smart Alerts</h3>
            <p className="text-sm text-gray-500">
              Get notified when anomalies are detected, keeping you and your care team informed.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // Has data - show full dashboard
  const careScore = summary?.care_score;
  const currentScore = careScore?.score || 0;
  const status = careScore?.status || "Stable";

  const scoreColor =
    currentScore > 70 ? "text-red-600" :
      currentScore > 50 ? "text-amber-600" :
        currentScore > 30 ? "text-blue-600" : "text-emerald-600";

  const driftDetected = (careScore?.drift_score || 0) > 30;
  const confidence = careScore?.confidence || 85;
  const stability = careScore?.stability || (100 - currentScore);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Clinical Surveillance</h1>
          <p className="text-gray-500 mt-1">Real-time monitoring and drift detection.</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Live Data Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Cloud className="w-3.5 h-3.5" />
            Live Data
          </div>

          {/* Sync Button */}
          <Button
            variant="outline"
            onClick={handleSyncData}
            disabled={isSyncing}
            className="gap-2"
          >
            <RefreshCw className={clsx("w-4 h-4", isSyncing && "animate-spin")} />
            {isSyncing ? "Syncing..." : "Refresh"}
          </Button>

          {/* System Status */}
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-medium text-gray-600">System Active</span>
          </div>
        </div>
      </div>

      {/* Hero Score Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-l-4 border-l-gray-900">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>CareScore™</CardTitle>
            <Activity className="w-5 h-5 text-gray-400" />
          </CardHeader>
          <div className="flex items-baseline gap-2">
            <span className={clsx("text-6xl font-bold tracking-tighter", scoreColor)}>
              {currentScore}
            </span>
            <span className="text-gray-400 font-medium">/ 100</span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className={clsx(
              "px-2.5 py-0.5 rounded-full text-xs font-medium border",
              status === "High" ? "bg-red-50 text-red-700 border-red-200" :
                status === "Moderate" ? "bg-amber-50 text-amber-700 border-amber-200" :
                  status === "Mild" ? "bg-blue-50 text-blue-700 border-blue-200" :
                    "bg-emerald-50 text-emerald-700 border-emerald-200"
            )}>
              {status} Risk
            </span>
            {driftDetected && (
              <span className="text-xs text-gray-500">Clinical drift detected</span>
            )}
          </div>

          {currentScore > 70 && (
            <div className="mt-6">
              <Link to="/escalation">
                <Button variant="danger" className="w-full gap-2">
                  Review Escalation <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2" delay={0.1}>
          <CardHeader>
            <CardTitle>60-Day Drift Analysis</CardTitle>
          </CardHeader>
          {data.length > 0 ? (
            <>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#111827" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#111827" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" hide />
                    <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <ReferenceLine y={70} stroke="#E5E7EB" strokeDasharray="3 3" />
                    <Area
                      type="monotone"
                      dataKey="heartRate"
                      stroke="#111827"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorHr)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2 px-2">
                <span>60 Days Ago</span>
                <span>Today</span>
              </div>
            </>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-400">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-200" />
                <p className="text-sm">Trend data will appear as you sync more readings</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card delay={0.2}>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Confidence</CardTitle>
            <ShieldCheck className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardValue>{confidence.toFixed(1)}%</CardValue>
          <p className="text-xs text-gray-500 mt-2">AI Model Certainty</p>
        </Card>

        <Card delay={0.3}>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Stability</CardTitle>
            <TrendingUp className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardValue>{stability.toFixed(0)}/100</CardValue>
          <p className="text-xs text-gray-500 mt-2">Inverse Volatility Index</p>
        </Card>

        <Card delay={0.4}>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Drift Factors</CardTitle>
            <AlertCircle className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <div className="space-y-2">
            {careScore?.components?.severity && careScore.components.severity > 20 && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                High Severity Deviation
              </div>
            )}
            {careScore?.components?.persistence && careScore.components.persistence > 10 && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Sustained Trend (&gt;14 days)
              </div>
            )}
            {careScore?.components?.manual_modifier && careScore.components.manual_modifier > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Reported Symptoms
              </div>
            )}
            {currentScore < 30 && (
              <div className="text-sm text-gray-500">No significant drift factors.</div>
            )}
          </div>
        </Card>
      </div>

      {/* Current Metrics from API */}
      {summary?.current_metrics && (
        <Card delay={0.5}>
          <CardHeader>
            <CardTitle>Current Vitals</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {summary.current_metrics.heart_rate?.value && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Heart Rate</p>
                <p className="text-xl font-semibold text-gray-900">
                  {summary.current_metrics.heart_rate.value.toFixed(0)}
                  <span className="text-sm font-normal text-gray-400 ml-1">bpm</span>
                </p>
              </div>
            )}
            {summary.current_metrics.hrv?.value && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">HRV</p>
                <p className="text-xl font-semibold text-gray-900">
                  {summary.current_metrics.hrv.value.toFixed(0)}
                  <span className="text-sm font-normal text-gray-400 ml-1">ms</span>
                </p>
              </div>
            )}
            {summary.current_metrics.sleep_duration?.value && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Sleep</p>
                <p className="text-xl font-semibold text-gray-900">
                  {summary.current_metrics.sleep_duration.value.toFixed(1)}
                  <span className="text-sm font-normal text-gray-400 ml-1">hrs</span>
                </p>
              </div>
            )}
            {summary.current_metrics.activity_level?.value && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Steps</p>
                <p className="text-xl font-semibold text-gray-900">
                  {summary.current_metrics.activity_level.value.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Health Suggestions */}
      {healthSuggestions && healthSuggestions.suggestions.length > 0 && (
        <Card delay={0.6}>
          <CardHeader>
            <CardTitle>Wellness Suggestions</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {healthSuggestions.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-medium mt-0.5">
                  {index + 1}
                </div>
                <p className="text-sm text-blue-900">{suggestion}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4 italic">{healthSuggestions.disclaimer}</p>
        </Card>
      )}

      {/* Care Team & Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Care Team</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            {careTeam.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-900 font-medium">No connections yet</p>
                <p className="text-sm text-gray-500 mb-4">Connect with doctors and caretakers</p>
                <Link to="/connections">
                  <Button variant="outline">Add Connection</Button>
                </Link>
              </div>
            ) : (
              <>
                {careTeam.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={clsx(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                        member.role === "doctor" ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
                      )}>
                        {member.role === "doctor" ? <Stethoscope className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-500">
                          {member.role === "doctor" ? member.specialization || "Doctor" : "Caretaker"}
                        </p>
                      </div>
                    </div>
                    <span className={clsx(
                      "text-xs px-2 py-1 rounded-full",
                      member.status === "accepted" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    )}>
                      {member.status === "accepted" ? "Connected" : "Pending"}
                    </span>
                  </div>
                ))}
                <div className="pt-2">
                  <Link to="/connections">
                    <Button variant="outline" className="w-full text-sm">Manage Connections</Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Care Alerts</CardTitle>
          </CardHeader>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ShieldCheck className="w-12 h-12 text-emerald-200 mb-3" />
            <p className="text-gray-900 font-medium">No alerts recently</p>
            <p className="text-sm text-gray-500">Your health metrics are stable</p>
          </div>
        </Card>
      </div >
    </div >
  );
};
