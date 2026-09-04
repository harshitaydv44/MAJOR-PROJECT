import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { challengeService } from '../services/challengeService';
import { Lightbulb, Code2, Users, Award, UploadCloud, CheckCircle, FileText, CheckCircle2 } from 'lucide-react';

const StudentDashboardPage = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittedMessage, setSubmittedMessage] = useState('');

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const res = await challengeService.getChallenges();
      if (res.data?.challenges) {
        setChallenges(res.data.challenges);
      }
    } catch (err) {
      console.error('Failed to load student projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const activeProject = challenges.find((c) => c.status === 'in_progress') || challenges[0];

  const handleUpdateSprint = () => {
    const note = prompt('Enter sprint progress update (e.g. Completed telemetry board bench test with 99% packet success):');
    if (!note) return;
    setSubmittedMessage('Sprint deliverable logged successfully! Faculty mentor has been notified.');
    setTimeout(() => setSubmittedMessage(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-sm flex items-start space-x-3">
        <Lightbulb className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
        <div className="text-xs font-serif">
          <strong className="text-amber-900 font-bold">Student Innovator Workspace: </strong>
          Develop practical engineering and societal solutions for verified Delhi problems. Collaborate with multidisciplinary teammates, receive faculty mentorship, and submit prototypes for state innovation awards.
        </div>
      </div>

      {submittedMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-serif rounded-sm flex items-center">
          <CheckCircle2 className="w-4 h-4 mr-2" />
          {submittedMessage}
        </div>
      )}

      {/* Student Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card accent="gold" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-serif text-gov-text-secondary uppercase">Assigned Challenge</div>
              <div className="text-sm font-serif font-bold text-gov-navy mt-1 truncate max-w-[160px]">
                {activeProject ? activeProject.title : 'Loading...'}
              </div>
            </div>
            <div className="w-10 h-10 rounded-sm bg-amber-50 text-amber-700 flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card accent="none" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-serif text-gov-text-secondary uppercase">Team Size</div>
              <div className="text-2xl font-serif font-bold text-gov-navy mt-1">4 Cohort Members</div>
            </div>
            <div className="w-10 h-10 rounded-sm bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card accent="none" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-serif text-gov-text-secondary uppercase">Milestones Completed</div>
              <div className="text-2xl font-serif font-bold text-emerald-700 mt-1">
                {activeProject?.milestones?.filter((m) => m.completed).length || 2} / {activeProject?.milestones?.length || 4}
              </div>
            </div>
            <div className="w-10 h-10 rounded-sm bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card accent="none" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-serif text-gov-text-secondary uppercase">State Innovation Credits</div>
              <div className="text-2xl font-serif font-bold text-gov-maroon mt-1">150 pts</div>
            </div>
            <div className="w-10 h-10 rounded-sm bg-gov-maroon-surface text-gov-maroon flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Active Solution Development Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {activeProject && (
            <Card
              accent="gold"
              title={`Active Project: ${activeProject.title}`}
              subtitle={`District: ${activeProject.district} &bull; Category: ${activeProject.category}`}
              headerAction={
                <Button variant="primary" size="sm" onClick={handleUpdateSprint} icon={UploadCloud}>
                  Submit Sprint Deliverable
                </Button>
              }
            >
              <div className="space-y-4 text-xs font-serif">
                <p className="text-gov-text-secondary leading-relaxed">
                  {activeProject.description}
                </p>

                <div className="border border-gov-border rounded-sm p-4 bg-gov-sand-50">
                  <h5 className="font-bold text-gov-navy mb-2">Sprint Milestones & Ground Deliverables:</h5>
                  <ul className="space-y-2">
                    {activeProject.milestones && activeProject.milestones.length > 0 ? (
                      activeProject.milestones.map((m, idx) => (
                        <li key={idx} className={`flex items-center ${m.completed ? 'text-emerald-800' : 'text-gov-navy'}`}>
                          {m.completed ? (
                            <CheckCircle className="w-4 h-4 mr-2 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <span className="w-4 h-4 rounded-full border border-gov-navy flex items-center justify-center mr-2 text-[10px] flex-shrink-0">
                              {idx + 1}
                            </span>
                          )}
                          <span>{m.title}</span>
                          {m.completed && <span className="ml-2 text-[10px] text-emerald-600 font-bold">(Completed)</span>}
                        </li>
                      ))
                    ) : (
                      <li className="text-gov-text-muted">No custom milestones configured.</li>
                    )}
                  </ul>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gov-border">
                  <span className="text-gov-text-muted">
                    Faculty Advisor: <strong>{activeProject.facultyLead?.name || 'Prof. Anil Kumar, DTU'}</strong>
                  </span>
                  <Badge variant="gold">
                    {activeProject.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div>
          <Card title="Student Team Cohort" accent="none">
            <div className="space-y-3 text-xs font-serif">
              <div className="p-2.5 border border-gov-border rounded-sm bg-white">
                <div className="font-bold text-gov-navy">Aarav Malhotra (Team Lead)</div>
                <div className="text-gov-text-muted">ECE, 4th Year &bull; IoT & Embedded Hardware</div>
              </div>
              <div className="p-2.5 border border-gov-border rounded-sm bg-white">
                <div className="font-bold text-gov-navy">Priya Sharma</div>
                <div className="text-gov-text-muted">Environmental Biotechnology &bull; Field Sampling</div>
              </div>
              <div className="p-2.5 border border-gov-border rounded-sm bg-white">
                <div className="font-bold text-gov-navy">Karan Varma</div>
                <div className="text-gov-text-muted">Computer Science &bull; Cloud Dashboard & Telemetry</div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gov-border">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => alert('Code repository link: https://github.com/delhi-innovation/iot-monitoring-prototype')}
                icon={FileText}
              >
                Access Team Git Repository
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardPage;
