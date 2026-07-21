import { ROLES } from './constants';

export const can = (userRole, action) => {
  const perms = {
    [ROLES.SUPER_ADMIN]: ['view_all_departments', 'view_all_employees', 'add_employee', 'edit_employee', 'delete_employee'],
    [ROLES.ADMIN]: ['view_all_departments', 'view_all_employees', 'add_employee', 'edit_employee'],
    [ROLES.EXECUTIVE]: ['view_assigned_department'],
  };
  return perms[userRole]?.includes(action) ?? false;
};
