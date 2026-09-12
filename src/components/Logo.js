import React from 'react';
import './Logo.css';
import darkLogo from '../assets/zaincodes-icon-dark-transparent.svg';
import lightLogo from '../assets/zaincodes-icon-light-transparent.svg';

const Logo = ({ className = '', showText = true, size = 'medium', onClick }) => {
  return (
    <div 
      className={`logo-container logo-${size} ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="logo-icon-wrapper">
        <img
          src={darkLogo}
          alt="ZainCodes Logo Dark"
          className="logo-icon-img logo-icon-dark"
        />
        <img
          src={lightLogo}
          alt="ZainCodes Logo Light"
          className="logo-icon-img logo-icon-light"
        />
      </div>

      {showText && (
        <span className="logo-text">
          <span className="logo-text-zain">Zain</span>
          <span className="logo-text-codes">Codes</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
