import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users, Plus, Search, Edit2, Trash2, Eye,
  ChevronLeft, ChevronRight, RefreshCw, AlertCircle, Download, FileText
} from 'lucide-react';
import * as XLSX from 'xlsx';
import AppLayout from '../../components/layout/AppLayout';
import employeeService from '../../services/employeeService';
import departmentService from '../../services/departmentService';

const statusBadge  = { active: 'badge-green', inactive: 'badge-red', on_leave: 'badge-yellow', terminated: 'badge-red' };
const statusLabel  = { active: 'Active', inactive: 'Inactive', on_leave: 'On Leave', terminated: 'Terminated' };
const roleBadge    = { admin: 'badge-purple', hr: 'badge-blue', employee: 'badge-green' };

const EmployeeListPage = () => {
  const navigate = useNavigate();
  const [data, setData]           = useState({ employees: [], total: 0, pages: 1 });
  const [departments, setDepts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [deleting, setDeleting]   = useState(null);

  const [searchParams] = useSearchParams();
  const initialDeptId = searchParams.get('departmentId') || '';

  const [search,   setSearch]     = useState('');
  const [status,   setStatus]     = useState('');
  const [role,     setRole]       = useState('');
  const [deptId,   setDeptId]     = useState(initialDeptId);
  const [page,     setPage]       = useState(1);
  const [sortBy,   setSortBy]     = useState('createdAt');
  const [order,    setOrder]      = useState('desc');

  // Load departments for filter dropdown
  useEffect(() => {
    departmentService.getAll({ limit: 100 })
      .then((r) => setDepts(r.departments || []))
      .catch(() => {});
  }, []);

  const fetchEmployees = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const result = await employeeService.getAll({
        search, status, role, departmentId: deptId,
        page, sortBy, order, limit: 10,
      });
      setData(result);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load employees');
    } finally { setLoading(false); }
  }, [search, status, role, deptId, page, sortBy, order]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);
  useEffect(() => { setPage(1); }, [search, status, role, deptId]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try { await employeeService.delete(id); fetchEmployees(); }
    catch (err) { setError(err.response?.data?.message || 'Delete failed'); }
    finally { setDeleting(null); }
  };

  const handleSort = (field) => {
    if (sortBy === field) setOrder((o) => o === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setOrder('asc'); }
  };

  // ── Export helpers ──
  const getExportData = () =>
    data.employees.map(emp => ({
      'Code':          emp.employeeCode,
      'Full Name':     emp.fullName,
      'Email':         emp.email,
      'Phone':         emp.phone || '',
      'Job Title':     emp.jobTitle || '',
      'Department':    emp.departmentId?.name || 'Unassigned',
      'Role':          emp.role,
      'Status':        emp.employmentStatus,
      'Joining Date':  emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : '',
      'Salary':        emp.salary || 0,
    }));

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(getExportData());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employees');
    XLSX.writeFile(wb, `SEMS_Employees_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const exportToCSV = () => {
    const rows = getExportData();
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(','),
      ...rows.map(r => headers.map(h => `"${String(r[h]).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `SEMS_Employees_${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const SortIcon = ({ field }) =>
    sortBy === field
      ? <span className="text-primary-400 ml-1">{order === 'asc' ? '↑' : '↓'}</span>
      : <span className="text-slate-700 ml-1">↕</span>;

  const cols = [
    { label: 'Code',    field: 'employeeCode' },
    { label: 'Name',    field: 'fullName'      },
    { label: 'Email',   field: 'email'         },
    { label: 'Title',   field: null            },
    { label: 'Dept',    field: null            },
    { label: 'Role',    field: null            },
    { label: 'Status',  field: null            },
    { label: 'Joined',  field: 'joiningDate'   },
    { label: 'Actions', field: null            },
  ];

  return (
    <AppLayout>
      <div className="px-8 py-10 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-8 border-b border-slate-100">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Personnel Directory</h1>
            <p className="page-subtitle">
              {data.total > 0 ? `Database contains ${data.total} active employee records.` : 'Search and filter organizational personnel.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
              <button onClick={exportToCSV} disabled={data.employees.length === 0}
                className="btn-secondary h-9 px-3 gap-2 text-[12px] disabled:opacity-40">
                <FileText size={14}/> CSV
              </button>
              <button onClick={exportToExcel} disabled={data.employees.length === 0}
                className="btn-secondary h-9 px-3 gap-2 text-[12px] disabled:opacity-40">
                <Download size={14}/> Excel
              </button>
              <Link to="/employees/add" className="btn-primary h-9 px-4">
                <Plus size={16}/> Add Personnel
              </Link>
            </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-700 rounded-md px-4 py-3 mb-8 text-[13px] font-medium">
            <AlertCircle size={16}/>{error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-subtle mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
            <div className="relative lg:col-span-1.5">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input
                type="text" placeholder="Search ID, name, or email…"
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="input pl-9 h-9"
              />
            </div>
            
            <select value={deptId} onChange={(e) => setDeptId(e.target.value)} className="input h-9 font-medium">
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>

            <select value={status} onChange={(e) => setStatus(e.target.value)} className="input h-9 font-medium">
              <option value="">All Statuses</option>
              {Object.entries(statusLabel).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>

            <select value={role} onChange={(e) => setRole(e.target.value)} className="input h-9 font-medium">
              <option value="">All Roles</option>
              <option value="admin">Administrator</option>
              <option value="hr">Human Resources</option>
              <option value="employee">Standard Staff</option>
            </select>

            <div className="flex justify-end">
              <button onClick={fetchEmployees} className="btn-secondary h-9 px-3">
                <RefreshCw size={14} className={loading ? 'animate-spin text-primary-600' : 'text-slate-500'}/>
              </button>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-subtle overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  {cols.map(({ label, field }) => (
                    <th
                      key={label}
                      onClick={() => field && handleSort(field)}
                      className={`px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest
                        ${field ? 'cursor-pointer hover:text-slate-900 select-none' : ''}`}
                    >
                      <div className="flex items-center gap-1">
                        {label}{field && <SortIcon field={field}/>}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={9} className="py-20 text-center">
                    <div className="w-8 h-8 border-3 border-primary-100 border-t-primary-600 rounded-full animate-spin mx-auto"/>
                    <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mt-4 italic">Querying Repository…</p>
                  </td></tr>
                ) : data.employees.length === 0 ? (
                  <tr><td colSpan={9} className="py-20 text-center">
                    <p className="text-slate-900 font-bold text-lg tracking-tight">No records found</p>
                    <p className="text-slate-500 text-[13px] mt-1">Adjust your parameters or initialize new personnel.</p>
                    <button onClick={() => { setSearch(''); setStatus(''); setRole(''); setDeptId(''); }} className="btn-ghost mt-4 text-primary-600 font-bold">Clear Filters</button>
                  </td></tr>
                ) : data.employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-4 py-3">
                      <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                        {emp.employeeCode}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 text-[13px] tracking-tight">{emp.fullName}</div>
                      {emp.phone && <div className="text-[11px] text-slate-500 mt-0.5">{emp.phone}</div>}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-[13px]">{emp.email}</td>
                    <td className="px-4 py-3 text-slate-600 text-[13px]">{emp.jobTitle || '—'}</td>
                    <td className="px-4 py-3">
                      {emp.departmentId?.name
                        ? <div className="inline-flex items-center gap-1.5 text-primary-700 font-bold text-[11px] px-2 py-0.5 bg-primary-50 rounded border border-primary-100/50">
                            {emp.departmentId.name}
                          </div>
                        : <span className="text-slate-400 font-medium italic text-xs">Unassigned</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={roleBadge[emp.role] || 'badge-blue'}>{emp.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={statusBadge[emp.employmentStatus] || 'badge-yellow'}>
                        {statusLabel[emp.employmentStatus] || emp.employmentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-medium text-[11px] tabular-nums">
                      {emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-150">
                        <button onClick={() => navigate(`/employees/${emp._id}`)} title="View"
                          className="p-1.5 rounded bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-300">
                          <Eye size={14}/>
                        </button>
                        <button onClick={() => navigate(`/employees/${emp._id}/edit`)} title="Edit"
                          className="p-1.5 rounded bg-white border border-slate-200 text-slate-400 hover:text-primary-600 hover:border-primary-200">
                          <Edit2 size={14}/>
                        </button>
                        <button onClick={() => handleDelete(emp._id, emp.fullName)} disabled={deleting === emp._id} title="Terminate"
                          className="p-1.5 rounded bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200">
                          {deleting === emp._id ? <RefreshCw size={14} className="animate-spin"/> : <Trash2 size={14}/>}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {!loading && data.total > 0 && (
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Records {Math.min(data.total, (page-1)*10+1)}–{Math.min(page*10, data.total)} / Total {data.total}
              </p>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Page {page} of {data.pages}</span>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setPage((p)=>Math.max(1,p-1))} disabled={page===1}
                    className="btn-secondary w-8 h-8 p-0 disabled:opacity-30"><ChevronLeft size={14}/></button>
                  <button onClick={() => setPage((p)=>Math.min(data.pages,p+1))} disabled={page===data.pages}
                    className="btn-secondary w-8 h-8 p-0 disabled:opacity-30"><ChevronRight size={14}/></button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default EmployeeListPage;
