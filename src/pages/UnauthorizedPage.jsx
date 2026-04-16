import { Link } from 'react-router-dom';
import { ShieldOff, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UnauthorizedPage = () => {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-[#f6f4ef] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="text-center animate-slide-up max-w-lg relative z-10 p-10 bg-white border border-slate-200 rounded-lg shadow-subtle">
        <div className="inline-flex w-16 h-16 items-center justify-center bg-red-50 rounded-md mb-8 border border-red-100">
          <ShieldOff size={28} className="text-red-600" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-4">Access Restricted</h1>
        <p className="text-[13px] text-slate-600 font-medium mb-3 leading-relaxed">
          Your account role (<span className="text-red-700 font-bold uppercase tracking-wider">{user?.role || 'unknown'}</span>) does not possess the necessary clearance for this sector.
        </p>
        <p className="text-slate-400 text-[12px] font-medium mb-10 italic">
          Please contact a system administrator if you believe your permissions are misconfigured.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/dashboard" className="btn-secondary h-9 px-6 flex items-center justify-center gap-2">
            <ArrowLeft size={16} /> Return to Home
          </Link>
          <button onClick={logout} className="h-9 px-6 rounded bg-slate-900 text-white hover:bg-black font-bold text-[13px] transition-all flex items-center justify-center gap-2">
            <LogOut size={16} /> Exit & Re-login
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
