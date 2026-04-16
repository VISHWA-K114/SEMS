import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import employeeService from '../../services/employeeService';
import departmentService from '../../services/departmentService';

const Field = ({ label, error, children }) => (
  <div>
    <label className="label">{label}</label>
    {children}
    {error && <p className="error-text">{error}</p>}
  </div>
);

const EditEmployeePage = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [form, setForm]         = useState(null);
  const [departments, setDepts] = useState([]);
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    Promise.all([
      employeeService.getById(id),
      departmentService.getAll({ limit: 100, status: 'active' }),
    ]).then(([empRes, deptRes]) => {
      const emp = empRes.employee;
      setDepts(deptRes.departments || []);
      setForm({
        fullName:         emp.fullName || '',
        email:            emp.email    || '',
        phone:            emp.phone    || '',
        gender:           emp.gender   || 'prefer_not_to_say',
        dateOfBirth:      emp.dateOfBirth  ? emp.dateOfBirth.split('T')[0]  : '',
        departmentId:     emp.departmentId?._id || emp.departmentId || '',
        jobTitle:         emp.jobTitle         || '',
        role:             emp.role             || 'employee',
        joiningDate:      emp.joiningDate ? emp.joiningDate.split('T')[0] : '',
        employmentStatus: emp.employmentStatus || 'active',
        salary:           emp.salary ?? '',
        address: {
          street:  emp.address?.street  || '',
          city:    emp.address?.city    || '',
          state:   emp.address?.state   || '',
          country: emp.address?.country || '',
          zipCode: emp.address?.zipCode || '',
        },
      });
    }).catch(() => setApiError('Failed to load data'))
      .finally(() => setFetching(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const key = name.split('.')[1];
      setForm((p) => ({ ...p, address: { ...p.address, [key]: value } }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
    setErrors((p) => ({ ...p, [name]: '' }));
    setApiError('');
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.email.trim())    e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }
    setLoading(true);
    try {
      await employeeService.update(id, {
        ...form,
        salary: form.salary ? parseFloat(form.salary) : 0,
        departmentId: form.departmentId || null,
      });
      setSuccess('Updated! Redirecting…');
      setTimeout(() => navigate(`/employees/${id}`), 1200);
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        const fe = {};
        data.errors.forEach(({ field, message }) => { fe[field] = message; });
        setErrors(fe);
      }
      setApiError(data?.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <AppLayout>
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="text-primary-500 animate-spin"/>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="px-8 py-10 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-10 pb-8 border-b border-slate-100">
          <button onClick={() => navigate(`/employees/${id}`)} className="btn-secondary w-9 h-9 p-0 flex items-center justify-center">
            <ArrowLeft size={16}/>
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Modify Record</h1>
            <p className="page-subtitle">Updating administrative data for internal personnel file.</p>
          </div>
        </div>

        {apiError && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-700 rounded-md px-4 py-3 mb-8 text-[13px] font-medium">
            <AlertCircle size={16} className="shrink-0"/>{apiError}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-md px-4 py-3 mb-8 text-[13px] font-medium">
            <CheckCircle2 size={16} className="shrink-0"/>{success}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-8 pb-12">
          {/* Personal */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-subtle overflow-hidden">
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
              <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Personal Identification</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <Field label="Full Legal Name *" error={errors.fullName}>
                <input name="fullName" type="text" placeholder="Name" value={form.fullName} onChange={handleChange} className="input h-9 text-[13px]"/>
              </Field>
              <Field label="Work Email *" error={errors.email}>
                <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="input h-9 text-[13px]"/>
              </Field>
              <Field label="Contact Number">
                <input name="phone" type="tel" placeholder="Phone" value={form.phone} onChange={handleChange} className="input h-9 text-[13px]"/>
              </Field>
              <Field label="Gender Identity">
                <select name="gender" value={form.gender} onChange={handleChange} className="input h-9 text-[13px] font-medium">
                  <option value="prefer_not_to_say">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </Field>
              <Field label="Date of Birth">
                <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} className="input h-9 text-[13px] font-medium"/>
              </Field>
            </div>
          </div>

          {/* Employment */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-subtle overflow-hidden">
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
              <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Employment Contract</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <Field label="Business Unit">
                <select name="departmentId" value={form.departmentId} onChange={handleChange} className="input h-9 text-[13px] font-medium">
                  <option value="">Unassigned</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Corporate Title">
                <input name="jobTitle" type="text" placeholder="Title" value={form.jobTitle} onChange={handleChange} className="input h-9 text-[13px]"/>
              </Field>
              <Field label="Access Level">
                <select name="role" value={form.role} onChange={handleChange} className="input h-9 text-[13px] font-medium">
                  <option value="employee">Staff</option>
                  <option value="hr">HR Admin</option>
                  <option value="admin">System Admin</option>
                </select>
              </Field>
              <Field label="Joining Date">
                <input name="joiningDate" type="date" value={form.joiningDate} onChange={handleChange} className="input h-9 text-[13px] font-medium"/>
              </Field>
              <Field label="Contract Status">
                <select name="employmentStatus" value={form.employmentStatus} onChange={handleChange} className="input h-9 text-[13px] font-medium">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                  <option value="terminated">Terminated</option>
                </select>
              </Field>
              <Field label="Annual Fixed (₹)">
                <input name="salary" type="number" min="0" placeholder="0.00" value={form.salary} onChange={handleChange} className="input h-9 text-[13px] font-bold"/>
              </Field>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-subtle overflow-hidden">
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
              <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Mailing & Residence</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <div className="sm:col-span-2">
                <Field label="Street Address"><input name="address.street" type="text" placeholder="Street" value={form.address.street} onChange={handleChange} className="input h-9 text-[13px]"/></Field>
              </div>
              <Field label="City"><input name="address.city"    type="text" placeholder="City"       value={form.address.city}    onChange={handleChange} className="input h-9 text-[13px]"/></Field>
              <Field label="State / Province"><input name="address.state"  type="text" placeholder="State"  value={form.address.state}   onChange={handleChange} className="input h-9 text-[13px]"/></Field>
              <Field label="Country"><input name="address.country" type="text" placeholder="Country"    value={form.address.country} onChange={handleChange} className="input h-9 text-[13px]"/></Field>
              <Field label="Postal Code"><input name="address.zipCode" type="text" placeholder="Code"       value={form.address.zipCode} onChange={handleChange} className="input h-9 text-[13px]"/></Field>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <button type="button" onClick={() => navigate(`/employees/${id}`)} className="btn-secondary h-9 px-6">Discard Changes</button>
            <button type="submit" disabled={loading} className="btn-primary h-9 px-6">
              {loading
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                : <><Save size={16}/> Save Updates</>}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};

export default EditEmployeePage;
