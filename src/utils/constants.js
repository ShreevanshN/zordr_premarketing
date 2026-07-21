export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  EXECUTIVE: 'EXECUTIVE',
};

export const DEPARTMENTS = ['Finance', 'Legal & Compliance', 'Operations', 'Marketing & Sales'];

// Academic branches for the Campus Insider form -- distinct from the
// internal company DEPARTMENTS above (which is for the Employee Portal).
// The original handoff form was reusing DEPARTMENTS here by mistake.
export const ACADEMIC_BRANCHES = [
  'Computer Science', 'Information Technology', 'Electronics & Communication',
  'Electrical & Electronics', 'Mechanical', 'Civil', 'Chemical', 'Other',
];

export const STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

export const LS_KEYS = {
  USER: 'zordrUser',
  EMPLOYEES: 'zordrEmployees',
  EARLY_BIRD_USERS: 'earlyBirdUsers',
  CAMPUS_INSIDERS: 'campusInsiders',
  REFERRALS: 'referrals',
  EARLY_BIRD_STATS: 'earlyBirdStats',
};

export const CAMPUS_ROLES = ['Growth Lead', 'Community Lead', 'Product Insider'];
