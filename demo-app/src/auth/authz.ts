import { User } from "next-auth";

export enum AuthzUserRole {
  admin = "admin",
  employee = "employee",
  manager = "manager",
}

export enum AuthzAction {
  viewAdminPage = "viewAdminPage",
  archiveEmployee = "archiveEmployee",
  getEmployeesAll = "getEmployeesAll",
  viewUserPage = "viewUserPage",
  getEmployeesMe = "getEmployeesMe",
  viewBrowsePage = "viewBrowsePage",
}

// The mappings between user roles and allowed actions
const ROLES_MAPPINGS = {
  admin: [
    AuthzAction.viewAdminPage,
    AuthzAction.archiveEmployee,
    AuthzAction.getEmployeesAll,
    AuthzAction.viewUserPage,
    AuthzAction.getEmployeesMe,
    AuthzAction.viewBrowsePage,
  ],
  manager: [
    AuthzAction.viewUserPage,
    AuthzAction.getEmployeesMe,
    AuthzAction.getEmployeesAll,
  ],
  employee: [AuthzAction.viewUserPage, AuthzAction.getEmployeesMe],
};

// Setup the admin users using environment variables
let getAdminUsers = () => {
  return ((process.env.ROLE_ADMIN as string) || "")
    .split(",")
    .map((o) => o.toLowerCase().trim());
};

let getManagerUsers = () => {
  return ((process.env.ROLE_MANAGER as string) || "")
    .split(",")
    .map((o) => o.toLowerCase().trim());
};

/**
 * Used to determine if a user is authorized to perform a specific action
 * @param user the user object which the action is authorized against
 * @param actionsToChecks a single AuthzAction or array of AuthzActions to authorize against
 * @returns true if the user is authorized
 */
export const isAuthorizied = (
  user: User | null | undefined,
  actionsToChecks: AuthzAction | AuthzAction[]
) => {
  let role = getUserRole(user);
  if (!role) {
    return false;
  }
  let authorizedActionsForRole = ROLES_MAPPINGS[role] || [];

  let actionList = Array.isArray(actionsToChecks)
    ? actionsToChecks
    : [actionsToChecks];
  for (let action of actionList) {
    if (authorizedActionsForRole.includes(action)) {
      return true;
    }
  }

  return false;
};

/**
 * Returns a user's assigned role
 * @param user the user object that we will retrieve the role for
 * @returns the user's role or null if not authenticated
 */
export const getUserRole = (user?: User | null): AuthzUserRole | null => {
  if (!user) {
    return null;
  }

  if (user && getAdminUsers().find((o) => o === user?.email)) {
    return AuthzUserRole.admin;
  }

  if (user && getManagerUsers().find((o) => o === user?.email)) {
    return AuthzUserRole.manager;
  }

  return AuthzUserRole.employee;
};
