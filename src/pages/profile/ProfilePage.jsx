import React, { useEffect, useState, useRef } from 'react';
import api from '../../services/api';
import { 
  User, Mail, Phone, MapPin, Briefcase, Calendar, 
  Camera, Loader2, CheckCircle2, AlertCircle, Edit2, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AppLayout from '../../components/layout/AppLayout';

const ProfilePage = () => {
  const { user } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // Assuming we have a /api/employees/profile/me endpoint
      const resp = await api.get('/employees/profile/me');
      if (resp.data.success) {
        setEmployee(resp.data.employee);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Basic size check (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setStatus({ type: 'error', message: 'Image size should be less than 2MB' });
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    setUploading(true);
    setStatus({ type: '', message: '' });

    try {
      const resp = await api.patch(`/employees/${employee._id}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (resp.data.success) {
        setEmployee({ ...employee, profilePhoto: resp.data.profilePhoto });
        setStatus({ type: 'success', message: 'Photo updated successfully!' });
      }
    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.message || 'Failed to upload photo' 
      });
    } finally {
      setUploading(false);
    }
  };

  const InfoCard = ({ icon: Icon, label, value, subValue }) => (
    <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all duration-200 group">
      <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-400 group-hover:text-primary-600 group-hover:border-primary-100 transition-colors">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-[14px] font-bold text-slate-900 mt-0.5 truncate tracking-tight">{value || 'Not provided'}</p>
        {subValue && <p className="text-[11px] text-slate-500 font-medium italic mt-0.5">{subValue}</p>}
      </div>
    </div>
  );

  if (loading) {
    return (
      <AppLayout>
        <div className="p-8 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="animate-spin text-primary-600" size={32} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left: Avatar & Basic Info */}
          <div className="w-full md:w-80 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 text-center space-y-4">
              <div className="relative inline-block group">
                <div className="w-32 h-32 rounded-2xl bg-slate-100 border-2 border-slate-50 shadow-inner overflow-hidden flex items-center justify-center relative ring-4 ring-white">
                  {employee?.profilePhoto ? (
                    <img 
                      src={employee.profilePhoto} 
                      alt={employee.fullName} 
                      className={`w-full h-full object-cover transition-opacity duration-300 ${uploading ? 'opacity-40' : 'opacity-100'}`} 
                    />
                  ) : (
                    <User size={48} className="text-slate-300" />
                  )}
                  
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="animate-spin text-primary-600 shadow-sm" size={24} />
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-2 -right-2 p-2 bg-slate-900 text-white rounded-lg shadow-lg hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
                  aria-label="Change photo"
                >
                  <Camera size={14} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePhotoUpload} 
                  className="hidden" 
                  accept="image/*"
                />
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{employee?.fullName}</h2>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{employee?.employeeCode}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="text-[11px] font-bold text-primary-600 uppercase tracking-widest">{employee?.jobTitle || 'No Title'}</span>
                </div>
              </div>

              {status.message && (
                <div className={`mt-4 p-3 rounded-lg flex items-start gap-2 border text-[12px] font-medium leading-tight ${
                  status.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'
                }`}>
                  {status.type === 'success' ? <CheckCircle2 size={14} className="shrink-0 mt-0.5" /> : <AlertCircle size={14} className="shrink-0 mt-0.5" />}
                  <p>{status.message}</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Leave Balance</p>
              <div className="space-y-3">
                {employee?.leaveBalance && Object.entries(employee.leaveBalance).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-slate-50/50">
                    <span className="text-[12px] font-bold text-slate-600 capitalize tracking-tight">{key.replace('Leave', '')}</span>
                    <span className="text-[12px] font-bold text-slate-900 tabular-nums">{val} <span className="text-[10px] text-slate-400">days</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Detailed Info */}
          <div className="flex-1 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase size={20} className="text-primary-600" />
                  Personal Information
                </h3>
                <button className="text-[12px] font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1.5 transition-colors">
                  <Edit2 size={12} /> Edit Profile
                </button>
              </div>
              
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard icon={Mail} label="Email Address" value={employee?.email} subValue="Work Email" />
                <InfoCard icon={Phone} label="Phone Number" value={employee?.phone} subValue="Mobile Number" />
                <InfoCard icon={Calendar} label="Date of Birth" value={employee?.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : 'N/A'} />
                <InfoCard icon={Calendar} label="Joining Date" value={new Date(employee?.joiningDate).toLocaleDateString()} subValue="Company Start Date" />
                <InfoCard icon={Briefcase} label="Department" value={employee?.departmentId?.name} subValue={employee?.departmentId?.status === 'active' ? 'Verified' : 'Pending'} />
                <InfoCard icon={MapPin} label="Office Location" value={employee?.address?.city + ', ' + employee?.address?.country} />
              </div>
            </div>

            <div className="bg-emerald-50/30 rounded-2xl border border-emerald-100 p-8 flex items-center justify-between gap-6 shadow-sm">
              <div className="space-y-1">
                <p className="text-lg font-bold text-emerald-900 tracking-tight">Enterprise Security</p>
                <p className="text-sm text-emerald-700/70 font-medium italic">Your account is protected with role-based access control.</p>
              </div>
              <ShieldAlert className="text-emerald-400" size={40} />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
