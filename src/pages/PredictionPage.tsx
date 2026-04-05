import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Activity, AlertCircle, CheckCircle2, ChevronRight, Info, Loader2, RefreshCw, ShieldCheck, User } from "lucide-react";
import { cn } from "../lib/utils";
import { ADMISSION_TYPES, DISCHARGE_DISPOSITIONS } from "../constants";
import { db, auth, OperationType, handleFirestoreError, isFirebaseConfigured } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

const PredictionPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    age: "50-60",
    gender: "Female",
    timeInHospital: 3,
    numLabProcedures: 40,
    numProcedures: 1,
    numMedications: 15,
    numDiagnoses: 6,
    diabetesMed: "No",
    change: "No",
    admissionType: "Emergency",
    dischargeDisposition: "Discharged to home",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setSaveStatus(null);

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      
      // Simulate network delay
      setTimeout(async () => {
        setResult(data);
        setLoading(false);

        // Save to Firestore if configured and authenticated
        if (isFirebaseConfigured() && auth.currentUser) {
          try {
            await addDoc(collection(db, "predictions"), {
              ...formData,
              readmission_probability: data.readmission_probability,
              risk_level: data.risk_level,
              timestamp: data.timestamp,
              createdBy: auth.currentUser.uid
            });
            setSaveStatus("Saved to clinical records");
          } catch (err) {
            handleFirestoreError(err, OperationType.CREATE, "predictions");
            setSaveStatus("Failed to save record");
          }
        }
      }, 1500);
    } catch (error) {
      console.error("Prediction failed:", error);
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["timeInHospital", "numLabProcedures", "numProcedures", "numMedications", "numDiagnoses"].includes(name)
        ? parseInt(value)
        : value,
    }));
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "High": return "text-red-600 bg-red-50 border-red-100";
      case "Moderate": return "text-amber-600 bg-amber-50 border-amber-100";
      case "Low": return "text-emerald-600 bg-emerald-50 border-emerald-100";
      default: return "text-slate-600 bg-slate-50 border-slate-100";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "High": return AlertCircle;
      case "Moderate": return Info;
      case "Low": return CheckCircle2;
      default: return Activity;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Patient Risk Prediction</h1>
          <p className="text-slate-500">Enter patient clinical data to assess 30-day readmission risk.</p>
        </div>
        <button
          onClick={() => {
            setResult(null);
            setFormData({
              age: "50-60",
              gender: "Female",
              timeInHospital: 3,
              numLabProcedures: 40,
              numProcedures: 1,
              numMedications: 15,
              numDiagnoses: 6,
              diabetesMed: "No",
              change: "No",
              admissionType: "Emergency",
              dischargeDisposition: "Discharged to home",
            });
          }}
          className="flex items-center space-x-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Reset Form</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center space-x-2 text-slate-900 font-bold">
                <User className="h-5 w-5 text-blue-600" />
                <span>Patient Demographics & Clinical History</span>
              </div>
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Age */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Age Range</label>
                <select
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-white"
                >
                  {["[0-10)", "[10-20)", "[20-30)", "[30-40)", "[40-50)", "[50-60)", "[60-70)", "[70-80)", "[80-90)", "[90-100)"].map(age => (
                    <option key={age} value={age}>{age}</option>
                  ))}
                </select>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Gender</label>
                <div className="flex space-x-4">
                  {["Male", "Female"].map((g) => (
                    <label key={g} className={cn(
                      "flex-1 flex items-center justify-center py-2.5 rounded-xl border cursor-pointer transition-all font-medium text-sm",
                      formData.gender === g ? "bg-blue-50 border-blue-600 text-blue-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}>
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        checked={formData.gender === g}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      {g}
                    </label>
                  ))}
                </div>
              </div>

              {/* Time in Hospital */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Time in Hospital (Days)</label>
                <input
                  type="number"
                  name="timeInHospital"
                  min="1"
                  max="14"
                  value={formData.timeInHospital}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                />
              </div>

              {/* Lab Procedures */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Number of Lab Procedures</label>
                <input
                  type="number"
                  name="numLabProcedures"
                  min="1"
                  max="132"
                  value={formData.numLabProcedures}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                />
              </div>

              {/* Medications */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Number of Medications</label>
                <input
                  type="number"
                  name="numMedications"
                  min="1"
                  max="81"
                  value={formData.numMedications}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                />
              </div>

              {/* Diagnoses */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Number of Diagnoses</label>
                <input
                  type="number"
                  name="numDiagnoses"
                  min="1"
                  max="16"
                  value={formData.numDiagnoses}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                />
              </div>

              {/* Admission Type */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Admission Type</label>
                <select
                  name="admissionType"
                  value={formData.admissionType}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-white"
                >
                  {ADMISSION_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Discharge Disposition */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Discharge Disposition</label>
                <select
                  name="dischargeDisposition"
                  value={formData.dischargeDisposition}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-white"
                >
                  {DISCHARGE_DISPOSITIONS.map(disp => (
                    <option key={disp} value={disp}>{disp}</option>
                  ))}
                </select>
              </div>

              {/* Diabetes Meds */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Diabetes Medication</label>
                <div className="flex space-x-4">
                  {["Yes", "No"].map((v) => (
                    <label key={v} className={cn(
                      "flex-1 flex items-center justify-center py-2.5 rounded-xl border cursor-pointer transition-all font-medium text-sm",
                      formData.diabetesMed === v ? "bg-blue-50 border-blue-600 text-blue-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}>
                      <input
                        type="radio"
                        name="diabetesMed"
                        value={v}
                        checked={formData.diabetesMed === v}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      {v}
                    </label>
                  ))}
                </div>
              </div>

              {/* Change */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Medication Change</label>
                <div className="flex space-x-4">
                  {["Ch", "No"].map((v) => (
                    <label key={v} className={cn(
                      "flex-1 flex items-center justify-center py-2.5 rounded-xl border cursor-pointer transition-all font-medium text-sm",
                      formData.change === v ? "bg-blue-50 border-blue-600 text-blue-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}>
                      <input
                        type="radio"
                        name="change"
                        value={v}
                        checked={formData.change === v}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      {v === "Ch" ? "Change" : "No Change"}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50/50 border-t border-slate-100">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-3 py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-100"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Analyzing Clinical Data...</span>
                  </>
                ) : (
                  <>
                    <Activity className="h-6 w-6" />
                    <span>Predict Readmission Risk</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 border-dashed text-center space-y-4"
              >
                <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center">
                  <Activity className="h-8 w-8 text-slate-300" />
                </div>
                <div className="space-y-2">
                  <p className="font-bold text-slate-900">No Prediction Yet</p>
                  <p className="text-sm text-slate-500">Complete the form and click "Predict Risk" to see the assessment.</p>
                </div>
              </motion.div>
            )}

            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-6"
              >
                <div className="relative">
                  <div className="h-24 w-24 rounded-full border-4 border-blue-50 border-t-blue-600 animate-spin" />
                  <Activity className="h-8 w-8 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="space-y-2">
                  <p className="font-bold text-slate-900">Processing Data</p>
                  <p className="text-sm text-slate-500">Our machine learning model is analyzing the clinical factors...</p>
                </div>
              </motion.div>
            )}

            {result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className={cn("p-8 rounded-2xl border shadow-sm space-y-6", getRiskColor(result.risk_level))}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-white/50">
                        {(() => {
                          const Icon = getRiskIcon(result.risk_level);
                          return <Icon className="h-6 w-6" />;
                        })()}
                      </div>
                      <span className="font-bold uppercase tracking-wider text-sm">Risk Assessment</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-medium opacity-70">{new Date(result.timestamp).toLocaleTimeString()}</span>
                      {saveStatus && (
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-tighter",
                          saveStatus.includes("Failed") ? "text-red-500" : "text-emerald-600"
                        )}>
                          {saveStatus}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <p className="text-5xl font-black">{(result.readmission_probability * 100).toFixed(0)}%</p>
                    <p className="text-xl font-bold uppercase tracking-widest">{result.risk_level} RISK</p>
                  </div>

                  <div className="h-3 bg-white/30 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.readmission_probability * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={cn(
                        "h-full rounded-full",
                        result.risk_level === "High" ? "bg-red-600" : 
                        result.risk_level === "Moderate" ? "bg-amber-600" : "bg-emerald-600"
                      )}
                    />
                  </div>

                  <p className="text-sm leading-relaxed font-medium">
                    {result.risk_level === "High" 
                      ? "This patient shows significant risk factors for readmission. Immediate care coordination and post-discharge follow-up are strongly recommended."
                      : result.risk_level === "Moderate"
                      ? "Moderate risk factors detected. Consider additional patient education and a 48-hour follow-up call after discharge."
                      : "Patient shows low risk of readmission. Standard discharge protocols and routine follow-up are appropriate."}
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center space-x-2 text-slate-900 font-bold">
                    <Info className="h-5 w-5 text-blue-600" />
                    <span>Key Risk Factors</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "Time in Hospital", value: formData.timeInHospital > 5 ? "High" : "Normal" },
                      { label: "Medication Count", value: formData.numMedications > 20 ? "High" : "Normal" },
                      { label: "Diagnosis Count", value: formData.numDiagnoses > 7 ? "High" : "Normal" },
                    ].map((factor, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">{factor.label}</span>
                        <span className={cn(
                          "px-2 py-0.5 rounded-md font-bold text-[10px] uppercase",
                          factor.value === "High" ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-500"
                        )}>{factor.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-600 p-6 rounded-2xl shadow-lg shadow-blue-100 text-white space-y-4">
                  <div className="flex items-center space-x-2 font-bold">
                    <ShieldCheck className="h-5 w-5" />
                    <span>Clinical Recommendation</span>
                  </div>
                  <p className="text-sm text-blue-50 leading-relaxed">
                    Based on the assessment, we recommend scheduling a primary care follow-up within 7 days and reviewing medication adherence protocols with the patient.
                  </p>
                  <button className="w-full py-2 bg-white text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors">
                    Generate Care Plan
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PredictionPage;
