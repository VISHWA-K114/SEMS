import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Clock, CheckCircle2, XCircle, AlertCircle, MoreHorizontal } from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import AccessControl from '../../components/common/AccessControl';

const StatusBadge = ({ status }) => {
  const styles = {
    pending:  'bg-amber-50 text-amber-700 border-amber-100',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    rejected: 'bg-rose-50 text-rose-700 border-rose-100',
    cancelled:'bg-slate-50 text-slate-600 border-slate-100',
  };
  const Icons = {
    pending:  Clock,
    approved: CheckCircle2,
    rejected: XCircle,
    cancelled: AlertCircle,
  };
  const Icon = Icons[status] || Clock;
  
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-widest ${styles[status]}`}>
      <Icon size={12} />
      {status}
    </span>
  );
};

const LeaveHistoryPage = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const resp = await api.get('/leaves/my');
      if (resp.data.success) {
        setLeaves(resp.data.leaves);
      }
    } catch (err) {
      console.error('Error fetching leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <AppLayout>
      <div className="p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Leave Management</h1>
            <p className="text-sm text-slate-500 font-medium">View your leave history and track application status</p>
          </div>
          <div className="flex gap-3">
            <AccessControl roles={['admin', 'hr']}>
              <button
                onClick={() => navigate('/leaves/approval')}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
              >
                Approval Dashboard
              </button>
            </AccessControl>
            <AccessControl roles={['employee', 'hr']}>
              <button
                onClick={() => navigate('/leaves/apply')}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm"
              >
                <Plus size={16} /> Apply for Leave
              </button>
            </AccessControl>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Duration</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Applied On</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Reviewer Comment</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="h-4 bg-slate-100 rounded w-full" />
                      </td>
                    </tr>
                  ))
                ) : leaves.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Calendar size={32} className="text-slate-300" />
                        <p className="text-sm font-bold text-slate-400">No leave requests found</p>
                        <AccessControl roles={['employee', 'hr']}>
                          <button 
                            onClick={() => navigate('/leaves/apply')}
                            className="mt-2 text-primary-600 text-xs font-bold hover:underline"
                          >
                            Apply for your first leave
                          </button>
                        </AccessControl>
                      </div>
                    </td>
                  </tr>
                ) : (
                  leaves.map((leave) => (
                    <tr key={leave._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="text-[13px] font-bold text-slate-900 capitalize tracking-tight">
                          {leave.leaveType.replace('Leave', ' Leave')}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate max-w-[150px] font-medium mt-0.5">{leave.reason}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-[12px] font-bold text-slate-700">{formatDate(leave.startDate)}</span>
                          <span className="text-[10px] text-slate-400 font-medium">to {formatDate(leave.endDate)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[12px] font-medium text-slate-500 italic">
                        {formatDate(leave.appliedAt)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={leave.status} />
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[11px] text-slate-500 font-medium italic max-w-[200px] truncate">
                          {leave.reviewComment || '—'}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-all">
                          <MoreHorizontal size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default LeaveHistoryPage;
