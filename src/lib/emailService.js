import { supabase } from './supabaseClient';

const LOCAL_STORAGE_KEY = 'elpatinoso_customer_emails';
const SAVED_EMAIL_KEY = 'elpatinoso_saved_user_email';
const COOKIE_NAME = 'elpatinoso_user_email';

// Helper to get cookie value by name
function getCookie(name) {
  try {
    if (typeof document === 'undefined') return '';
    const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
    return match ? decodeURIComponent(match[3]) : '';
  } catch (err) {
    return '';
  }
}

// Helper to set cookie with long expiration (1 year)
function setCookie(name, value, days = 365) {
  try {
    if (typeof document === 'undefined') return;
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  } catch (err) {
    console.error("Error setting cookie:", err);
  }
}

// Helper to remove cookie
function removeCookie(name) {
  try {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
  } catch (err) {
    console.error("Error removing cookie:", err);
  }
}

/**
 * Get remembered/consented user email from cookies or localStorage
 */
export function getSavedUserEmail() {
  try {
    // 1. Check cookie first
    const cookieEmail = getCookie(COOKIE_NAME);
    if (cookieEmail && cookieEmail.includes('@')) {
      return cookieEmail.trim().toLowerCase();
    }

    // 2. Check localStorage key
    const localEmail = localStorage.getItem(SAVED_EMAIL_KEY) || localStorage.getItem('vapex_saved_user_email');
    if (localEmail && localEmail.includes('@')) {
      // Synchronize to cookie for longevity
      setCookie(COOKIE_NAME, localEmail.trim().toLowerCase());
      return localEmail.trim().toLowerCase();
    }

    // 3. Fallback to the latest email in the local emails list if present
    const emailsList = getLocalEmails();
    if (emailsList.length > 0 && emailsList[0].email && emailsList[0].email.includes('@')) {
      const email = emailsList[0].email.trim().toLowerCase();
      setSavedUserEmail(email);
      return email;
    }
  } catch (err) {
    console.error("Error reading saved user email:", err);
  }
  return '';
}

/**
 * Store remembered/consented user email in both cookies and localStorage
 */
export function setSavedUserEmail(email) {
  const cleanEmail = email ? email.trim().toLowerCase() : '';
  if (!cleanEmail || !cleanEmail.includes('@')) return;

  try {
    localStorage.setItem(SAVED_EMAIL_KEY, cleanEmail);
    setCookie(COOKIE_NAME, cleanEmail);
  } catch (err) {
    console.error("Error persisting saved user email:", err);
  }
}

/**
 * Remove saved user email
 */
export function clearSavedUserEmail() {
  try {
    localStorage.removeItem(SAVED_EMAIL_KEY);
    localStorage.removeItem('vapex_saved_user_email');
    removeCookie(COOKIE_NAME);
  } catch (err) {
    console.error("Error clearing saved user email:", err);
  }
}

// Get local emails array from localStorage
function getLocalEmails() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY) || localStorage.getItem('vapex_customer_emails');
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Error reading customer emails from localStorage:", err);
    return [];
  }
}

// Save local emails array to localStorage
function setLocalEmails(emails) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(emails));
  } catch (err) {
    console.error("Error saving customer emails to localStorage:", err);
  }
}

/**
 * Save a customer email to Supabase and fallback to LocalStorage
 */
export async function saveCustomerEmail({ email, acceptTerms = true, acceptMarketing = false, source = 'whatsapp' }) {
  const cleanEmail = email ? email.trim().toLowerCase() : '';
  if (!cleanEmail) {
    return { success: false, error: 'Email invalid' };
  }

  // Persist email in cookie & localStorage so user is not asked again
  setSavedUserEmail(cleanEmail);

  const now = new Date().toISOString();
  const newRecord = {
    id: Date.now(),
    email: cleanEmail,
    accept_terms: acceptTerms,
    accept_marketing: acceptMarketing,
    source: source,
    created_at: now
  };

  // 1. Save to LocalStorage
  const localList = getLocalEmails();
  // Remove existing duplicate if any, then prepend
  const filteredLocal = localList.filter(item => item.email !== cleanEmail);
  filteredLocal.unshift(newRecord);
  setLocalEmails(filteredLocal);

  // 2. Save to Supabase if connected
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('customer_emails')
        .insert([{
          email: cleanEmail,
          accept_terms: acceptTerms,
          accept_marketing: acceptMarketing,
          source: source,
          created_at: now
        }])
        .select();

      if (error) {
        console.warn("Could not insert email into Supabase table customer_emails:", error.message);
      } else if (data && data[0]) {
        return { success: true, data: data[0] };
      }
    } catch (err) {
      console.warn("Supabase save email error:", err);
    }
  }

  return { success: true, data: newRecord };
}

/**
 * Fetch all stored customer emails from Supabase and/or LocalStorage
 */
export async function getCustomerEmails() {
  let supabaseEmails = [];
  
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('customer_emails')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        supabaseEmails = data.map(item => ({
          ...item,
          accept_terms: item.accept_terms !== undefined ? item.accept_terms : true,
          accept_marketing: item.accept_marketing !== undefined ? item.accept_marketing : false,
        }));
      }
    } catch (err) {
      console.warn("Could not fetch emails from Supabase:", err);
    }
  }

  const localEmails = getLocalEmails();

  // Merge lists without duplicates by email
  const map = new Map();

  // Load local emails first
  localEmails.forEach(item => map.set(item.email.toLowerCase(), item));
  // Override or complement with Supabase emails
  supabaseEmails.forEach(item => map.set(item.email.toLowerCase(), item));

  const merged = Array.from(map.values()).sort((a, b) => {
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  return merged;
}

/**
 * Delete a customer email record by id and/or email
 */
export async function deleteCustomerEmail(id, email) {
  const cleanEmail = email ? email.trim().toLowerCase() : null;

  // 1. Delete from LocalStorage
  let localList = getLocalEmails();
  localList = localList.filter(item => item.id !== id && (cleanEmail ? item.email !== cleanEmail : true));
  setLocalEmails(localList);

  // 2. Delete from Supabase
  if (supabase) {
    try {
      if (id && typeof id === 'number' && id < 100000000000) { // Supabase BIGINT ID
        await supabase.from('customer_emails').delete().eq('id', id);
      } else if (cleanEmail) {
        await supabase.from('customer_emails').delete().eq('email', cleanEmail);
      }
    } catch (err) {
      console.warn("Could not delete email from Supabase:", err);
    }
  }

  return { success: true };
}
