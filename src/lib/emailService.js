import { supabase } from './supabaseClient';

const LOCAL_STORAGE_KEY = 'vapex_customer_emails';

// Get local emails array from localStorage
function getLocalEmails() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
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
