import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Building2, CalendarDays,
  LogOut, ChevronRight, User, Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard, roles: ['admin', 'hr', 'employee'] },
  { to: '/employees', label: 'Employees',  icon: Users,            roles: ['admin', 'hr'] },
  { to: '/departments', label: 'Departments', icon: Building2,     roles: ['admin', 'hr'] },
  { to: '/leaves',    label: 'Leave',      icon: CalendarDays,     roles: ['admin', 'hr', 'employee'] },
  { to: '/profile',   label: 'My Profile', icon: User,             roles: ['admin', 'hr', 'employee'] },
  { to: '/audit-logs', label: 'Audit Logs', icon: Activity,        roles: ['admin'] },
];

const roleColors = { admin: 'badge-purple', hr: 'badge-blue', employee: 'badge-green' };

const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const visible = navItems.filter((n) => n.roles.includes(user?.role));

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 left-0 z-50">
        {/* Brand */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-sm font-bold text-white">S</span>
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-bold text-slate-900 leading-none tracking-tight truncate">SEMS Enterprise</p>
            <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">Portal V2</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6 space-y-0.5 overflow-y-auto scrollbar-thin">
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Workspace</p>
          {visible.map(({ to, label, icon: Icon, badge }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-all duration-150 group
                ${isActive
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} className={isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'} />
                  <span className="flex-1">{label}</span>
                  {badge && (
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold border border-slate-200/50">{badge}</span>
                  )}
                  {isActive && <div className="w-1 h-1 rounded-full bg-primary-600" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User profile */}
        <div className="px-3 py-4 border-t border-slate-100 bg-slate-50/30">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0 overflow-hidden">
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] font-bold text-primary-600">{user?.fullName?.[0]?.toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-slate-900 truncate tracking-tight">{user?.fullName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${user?.role === 'admin' ? 'bg-primary-500' : 'bg-emerald-500'}`} />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{user?.role}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full mt-2 flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-bold text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all group"
          >
            <LogOut size={14} className="group-hover:translate-x-0.5 transition-transform" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 ml-64 min-h-screen">
        {children}
      </div>
    </div>
  );
};

export default AppLayout;
