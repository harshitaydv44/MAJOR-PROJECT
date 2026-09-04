import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Badge from '../components/common/Badge';
import { ROLES } from '../utils/constants';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';

const DashboardLayout = ({ roleId, roleTitle, roleBadge }) => {
  const location = useLocation();
  const currentRole = ROLES.find((r) => r.id === roleId) || ROLES[0];

  return (
    <div className="min-h-screen flex flex-col bg-gov-sand-50 text-gov-text-primary">
      <Navbar />

      {/* Breadcrumb & Role Title Header Strip */}
      <div className="bg-white border-b border-gov-border shadow-gov">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-xs font-serif text-gov-text-secondary mb-2">
            <Link to="/select-role" className="hover:text-gov-maroon flex items-center">
              <Home className="w-3.5 h-3.5 mr-1" />
              Role Selection
            </Link>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="text-gov-maroon font-semibold">{roleTitle || currentRole.title}</span>
          </nav>

          {/* Heading with Role Badge & Quick Switch */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-serif font-bold text-gov-navy">
                  {roleTitle || currentRole.title} Dashboard
                </h1>
                <Badge variant={currentRole.colorVariant === 'navy' ? 'navy' : 'maroon'}>
                  {roleBadge || currentRole.badgeText}
                </Badge>
              </div>
              <p className="text-xs font-serif text-gov-text-secondary mt-1 max-w-2xl">
                {currentRole.description}
              </p>
            </div>

            <Link
              to="/select-role"
              className="inline-flex items-center text-xs font-serif font-medium text-gov-maroon hover:text-gov-maroon-dark hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Switch Portal Role
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-8 py-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default DashboardLayout;
