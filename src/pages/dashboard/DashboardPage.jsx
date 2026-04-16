import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Users, Building2, CalendarDays, Shield, ChevronRight, Plus,
  Activity, TrendingUp, Clock, CheckCircle, XCircle, BarChart2,
} from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import dashboardService from '../../services/dashboardService';

// Brand color palette
const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const StatCard = ({ label, value, icon: Icon, color, to, loading }) => {
  const inner = (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-subtle hover:border-slate-300 hover:shadow-md transition-all group flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={17} />
        </div>
        {to && <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-700 transition-colors" />}
      </div>
      <p className="text-2xl font-extrabold text-slate-900 tracking-tight">
        {loading ? <span className="animate-pulse text-slate-300">—</span> : value}
      </p>
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">{label}</p>
    </div>
  );
  return to ? <Link to={to} className="block">{inner}</Link> : <div>{inner}</div>;
};

const ChartCard = ({ title, subtitle, children, loading }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-subtle">
    <div className="mb-5">
      <h3 className="text-[13px] font-bold text-slate-900 tracking-tight">{title}</h3>
      {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
    {loading ? (
      <div className="h-48 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    ) : children}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-slate-900 text-white text-[12px] px-3 py-2 rounded-lg shadow-xl">
        {label && <p className="font-bold mb-1">{label}</p>}
        {payload.map(p => (
          <p key={p.name}>{p.name || 'Count'}: <span className="font-bold">{p.value}</span></p>
        ))}
      </div>
    );
  }
  return null;
};

const DashboardPage = () => {
  const { user } = useAuth();
  const isAdminOrHR = ['admin', 'hr'].includes(user?.role);

  const [summary, setSummary]       = useState(null);
  const [deptData, setDeptData]     = useState([]);
  const [leaveData, setLeaveData]   = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [trendData, setTrendData]   = useState([]);
  const [loading, setLoading]       = useState(true);

  const loadAll = useCallback(async () => {
    if (!isAdminOrHR) { setLoading(false); return; }
    try {
      const [sum, dept, leave, status, trend] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getEmployeesByDepartment(),
        dashboardService.getLeaveSummary(),
        dashboardService.getEmployeeStatusSummary(),
        dashboardService.getJoinTrend(),
      ]);
      setSummary(sum.summary);
      setDeptData(dept.data);
      setLeaveData(leave.data);
      setStatusData(status.data);
      setTrendData(trend.data);
    } catch {
      // handled below
    } finally {
      setLoading(false);
    }
  }, [isAdminOrHR]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Leave status color map
  const leaveColorMap = { pending: '#f59e0b', approved: '#10b981', rejected: '#ef4444', cancelled: '#94a3b8' };
  const statusColorMap = { active: '#10b981', inactive: '#94a3b8', on_leave: '#f59e0b', terminated: '#ef4444' };

  return (
    <AppLayout>
      <div className="px-8 py-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-slate-100">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="page-subtitle mt-1">
              Hello, {user?.fullName?.split(' ')[0]}.{' '}
              {isAdminOrHR ? 'Live analytics and operations overview.' : 'Your personal workspace and activity.'}
            </p>
          </div>
          {isAdminOrHR && (
            <div className="flex items-center gap-3">
              <Link to="/employees/add" className="btn-primary h-9 px-4 gap-2">
                <Plus size={15} /> Register Personnel
              </Link>
            </div>
          )}
        </div>

        {/* ────── Admin/HR Dashboard ────── */}
        {isAdminOrHR ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in">
              <StatCard label="Total Workforce"   value={summary?.totalEmployees}    icon={Users}        color="bg-blue-50 text-blue-600"    to="/employees"               loading={loading} />
              <StatCard label="Active Employees"  value={summary?.activeEmployees}   icon={CheckCircle}  color="bg-emerald-50 text-emerald-600" to="/employees?status=active" loading={loading} />
              <StatCard label="Departments"       value={summary?.totalDepartments}  icon={Building2}    color="bg-violet-50 text-violet-600" to="/departments"             loading={loading} />
              <StatCard label="Pending Leaves"    value={summary?.pendingLeaves}     icon={Clock}        color="bg-amber-50 text-amber-600"   to="/leaves/approval"         loading={loading} />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              <StatCard label="Approved Leaves"  value={summary?.approvedLeaves}   icon={CalendarDays}  color="bg-emerald-50 text-emerald-600" to={null} loading={loading} />
              <StatCard label="Rejected Leaves"  value={summary?.rejectedLeaves}   icon={XCircle}       color="bg-red-50 text-red-500"         to={null} loading={loading} />
              <StatCard label="Access Level"     value={user?.role?.toUpperCase()} icon={Shield}        color="bg-slate-100 text-slate-600"    to={null} loading={false}    />
              <StatCard label="Analytics"        value="Live"                      icon={BarChart2}     color="bg-cyan-50 text-cyan-600"       to={null} loading={false}    />
            </div>

            {/* Charts Row 1 */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              {/* Bar: Employees by Department */}
              <ChartCard title="Workforce by Department" subtitle="Employee distribution across departments" loading={loading}>
                {deptData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={deptData} margin={{ top: 0, right: 10, left: -10, bottom: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} angle={-30} textAnchor="end" interval={0} />
                      <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" name="Employees" radius={[4, 4, 0, 0]}>
                        {deptData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-slate-400 text-sm py-12">No department data yet</p>
                )}
              </ChartCard>

              {/* Pie: Leave Status */}
              <ChartCard title="Leave Request Breakdown" subtitle="Status distribution of all leave requests" loading={loading}>
                {leaveData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={leaveData} cx="50%" cy="50%" outerRadius={80} innerRadius={45}
                        dataKey="count" nameKey="name" paddingAngle={3}
                      >
                        {leaveData.map((entry, i) => (
                          <Cell key={i} fill={leaveColorMap[entry.name] || COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        iconType="circle" iconSize={8}
                        formatter={(v) => <span className="text-[11px] font-semibold text-slate-600 capitalize">{v}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-slate-400 text-sm py-12">No leave data yet</p>
                )}
              </ChartCard>
            </div>

            {/* Charts Row 2 */}
            <div className="grid lg:grid-cols-3 gap-6 mb-6">
              {/* Line: Join Trend */}
              <div className="lg:col-span-2">
                <ChartCard title="New Hires Trend" subtitle="Employees joined in the last 6 months" loading={loading}>
                  {trendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
                        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                          type="monotone" dataKey="count" name="New Hires"
                          stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4, fill: '#2563eb' }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-slate-400 text-sm py-12">No recent hire data</p>
                  )}
                </ChartCard>
              </div>

              {/* Pie: Employee Status */}
              <ChartCard title="Employment Status" subtitle="Workforce status breakdown" loading={loading}>
                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={statusData} cx="50%" cy="45%" outerRadius={65} innerRadius={35}
                        dataKey="count" nameKey="name" paddingAngle={3}
                      >
                        {statusData.map((entry, i) => (
                          <Cell key={i} fill={statusColorMap[entry.name] || COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        iconType="circle" iconSize={7}
                        formatter={(v) => <span className="text-[10px] font-semibold text-slate-600 capitalize">{v?.replace(/_/g, ' ')}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-slate-400 text-sm py-12">No data</p>
                )}
              </ChartCard>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-900 rounded-xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                  <TrendingUp size={20} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Operations</p>
                  <p className="text-[15px] font-bold tracking-tight mt-0.5">Quick Access</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/employees"      className="px-4 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-[12px] font-bold text-white flex items-center gap-2 transition-all border border-white/10">
                  <Users size={14} /> Employees
                </Link>
                <Link to="/departments"    className="px-4 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-[12px] font-bold text-white flex items-center gap-2 transition-all border border-white/10">
                  <Building2 size={14} /> Departments
                </Link>
                <Link to="/leaves/approval" className="px-4 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-[12px] font-bold text-white flex items-center gap-2 transition-all border border-white/10">
                  <CalendarDays size={14} /> Leave Approvals
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/audit-logs" className="px-4 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-[12px] font-bold text-white flex items-center gap-2 transition-all">
                    <Activity size={14} /> Audit Logs
                  </Link>
                )}
              </div>
            </div>
          </>
        ) : (
          /* ── Employee view ── */
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-subtle">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <CalendarDays size={18} className="text-blue-600" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Personal Workspace</h2>
                </div>
                <p className="text-[14px] text-slate-500 mb-6">Manage your leave requests and view your profile.</p>
                <div className="flex flex-wrap gap-3">
                  <Link to="/leaves/apply" className="btn-primary px-5 h-9 gap-2"><CalendarDays size={14} /> Apply for Leave</Link>
                  <Link to="/leaves"       className="btn-secondary px-5 h-9 gap-2"><Activity size={14} /> My Leave History</Link>
                  <Link to="/profile"      className="btn-secondary px-5 h-9 gap-2"><Users size={14} /> My Profile</Link>
                </div>
              </div>
            </div>
            <div className="bg-slate-900 rounded-xl p-6 text-white">
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4">Security Level</p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
                  <Shield size={18} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-[14px] font-bold">{user?.role?.toUpperCase()}</p>
                  <p className="text-[11px] text-slate-400">Authenticated</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
