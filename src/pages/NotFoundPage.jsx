import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFoundPage = () => (
  <div className="min-h-screen bg-[#f6f4ef] flex items-center justify-center px-4 relative overflow-hidden">
    <div className="text-center animate-slide-up relative z-10">
      <div className="mb-8">
        <p className="text-[140px] font-bold text-slate-200/40 leading-none select-none tracking-tighter mix-blend-multiply">404</p>
      </div>
      <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-3">Resource Missing</h1>
      <p className="text-[13px] text-slate-500 font-medium max-w-sm mx-auto mb-10 leading-relaxed">
        The requested endpoint is inaccessible or has been permanently removed from the personnel management system.
      </p>
      <Link to="/dashboard" className="btn-primary h-10 px-6 inline-flex items-center gap-2">
        <Home size={16} />
        Back to Headquarters
      </Link>
    </div>
  </div>
);

export default NotFoundPage;
