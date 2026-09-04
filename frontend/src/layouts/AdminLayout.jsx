import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import AdminHeader from '../components/admin/AdminHeader';
import AdminSidebar from '../components/admin/AdminSidebar';
import Footer from '../components/common/Footer';
import { ShieldCheck, ChevronRight, ArrowLeft } from 'lucide-react';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getBreadcrumbTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Overview';
    if (path === '/admin/challenges') return 'Challenge Management';
    if (path === '/admin/validation-queue') return 'Validation Queue';
    if (path === '/admin/universities') return 'Universities Registry';
    if (path === '/admin/industry-partners') return 'Industry & Corporate Partners';
    if (path === '/admin/projects') return 'Active Societal Projects';
    if (path === '/admin/analytics') return 'Strategic Analytics';
    if (path === '/admin/notifications') return 'Government Alerts';
    if (path === '/admin/settings') return 'Admin Settings & Identity';
    return 'State Console';
  };

  return (
    <div className="min-h-screen flex flex-col bg-gov-sand-50 text-gov-text-primary font-serif">
      <AdminHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Sub-header Breadcrumb Strip */}
      <div className="bg-white border-b border-gov-border px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs">
        <nav className="flex items-center space-x-2 text-gov-text-muted">
          <Link to="/select-role" className="hover:text-gov-maroon flex items-center">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-gov-navy" />
            Portal
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <Link to="/admin" className="hover:text-gov-navy font-medium">
            State Administration
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="text-gov-navy font-bold">{getBreadcrumbTitle()}</span>
        </nav>

        <Link
          to="/select-role"
          className="text-gov-maroon hover:underline flex items-center text-[11px] font-semibold"
        >
          <ArrowLeft className="w-3 h-3 mr-1" />
          Exit Admin Console
        </Link>
      </div>

      {/* Body: Sidebar + Main Content */}
      <div className="flex-1 flex overflow-hidden max-w-7xl w-full mx-auto">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default AdminLayout;
