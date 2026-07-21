import { LS_KEYS } from '../utils/constants';

export const getEmployees = () => {
  return JSON.parse(localStorage.getItem(LS_KEYS.EMPLOYEES) || '[]');
};

export const saveEmployees = (employees) => {
  localStorage.setItem(LS_KEYS.EMPLOYEES, JSON.stringify(employees));
};

export const addEmployee = (employee) => {
  const employees = getEmployees();
  employees.push({ ...employee, id: Date.now() });
  saveEmployees(employees);
};

export const updateEmployee = (id, data) => {
  const employees = getEmployees().map(e => e.id === id ? { ...e, ...data } : e);
  saveEmployees(employees);
};

export const deleteEmployee = (id) => {
  const employees = getEmployees().filter(e => e.id !== id);
  saveEmployees(employees);
};
