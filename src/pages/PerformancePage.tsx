import { motion } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter, ZAxis } from "recharts";
import { Activity, ShieldCheck, Target, Zap, Info, ChevronRight, BarChart3, PieChart as PieChartIcon, TrendingUp } from "lucide-react";
import { cn } from "../lib/utils";

const PerformancePage = () => {
  const featureImportance = [
    { name: "Time in Hospital", value: 0.24 },
    { name: "Num Medications", value: 0.18 },
    { name: "Num Diagnoses", value: 0.15 },
    { name: "Age Range", value: 0.12 },
    { name: "Num Lab Procedures", value: 0.10 },
    { name: "Admission Type", value: 0.08 },
    { name: "Diabetes Med", value: 0.07 },
    { name: "Gender", value: 0.06 },
  ];

  const rocCurve = [
    { fpr: 0, tpr: 0 },
    { fpr: 0.1, tpr: 0.4 },
    { fpr: 0.2, tpr: 0.65 },
    { fpr: 0.3, tpr: 0.78 },
    { fpr: 0.4, tpr: 0.85 },
    { fpr: 0.5, tpr: 0.9 },
    { fpr: 0.6, tpr: 0.93 },
    { fpr: 0.7, tpr: 0.96 },
    { fpr: 0.8, tpr: 0.98 },
    { fpr: 0.9, tpr: 0.99 },
    { fpr: 1, tpr: 1 },
  ];

  const confusionMatrix = [
    { name: "True Negative", value: 842, color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    { name: "False Positive", value: 124, color: "bg-red-50 text-red-700 border-red-100" },
    { name: "False Negative", value: 98, color: "bg-amber-50 text-amber-700 border-amber-100" },
    { name: "True Positive", value: 342, color: "bg-blue-50 text-blue-700 border-blue-100" },
  ];

  const metrics = [
    { label: "Accuracy", value: "85.2%", icon: Target, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "AUC Score", value: "0.88", icon: Activity, color: "text-teal-600", bg: "bg-teal-50" },
    { label: "Precision", value: "82.4%", icon: ShieldCheck, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Recall", value: "78.9%", icon: Zap, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="space-y-8 pb-24">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Model Performance & Insights</h1>
        <p className="text-slate-500">Technical evaluation of the ReadmitAI machine learning model.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4"
          >
            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", metric.bg, metric.color)}>
              <metric.icon className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">{metric.label}</p>
              <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Feature Importance */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-slate-900 font-bold">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span>Feature Importance</span>
            </div>
            <button className="p-2 rounded-lg hover:bg-slate-50 text-slate-400">
              <Info className="h-4 w-4" />
            </button>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureImportance} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748B', fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(v: number) => [`${(v * 100).toFixed(1)}%`, 'Importance']}
                />
                <Bar 
                  dataKey="value" 
                  fill="#3A86FF" 
                  radius={[0, 8, 8, 0]} 
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            The chart above shows which clinical factors have the most significant impact on the model's prediction. "Time in Hospital" and "Number of Medications" are the primary drivers of readmission risk.
          </p>
        </motion.div>

        {/* ROC Curve */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-slate-900 font-bold">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span>ROC Curve (AUC: 0.88)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="h-3 w-3 rounded-full bg-blue-600" />
              <span className="text-xs font-medium text-slate-500">Model Performance</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rocCurve} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis 
                  dataKey="fpr" 
                  label={{ value: 'False Positive Rate', position: 'bottom', offset: -5, fontSize: 12, fill: '#64748B' }}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                />
                <YAxis 
                  label={{ value: 'True Positive Rate', angle: -90, position: 'left', fontSize: 12, fill: '#64748B' }}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="tpr" 
                  stroke="#3A86FF" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#3A86FF' }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="linear" 
                  dataKey="fpr" 
                  stroke="#CBD5E1" 
                  strokeDasharray="5 5" 
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-600 leading-relaxed">
              The Receiver Operating Characteristic (ROC) curve illustrates the diagnostic ability of our binary classifier system. An AUC of 0.88 indicates strong predictive power.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Confusion Matrix */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8"
      >
        <div className="flex items-center space-x-2 text-slate-900 font-bold">
          <Target className="h-5 w-5 text-blue-600" />
          <span>Confusion Matrix</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {confusionMatrix.map((item, i) => (
            <div key={i} className={cn("p-6 rounded-2xl border text-center space-y-2 transition-transform hover:scale-105", item.color)}>
              <p className="text-xs font-bold uppercase tracking-widest opacity-70">{item.name}</p>
              <p className="text-3xl font-black">{item.value}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-col md:flex-row gap-8 items-center justify-between p-6 bg-blue-600 rounded-2xl text-white">
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Model Interpretation</h3>
            <p className="text-sm text-blue-100 max-w-xl">
              The model correctly identifies 342 high-risk patients (True Positives) while maintaining a low false positive rate. This balance is critical for minimizing "alert fatigue" in clinical settings.
            </p>
          </div>
          <button className="px-8 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all whitespace-nowrap">
            Download Technical Report
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PerformancePage;
