import { seedUser } from '../data/seed';
import { LS_KEYS } from '../utils/constants';

export const authenticate = (email, password) => {
  if (email === seedUser.email && password === seedUser.password) {
    const u = { id: seedUser.id, name: seedUser.name, email: seedUser.email, role: seedUser.role };
    localStorage.setItem(LS_KEYS.USER, JSON.stringify(u));
    return { success: true, user: u };
  }
  return { success: false };
};
