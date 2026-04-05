import { motion } from "motion/react";
import { ShieldCheck, Activity, BarChart3, Users, ChevronRight, ArrowRight, CheckCircle2, Database } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";
import { useAuth } from "../hooks/useAuth";

const LandingPage = () => {
  const { user } = useAuth();

  const features = [
    {
      title: "Predictive Risk Scoring",
      description: "Identify high-risk patients before discharge using advanced machine learning models trained on historical clinical data.",
      icon: Activity,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Clinical Decision Support",
      description: "Empower healthcare professionals with data-driven insights to improve care planning and intervention strategies.",
      icon: ShieldCheck,
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
    {
      title: "Real-time Analytics",
      description: "Monitor hospital-wide readmission trends and risk distribution through interactive dashboards and reports.",
      icon: BarChart3,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Batch Data Processing",
      description: "Upload and analyze entire patient datasets to identify population-level risks and trends.",
      icon: Database,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
  ];

  return (
    <div className="space-y-24 py-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              <span>AI-Powered Clinical Intelligence</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              Predicting <span className="text-blue-600">30-Day</span> Hospital Readmission Risk
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-xl">
              ReadmitAI uses advanced machine learning to help healthcare providers identify patients at high risk of readmission, enabling proactive care and better outcomes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to={user ? "/dashboard" : "/login"}
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all group"
              >
                <span>{user ? "Go to Dashboard" : "Access Clinical Portal"}</span>
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/performance"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-slate-900 font-bold text-lg border border-slate-200 hover:bg-slate-50 transition-all"
              >
                View Model Accuracy
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-100 to-teal-100 rounded-3xl blur-2xl opacity-50" />
            <div className="relative bg-white p-8 rounded-3xl shadow-2xl border border-slate-100">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">JD</div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Patient #8421</p>
                      <p className="text-xs text-slate-500">Discharge Date: Oct 12, 2026</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-md bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider border border-red-100">High Risk</span>
                </div>
                <div className="h-48 bg-slate-50 rounded-2xl flex items-center justify-center border border-dashed border-slate-200">
                  <div className="text-center space-y-2">
                    <Activity className="h-8 w-8 text-blue-400 mx-auto" />
                    <p className="text-sm font-medium text-slate-400">Risk Probability: 78%</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full w-2/3" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Comprehensive Clinical Support</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Our platform integrates seamlessly into clinical workflows to provide actionable insights at the point of care.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", feature.bg, feature.color)}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why it matters */}
      <section className="bg-slate-900 rounded-[3rem] p-12 lg:p-24 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold tracking-tight">Why Reducing Readmissions Matters</h2>
            <div className="space-y-6">
              {[
                "Improve patient clinical outcomes and satisfaction",
                "Reduce hospital readmission penalties and costs",
                "Optimize resource allocation and bed management",
                "Enable proactive post-discharge care coordination"
              ].map((item, i) => (
                <div key={i} className="flex items-start space-x-4">
                  <div className="mt-1 bg-blue-500/20 p-1 rounded-full">
                    <CheckCircle2 className="h-5 w-5 text-blue-400" />
                  </div>
                  <p className="text-slate-300 text-lg">{item}</p>
                </div>
              ))}
            </div>
            <Link
              to="/predict"
              className="inline-flex items-center text-blue-400 font-bold hover:text-blue-300 transition-colors group"
            >
              <span>Explore the Prediction Tool</span>
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/5 backdrop-blur-lg p-8 rounded-3xl border border-white/10 space-y-2">
              <p className="text-4xl font-bold text-blue-400">20%</p>
              <p className="text-slate-400 text-sm">Average US hospital readmission rate</p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg p-8 rounded-3xl border border-white/10 space-y-2 translate-y-8">
              <p className="text-4xl font-bold text-teal-400">$17B</p>
              <p className="text-slate-400 text-sm">Annual cost of avoidable readmissions</p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg p-8 rounded-3xl border border-white/10 space-y-2">
              <p className="text-4xl font-bold text-amber-400">30D</p>
              <p className="text-slate-400 text-sm">Critical window for intervention</p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg p-8 rounded-3xl border border-white/10 space-y-2 translate-y-8">
              <p className="text-4xl font-bold text-indigo-400">85%</p>
              <p className="text-slate-400 text-sm">Accuracy of our predictive model</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
