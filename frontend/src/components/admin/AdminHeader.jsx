import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PORTAL_TITLE, GOVT_NAME } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';
import NotificationDropdown from '../common/NotificationDropdown';
import Button from '../common/Button';
import Badge from '../common/Badge';
import {
  Bell,
  LogOut,
  User,
  Menu,
  X,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';

const AdminHeader = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const adminNotifications = [
    {
      id: 1,
      title: 'New Challenge Awaiting Review',
      text: 'DEL-203 (Micro-Climatic PM2.5 Filtration at Anand Vihar) was lodged by RWA President.',
      time: '15 mins ago',
      unread: true
    },
    {
      id: 2,
      title: 'University Milestone Delivered',
      text: 'DTU Environmental Lab submitted Milestone 3 documentation for Ghazipur Waste project.',
      time: '3 hours ago',
      unread: true
    },
    {
      id: 3,
      title: 'Industry Sponsorship Pledged',
      text: 'Tata Power DDL pledged ₹ 6,00,000 for AIIMS solar lighting deployment.',
      time: '1 day ago',
      unread: false
    }
  ];

  return (
    <header className="bg-white border-b border-gov-border sticky top-0 z-40 shadow-xs">
      {/* Top Administration Strip */}
      <div className="bg-gov-navy text-white text-[11px] font-serif py-1 px-4 sm:px-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          <span className="font-bold tracking-wide">{GOVT_NAME}</span>
          <span className="text-gray-400 hidden sm:inline">|</span>
          <span className="text-gray-300 hidden sm:inline">Official State Administration & Governance Console</span>
        </div>
        <div className="flex items-center space-x-3 text-gray-300">
          <span className="text-amber-300 font-bold uppercase tracking-wider text-[10px]">
            Restricted Clearance Level
          </span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-gov-navy hover:bg-gov-sand-100 rounded-sm border border-gov-border"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/admin" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-sm bg-gov-navy flex items-center justify-center text-white border border-amber-600 shadow-xs">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="font-serif font-bold text-gov-navy text-base sm:text-lg leading-tight">
                {PORTAL_TITLE}
              </div>
              <div className="text-[10px] font-serif text-gov-maroon font-bold uppercase tracking-wider">
                Government State Validation & Innovation Authority Console
              </div>
            </div>
          </Link>
        </div>

        {/* Right: Notifications, Admin Profile, Logout */}
        <div className="flex items-center space-x-3">
          {/* Notifications Dropdown */}
          <NotificationDropdown />

          {/* Admin Profile Pill */}
          <Link
            to="/admin/settings"
            className="flex items-center space-x-2.5 p-1.5 rounded-sm hover:bg-gov-sand-50 transition-colors border border-transparent hover:border-gov-border"
          >
            <img
              src={
                user?.profileImage ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Administrator')}&background=142a45&color=fff&font-size=0.4`
              }
              alt={user?.name}
              className="w-8 h-8 rounded-sm border border-gov-navy object-cover"
            />
            <div className="hidden sm:block text-left">
              <div className="text-xs font-serif font-bold text-gov-navy leading-tight truncate max-w-[140px]">
                {user?.name || 'Dr. Vivek Saxena'}
              </div>
              <div className="flex items-center space-x-1">
                <Badge variant="navy" className="text-[9px] py-0 px-1 font-bold">
                  STATE ADMIN
                </Badge>
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

export default AdminHeader;
