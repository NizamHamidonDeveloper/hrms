export const ROLE_ID = {
  HR_ADMIN: 5,
  MANAGER: 3,
  EMPLOYEE: 4,
};

export type RoleKey = keyof typeof ROLE_ID;

export function getRoleNameById(roleId: number | string): string | undefined {
  const id = Number(roleId);
  switch (id) {
    case ROLE_ID.HR_ADMIN:
      return 'hr_admin';
    case ROLE_ID.MANAGER:
      return 'manager';
    case ROLE_ID.EMPLOYEE:
      return 'employee';
    default:
      return undefined;
  }
}

export const ROLE_LABELS: { [key: string]: string } = {
  hr_admin: 'HR Admin',
  manager: 'Manager',
  employee: 'Employee',
};

// Optionally, add a reverse mapping for backend integration
export const ROLE_NAME_TO_ID: { [key: string]: number } = {
  hr_admin: ROLE_ID.HR_ADMIN,
  manager: ROLE_ID.MANAGER,
  employee: ROLE_ID.EMPLOYEE,
}; 