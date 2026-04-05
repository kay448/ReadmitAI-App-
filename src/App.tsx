import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { Activity, LayoutDashboard, FileText, BarChart3, Upload, LogIn, Menu, X, ShieldCheck, LogOut, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "./lib/utils";
import { useAuth } from "./hooks/useAuth";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";

// Pages
import LandingPage from "./pages/LandingPage";
import PredictionPage from "./pages/PredictionPage";
import DashboardPage from "./pages/DashboardPage";
import PerformancePage from "./pages/PerformancePage";
import UploadPage from "./pages/UploadPage";
import LoginPage from "./pages/LoginPage";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Predict Risk", path: "/predict", icon: Activity },
    { name: "Batch Analysis", path: "/upload", icon: Upload },
    { name: "Model Performance", path: "/performance", icon: BarChart3 },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="bg-blue-600 p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-blue-100">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-black text-slate-900 tracking-tighter">Readmit<span className="text-blue-600">AI</span></span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200",
                  location.pathname === item.path
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
            
            <div className="ml-4 pl-4 border-l border-slate-100 flex items-center space-x-4">
              {loading ? (
                <div className="h-8 w-8 rounded-full bg-slate-100 animate-pulse" />
              ) : user ? (
                <div className="flex items-center space-x-3">
                  <div className="text-right hidden lg:block">
                    <p className="text-xs font-bold text-slate-900 leading-none">{user.displayName}</p>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-1">{user.role}</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <Link 
                  to="/login"
                  className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-100"
                >
                  Login
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-50 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-bold",
                    location.pathname === item.path
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-500 hover:bg-slate-50"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
              <div className="pt-4 mt-4 border-t border-slate-100">
                {user ? (
                  <div className="flex items-center justify-between px-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {user.displayName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{user.displayName}</p>
                        <p className="text-xs text-slate-500">{user.role}</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="p-2 rounded-xl text-red-600 bg-red-50"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center w-full py-4 rounded-xl bg-slate-900 text-white font-bold"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return user ? <>{children}</> : null;
};

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
        <Navigation />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/predict" element={<ProtectedRoute><PredictionPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/performance" element={<ProtectedRoute><PerformancePage /></ProtectedRoute>} />
            <Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-slate-100 py-12 mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0 text-center md:text-left">
              <div className="flex items-center space-x-3">
                <div className="bg-slate-900 p-1.5 rounded-lg">
                  <ShieldCheck className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-black text-slate-900 tracking-tighter">Readmit<span className="text-blue-600">AI</span></span>
              </div>
              <p className="text-slate-400 text-sm font-medium">
                © 2026 ReadmitAI Clinical Systems. HIPAA Compliant.
              </p>
              <div className="flex space-x-8">
                <a href="#" className="text-slate-400 hover:text-slate-900 text-sm font-bold transition-colors">Privacy Policy</a>
                <a href="#" className="text-slate-400 hover:text-slate-900 text-sm font-bold transition-colors">Terms of Service</a>
                <a href="#" className="text-slate-400 hover:text-slate-900 text-sm font-bold transition-colors">Security</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
