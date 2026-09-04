import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { Home, AlertTriangle } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="py-20 px-4 text-center max-w-lg mx-auto">
      <div className="w-16 h-16 bg-gov-maroon-surface text-gov-maroon rounded-full flex items-center justify-center mx-auto mb-6">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-serif font-bold text-gov-navy mb-2">
        Page Not Found
      </h1>
      <p className="text-sm font-serif text-gov-text-secondary mb-8">
        The requested portal resource does not exist or has been relocated under official digital guidelines.
      </p>
      <Link to="/select-role">
        <Button variant="primary" size="md" icon={Home}>
          Return to Portal Role Selection
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
