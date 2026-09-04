import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import UniversityHeader from '../components/university/UniversityHeader';
import UniversitySidebar from '../components/university/UniversitySidebar';
import Footer from '../components/common/Footer';

const UniversityLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gov-sand-50 font-serif text-gov-text-primary">
      {/* Header */}
      <UniversityHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main App Shell */}
      <div className="flex-1 flex w-full">
        {/* Sidebar */}
        <UniversitySidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default UniversityLayout;
