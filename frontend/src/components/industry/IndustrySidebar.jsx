import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  Briefcase,
  Handshake,
  Award,
  IndianRupee,
  Cpu,
  Send,
  Bell,
  Building,
  ChevronRight
} from 'lucide-react';

const IndustrySidebar = ({ isOpen, onClose }) => {
  const navItems = [
    { label: 'Dashboard', path: '/industry', icon: LayoutDashboard, end: true },
    { label: 'Innovation Opportunities', path: '/industry/opportunities', icon: Compass },
    { label: 'Projects', path: '/industry/projects', icon: Briefcase },
    { label: 'Partnership Requests', path: '/industry/partnerships', icon: Handshake },
    { label: 'Mentorship', path: '/industry/mentorship', icon: Award },
    { label: 'Funding', path: '/industry/funding', icon: IndianRupee },
    { label: 'Prototyping', path: '/industry/prototyping', icon: Cpu },
    { label: 'Pilot Projects', path: '/industry/pilot-projects', icon: Send },
    { label: 'Notifications', path: '/industry/notifications', icon: Bell },
    { label: 'Profile', path: '/industry/profile', icon: Building }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 md:top-14 z-50 md:z-30 w-64 bg-white border-r border-gov-border h-screen md:h-[calc(100vh-3.5rem)] flex flex-col justify-between transition-transform duration-200 ease-in-out font-serif ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="py-4 overflow-y-auto">
          {/* Badge Header */}
          <div className="px-4 pb-3 mb-2 border-b border-gov-border">
            <div className="text-[10px] uppercase font-bold text-gov-maroon tracking-wider">
              Corporate Innovation Desk
            </div>
            <div className="text-xs font-bold text-gov-navy truncate">
              Delhi Industry Collaboration
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-0.5 px-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 text-xs rounded-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-gov-maroon text-white font-bold shadow-xs'
                      : 'text-gov-navy hover:bg-gov-sand-100 hover:text-gov-maroon'
                  }`
                }
              >
                <div className="flex items-center space-x-2.5">
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Help Desk */}
        <div className="p-4 border-t border-gov-border bg-gov-sand-50/70 text-[11px] text-gov-text-muted">
          <div className="font-bold text-gov-navy text-xs mb-0.5">Corporate Innovation Cell</div>
          <p className="leading-snug">
            Delhi State Innovation Council partnership desk for CSR grants, testbed access, and joint prototyping.
          </p>
        </div>
      </aside>
    </>
  );
};

export default IndustrySidebar;
