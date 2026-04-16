import { useState, useEffect, useCallback } from 'react';
import { Activity, RefreshCw, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import auditLogService from '../../services/auditLogService';

const MODULE_OPTIONS = ['', 'Auth', 'Employee', 'Department', 'Leave', 'Profile', 'System'];

const statusColorMap = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  failure: 'bg-red-50 text-red-600 border-red-200',
};

const moduleColorMap = {
  Employee:   'bg-blue-50 text-blue-700',
  Leave:      'bg-amber-50 text-amber-700',
  Auth:       'bg-violet-50 text-violet-700',
  Department: 'bg-cyan-50 text-cyan-700',
  Profile:    'bg-pink-50 text-pink-700',
  System:     'bg-slate-100 text-slate-600',
};

const fmtDate = (d) => {
  const dt = new Date(d);
  return dt.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const AuditLogPage = () => {
  const [logs, setLogs]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [pages, setPages]     = useState(1);
  const [module, setModule]   = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await auditLogService.getLogs({ page, limit: 20, module: module || undefined });
      setLogs(data.logs);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, module]);

  useEffect(() => { load(); }, [load]);

  const handleModuleChange = (e) => { setModule(e.target.value); setPage(1); };

  return (
    <AppLayout>
      <div className="px-8 py-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center">
                <Activity size={17} className="text-white" />
              </div>
              Audit Logs
            </h1>
            <p className="page-subtitle mt-1">System-wide action trail — {total.toLocaleString()} entries recorded.</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Module filter */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 h-9 shadow-subtle">
              <Filter size={13} className="text-slate-400" />
              <select
                value={module}
                onChange={handleModuleChange}
                className="text-[12px] font-semibold text-slate-700 bg-transparent outline-none cursor-pointer"
              >
                {MODULE_OPTIONS.map(m => (
                  <option key={m} value={m}>{m || 'All Modules'}</option>
                ))}
              </select>
            </div>
            <button
              onClick={load}
              className="flex items-center gap-1.5 h-9 px-3 bg-white border border-slate-200 rounded-lg text-[12px] font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-subtle"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-subtle overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-20">
              <Activity size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No audit logs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    {['Timestamp', 'User', 'Module', 'Action', 'Description', 'Status'].map(h => (
                      <th key={h} className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3 text-[11px] text-slate-500 font-mono whitespace-nowrap">
                        {fmtDate(log.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        {log.userId ? (
                          <div>
                            <p className="text-[12px] font-bold text-slate-800">{log.userId.fullName}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{log.userId.role}</p>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">System</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${moduleColorMap[log.module] || 'bg-slate-100 text-slate-500'}`}>
                          {log.module}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-slate-600 max-w-xs truncate">
                        {log.description || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColorMap[log.status]}`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/40">
              <p className="text-[11px] text-slate-500 font-medium">
                Page {page} of {pages} &mdash; {total.toLocaleString()} total entries
              </p>
              <div className="flex items-center gap-1">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-40 transition-all"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  disabled={page >= pages}
                  onClick={() => setPage(p => p + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-40 transition-all"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default AuditLogPage;
