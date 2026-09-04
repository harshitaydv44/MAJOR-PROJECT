import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PORTAL_TITLE, GOVT_NAME } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';
import NotificationDropdown from '../common/NotificationDropdown';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { Bell, LogOut, Menu, X, Building2, Factory, Briefcase } from 'lucide-react';

const IndustryHeader = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifs = async () => {
    try {
      const res = await notificationService.getMyNotifications();
      setNotifications(res.data?.notifications || []);
      setUnreadCount(res.data?.unreadCount || 0);
    } catch (err) {
      console.warn('Notification service unreachable');
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gov-border sticky top-0 z-40 shadow-xs font-serif">
      {/* Top NCT of Delhi Banner */}
      <div className="bg-gov-navy text-white text-[11px] py-1 px-4 sm:px-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          <span>{GOVT_NAME} &bull; Corporate Innovation & CSR Collaboration Directorate</span>
        </div>
        <div className="text-gray-300">
          NCT of Delhi
        </div>
      </div>

      {/* Main Header Container */}
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="md:hidden p-2 text-gov-navy hover:bg-gov-sand-100 rounded-sm border border-gov-border"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/industry" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-sm bg-gov-maroon flex items-center justify-center text-white border border-amber-600">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-gov-maroon text-sm sm:text-base leading-tight">
                {PORTAL_TITLE}
              </div>
              <div className="text-[10px] text-gov-navy font-semibold flex items-center space-x-1.5">
                <span>Industry & Startup Innovation Exchange</span>
                <span>&bull;</span>
                <span className="text-gov-maroon">CSR & Corporate Lab Portal</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Right: Notifications, Corporate Pill, Logout */}
        <div className="flex items-center space-x-3">
          {/* Notifications Dropdown */}
          <NotificationDropdown />

          {/* Industry Profile Pill */}
          <Link
            to="/industry/profile"
            className="flex items-center space-x-2 p-1.5 rounded-sm hover:bg-gov-sand-50 transition-colors border border-transparent hover:border-gov-border"
          >
            <div className="w-7 h-7 rounded-sm bg-gov-navy text-white flex items-center justify-center font-bold text-xs border border-gov-border">
              <Factory className="w-3.5 h-3.5" />
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-gov-navy leading-tight truncate max-w-[160px]">
                {user?.organization || user?.name || 'Tata Power DDL'}
              </div>
              <div className="text-[10px] text-gov-maroon font-semibold">
                INDUSTRY PARTNER
              </div>
            </div>
          </Link>

          {/* Logout */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            icon={LogOut}
            className="text-gov-navy hover:text-gov-maroon"
          >
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default IndustryHeader;
