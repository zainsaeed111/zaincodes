import React from 'react';
import './Logo.css';

const Logo = ({ className = '' }) => {
  return (
    <div className={`logo-mark ${className}`}>
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1.5" y="1.5" width="29" height="29" rx="8" stroke="currentColor" strokeWidth="2.5" />
        <path d="M9 8h13M22 8v16M9 24h13" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

export default Logo;
