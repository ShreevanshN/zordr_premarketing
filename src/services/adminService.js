import { supabase } from '../lib/supabase';

// supabase.functions.invoke automatically attaches the current session's
// access token (from AdminAuthContext's supabase.auth session) as the
// Authorization header -- that's what requireAdmin() checks server-side.
async function callAdminFunction(name, body) {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) return { data: null, error: error.message || 'Request failed' };
  if (data?.error) return { data: null, error: data.error };
  return { data, error: null };
}

export const adminColleges = {
  list: () => callAdminFunction('admin-colleges', { action: 'list' }),
  create: (fields) => callAdminFunction('admin-colleges', { action: 'create', ...fields }),
  update: (collegeId, fields) => callAdminFunction('admin-colleges', { action: 'update', collegeId, ...fields }),
};

export const adminRewards = {
  list: (collegeId) => callAdminFunction('admin-rewards', { action: 'list', collegeId }),
  create: (collegeId, fields) => callAdminFunction('admin-rewards', { action: 'create', collegeId, ...fields }),
  update: (collegeId, rewardId, fields) => callAdminFunction('admin-rewards', { action: 'update', collegeId, rewardId, ...fields }),
};

export const adminFormFields = {
  list: (collegeId) => callAdminFunction('admin-form-fields', { action: 'list', collegeId }),
  create: (collegeId, fields) => callAdminFunction('admin-form-fields', { action: 'create', collegeId, ...fields }),
  update: (collegeId, fieldId, fields) => callAdminFunction('admin-form-fields', { action: 'update', collegeId, fieldId, ...fields }),
  remove: (fieldId) => callAdminFunction('admin-form-fields', { action: 'delete', fieldId }),
};

export const adminApplications = {
  list: (collegeId, status) => callAdminFunction('admin-applications', { action: 'list', collegeId, status }),
  updateStatus: (applicationId, status) => callAdminFunction('admin-applications', { action: 'updateStatus', applicationId, status }),
};

export const adminAnalytics = {
  get: (collegeId) => callAdminFunction('admin-analytics', { collegeId }),
};

export const adminCoupons = {
  markSynced: (collegeId, couponCode) =>
    callAdminFunction('admin-coupons', { action: 'markSynced', collegeId, couponCode }),
};
