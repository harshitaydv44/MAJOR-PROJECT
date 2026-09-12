import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import studentService from '../../services/studentService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingState from '../../components/common/LoadingState';
import {
  User,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  Award,
  Lock,
  Camera,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Save,
  Plus,
  X,
  ShieldCheck,
  IdCard,
  BookOpen
} from 'lucide-react';

const ACADEMIC_YEARS = [
  '1st Year B.Tech',
  '2nd Year B.Tech',
  '3rd Year B.Tech',
  '4th Year B.Tech',
  '1st Year M.Tech / M.Sc',
  '2nd Year M.Tech / M.Sc',
  'Ph.D. Scholar'
];

const StudentProfilePage = () => {
  const { user: authUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Multi-tag state
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [expertise, setExpertise] = useState([]);
  const [newExpertise, setNewExpertise] = useState('');
  const [areasOfInterest, setAreasOfInterest] = useState([]);
  const [newArea, setNewArea] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isDirty }
  } = useForm({
    defaultValues: {
      name: '',
      phone: '',
      studentId: '',
      course: '',
      year: '3rd Year B.Tech',
      department: '',
      bio: ''
    }
  });

  const fetchProfile = async () => {
    try {
      setErrorMsg('');
      const res = await studentService.getProfile();
      if (res?.data?.profile) {
        const p = res.data.profile;
        setProfile(p);
        setValue('name', p.name || '');
        setValue('phone', p.phone || '');
        setValue('studentId', p.studentId || '');
        setValue('course', p.course || 'B.Tech');
        setValue('year', p.year || '3rd Year B.Tech');
        setValue('department', p.department || 'Computer Science & Engineering');
        setValue('bio', p.bio || '');

        setSkills(p.skills || []);
        setExpertise(p.expertise || []);
        setAreasOfInterest(p.areasOfInterest || []);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load profile details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Tag helpers
  const addTag = (list, setList, value, setValueInput) => {
    const trimmed = value.trim();
    if (trimmed && !list.includes(trimmed)) {
      setList([...list, trimmed]);
      setValueInput('');
    }
  };

  const removeTag = (list, setList, index) => {
    setList(list.filter((_, i) => i !== index));
  };

  // Profile Image Upload
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size must be less than 5MB.');
      return;
    }

    setUploadingImage(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await studentService.uploadProfileImage(formData);
      if (res?.data?.profileImage) {
        setProfile((prev) => ({ ...prev, profileImage: res.data.profileImage }));
        if (updateUser) {
          updateUser({ profileImage: res.data.profileImage });
        }
        setSuccessMsg('Profile picture updated successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to upload profile image.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Form Submission
  const onSubmit = async (data) => {
    setErrorMsg('');
    setSuccessMsg('');

    const payload = {
      name: data.name.trim(),
      phone: data.phone.trim(),
      studentId: data.studentId.trim(),
      course: data.course.trim(),
      year: data.year,
      department: data.department.trim(),
      bio: data.bio.trim(),
      skills,
      expertise,
      areasOfInterest
    };

    try {
      const res = await studentService.updateProfile(payload);
      if (res?.data) {
        setSuccessMsg('Student profile changes saved successfully to MongoDB!');
        if (updateUser && res.data.user) {
          updateUser(res.data.user);
        }
        fetchProfile();
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update student profile.');
    }
  };

  if (loading) {
    return <LoadingState message="Loading authenticated student profile & credentials..." />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-serif pb-16">
      {/* 1. Page Header Card with Profile Avatar & Badges */}
      <div className="bg-white border border-gov-border rounded-xs p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          {/* Profile Image & Uploader */}
          <div className="relative group flex-shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gov-sand-100 border-2 border-gov-border flex items-center justify-center text-gov-navy text-2xl font-bold shadow-2xs">
              {profile?.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{(profile?.name || 'S').charAt(0).toUpperCase()}</span>
              )}
            </div>

            <label
              htmlFor="profile-image-input"
              className="absolute bottom-0 right-0 bg-gov-maroon text-white p-2 rounded-full cursor-pointer hover:bg-gov-maroon/90 shadow-xs transition-transform hover:scale-105"
              title="Upload new profile picture"
            >
              <Camera className="w-4 h-4" />
              <input
                id="profile-image-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={uploadingImage}
                className="hidden"
              />
            </label>
          </div>

          {/* User Details & Institutional Affiliation */}
          <div className="flex-1 text-center sm:text-left space-y-1.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-xl font-bold text-gov-navy">{profile?.name || 'Student Innovator'}</h1>
                <p className="text-xs text-gov-text-secondary">
                  {profile?.course} &bull; {profile?.department}
                </p>
              </div>

              <div className="flex items-center justify-center sm:justify-end space-x-2">
                <span className="inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Institutional Innovator</span>
                </span>
                <Badge variant="navy">STUDENT</Badge>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-y-1 gap-x-4 text-xs text-gov-text-muted pt-1">
              <span className="flex items-center space-x-1">
                <Building2 className="w-3.5 h-3.5 text-gov-maroon" />
                <span>{profile?.university?.name || 'Delhi Technological University'}</span>
              </span>

              {profile?.studentId && (
                <span className="flex items-center space-x-1">
                  <IdCard className="w-3.5 h-3.5 text-gray-500" />
                  <span>ID: <strong>{profile.studentId}</strong></span>
                </span>
              )}

              <span className="flex items-center space-x-1">
                <GraduationCap className="w-3.5 h-3.5 text-gray-500" />
                <span>{profile?.year || '3rd Year'}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {uploadingImage && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-xs flex items-center space-x-2 animate-pulse">
          <Camera className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span>Uploading and optimizing image via Cloudinary...</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2. Main Profile Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Security / Protected Identifiers */}
        <div className="bg-gov-sand-50 border border-gov-border rounded-xs p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-gov-border pb-2">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-gov-maroon" />
              <h3 className="font-bold text-gov-navy text-xs uppercase tracking-wider">
                Protected Institutional Identifiers
              </h3>
            </div>
            <span className="text-[11px] text-gov-text-muted font-sans">
              Immutable by student for security & compliance
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Email Address */}
            <div className="p-3 bg-white border border-gov-border rounded-xs space-y-1">
              <span className="text-gov-text-muted text-[10px] uppercase font-bold block flex items-center justify-between">
                <span>Institutional Email</span>
                <Lock className="w-3 h-3 text-gray-400" />
              </span>
              <span className="font-mono font-semibold text-gov-navy text-xs truncate block">
                {profile?.email}
              </span>
              <span className="text-[10px] text-gray-400 block">
                Official institutional login credential
              </span>
            </div>

            {/* Stakeholder Role */}
            <div className="p-3 bg-white border border-gov-border rounded-xs space-y-1">
              <span className="text-gov-text-muted text-[10px] uppercase font-bold block flex items-center justify-between">
                <span>Stakeholder Role</span>
                <Lock className="w-3 h-3 text-gray-400" />
              </span>
              <span className="font-bold text-gov-maroon text-xs block">
                STUDENT INNOVATOR
              </span>
              <span className="text-[10px] text-gray-400 block">
                Role-based access control protected
              </span>
            </div>

            {/* University Verification */}
            <div className="p-3 bg-white border border-gov-border rounded-xs space-y-1">
              <span className="text-gov-text-muted text-[10px] uppercase font-bold block flex items-center justify-between">
                <span>Institution Verified</span>
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
              </span>
              <span className="font-semibold text-gov-navy text-xs truncate block">
                {profile?.university?.name || 'DTU Delhi'}
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold block">
                District: {profile?.university?.district || 'Shahdara'}
              </span>
            </div>
          </div>
        </div>

        {/* Editable Personal & Academic Information */}
        <Card accent="none" title="Personal & Academic Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="font-semibold text-gov-navy block">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register('name', { required: 'Full name is required' })}
                className="w-full p-2.5 border border-gov-border rounded-xs outline-none focus:ring-1 focus:ring-gov-navy bg-white"
                placeholder="Student Full Name"
              />
              {errors.name && (
                <p className="text-[11px] text-rose-600">{errors.name.message}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label className="font-semibold text-gov-navy block">
                Contact Phone Number
              </label>
              <input
                type="text"
                {...register('phone', {
                  pattern: {
                    value: /^[0-9+ -]{7,15}$/,
                    message: 'Please enter a valid phone number'
                  }
                })}
                className="w-full p-2.5 border border-gov-border rounded-xs outline-none focus:ring-1 focus:ring-gov-navy bg-white font-mono"
                placeholder="+91 98765 43210"
              />
              {errors.phone && (
                <p className="text-[11px] text-rose-600">{errors.phone.message}</p>
              )}
            </div>

            {/* Student ID */}
            <div className="space-y-1">
              <label className="font-semibold text-gov-navy block">
                Student ID / Enrolment Roll No.
              </label>
              <input
                type="text"
                {...register('studentId')}
                className="w-full p-2.5 border border-gov-border rounded-xs outline-none focus:ring-1 focus:ring-gov-navy bg-white font-mono"
                placeholder="e.g. 2K21/CO/245"
              />
            </div>

            {/* Course / Degree */}
            <div className="space-y-1">
              <label className="font-semibold text-gov-navy block">
                Degree Program / Course
              </label>
              <input
                type="text"
                {...register('course')}
                className="w-full p-2.5 border border-gov-border rounded-xs outline-none focus:ring-1 focus:ring-gov-navy bg-white"
                placeholder="e.g. B.Tech Computer Science & Engineering"
              />
            </div>

            {/* Academic Year */}
            <div className="space-y-1">
              <label className="font-semibold text-gov-navy block">
                Academic Year
              </label>
              <select
                {...register('year')}
                className="w-full p-2.5 border border-gov-border rounded-xs outline-none focus:ring-1 focus:ring-gov-navy bg-white"
              >
                {ACADEMIC_YEARS.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div className="space-y-1">
              <label className="font-semibold text-gov-navy block">
                Department / Faculty Division <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register('department', { required: 'Department is required' })}
                className="w-full p-2.5 border border-gov-border rounded-xs outline-none focus:ring-1 focus:ring-gov-navy bg-white"
                placeholder="e.g. Department of Electrical & Computer Engineering"
              />
              {errors.department && (
                <p className="text-[11px] text-rose-600">{errors.department.message}</p>
              )}
            </div>

            {/* Bio */}
            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-gov-navy block">
                Innovator Bio & Research Profile
              </label>
              <textarea
                rows={3}
                {...register('bio')}
                className="w-full p-2.5 border border-gov-border rounded-xs outline-none focus:ring-1 focus:ring-gov-navy bg-white"
                placeholder="Describe your innovation focus, engineering background, prototype experience, and societal problem-solving interests..."
              />
            </div>
          </div>
        </Card>

        {/* 3. Skills, Expertise & Areas of Interest */}
        <Card accent="none" title="Competencies & Technical Domain Focus">
          <div className="space-y-6 text-xs">
            {/* Skills */}
            <div className="space-y-2">
              <label className="font-bold text-gov-navy uppercase text-[11px] block">
                Technical Skills & Tools
              </label>
              <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-gov-sand-50 border border-gov-border rounded-xs">
                {skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 bg-white border border-gov-border text-gov-navy rounded-xs text-xs font-semibold shadow-2xs"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(skills, setSkills, idx)}
                      className="text-gray-400 hover:text-rose-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {skills.length === 0 && (
                  <span className="text-gray-400 italic text-xs py-1">No skills added yet.</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag(skills, setSkills, newSkill, setNewSkill);
                    }
                  }}
                  placeholder="Type skill (e.g. Embedded C, LoRaWAN, React, ROS) and press Add"
                  className="flex-1 p-2 border border-gov-border rounded-xs outline-none focus:ring-1 focus:ring-gov-navy bg-white text-xs"
                />
                <button
                  type="button"
                  onClick={() => addTag(skills, setSkills, newSkill, setNewSkill)}
                  className="px-3 py-2 bg-gov-sand-100 hover:bg-gov-sand-200 border border-gov-border text-gov-navy rounded-xs text-xs font-semibold flex items-center space-x-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Skill</span>
                </button>
              </div>
            </div>

            {/* Expertise */}
            <div className="space-y-2">
              <label className="font-bold text-gov-navy uppercase text-[11px] block">
                Engineering Expertise & Specializations
              </label>
              <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-gov-sand-50 border border-gov-border rounded-xs">
                {expertise.map((e, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-900 rounded-xs text-xs font-semibold shadow-2xs"
                  >
                    <span>{e}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(expertise, setExpertise, idx)}
                      className="text-blue-400 hover:text-rose-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {expertise.length === 0 && (
                  <span className="text-gray-400 italic text-xs py-1">No expertise domains added yet.</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newExpertise}
                  onChange={(e) => setNewExpertise(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag(expertise, setExpertise, newExpertise, setNewExpertise);
                    }
                  }}
                  placeholder="Type engineering expertise (e.g. Signal Processing, Firmware, CAD Design)"
                  className="flex-1 p-2 border border-gov-border rounded-xs outline-none focus:ring-1 focus:ring-gov-navy bg-white text-xs"
                />
                <button
                  type="button"
                  onClick={() => addTag(expertise, setExpertise, newExpertise, setNewExpertise)}
                  className="px-3 py-2 bg-gov-sand-100 hover:bg-gov-sand-200 border border-gov-border text-gov-navy rounded-xs text-xs font-semibold flex items-center space-x-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Expertise</span>
                </button>
              </div>
            </div>

            {/* Areas of Interest */}
            <div className="space-y-2">
              <label className="font-bold text-gov-navy uppercase text-[11px] block">
                Societal Innovation Areas of Interest
              </label>
              <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-gov-sand-50 border border-gov-border rounded-xs">
                {areasOfInterest.map((a, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-xs text-xs font-semibold shadow-2xs"
                  >
                    <span>{a}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(areasOfInterest, setAreasOfInterest, idx)}
                      className="text-amber-500 hover:text-rose-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {areasOfInterest.length === 0 && (
                  <span className="text-gray-400 italic text-xs py-1">No innovation focus areas added yet.</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newArea}
                  onChange={(e) => setNewArea(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag(areasOfInterest, setAreasOfInterest, newArea, setNewArea);
                    }
                  }}
                  placeholder="Type focus area (e.g. Water Treatment, Air Pollution Monitoring, Waste Segregation)"
                  className="flex-1 p-2 border border-gov-border rounded-xs outline-none focus:ring-1 focus:ring-gov-navy bg-white text-xs"
                />
                <button
                  type="button"
                  onClick={() => addTag(areasOfInterest, setAreasOfInterest, newArea, setNewArea)}
                  className="px-3 py-2 bg-gov-sand-100 hover:bg-gov-sand-200 border border-gov-border text-gov-navy rounded-xs text-xs font-semibold flex items-center space-x-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Area</span>
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Submit Bar */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center space-x-2 px-6 py-2.5 bg-gov-maroon text-white text-xs font-bold rounded-xs hover:bg-gov-maroon/90 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving to Database...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentProfilePage;
