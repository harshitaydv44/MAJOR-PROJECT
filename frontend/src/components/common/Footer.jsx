import React from 'react';
import { Link } from 'react-router-dom';
import { PORTAL_TITLE, GOVT_NAME, FOOTER_LINKS } from '../../utils/constants';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-gov-sand-100 border-t-2 border-t-gov-maroon border-b border-gov-border mt-auto">
      {/* Upper Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1: About Portal */}
        <div className="space-y-3">
          <h4 className="text-sm font-serif font-bold text-gov-navy uppercase tracking-wider border-b border-gov-border pb-1">
            {PORTAL_TITLE}
          </h4>
          <p className="text-xs font-serif text-gov-text-secondary leading-relaxed">
            A state-level collaborative platform empowering citizens to submit local challenges, enabling academic researchers and students to develop sustainable solutions, and connecting industry partners for funding and execution across the National Capital Territory of Delhi.
          </p>
          <div className="pt-2 text-xs font-serif text-gov-maroon font-semibold">
            {GOVT_NAME}
          </div>
        </div>

        {/* Col 2: About & Guidelines */}
        <div className="space-y-3">
          <h4 className="text-sm font-serif font-bold text-gov-navy uppercase tracking-wider border-b border-gov-border pb-1">
            Initiative & Framework
          </h4>
          <ul className="space-y-2 text-xs font-serif">
            {FOOTER_LINKS.about.map((item, idx) => (
              <li key={idx}>
                <Link
                  to={item.path}
                  className="text-gov-text-secondary hover:text-gov-maroon transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/select-role" className="text-gov-maroon hover:underline font-semibold">
                &rarr; Select Portal Role
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Support & Helpdesk */}
        <div className="space-y-3">
          <h4 className="text-sm font-serif font-bold text-gov-navy uppercase tracking-wider border-b border-gov-border pb-1">
            Support & Helpdesk
          </h4>
          <ul className="space-y-2 text-xs font-serif">
            {FOOTER_LINKS.support.map((item, idx) => (
              <li key={idx}>
                <Link
                  to={item.path}
                  className="text-gov-text-secondary hover:text-gov-maroon transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="text-xs font-serif text-gov-text-muted mt-2">
            Toll-Free Civic Helpline: <strong>1800-11-DELHI (011-23379000)</strong>
          </div>
        </div>

        {/* Col 4: Legal & Policies */}
        <div className="space-y-3">
          <h4 className="text-sm font-serif font-bold text-gov-navy uppercase tracking-wider border-b border-gov-border pb-1">
            Policies & Standards
          </h4>
          <ul className="space-y-2 text-xs font-serif">
            {FOOTER_LINKS.legal.map((item, idx) => (
              <li key={idx}>
                <Link
                  to={item.path}
                  className="text-gov-text-secondary hover:text-gov-maroon transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Legal & Accessibility Strip */}
      <div className="bg-gov-navy text-white text-xs font-serif py-4 px-4 sm:px-8 border-t border-gov-navy-dark">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
          <div>
            &copy; {currentYear} {PORTAL_TITLE}. All Rights Reserved.
          </div>
          <div className="flex items-center space-x-4 text-gray-300">
            <span>Official Digital Public Good</span>
            <span>&bull;</span>
            <span>Standards Compliant (W3C / GIGW)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
