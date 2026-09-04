import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  icon: Icon = null,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-serif font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-sm',
    md: 'px-4 py-2 text-sm rounded-sm',
    lg: 'px-6 py-2.5 text-base rounded-sm'
  };

  const variantClasses = {
    primary:
      'bg-gov-maroon text-white hover:bg-gov-maroon-dark focus:ring-gov-maroon border border-gov-maroon shadow-sm',
    secondary:
      'bg-gov-navy text-white hover:bg-gov-navy-dark focus:ring-gov-navy border border-gov-navy shadow-sm',
    outline:
      'bg-transparent text-gov-maroon border border-gov-maroon hover:bg-gov-maroon-surface focus:ring-gov-maroon',
    outlineNavy:
      'bg-transparent text-gov-navy border border-gov-navy hover:bg-gov-navy-surface focus:ring-gov-navy',
    subtle:
      'bg-gov-sand-100 text-gov-text-primary border border-gov-border hover:bg-gov-sand-200 focus:ring-gov-navy',
    ghost:
      'bg-transparent text-gov-text-primary hover:bg-gov-sand-200 border border-transparent'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${sizeClasses[size] || sizeClasses.md}
        ${variantClasses[variant] || variantClasses.primary}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {Icon && <Icon className={`w-4 h-4 ${children ? 'mr-2' : ''}`} />}
      {children}
    </button>
  );
};

export default Button;
