import { LS_KEYS } from '../utils/constants';

export const seedUser = {
  id: 1,
  name: 'Tech Admin',
  email: 'tech@zordr.in',
  password: 'Zordr@2025',
  role: 'SUPER_ADMIN',
};

export const seedEmployees = [
  { id: 1001, name: 'Rahul Sharma', email: 'rahul.sharma@zordr.com', phone: '9876543210', role: 'EXECUTIVE', department: 'Finance', temporaryPassword: 'Temp@123', status: 'ACTIVE' },
  { id: 1002, name: 'Pooja Mehta', email: 'pooja.mehta@zordr.com', phone: '9876543211', role: 'ADMIN', department: 'Finance', temporaryPassword: 'Temp@123', status: 'ACTIVE' },
  { id: 1003, name: 'Neha Singh', email: 'neha.singh@zordr.com', phone: '9876543212', role: 'EXECUTIVE', department: 'Marketing & Sales', temporaryPassword: 'Temp@123', status: 'ACTIVE' },
  { id: 1004, name: 'Aman Verma', email: 'aman.verma@zordr.com', phone: '9876543213', role: 'ADMIN', department: 'Operations', temporaryPassword: 'Temp@123', status: 'ACTIVE' },
  { id: 1005, name: 'Karan Patel', email: 'karan.patel@zordr.com', phone: '9876543214', role: 'EXECUTIVE', department: 'Legal & Compliance', temporaryPassword: 'Temp@123', status: 'INACTIVE' },
];

export const initSeedData = () => {
  if (!localStorage.getItem(LS_KEYS.EMPLOYEES)) {
    localStorage.setItem(LS_KEYS.EMPLOYEES, JSON.stringify(seedEmployees));
  }
  if (!localStorage.getItem(LS_KEYS.EARLY_BIRD_STATS)) {
    localStorage.setItem(LS_KEYS.EARLY_BIRD_STATS, JSON.stringify({ claimed: 327, total: 500 }));
  }
};
