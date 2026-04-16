import { useState, useEffect, useCallback } from 'react';
import { Building2, Plus, Edit2, Trash2, Search, RefreshCw, AlertCircle, CheckCircle2, X, Users } from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import departmentService from '../../services/departmentService';
import { useAuth } from '../../context/AuthContext';

const statusBadge = { active: 'badge-green', inactive: 'badge-red' };

// ── Modal ────────────────────────────────────────────────────────────────────
// ── Modal ────────────────────────────────────────────────────────────────────
const DeptModal = ({ dept, onClose, onSaved }) => {
  const [form, setForm]   = useState({ 
    name: dept?.name || '', 
    description: dept?.description || '', 
    status: dept?.status || 'active',
    staffCount: dept?.staffCount || 0
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isEdit = !!dept;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required'); return; }
    setLoading(true);
    try {
      if (isEdit) await departmentService.update(dept._id, form);
      else        await departmentService.create(form);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save department');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center px-4 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-lg w-full max-w-md shadow-xl animate-slide-up overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">{isEdit ? 'Modify Unit' : 'New Department'}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-50 text-slate-400">
            <X size={16}/>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 text-red-700 rounded-md px-3 py-2 text-[13px] font-medium">
              <AlertCircle size={14}/>{error}
            </div>
          )}
          <div className="space-y-1.5">
            <label className="label">Department Name *</label>
            <input
              type="text" placeholder="e.g. Strategic Engineering" value={form.name}
              onChange={(e) => { setForm((p)=>({...p,name:e.target.value})); setError(''); }}
              className="input h-9 text-[13px]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="label">Purpose / Description</label>
            <textarea
              rows={3} placeholder="Describe the unit's core function…" value={form.description}
              onChange={(e) => setForm((p)=>({...p,description:e.target.value}))}
              className="input resize-none py-2 text-[13px]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="label">Status</label>
            <select value={form.status} onChange={(e) => setForm((p)=>({...p,status:e.target.value}))} className="input h-9 text-[13px] font-medium">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="label">Sample Staff Count</label>
            <input
              type="number" 
              min="0"
              placeholder="e.g. 15" 
              value={form.staffCount}
              onChange={(e) => setForm((p)=>({...p,staffCount:e.target.value}))}
              className="input h-9 text-[13px]"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-50">
            <button type="button" onClick={onClose} className="btn-secondary h-9 px-4">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary h-9 px-4">
              {loading 
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> 
                : isEdit ? 'Update' : 'Create Unit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main Page ────────────────────────────────────────────────────────────────
const DepartmentsPage = () => {
  const { user }              = useAuth();
  const isAdmin               = user?.role === 'admin';
  const [data, setData]       = useState({ departments: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [toast, setToast]     = useState('');
  const [search, setSearch]   = useState('');
  const [modal, setModal]     = useState(null); // null | 'add' | dept object
  const [deleting, setDeleting] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetch = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const result = await departmentService.getAll({ search });
      setData(result);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load departments');
    } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleDelete = async (dept) => {
    if (!window.confirm(`Delete "${dept.name}"?\n${dept.employeeCount} employee(s) will be unassigned.`)) return;
    setDeleting(dept._id);
    try {
      await departmentService.delete(dept._id);
      showToast('Unit successfully removed');
      fetch();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete operation failed');
    } finally { setDeleting(null); }
  };

  const handleSaved = () => { setModal(null); showToast('Unit updated successfully'); fetch(); };

  return (
    <AppLayout>
      {modal && (
        <DeptModal
          dept={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}

      <div className="px-8 py-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-slate-100">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Organization Structure</h1>
            <p className="page-subtitle">Manage business units and departmental hierarchy.</p>
          </div>
          {isAdmin && (
            <button onClick={() => setModal('add')} className="btn-primary h-9 px-4">
              <Plus size={16}/> Form New Unit
            </button>
          )}
        </div>

        {/* Status Messages */}
        {toast && (
          <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-md px-4 py-3 mb-8 text-[13px] font-bold animate-fade-in">
            <CheckCircle2 size={16}/>{toast}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 text-red-700 rounded-md px-4 py-3 mb-8 text-[13px] font-medium">
            <AlertCircle size={16}/>{error}
          </div>
        )}

        {/* Search & Statistics */}
        <div className="grid lg:grid-cols-12 gap-6 items-center mb-8">
          <div className="lg:col-span-8">
            <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-subtle flex items-center gap-3">
              <Search size={16} className="text-slate-400 ml-1"/>
              <input
                type="text" placeholder="Filter business units…" value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input border-none bg-transparent focus:ring-0 text-slate-900 font-medium placeholder:text-slate-400 p-0 text-[13px]"
              />
              <div className="h-4 w-px bg-slate-100 mx-1" />
              <button onClick={fetch} className="p-1.5 rounded-md hover:bg-slate-50 text-slate-500 transition-colors">
                <RefreshCw size={14} className={loading ? 'animate-spin text-primary-600' : ''}/>
              </button>
            </div>
          </div>
          <div className="lg:col-span-4 grid grid-cols-2 gap-3">
            <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-subtle flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-slate-50 flex items-center justify-center text-slate-400">
                <Building2 size={16}/>
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900 leading-none">{data.total}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Units</p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-subtle flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-slate-50 flex items-center justify-center text-slate-400">
                <Users size={16}/>
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900 leading-none">
                  {data.departments.reduce((s, d) => s + (d.employeeCount || 0) + (d.staffCount || 0), 0)}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Staff</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-primary-100 border-t-primary-600 rounded-full animate-spin mb-4"/>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest italic">Querying Structure…</p>
          </div>
        ) : data.departments.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg text-center py-16 shadow-subtle">
            <Building2 size={32} className="text-slate-100 mx-auto mb-4"/>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No Departments</h3>
            <p className="text-[13px] text-slate-500 font-medium mb-8 max-w-xs mx-auto">No results matching the current criteria. Establish a new organizational unit.</p>
            {isAdmin && (
              <button onClick={() => setModal('add')} className="btn-primary h-9 px-6">
                New Unit
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.departments.map((dept) => (
              <div key={dept._id} className="bg-white border border-slate-200 rounded-lg p-5 shadow-subtle group hover:border-slate-300 transition-all flex flex-col h-full min-h-[180px]">
                {/* Actions */}
                {isAdmin && (
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setModal(dept)}
                      className="p-1.5 rounded bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-300"
                      title="Edit"
                    >
                      <Edit2 size={12}/>
                    </button>
                    <button
                      onClick={() => handleDelete(dept)}
                      disabled={deleting === dept._id}
                      className="p-1.5 rounded bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200"
                      title="Delete"
                    >
                      {deleting === dept._id
                        ? <RefreshCw size={12} className="animate-spin text-red-500"/>
                        : <Trash2 size={12}/>}
                    </button>
                  </div>
                )}

                {/* Body */}
                <div className="flex-1 pr-12 relative">
                  <div className="w-9 h-9 rounded bg-primary-50 flex items-center justify-center mb-4 border border-primary-100/50">
                    <Building2 size={16} className="text-primary-600"/>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base tracking-tight mb-2 truncate">{dept.name}</h3>
                  {dept.description && <p className="text-[12px] font-medium text-slate-500 line-clamp-2 leading-relaxed mb-4">{dept.description}</p>}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
                  <span className={statusBadge[dept.status] || 'badge-gray'}>{dept.status}</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate(`/employees?departmentId=${dept._id}`)}
                      className="text-[10px] font-bold text-primary-600 uppercase tracking-widest hover:underline"
                    >
                      View Staff
                    </button>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <Users size={12} className="text-slate-300"/> {(dept.employeeCount || 0) + (dept.staffCount || 0)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default DepartmentsPage;
