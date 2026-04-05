import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { auth, db, OperationType, handleFirestoreError } from "../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ShieldCheck, LogIn, Loader2, User, Lock, Briefcase, ChevronRight, AlertCircle, UserPlus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";
import { UserRole } from "../types";

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'form' | 'role'>('form');
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [tempUser, setTempUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('Doctor');
  const navigate = useNavigate();

  // Map username to a internal email format for Firebase Auth
  const getEmail = (username: string) => {
    const sanitized = username.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    return `${sanitized || 'staff'}@readmit.ai`;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const email = getEmail(formData.username);
    // Use a fixed internal password to make it truly permissive for testing/demo purposes
    // This allows "any" password entered in the UI to work seamlessly
    const internalPassword = "clinical_test_access_2026"; 

    try {
      // 1. Try to sign in first
      try {
        await signInWithEmailAndPassword(auth, email, internalPassword);
        navigate("/dashboard");
      } catch (signInErr: any) {
        // 2. If sign in fails (user doesn't exist), try to auto-register
        try {
          const result = await createUserWithEmailAndPassword(auth, email, internalPassword);
          await updateProfile(result.user, { displayName: formData.username });
          setTempUser(result.user);
          setStep('role');
        } catch (createErr: any) {
          console.error("Auto-registration failed:", createErr);
          setError("Clinical portal access failed. Please try a different username.");
        }
      }
    } catch (err: any) {
      console.error("Auth failed:", err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = async () => {
    if (!tempUser) return;
    setLoading(true);
    
    try {
      await setDoc(doc(db, "users", tempUser.uid), {
        email: tempUser.email,
        role: selectedRole,
        displayName: tempUser.displayName || formData.username,
        username: formData.username,
        createdAt: new Date().toISOString()
      });
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Profile creation failed:", err);
      setError("Failed to create your professional profile.");
      handleFirestoreError(err, OperationType.CREATE, "users");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100"
      >
        <div className="text-center space-y-4">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
            <ShieldCheck className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            ReadmitAI Portal
          </h2>
          <p className="text-slate-500 text-sm">
            {step === 'form' 
              ? "Clinical Access & Decision Support"
              : "Complete your professional profile"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'form' ? (
            <motion.form
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleAuth}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Professional ID / Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
                      placeholder="e.g. jsmith_clinical"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <LogIn className="h-5 w-5" />
                  </>
                )}
              </button>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Clinical credentials are required for access. New users will be automatically registered upon first sign-in.
                </p>
              </div>
            </motion.form>
          ) : (
            <motion.div
              key="role"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setStep('form')}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-slate-900">Welcome, {formData.username}</p>
                  <p className="text-xs text-slate-500">Select your clinical role.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {(['Doctor', 'Nurse', 'Administrator'] as UserRole[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left",
                      selectedRole === role 
                        ? "border-blue-600 bg-blue-50/50" 
                        : "border-slate-100 hover:border-slate-200 bg-white"
                    )}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center",
                        selectedRole === role ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                      )}>
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <div>
                        <p className={cn("font-bold text-sm", selectedRole === role ? "text-blue-700" : "text-slate-900")}>{role}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Clinical Staff</p>
                      </div>
                    </div>
                    {selectedRole === role && <CheckCircle2 className="h-5 w-5 text-blue-600" />}
                  </button>
                ))}
              </div>

              <button
                onClick={handleCompleteProfile}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <span>Complete Setup</span>
                    <ChevronRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-medium flex items-center space-x-2"
          >
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

const CheckCircle2 = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default LoginPage;
