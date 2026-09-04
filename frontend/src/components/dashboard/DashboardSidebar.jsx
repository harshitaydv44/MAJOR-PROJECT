import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  FolderKanban,
  Bookmark,
  Bell,
  User,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/client', icon: LayoutDashboard, end: true },
  { label: 'Submit a Challenge', path: '/client/submit', icon: PlusCircle },
  { label: 'My Challenges', path: '/client/challenges', icon: FolderKanban },
  { label: 'Saved Challenges', path: '/client/saved', icon: Bookmark },
  { label: 'Notifications', path: '/client/notifications', icon: Bell },
  { label: 'Profile', path: '/client/profile', icon: User },
  { label: 'Help & Support', path: '/client/help', icon: HelpCircle }
];

const DashboardSidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gov-border flex flex-col justify-between transition-transform duration-200 ease-in-out font-serif ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Navigation Links */}
        <div className="p-4 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-[11px] font-bold text-gov-navy uppercase tracking-wider">
            Citizen Workspace
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 text-xs rounded-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-gov-maroon text-white font-semibold shadow-xs'
                        : 'text-gov-text-secondary hover:bg-gov-sand-100 hover:text-gov-navy'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Public Service Helpline Box */}
        <div className="p-4 border-t border-gov-border bg-gov-sand-50/50">
          <div className="p-3 bg-white border border-gov-border rounded-xs text-[11px]">
            <div className="font-bold text-gov-navy">Delhi Civic Toll-Free</div>
            <div className="text-gov-maroon font-mono font-semibold mt-0.5">1800-11-DELHI</div>
            <p className="text-gov-text-muted text-[10px] mt-1 leading-snug">
              Call 011-23379000 for emergency infrastructure grievance escalation.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
