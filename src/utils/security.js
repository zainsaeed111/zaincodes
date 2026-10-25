/**
 * Security utilities for ZainCodes Portfolio
 * Provides client-side cryptographic hashing, brute-force rate limiting,
 * input sanitization, and credential protection.
 */

// Default master password hash for 'zaincodes2024' (SHA-256 with salt)
// Salt: 'zaincodes_secure_salt_v1'
const DEFAULT_SALT = 'zaincodes_secure_salt_v1';
const DEFAULT_PASSWORD_HASH = '9e0bcfcf5a458db4f4f7288ef56b9ccefa8e0ce9268759325c1fe52885444ca9';

/**
 * Computes SHA-256 hash of a string using Web Crypto API
 * @param {string} message 
 * @returns {Promise<string>} Hex-encoded hash
 */
export async function sha256(message) {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verifies admin password against stored or default hash
 * @param {string} password Attempted password
 * @returns {Promise<boolean>}
 */
export async function verifyAdminPassword(password) {
  if (!password || typeof password !== 'string') return false;

  const inputHash = await sha256(password + DEFAULT_SALT);
  const customHash = localStorage.getItem('adminPasswordHash');

  if (customHash) {
    return inputHash === customHash;
  }

  // Also support default initial password 'zaincodes2024'
  const defaultCheck = await sha256('zaincodes2024' + DEFAULT_SALT);
  return inputHash === defaultCheck || inputHash === DEFAULT_PASSWORD_HASH;
}

/**
 * Updates the admin master password (stores salted hash)
 * @param {string} newPassword 
 * @returns {Promise<boolean>}
 */
export async function updateAdminPassword(newPassword) {
  if (!newPassword || newPassword.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }
  const newHash = await sha256(newPassword + DEFAULT_SALT);
  localStorage.setItem('adminPasswordHash', newHash);
  return true;
}

/**
 * Rate Limiter for Login Protection
 * Locks out after 5 consecutive failed attempts for 15 minutes.
 */
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

export function checkLoginAttempts() {
  try {
    const raw = localStorage.getItem('admin_login_security');
    if (!raw) return { allowed: true, remainingAttempts: MAX_ATTEMPTS, lockedUntil: null };

    const data = JSON.parse(raw);
    const now = Date.now();

    if (data.lockedUntil && now < data.lockedUntil) {
      const remainingMinutes = Math.ceil((data.lockedUntil - now) / 60000);
      return { allowed: false, remainingAttempts: 0, lockedUntil: data.lockedUntil, remainingMinutes };
    }

    // Reset if lockout period has passed
    if (data.lockedUntil && now >= data.lockedUntil) {
      localStorage.removeItem('admin_login_security');
      return { allowed: true, remainingAttempts: MAX_ATTEMPTS, lockedUntil: null };
    }

    const remainingAttempts = Math.max(0, MAX_ATTEMPTS - (data.attempts || 0));
    return { allowed: remainingAttempts > 0, remainingAttempts, lockedUntil: null };
  } catch {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS, lockedUntil: null };
  }
}

export function recordFailedLogin() {
  const raw = localStorage.getItem('admin_login_security');
  const now = Date.now();
  let data = raw ? JSON.parse(raw) : { attempts: 0, firstAttempt: now };

  data.attempts = (data.attempts || 0) + 1;

  if (data.attempts >= MAX_ATTEMPTS) {
    data.lockedUntil = now + LOCKOUT_MS;
  }

  localStorage.setItem('admin_login_security', JSON.stringify(data));
  return checkLoginAttempts();
}

export function recordSuccessfulLogin() {
  localStorage.removeItem('admin_login_security');
  // Store session with expiry timestamp (30 minutes)
  const sessionData = {
    authenticated: true,
    expiresAt: Date.now() + 30 * 60 * 1000
  };
  sessionStorage.setItem('admin_session', JSON.stringify(sessionData));
}

export function validateSession() {
  try {
    const raw = sessionStorage.getItem('admin_session');
    if (!raw) return false;
    const session = JSON.parse(raw);
    if (!session.authenticated || !session.expiresAt) return false;
    if (Date.now() > session.expiresAt) {
      sessionStorage.removeItem('admin_session');
      return false;
    }
    // Refresh session expiry on activity
    session.expiresAt = Date.now() + 30 * 60 * 1000;
    sessionStorage.setItem('admin_session', JSON.stringify(session));
    return true;
  } catch {
    return false;
  }
}

export function terminateSession() {
  sessionStorage.removeItem('admin_session');
  sessionStorage.removeItem('adminAuth');
}

/**
 * XSS prevention: Sanitize plain text strings
 */
export function sanitizeInput(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/onload=/gi, '')
    .replace(/onerror=/gi, '')
    .trim();
}

/**
 * Mask sensitive tokens for safe UI display
 * e.g. 'github_pat_11AB...34CD'
 */
export function maskToken(token) {
  if (!token || typeof token !== 'string') return '';
  if (token.length <= 8) return '••••••••';
  return `${token.slice(0, 4)}••••••••••••••••${token.slice(-4)}`;
}
