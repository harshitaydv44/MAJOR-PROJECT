import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Samadhan Setu (समाधान सेतु) Official Emblem & Logo Component
 * Symbolizes the civic problem-to-solution bridge connecting citizens,
 * universities, student innovators, and industry partners.
 */
export const SamadhanSetuEmblem = ({ size = 42, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${className}`}
      aria-label="Samadhan Setu Emblem"
    >
      <defs>
        {/* Outer Ring Gradient */}
        <linearGradient id="setuGoldRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        {/* Shield / Disk Background */}
        <radialGradient id="setuShieldBg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#8e1719" />
          <stop offset="70%" stopColor="#640d0f" />
          <stop offset="100%" stopColor="#001838" />
        </radialGradient>

        {/* Sun / Solution Glow */}
        <radialGradient id="solutionGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="60%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </radialGradient>
      </defs>

      {/* 1. Base Disk with Gold Rim */}
      <circle cx="50" cy="50" r="48" fill="url(#setuGoldRing)" />
      <circle cx="50" cy="50" r="45" fill="url(#setuShieldBg)" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.4" />

      {/* 2. Inner Decorative Ring */}
      <circle cx="50" cy="50" r="41" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 2" opacity="0.8" />

      {/* 3. The Rising Solution Sun / Innovation Star (Samadhan) */}
      <g transform="translate(50, 32)">
        {/* Radiant Rays */}
        <circle cx="0" cy="0" r="9" fill="url(#solutionGlow)" />
        <circle cx="0" cy="0" r="4.5" fill="#ffffff" />
        
        {/* 8 Cardinal & Ordinal Solution Rays */}
        <path d="M0 -14 L0 -10 M0 10 L0 14 M-14 0 L-10 0 M10 0 L14 0" stroke="#fef08a" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M-9 -9 L-6.5 -6.5 M6.5 6.5 L9 9 M-9 9 L-6.5 6.5 M6.5 -6.5 L9 -9" stroke="#f59e0b" strokeWidth="1.4" strokeLinecap="round" />
      </g>

      {/* 4. Suspension Cables radiating from Solution down to Bridge */}
      <g stroke="#ffffff" strokeWidth="1" strokeOpacity="0.55">
        <line x1="50" y1="36" x2="22" y2="66" />
        <line x1="50" y1="36" x2="34" y2="63" />
        <line x1="50" y1="36" x2="44" y2="61" />
        <line x1="50" y1="36" x2="56" y2="61" />
        <line x1="50" y1="36" x2="66" y2="63" />
        <line x1="50" y1="36" x2="78" y2="66" />
      </g>

      {/* 5. Dual Bridge Anchor Towers (Left: Problem / Citizen, Right: Solution / Innovator) */}
      {/* Left Tower */}
      <path d="M19 50 L25 50 L26 72 L18 72 Z" fill="#f59e0b" opacity="0.9" />
      <rect x="20.5" y="47" width="3" height="3" fill="#ffffff" />
      
      {/* Right Tower */}
      <path d="M75 50 L81 50 L82 72 L74 72 Z" fill="#f59e0b" opacity="0.9" />
      <rect x="76.5" y="47" width="3" height="3" fill="#ffffff" />

      {/* 6. The Suspension Bridge Roadway Arch (Setu) */}
      {/* Upper Arch Curve */}
      <path
        d="M14 68 Q50 56 86 68"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      
      {/* Lower Bridge Deck Foundation */}
      <path
        d="M12 72 Q50 60 88 72"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Underbridge Arch Span */}
      <path
        d="M26 72 Q50 63 74 72 Z"
        fill="#001838"
        opacity="0.8"
      />

      {/* 7. Flowing Civic Water / River Waves Beneath the Bridge */}
      <path
        d="M22 79 Q36 76 50 79 T78 79"
        fill="none"
        stroke="#60a5fa"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M28 84 Q40 82 50 84 T72 84"
        fill="none"
        stroke="#93c5fd"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* 8. Micro Inscription: 2026 Innovation */}
      <circle cx="50" cy="71" r="1.5" fill="#fef08a" />
    </svg>
  );
};

const SIZES = {
  xs: { emblem: 28, title: 'text-sm', sub: 'text-[9px]' },
  sm: { emblem: 36, title: 'text-base', sub: 'text-[10px]' },
  md: { emblem: 44, title: 'text-lg', sub: 'text-xs' },
  lg: { emblem: 54, title: 'text-xl', sub: 'text-xs' },
  xl: { emblem: 66, title: 'text-2xl', sub: 'text-sm' }
};

const SamadhanSetuLogo = ({
  size = 'md',
  showText = true,
  isCollapsed = false,
  subtitle = 'National & State Innovation Network',
  hindiTagline = 'समाधान सेतु',
  variant = 'default', // default | light | dark | admin
  to = '/select-role',
  className = ''
}) => {
  const sizeConfig = SIZES[size] || SIZES.md;

  const titleColor =
    variant === 'light'
      ? 'text-white'
      : variant === 'admin'
      ? 'text-gov-navy'
      : 'text-gov-maroon';

  const subColor =
    variant === 'light'
      ? 'text-amber-200'
      : 'text-gov-navy';

  const Content = (
    <div className={`inline-flex items-center space-x-3 group ${className}`}>
      {/* High-definition Setu Emblem */}
      <SamadhanSetuEmblem size={sizeConfig.emblem} />

      {/* Text Branding */}
      {showText && !isCollapsed && (
        <div className="flex flex-col text-left leading-tight">
          <div className="flex items-center space-x-1.5">
            <span className={`font-serif font-bold tracking-tight ${sizeConfig.title} ${titleColor}`}>
              Samadhan Setu
            </span>
            {hindiTagline && (
              <span className="hidden sm:inline-block text-[11px] font-sans font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded-xs border border-amber-200/80">
                {hindiTagline}
              </span>
            )}
          </div>
          {subtitle && (
            <span className={`font-serif font-medium tracking-wide ${sizeConfig.sub} ${subColor} mt-0.5`}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex items-center focus:outline-none focus:ring-1 focus:ring-gov-maroon rounded-xs">
        {Content}
      </Link>
    );
  }

  return Content;
};

export default SamadhanSetuLogo;
