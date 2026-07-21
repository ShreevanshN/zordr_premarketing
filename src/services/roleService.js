import { supabase } from '../lib/supabase';

export const DEFAULT_AMBASSADOR_ROLES = [
  { id: 'Growth Lead', name: 'Growth Lead', icon: '📣', desc: 'Drive awareness inside your department.' },
  { id: 'Community Lead', name: 'Community Lead', icon: '🤝', desc: 'Manage communities and launch activities.' },
  { id: 'Product Insider', name: 'Product Insider', icon: '🧪', desc: 'Test features early and give valuable feedback.' },
];

const STORAGE_PREFIX = 'zordr_ambassador_roles_';

function getStorageKey(collegeId) {
  return `${STORAGE_PREFIX}${collegeId || 'global'}`;
}

/**
 * Retrieves configured Campus Ambassador roles for a given college.
 */
export async function getAmbassadorRoles(collegeId) {
  try {
    const raw = localStorage.getItem(getStorageKey(collegeId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading ambassador roles from storage:', e);
  }

  // Check if custom roles are stored in Supabase colleges metadata if available
  if (collegeId) {
    try {
      const { data } = await supabase
        .from('colleges')
        .select('settings')
        .eq('id', collegeId)
        .maybeSingle();

      if (data?.settings?.ambassador_roles && Array.isArray(data.settings.ambassador_roles) && data.settings.ambassador_roles.length > 0) {
        localStorage.setItem(getStorageKey(collegeId), JSON.stringify(data.settings.ambassador_roles));
        return data.settings.ambassador_roles;
      }
    } catch (err) {
      console.warn('Could not fetch roles from Supabase colleges settings:', err);
    }
  }

  return DEFAULT_AMBASSADOR_ROLES;
}

/**
 * Saves Campus Ambassador roles for a given college.
 */
export async function saveAmbassadorRoles(collegeId, roles) {
  const key = getStorageKey(collegeId);
  localStorage.setItem(key, JSON.stringify(roles));

  // Try updating Supabase colleges settings if admin session is active
  if (collegeId) {
    try {
      const { data: current } = await supabase.from('colleges').select('settings').eq('id', collegeId).maybeSingle();
      const updatedSettings = { ...(current?.settings || {}), ambassador_roles: roles };
      await supabase.from('colleges').update({ settings: updatedSettings }).eq('id', collegeId);
    } catch (err) {
      console.warn('Supabase college roles update skipped or failed:', err);
    }
  }

  return roles;
}

/**
 * Adds a new role to the college's ambassador roles.
 */
export async function addAmbassadorRole(collegeId, { name, icon, desc }) {
  const roles = await getAmbassadorRoles(collegeId);
  const trimmedName = String(name).trim();
  if (!trimmedName) throw new Error('Role name is required.');

  if (roles.some((r) => r.name.toLowerCase() === trimmedName.toLowerCase())) {
    throw new Error(`Role "${trimmedName}" already exists.`);
  }

  const newRole = {
    id: trimmedName,
    name: trimmedName,
    icon: icon ? String(icon).trim() : '🚀',
    desc: desc ? String(desc).trim() : 'Contribute to campus launch and growth.',
  };

  const updated = [...roles, newRole];
  await saveAmbassadorRoles(collegeId, updated);
  return updated;
}

/**
 * Removes a role by ID/name.
 */
export async function removeAmbassadorRole(collegeId, roleId) {
  const roles = await getAmbassadorRoles(collegeId);
  const updated = roles.filter((r) => r.id !== roleId && r.name !== roleId);
  await saveAmbassadorRoles(collegeId, updated);
  return updated;
}

/**
 * Resets roles back to defaults.
 */
export async function resetAmbassadorRoles(collegeId) {
  await saveAmbassadorRoles(collegeId, DEFAULT_AMBASSADOR_ROLES);
  return DEFAULT_AMBASSADOR_ROLES;
}
