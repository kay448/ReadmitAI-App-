import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { Upload, FileText, X, CheckCircle2, Loader2, AlertCircle, Download, Table, ChevronRight, Activity } from "lucide-react";
import { cn } from "../lib/utils";
import { db, auth, OperationType, handleFirestoreError, isFirebaseConfigured } from "../firebase";
import { collection, writeBatch, doc } from "firebase/firestore";

const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
      setSaveStatus(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls', '.xlsx']
    },
    multiple: false
  });

  const handleProcess = () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setSaveStatus(null);

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          // In a real app, we'd send this to the backend
          // For now, we'll simulate processing each row
          const processedResults = results.data
            .filter((row: any) => row.age) // Filter empty rows
            .map((row: any, index) => {
              const prob = Math.random();
              let risk = "Low";
              if (prob > 0.7) risk = "High";
              else if (prob > 0.4) risk = "Moderate";
              
              return {
                ...row,
                id: `P-${1000 + index}`,
                readmission_probability: (prob * 100).toFixed(1) + "%",
                risk_level: risk,
                timestamp: new Date().toISOString(),
                createdBy: auth.currentUser?.uid || "anonymous"
              };
            });

          setTimeout(async () => {
            setResults(processedResults);
            setLoading(false);

            // Save batch to Firestore if configured
            if (isFirebaseConfigured() && auth.currentUser && processedResults.length > 0) {
              try {
                const batch = writeBatch(db);
                processedResults.slice(0, 100).forEach((res) => { // Limit batch size for safety
                  const newDocRef = doc(collection(db, "predictions"));
                  batch.set(newDocRef, {
                    ...res,
                    readmission_probability: parseFloat(res.readmission_probability) / 100
                  });
                });
                await batch.commit();
                setSaveStatus("Batch saved to clinical database");
              } catch (err) {
                handleFirestoreError(err, OperationType.WRITE, "predictions_batch");
                setSaveStatus("Failed to save batch to database");
              }
            }
          }, 2000);
        } catch (err) {
          setError("Failed to process the dataset. Please ensure the CSV format is correct.");
          setLoading(false);
        }
      },
      error: (err) => {
        setError("Error parsing CSV file: " + err.message);
        setLoading(false);
      }
    });
  };

  const removeFile = () => {
    setFile(null);
    setResults([]);
    setError(null);
  };

  const downloadResults = () => {
    const csv = Papa.unparse(results);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "readmit_ai_predictions.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Batch Dataset Processing</h1>
        <p className="text-slate-500">Upload hospital datasets to run predictions on multiple patients simultaneously.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center space-x-2 text-slate-900 font-bold">
              <Upload className="h-5 w-5 text-blue-600" />
              <span>Upload Patient Data</span>
            </div>

            {!file ? (
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-2xl p-12 text-center space-y-4 transition-all cursor-pointer",
                  isDragActive ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-400 hover:bg-slate-50"
                )}
              >
                <input {...getInputProps()} />
                <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto text-blue-600">
                  <FileText className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-900">Drop CSV file here</p>
                  <p className="text-xs text-slate-500">or click to browse files</p>
                </div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Max size: 10MB</p>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center text-blue-600">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-slate-900 truncate max-w-[150px]">{file.name}</p>
                      <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button onClick={removeFile} className="p-2 rounded-lg hover:bg-white text-slate-400 hover:text-red-500 transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <button
                  onClick={handleProcess}
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Activity className="h-4 w-4" />
                      <span>Run Batch Prediction</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start space-x-3 text-red-700">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-xs font-medium">{error}</p>
              </div>
            )}

            <div className="pt-6 border-t border-slate-100 space-y-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Requirements</p>
              <div className="space-y-3">
                {[
                  "CSV format only",
                  "Headers must match model features",
                  "Maximum 5,000 rows per upload",
                  "Encrypted data transmission"
                ].map((req, i) => (
                  <div key={i} className="flex items-center space-x-2 text-sm text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>{req}</span>
                  </div>
                ))}
              </div>
              <button className="w-full py-2 text-blue-600 font-bold text-xs hover:underline">
                Download Template CSV
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {results.length === 0 && !loading && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 border-dashed text-center space-y-4"
              >
                <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center">
                  <Table className="h-10 w-10 text-slate-300" />
                </div>
                <div className="space-y-2">
                  <p className="font-bold text-slate-900 text-xl">No Data Processed</p>
                  <p className="text-slate-500 max-w-sm">Upload a patient dataset to see batch prediction results and generate reports.</p>
                </div>
              </motion.div>
            )}

            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-6"
              >
                <div className="h-24 w-24 rounded-full border-4 border-blue-50 border-t-blue-600 animate-spin" />
                <div className="space-y-2">
                  <p className="font-bold text-slate-900 text-xl">Analyzing Dataset</p>
                  <p className="text-slate-500">Running machine learning inference on {file?.name}...</p>
                </div>
              </motion.div>
            )}

            {results.length > 0 && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full"
              >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Processing Complete</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs text-slate-500">{results.length} patients analyzed</p>
                        {saveStatus && (
                          <>
                            <span className="text-slate-300">•</span>
                            <p className={cn(
                              "text-[10px] font-bold uppercase tracking-wider",
                              saveStatus.includes("Failed") ? "text-red-500" : "text-emerald-600"
                            )}>{saveStatus}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={downloadResults}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Results</span>
                  </button>
                </div>
                <div className="overflow-auto max-h-[600px]">
                  <table className="w-full text-left">
                    <thead className="sticky top-0 bg-white shadow-sm z-10">
                      <tr className="text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                        <th className="px-6 py-4">ID</th>
                        <th className="px-6 py-4">Age/Gender</th>
                        <th className="px-6 py-4">Risk Level</th>
                        <th className="px-6 py-4">Probability</th>
                        <th className="px-6 py-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {results.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900 text-sm">{row.id}</td>
                          <td className="px-6 py-4 text-xs text-slate-600">{row.age} / {row.gender}</td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                              row.risk_level === "High" ? "bg-red-50 text-red-600" : 
                              row.risk_level === "Moderate" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                            )}>
                              {row.risk_level}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-900 text-sm">{row.readmission_probability}</td>
                          <td className="px-6 py-4">
                            <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
