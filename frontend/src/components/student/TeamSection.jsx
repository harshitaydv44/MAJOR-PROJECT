import React, { useState } from 'react';
import { projectService } from '../../services/projectService';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import {
  Users2,
  UserPlus,
  Crown,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  X,
  Send,
  Briefcase,
  GraduationCap,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

const TeamSection = ({ project, user, onProjectUpdate }) => {
  const team = project?.team;
  const members = team?.members || [];

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modals
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'Research',
    responsibility: ''
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [editForm, setEditForm] = useState({
    role: '',
    responsibility: ''
  });

  // Current user student resolution
  const currentEmail = user?.email?.toLowerCase();
  const currentMember = members.find(
    (m) => m.student?.email && m.student.email.toLowerCase() === currentEmail
  );

  // Check if current user is Team Lead
  const isTeamLead =
    currentMember?.role === 'Team Lead' ||
    (members.length > 0 && members[0].student?.email?.toLowerCase() === currentEmail) ||
    user?.role === 'UNIVERSITY' ||
    user?.role === 'ADMIN';

  // Check if current user has a pending invitation to this team
  const pendingInvite = members.find(
    (m) =>
      m.student?.email &&
      m.student.email.toLowerCase() === currentEmail &&
      m.status === 'INVITED'
  );

  // 1. Send Invitation
  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteForm.email.trim()) return;

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await projectService.inviteTeamMember(team._id, {
        email: inviteForm.email.trim().toLowerCase(),
        role: inviteForm.role,
        responsibility: inviteForm.responsibility.trim()
      });

      setSuccessMsg(`Team collaboration invitation sent to ${inviteForm.email}!`);
      setShowInviteModal(false);
      setInviteForm({ email: '', role: 'Research', responsibility: '' });
      if (onProjectUpdate) await onProjectUpdate();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to send team invitation');
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Respond to Invitation (Accept/Reject)
  const handleRespondInvite = async (action) => {
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await projectService.respondTeamInvite(team._id, { action });
      setSuccessMsg(res.message || `Invitation ${action.toLowerCase()}ed successfully!`);
      if (onProjectUpdate) await onProjectUpdate();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to respond to invitation');
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Open Edit Responsibility Modal
  const openEditModal = (member) => {
    setEditingMember(member);
    setEditForm({
      role: member.role || 'Research',
      responsibility: member.responsibility || ''
    });
    setShowEditModal(true);
  };

  // 4. Save Responsibility & Role Updates
  const handleUpdateMember = async (e) => {
    e.preventDefault();
    if (!editingMember) return;

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await projectService.updateTeamMember(team._id, editingMember._id, {
        role: editForm.role,
        responsibility: editForm.responsibility.trim()
      });

      setSuccessMsg('Team member scope and responsibilities updated!');
      setShowEditModal(false);
      setEditingMember(null);
      if (onProjectUpdate) await onProjectUpdate();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to update member');
    } finally {
      setSubmitting(false);
    }
  };

  // 5. Remove Member
  const handleRemoveMember = async (memberId, memberName) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await projectService.removeTeamMember(team._id, memberId);
      setSuccessMsg(`Removed ${memberName} from team roster.`);
      if (onProjectUpdate) await onProjectUpdate();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to remove member');
    }
  };

  const leadMember = members.find((m) => m.role === 'Team Lead') || (members.length > 0 ? members[0] : null);

  return (
    <div className="space-y-6 max-w-5xl font-serif">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 border border-gov-border rounded-xs shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <Users2 className="w-5 h-5 text-gov-maroon" />
            <h3 className="text-base font-bold text-gov-navy">
              {team?.name || 'Multidisciplinary Student Cohort'}
            </h3>
            {leadMember && (
              <span className="text-[11px] text-gray-500 font-sans">
                (Led by: <strong className="text-gov-navy">{leadMember.student?.name}</strong>)
              </span>
            )}
          </div>
          <p className="text-xs text-gov-text-secondary mt-0.5">
            Institution: <strong>{project?.universityId?.name || 'Designated University'}</strong> &bull; Roster Size: <strong>{members.length} Member(s)</strong>
          </p>
        </div>

        {isTeamLead && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowInviteModal(true)}
            icon={UserPlus}
            className="bg-gov-maroon text-white"
          >
            Invite Student Innovator
          </Button>
        )}
      </div>

      {/* Success / Error Banners */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 text-xs rounded-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Pending Invitation Notification Banner for Current Student */}
      {pendingInvite && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1 text-amber-950">
            <div className="flex items-center space-x-2 font-bold text-amber-900">
              <Clock className="w-4 h-4 text-amber-800" />
              <span>Pending Team Invitation</span>
            </div>
            <p>
              You have been invited to join <strong>{team?.name}</strong> as <strong>{pendingInvite.role}</strong>.
              {pendingInvite.responsibility && (
                <span> Scope: <em>"{pendingInvite.responsibility}"</em></span>
              )}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="subtle"
              size="sm"
              onClick={() => handleRespondInvite('REJECT')}
              disabled={submitting}
              className="text-rose-700 hover:bg-rose-50 border border-rose-200"
            >
              Decline
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleRespondInvite('ACCEPT')}
              disabled={submitting}
              className="bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              Accept Invitation &rarr;
            </Button>
          </div>
        </div>
      )}

      {/* Members Grid from Real MongoDB Data */}
      {members.length === 0 ? (
        <Card accent="none" className="py-12 text-center text-xs text-gov-text-muted space-y-2">
          <Users2 className="w-8 h-8 text-gov-maroon mx-auto" />
          <p className="font-bold text-gov-navy text-sm">No Team Members Registered</p>
          <p className="max-w-md mx-auto">
            Team roster is empty. The Team Lead or University Lead can invite multidisciplinary student innovators.
          </p>
          {isTeamLead && (
            <Button variant="outline" size="sm" onClick={() => setShowInviteModal(true)} icon={UserPlus}>
              Invite First Member
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {members.map((m, idx) => {
            const isUserSelf = m.student?.email && m.student.email.toLowerCase() === currentEmail;
            const isLead = m.role === 'Team Lead' || (idx === 0 && !members.some((x) => x.role === 'Team Lead'));
            const isInvited = m.status === 'INVITED';

            return (
              <Card
                key={m._id || idx}
                accent={isLead ? 'gold' : isUserSelf ? 'maroon' : 'navy'}
                className={`p-4 space-y-3 transition-all ${
                  isInvited ? 'bg-amber-50/20 border-dashed border-amber-300' : 'bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1.5 flex-wrap">
                      <span className="font-bold text-gov-navy text-sm">
                        {m.student?.name || 'Student Innovator'}
                      </span>
                      {isUserSelf && (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-gov-maroon text-white">
                          You
                        </span>
                      )}
                      {isLead && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center space-x-1">
                          <Crown className="w-3 h-3 text-amber-700" />
                          <span>Team Lead</span>
                        </span>
                      )}
                      {isInvited && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                          Pending Invite
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-gov-text-secondary">
                      {m.student?.department || 'Department of Technology'} &bull; {m.student?.year || 'Student'}
                    </div>

                    <div className="text-[10px] text-gray-400 font-mono">
                      {m.student?.email}
                    </div>
                  </div>

                  <Badge variant={isLead ? 'gold' : 'navy'}>{m.role}</Badge>
                </div>

                {/* Assigned Responsibilities */}
                <div className="space-y-1 pt-2 border-t border-gov-border">
                  <span className="text-[10px] uppercase font-bold text-gov-navy block">
                    Assigned Responsibility & Scope
                  </span>
                  <p className="text-[11px] text-gov-text-secondary bg-gov-sand-50 p-2 rounded-xs border border-gov-border leading-relaxed">
                    {m.responsibility || (isLead ? 'Overall technical coordination, milestone delivery, and council submissions.' : 'Subsystem research, testing protocols, and deliverable documentation.')}
                  </p>
                </div>

                {/* Member Skills */}
                {m.student?.skills && m.student.skills.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-500 block">Skills & Expertise:</span>
                    <div className="flex flex-wrap gap-1">
                      {m.student.skills.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="bg-white text-gov-navy border border-gov-border px-1.5 py-0.5 rounded-xs text-[10px] font-mono"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer: Joined date & Lead actions */}
                <div className="pt-2 border-t border-gov-border flex flex-wrap items-center justify-between gap-2 text-[10px] text-gov-text-muted">
                  <span>
                    Joined: <strong>{m.joinedAt ? new Date(m.joinedAt).toLocaleDateString('en-IN') : 'Active Member'}</strong>
                  </span>

                  {(isTeamLead || isUserSelf) && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openEditModal(m)}
                        className="text-gov-maroon font-bold hover:underline flex items-center space-x-1"
                        title="Edit scope and responsibility"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit Scope</span>
                      </button>

                      {isTeamLead && !isLead && (
                        <button
                          onClick={() => handleRemoveMember(m._id, m.student?.name || 'member')}
                          className="text-rose-600 font-bold hover:underline flex items-center space-x-1 ml-1"
                          title="Remove from team roster"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Governance Advisory */}
      <div className="p-3 bg-gov-sand-50 border border-gov-border rounded-xs text-[11px] text-gov-text-secondary flex items-start space-x-2">
        <ShieldAlert className="w-4 h-4 text-gov-maroon flex-shrink-0 mt-0.5" />
        <div>
          <strong>Team Governance Protocol:</strong> Multidisciplinary team roles and responsibilities are formally recorded in MongoDB. Team Leads and University Coordinators hold authority to invite specialist students, update scopes, and oversee sprint deliverables.
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* Modal 1: Invite Student Innovator */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gov-border rounded-sm max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gov-border pb-3">
              <h3 className="font-bold text-gov-navy text-lg flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-gov-maroon" />
                <span>Invite Student Innovator</span>
              </h3>
              <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Student Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="e.g. priyanshi@dtu.ac.in or student email"
                  className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 outline-none focus:ring-1 focus:ring-gov-navy"
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">
                  Must match a registered student account in Samadhan Setu Portal.
                </span>
              </div>

              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Assigned Project Role
                </label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 bg-white outline-none"
                >
                  <option value="Hardware">Hardware & Sensors</option>
                  <option value="AI/ML">AI / Machine Learning</option>
                  <option value="Backend">Backend & Telemetry</option>
                  <option value="Frontend">Frontend & GIS Dashboard</option>
                  <option value="Research">Academic Research</option>
                  <option value="Testing">Testing & Field Calibration</option>
                  <option value="Documentation">Documentation & Compliance</option>
                  <option value="Team Lead">Co-Team Lead</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Scope & Specific Responsibilities *
                </label>
                <textarea
                  rows={3}
                  required
                  value={inviteForm.responsibility}
                  onChange={(e) => setInviteForm({ ...inviteForm, responsibility: e.target.value })}
                  placeholder="Detail the technical tasks, component delivery, and sprint scope expected from this student..."
                  className="w-full font-serif border border-gov-border rounded-xs p-2 outline-none focus:ring-1 focus:ring-gov-navy"
                />
              </div>

              <div className="pt-3 border-t border-gov-border flex items-center justify-end space-x-2">
                <Button variant="ghost" size="sm" onClick={() => setShowInviteModal(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={submitting} className="bg-gov-maroon text-white">
                  {submitting ? 'Sending Invitation...' : 'Send Team Invitation'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Scope & Responsibility */}
      {showEditModal && editingMember && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gov-border rounded-sm max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gov-border pb-3">
              <h3 className="font-bold text-gov-navy text-lg flex items-center space-x-2">
                <Edit2 className="w-5 h-5 text-gov-maroon" />
                <span>Edit Scope & Responsibility</span>
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateMember} className="space-y-3 text-xs">
              <div className="p-3 bg-gov-sand-50 rounded-xs border border-gov-border">
                <span className="font-bold text-gov-navy block text-sm">{editingMember.student?.name}</span>
                <span className="text-[11px] text-gray-500">{editingMember.student?.department}</span>
              </div>

              {isTeamLead && (
                <div>
                  <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                    Role Designation
                  </label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 bg-white outline-none"
                  >
                    <option value="Team Lead">Team Lead</option>
                    <option value="Hardware">Hardware & Sensors</option>
                    <option value="AI/ML">AI / Machine Learning</option>
                    <option value="Backend">Backend & Telemetry</option>
                    <option value="Frontend">Frontend & GIS Dashboard</option>
                    <option value="Research">Academic Research</option>
                    <option value="Testing">Testing & Field Calibration</option>
                    <option value="Documentation">Documentation & Compliance</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Technical Responsibility & Scope *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editForm.responsibility}
                  onChange={(e) => setEditForm({ ...editForm, responsibility: e.target.value })}
                  placeholder="Detail the technical tasks, subsystems, and milestones assigned..."
                  className="w-full font-serif border border-gov-border rounded-xs p-2 outline-none focus:ring-1 focus:ring-gov-navy"
                />
              </div>

              <div className="pt-3 border-t border-gov-border flex items-center justify-end space-x-2">
                <Button variant="ghost" size="sm" onClick={() => setShowEditModal(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={submitting} className="bg-gov-maroon text-white">
                  {submitting ? 'Saving...' : 'Save Scope'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamSection;
