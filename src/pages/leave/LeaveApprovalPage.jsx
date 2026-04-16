import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, XCircle, Clock, Search, Filter, 
  ArrowLeft, LayoutGrid, List, MessageSquare, ShieldAlert 
} from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';

const StatusBadge = ({ status }) => {
  const styles = {
    pending:  'bg-amber-50 text-amber-700 border-amber-100',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    rejected: 'bg-rose-50 text-rose-700 border-rose-100',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-widest ${styles[status]}`}>
      {status}
    </span>
  );
};

const LeaveApprovalPage = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [reviewData, setReviewData] = useState({ id: null, comment: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaves();
  }, [activeTab]);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const resp = await api.get(`/leaves?status=${activeTab}`);
      if (resp.data.success) {
        setLeaves(resp.data.leaves);
      }
    } catch (err) {
      console.error('Error fetching leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    if (!reviewData.comment && status === 'rejected') {
      alert('Please provide a reason for rejection');
      return;
    }

    setActionLoading(true);
    try {
      const resp = await api.patch(`/leaves/${id}/status`, {
        status,
        reviewComment: reviewData.comment
      });
      if (resp.data.success) {
        setLeaves(leaves.filter(l => l._id !== id));
        setReviewData({ id: null, comment: '' });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
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
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate('/leaves')}
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-900 shadow-sm transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Leave Approvals</h1>
            <p className="text-sm text-slate-500 font-medium italic">Review and manage company-wide leave requests</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-fit mb-6 border border-slate-200/50">
          {['pending', 'approved', 'rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-widest transition-all ${
                activeTab === tab 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Employee</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Type & Duration</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Reason</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Applied On</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-8"><div className="h-4 bg-slate-100 rounded w-full" /></td>
                    </tr>
                  ))
                ) : leaves.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm font-bold">
                      No {activeTab} leave requests found
                    </td>
                  </tr>
                ) : (
                  leaves.map((leave) => (
                    <tr key={leave._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-6 font-bold">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-[11px] text-primary-600 shadow-inner">
                            {leave.employeeId?.fullName?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-[13px] text-slate-900 truncate max-w-[150px]">{leave.employeeId?.fullName}</p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest">{leave.employeeId?.employeeCode || 'EMP-???'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="space-y-1">
                          <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-bold uppercase tracking-tighter">
                            {leave.leaveType.replace('Leave', '')}
                          </span>
                          <p className="text-[12px] font-bold text-slate-600">{formatDate(leave.startDate)} <span className="text-slate-300 mx-1">→</span> {formatDate(leave.endDate)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-start gap-2 max-w-[250px]">
                          <MessageSquare size={12} className="text-slate-300 mt-1 shrink-0" />
                          <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic line-clamp-2">"{leave.reason}"</p>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-[12px] text-slate-500 font-medium">{formatDate(leave.appliedAt)}</td>
                      <td className="px-6 py-6 text-right">
                        {activeTab === 'pending' ? (
                          <div className="flex flex-col gap-3">
                            <input
                              type="text"
                              placeholder="Add a comment..."
                              className="text-[11px] px-3 py-1.5 border border-slate-200 rounded focus:border-primary-500 focus:outline-none bg-slate-50/50 w-full mb-1"
                              onChange={(e) => setReviewData({ id: leave._id, comment: e.target.value })}
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleAction(leave._id, 'rejected')}
                                className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded text-[11px] font-bold hover:bg-rose-100 transition-all flex items-center gap-1 border border-rose-100/50"
                              >
                                <XCircle size={14} /> Reject
                              </button>
                              <button
                                onClick={() => handleAction(leave._id, 'approved')}
                                className="px-3 py-1.5 bg-emerald-600 text-white rounded text-[11px] font-bold hover:bg-emerald-700 transition-all flex items-center gap-1 shadow-sm"
                              >
                                <CheckCircle2 size={14} /> Approve
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end">
                             <StatusBadge status={leave.status} />
                             {leave.reviewComment && (
                               <p className="text-[10px] text-slate-400 mt-2 font-medium italic italic">"{leave.reviewComment}"</p>
                             )}
                          </div>
                        )}
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

export default LeaveApprovalPage;
