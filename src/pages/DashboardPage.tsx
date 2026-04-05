import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from "recharts";
import { Activity, Users, AlertCircle, CheckCircle2, TrendingUp, Calendar, Filter, Download, ChevronDown, LayoutDashboard, BarChart3, PieChartIcon, ShieldCheck, ShieldAlert } from "lucide-react";
import { cn } from "../lib/utils";
import { db, isFirebaseConfigured, OperationType, handleFirestoreError } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let unsubscribe: () => void;

    const fetchData = async () => {
      // Try Firebase first if configured
      if (isFirebaseConfigured()) {
        try {
          unsubscribe = onSnapshot(doc(db, "analytics", "summary"), (snapshot) => {
            if (snapshot.exists()) {
              setData(snapshot.data());
              setIsLive(true);
              setLoading(false);
            } else {
              // Fallback to API if document doesn't exist yet
              fetchFromApi();
            }
          }, (err) => {
            handleFirestoreError(err, OperationType.GET, "analytics/summary");
            fetchFromApi();
          });
        } catch (err) {
          fetchFromApi();
        }
      } else {
        fetchFromApi();
      }
    };

    const fetchFromApi = async () => {
      try {
        const response = await fetch("/api/analytics");
        const analytics = await response.json();
        setData(analytics);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
        setLoading(false);
      }
    };

    fetchData();
    return () => unsubscribe?.();
  }, []);

  const COLORS = ["#EF4444", "#F59E0B", "#10B981"];

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-blue-50 border-t-blue-600 animate-spin" />
      </div>
    );
  }

  const stats = [
    { label: "Total Predictions", value: data.totalPredictions, icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "High Risk Patients", value: data.highRiskCount, icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
    { label: "Moderate Risk", value: data.moderateRiskCount, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Low Risk", value: data.lowRiskCount, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Clinical Analytics Dashboard</h1>
            {isLive ? (
              <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                <ShieldCheck className="h-3 w-3" />
                <span>Live Data</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <ShieldAlert className="h-3 w-3" />
                <span>Demo Mode</span>
              </div>
            )}
          </div>
          <p className="text-slate-500">Real-time insights into hospital readmission risks and trends.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">
            <Calendar className="h-4 w-4" />
            <span>Last 30 Days</span>
            <ChevronDown className="h-4 w-4" />
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4"
          >
            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", stat.bg, stat.color)}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value.toLocaleString()}</p>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-emerald-600 font-bold">+12%</span>
              <span className="text-slate-400">from last month</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Risk Distribution */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-1 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-slate-900 font-bold">
              <PieChartIcon className="h-5 w-5 text-blue-600" />
              <span>Risk Distribution</span>
            </div>
            <button className="p-2 rounded-lg hover:bg-slate-50 text-slate-400">
              <Filter className="h-4 w-4" />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {data.distribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            {data.distribution.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-slate-600">{item.name} Risk</span>
                </div>
                <span className="font-bold text-slate-900">{((item.value / data.totalPredictions) * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Monthly Trends */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-slate-900 font-bold">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span>Monthly Risk Trends</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="h-3 w-3 rounded-full bg-blue-600" />
              <span className="text-xs font-medium text-slate-500">Avg Risk Score</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthlyTrends}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3A86FF" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3A86FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(v: number) => [`${(v * 100).toFixed(1)}%`, 'Avg Risk']}
                />
                <Area 
                  type="monotone" 
                  dataKey="risk" 
                  stroke="#3A86FF" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRisk)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl flex items-center space-x-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-blue-900">Trend Insight</p>
              <p className="text-xs text-blue-700">Average readmission risk has increased by 4.2% over the last 3 months. Reviewing elective procedure protocols is recommended.</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Predictions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-900 font-bold">
            <LayoutDashboard className="h-5 w-5 text-blue-600" />
            <span>Recent Risk Assessments</span>
          </div>
          <button className="text-sm font-bold text-blue-600 hover:text-blue-700">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Patient ID</th>
                <th className="px-6 py-4">Age/Gender</th>
                <th className="px-6 py-4">Admission Type</th>
                <th className="px-6 py-4">Risk Level</th>
                <th className="px-6 py-4">Probability</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { id: "#8421", age: "60-70", gender: "M", type: "Emergency", risk: "High", prob: "78%" },
                { id: "#8422", age: "40-50", gender: "F", type: "Urgent", risk: "Moderate", prob: "52%" },
                { id: "#8423", age: "70-80", gender: "F", type: "Elective", risk: "Low", prob: "12%" },
                { id: "#8424", age: "50-60", gender: "M", type: "Emergency", risk: "High", prob: "84%" },
                { id: "#8425", age: "30-40", gender: "F", type: "Urgent", risk: "Low", prob: "24%" },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{row.id}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{row.age} / {row.gender}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{row.type}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                      row.risk === "High" ? "bg-red-50 text-red-600" : 
                      row.risk === "Moderate" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                    )}>
                      {row.risk}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">{row.prob}</td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-700 font-bold text-sm">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
