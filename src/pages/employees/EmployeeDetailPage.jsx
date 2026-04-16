import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit2, Trash2, User, Mail, Phone, Briefcase,
  Calendar, MapPin, DollarSign, AlertCircle, Loader2, Building2,
  Shield, RefreshCw
} from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import employeeService from '../../services/employeeService';
import { useAuth } from '../../context/AuthContext';

const statusBadge = { active: 'badge-green', inactive: 'badge-red', on_leave: 'badge-yellow', terminated: 'badge-red' };
const statusLabel  = { active: 'Active', inactive: 'Inactive', on_leave: 'On Leave', terminated: 'Terminated' };
const roleBadge    = { admin: 'badge-purple', hr: 'badge-blue', employee: 'badge-green' };

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0 group">
    <div className="w-8 h-8 rounded bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100/50">
      <Icon size={14} className="text-slate-400 group-hover:text-primary-600 transition-colors"/>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-[13px] font-medium text-slate-900 truncate leading-relaxed">{value || <span className="text-slate-300 italic">Not Specified</span>}</p>
    </div>
  </div>
);

const EmployeeDetailPage = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    employeeService.getById(id)
      .then(({ employee: emp }) => setEmployee(emp))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load employee'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${employee.fullName}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await employeeService.delete(id);
      navigate('/employees');
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
      setDeleting(false);
    }
  };

  const canEdit   = ['admin', 'hr'].includes(user?.role);
  const canDelete = user?.role === 'admin';

  if (loading) return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-8 h-8 border-3 border-primary-100 border-t-primary-600 rounded-full animate-spin mb-4"/>
        <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest italic">Accessing Record…</p>
      </div>
    </AppLayout>
  );

  if (error) return (
    <AppLayout>
      <div className="flex items-center justify-center h-96 text-center">
        <div className="max-w-md p-8 bg-white border border-slate-200 rounded-lg shadow-subtle">
          <AlertCircle size={40} className="text-red-500 mx-auto mb-4"/>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Record Error</h2>
          <p className="text-[13px] text-slate-500 font-medium mb-8 leading-relaxed">{error}</p>
          <button onClick={() => navigate('/employees')} className="btn-primary w-full h-10">
            <ArrowLeft size={16}/> Back to Directory
          </button>
        </div>
      </div>
    </AppLayout>
  );

  const fullAddress = [
    employee.address?.street, employee.address?.city,
    employee.address?.state, employee.address?.country,
    employee.address?.zipCode,
  ].filter(Boolean).join(', ');

  return (
    <AppLayout>
      <div className="px-8 py-10 max-w-6xl mx-auto">
        {/* Navigation & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/employees')} className="btn-secondary w-9 h-9 p-0 flex items-center justify-center">
              <ArrowLeft size={16}/>
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Personnel Profile</h1>
              <p className="page-subtitle">File ID: {employee.employeeCode}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {canEdit && (
              <Link to={`/employees/${id}/edit`} className="btn-secondary h-9 px-4">
                <Edit2 size={14}/> Edit
              </Link>
            )}
            {canDelete && (
              <button onClick={handleDelete} disabled={deleting} className="btn-danger h-9 px-4 bg-white">
                {deleting
                  ? <RefreshCw size={14} className="animate-spin"/>
                  : <><Trash2 size={14}/> Terminate</>}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-subtle text-center">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 rounded bg-slate-50 border border-slate-200 p-1">
                  <div className="w-full h-full rounded border border-slate-100 flex items-center justify-center overflow-hidden bg-white">
                    {employee.profilePhoto
                      ? <img src={employee.profilePhoto} alt="" className="w-full h-full object-cover"/>
                      : <User size={40} className="text-slate-200"/>}
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white p-0.5 border border-slate-200 shadow-sm">
                  <div className={`w-full h-full rounded-full ${
                    employee.employmentStatus === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                  }`} />
                </div>
              </div>

              <h2 className="text-lg font-bold text-slate-900 tracking-tight">{employee.fullName}</h2>
              <p className="text-[13px] font-semibold text-slate-500 mt-0.5">{employee.jobTitle || 'Executive Staff'}</p>
              
              <div className="flex flex-wrap justify-center gap-2 mt-5">
                <span className={statusBadge[employee.employmentStatus] || 'badge-blue'}>
                  {statusLabel[employee.employmentStatus]}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-50 text-slate-500 border border-slate-200/50">
                  {employee.role}
                </span>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-around text-center">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Employee ID</p>
                  <p className="font-mono text-slate-900 font-bold mt-1 text-sm">{employee.employeeCode}</p>
                </div>
                <div className="w-px h-8 bg-slate-50" />
                {employee.departmentId && (
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Unit</p>
                    <p className="font-bold text-primary-600 mt-1 text-[13px] flex items-center gap-1.5">
                       {employee.departmentId.name}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Details Sections */}
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-subtle">
                <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                   Contact Information
                </h3>
                <div className="space-y-0.5">
                  <InfoRow icon={Mail}  label="Email Address"   value={employee.email}/>
                  <InfoRow icon={Phone} label="Contact Number"   value={employee.phone}/>
                  <InfoRow icon={MapPin} label="Residential Address" value={fullAddress}/>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-subtle">
                <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                   Employment Details
                </h3>
                <div className="space-y-0.5">
                  <InfoRow icon={Calendar}   label="Date Hired"  value={employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString('en-US',{dateStyle:'medium'}) : null}/>
                  <InfoRow icon={DollarSign} label="Base Salary"   value={employee.salary ? `₹${employee.salary.toLocaleString('en-IN')}` : null}/>
                  <InfoRow icon={User}  label="Gender Reference"  value={employee.gender?.replace(/_/g,' ')}/>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-subtle">
               <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                 Audit & Compliance Metadata
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                 <div className="space-y-0.5">
                   <InfoRow icon={Calendar} label="System Enrollment" value={new Date(employee.createdAt).toLocaleString()}/>
                   <InfoRow icon={RefreshCw} label="Last Updated" value={new Date(employee.updatedAt).toLocaleString()}/>
                 </div>
                 <div className="space-y-0.5">
                   <InfoRow icon={User} label="Registrar" value={employee.createdBy?.fullName || 'System Automated'}/>
                   <InfoRow icon={Calendar} label="Birth Record" value={employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString('en-US',{dateStyle:'medium'}) : null}/>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default EmployeeDetailPage;
