/**
 * CARTERA — SUPABASE BACKEND & AUTH CONFIGURATION
 * Connects the Cartera portfolio to your Supabase project.
 */

// -----------------------------------------------------------------------------
// 1. Supabase Credentials
// -----------------------------------------------------------------------------
const SUPABASE_CONFIG = {
  url: 'https://lqulqyvpsgpnechqigfn.supabase.co',
  anonKey: 'sb_publishable_i_OiASTYtpUqwW1wMpHCBQ_7iwJaLqY',
  storageBucket: 'project-screenshots',
  // Default Admin Password (Change this to whatever password you want!)
  // You can also use a SHA-256 hash for extra security.
  adminPassword: 'cartera2026',
  // SHA-256 hash of 'cartera2026'
  adminPasswordHash: '87e221ff62a67e436798075678bb39bb3f72813589b27620bc241a78ee9091a1',
  sessionKey: 'cartera_admin_session',
  sessionDurationHours: 24
};

// Initialize Supabase client if the library is loaded
let supabaseClient = null;
if (typeof supabase !== 'undefined' && supabase.createClient) {
  supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
}

// -----------------------------------------------------------------------------
// 2. Authentication & Session Management
// -----------------------------------------------------------------------------

/**
 * Computes SHA-256 hash of a string using Web Crypto API
 */
async function hashString(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Checks if current admin session is valid
 */
function isSessionValid() {
  const sessionDataStr = localStorage.getItem(SUPABASE_CONFIG.sessionKey) || 
                         sessionStorage.getItem(SUPABASE_CONFIG.sessionKey);
  
  if (!sessionDataStr) return false;

  try {
    const session = JSON.parse(sessionDataStr);
    if (!session || !session.token || !session.expiresAt) return false;
    
    // Check expiration
    if (Date.now() > session.expiresAt) {
      logoutAdmin();
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Verifies admin password and creates session
 */
async function loginAdmin(password, rememberMe = true) {
  if (!password) return { success: false, error: 'Please enter your password.' };

  const inputHash = await hashString(password);
  
  // Verify against plain password or hash
  const isValid = (password === SUPABASE_CONFIG.adminPassword) || 
                  (inputHash === SUPABASE_CONFIG.adminPasswordHash);

  if (!isValid) {
    return { success: false, error: 'Incorrect password. Please try again.' };
  }

  // Create session token
  const session = {
    token: 'adm_' + Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map(b => b.toString(16).padStart(2, '0')).join(''),
    createdAt: Date.now(),
    expiresAt: Date.now() + (SUPABASE_CONFIG.sessionDurationHours * 60 * 60 * 1000)
  };

  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(SUPABASE_CONFIG.sessionKey, JSON.stringify(session));

  return { success: true };
}

/**
 * Clears admin session and redirects to login page
 */
function logoutAdmin() {
  localStorage.removeItem(SUPABASE_CONFIG.sessionKey);
  sessionStorage.removeItem(SUPABASE_CONFIG.sessionKey);
  window.location.href = 'admin-login.html';
}

/**
 * Guard for protected pages (e.g. admin.html)
 * Redirects to login if not authenticated
 */
function requireAdminAuth() {
  if (!isSessionValid()) {
    window.location.href = 'admin-login.html';
  }
}

/**
 * Guard for login page (admin-login.html)
 * Redirects to admin.html if already logged in
 */
function redirectIfLoggedIn() {
  if (isSessionValid()) {
    window.location.href = 'admin.html';
  }
}
