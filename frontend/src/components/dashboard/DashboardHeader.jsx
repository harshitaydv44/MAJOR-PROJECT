import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PORTAL_TITLE, GOVT_NAME } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';
import NotificationDropdown from '../common/NotificationDropdown';
import Button from '../common/Button';
import Badge from '../common/Badge';
import SamadhanSetuLogo from '../common/SamadhanSetuLogo';
import { Bell, LogOut, User, Menu, X, CheckCircle, ExternalLink } from 'lucide-react';

const DashboardHeader = ({ onToggleSidebar }) => {
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
      console.warn('Notifications service unreachable');
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="bg-white border-b border-gov-border sticky top-0 z-40 shadow-xs">
      {/* Top Delhi Govt Strip */}
      <div className="bg-gov-navy text-white text-[11px] font-serif py-1 px-4 sm:px-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>{GOVT_NAME} &bull; Citizen Innovation Portal</span>
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

          <SamadhanSetuLogo
            size="sm"
            subtitle="Citizen Problem-to-Solution Gateway"
            to="/select-role"
          />
        </div>

        {/* Right: Notifications, Profile, Logout */}
        <div className="flex items-center space-x-3">
          {/* Notifications Dropdown */}
          <NotificationDropdown />

          {/* User Profile Pill */}
          <Link
            to="/client/profile"
            className="flex items-center space-x-2 p-1.5 rounded-sm hover:bg-gov-sand-50 transition-colors border border-transparent hover:border-gov-border"
          >
            <img
              src={
                user?.profileImage ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Citizen')}&background=7a1113&color=fff&font-size=0.4`
              }
              alt={user?.name}
              className="w-7 h-7 rounded-sm border border-gov-border object-cover"
            />
            <div className="hidden sm:block text-left">
              <div className="text-xs font-serif font-bold text-gov-navy leading-tight truncate max-w-[130px]">
                {user?.name || 'Citizen'}
              </div>
              <div className="text-[10px] font-serif text-gov-maroon font-semibold">
                {user?.district || 'Delhi Citizen'}
              </div>
            </div>
          </Link>

          {/* Logout Button */}
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

export default DashboardHeader;
