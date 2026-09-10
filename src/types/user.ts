export type UserRole = "admin" | "support_agent" | "employee";

export type UserStatus = "active" | "inactive";

export interface User {
  id: string;
  fullName: string;
  email: string;
  password: string;
  phone: string;
  department: string;
  role: UserRole;
  status: UserStatus;
  createdDate: string;
}