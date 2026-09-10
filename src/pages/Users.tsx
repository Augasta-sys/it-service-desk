import { useEffect, useMemo, useState } from "react";
import {
  UserPlus,
  Pencil,
  Trash2,
  UserCheck,
  UserX,
  X,
  Users as UsersIcon,
  ShieldCheck,
  UserRoundCheck,
  UserRoundX,
  Building2,
  TrendingUp,
} from "lucide-react";

import type { User } from "../types/user";

import {
  getUsers,
  createUser,
  deleteUser,
  updateUser,
} from "../services/userService";

import { useAuth } from "../hooks/useAuth";

import UserForm from "../components/Users/UserForm";
import ConfirmModal from "../components/common/ConfirmModal";

const Users = () => {
  const { user } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [savingUser, setSavingUser] = useState(false);

  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);

  /*
   * Load users
   */
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getUsers();

      setUsers(data);
    } catch (err) {
      console.error("Failed to load users:", err);

      setError("Unable to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // The data-fetching function updates local state, so this call is
    // intentionally performed from the effect after the component mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUsers();
  }, []);

  /*
   * Generate User ID
   */
  const generateUserId = () => {
    const numericIds = users
      .map((item) => {
        const match = item.id.match(/^USR(\d+)$/);

        return match ? Number(match[1]) : 0;
      })
      .filter((id) => id > 0);

    const highestId =
      numericIds.length > 0 ? Math.max(...numericIds) : 0;

    return `USR${String(highestId + 1).padStart(3, "0")}`;
  };

  /*
   * Create User
   */
  const handleCreateUser = async (newUser: User) => {
    try {
      setSavingUser(true);
      setError("");

      const userWithId: User = {
        ...newUser,
        id: generateUserId(),
      };

      const createdUser = await createUser(userWithId);

      setUsers((previousUsers) => [
        ...previousUsers,
        createdUser,
      ]);

      setEditingUser(null);
      setShowUserForm(false);
    } catch (err) {
      console.error("Failed to create user:", err);

      setError("Unable to create user. Please try again.");
    } finally {
      setSavingUser(false);
    }
  };

  /*
   * Edit User
   */
  const handleEditUser = async (updatedUser: User) => {
    try {
      setSavingUser(true);
      setError("");

      const updatedData = await updateUser(
        updatedUser.id,
        updatedUser
      );

      setUsers((previousUsers) =>
        previousUsers.map((item) =>
          item.id === updatedData.id ? updatedData : item
        )
      );

      setEditingUser(null);
      setShowUserForm(false);
    } catch (err) {
      console.error("Failed to update user:", err);

      setError("Unable to update user. Please try again.");
    } finally {
      setSavingUser(false);
    }
  };

  /*
   * Activate / Deactivate User
   */
  const handleToggleStatus = async (selectedUser: User) => {
    try {
      setError("");

      const newStatus =
        selectedUser.status === "active"
          ? "inactive"
          : "active";

      const updatedUser = await updateUser(
        selectedUser.id,
        {
          status: newStatus,
        }
      );

      setUsers((previousUsers) =>
        previousUsers.map((item) =>
          item.id === updatedUser.id ? updatedUser : item
        )
      );
    } catch (err) {
      console.error("Failed to update user status:", err);

      setError(
        "Unable to update user status. Please try again."
      );
    }
  };

  /*
   * Delete User
   */
  const handleDelete = async () => {
    if (!userToDelete) {
      return;
    }

    try {
      setDeletingUser(true);
      setError("");

      await deleteUser(userToDelete.id);

      setUsers((previousUsers) =>
        previousUsers.filter(
          (item) => item.id !== userToDelete.id
        )
      );

      setUserToDelete(null);
    } catch (err) {
      console.error("Failed to delete user:", err);

      setError("Unable to delete user. Please try again.");
    } finally {
      setDeletingUser(false);
    }
  };

  /*
   * Role label
   */
  const getRoleLabel = (role: User["role"]) => {
    switch (role) {
      case "admin":
        return "Admin";

      case "support_agent":
        return "Support Agent";

      case "employee":
        return "Employee";

      default:
        return role;
    }
  };

  /*
   * User statistics
   */
  const statistics = useMemo(() => {
    const total = users.length;

    const active = users.filter(
      (item) => item.status === "active"
    ).length;

    const inactive = users.filter(
      (item) => item.status === "inactive"
    ).length;

    const supportAgents = users.filter(
      (item) => item.role === "support_agent"
    ).length;

    const admins = users.filter(
      (item) => item.role === "admin"
    ).length;

    const employees = users.filter(
      (item) => item.role === "employee"
    ).length;

    return {
      total,
      active,
      inactive,
      supportAgents,
      admins,
      employees,
    };
  }, [users]);

  /*
   * Role distribution
   */
  const roleDistribution = useMemo(() => {
    const total = users.length || 1;

    const admin = users.filter(
      (item) => item.role === "admin"
    ).length;

    const supportAgent = users.filter(
      (item) => item.role === "support_agent"
    ).length;

    const employee = users.filter(
      (item) => item.role === "employee"
    ).length;

    const adminPercentage = (admin / total) * 100;

    const supportPercentage =
      (supportAgent / total) * 100;

    return {
      admin,
      supportAgent,
      employee,
      adminPercentage,
      supportPercentage,
    };
  }, [users]);

  /*
   * Department distribution
   */
  const departmentDistribution = useMemo(() => {
    const counts: Record<string, number> = {};

    users.forEach((item) => {
      const department =
        item.department.trim() || "Unassigned";

      counts[department] =
        (counts[department] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([department, count]) => ({
        department,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [users]);

  const maxDepartmentCount =
    departmentDistribution.length > 0
      ? Math.max(
          ...departmentDistribution.map(
            (item) => item.count
          )
        )
      : 1;

  /*
   * Admin-only access
   *
   * IMPORTANT:
   * This comes AFTER all hooks.
   */
  if (!user || user.role !== "admin") {
    return (
      <div className="rounded-2xl border border-red-200 border-t-4 border-t-red-500 bg-white p-6 shadow-sm transition-all duration-300 hover:border-red-300 hover:shadow-md sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <ShieldCheck size={21} />
          </div>

          <div>
            <h1 className="text-lg font-bold text-slate-900">
              Access Denied
            </h1>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              You do not have permission to manage users.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*
   * Loading state
   */
  if (loading) {
    return (
      <div className="flex min-h-80 items-center justify-center rounded-2xl border border-slate-200 border-t-4 border-t-indigo-500 bg-white shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />

          <p className="text-sm font-medium text-slate-500">
            Loading users...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5 sm:space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <UsersIcon size={19} />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Users
            </h1>

            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              Manage service desk users and their roles.
            </p>
          </div>
        </div>

        {/* Add User */}
        <button
          type="button"
          onClick={() => {
            setError("");
            setEditingUser(null);
            setShowUserForm(true);
          }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-900 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-700 hover:bg-slate-800 hover:shadow-lg active:translate-y-0 active:scale-[0.98] sm:w-auto"
        >
          <UserPlus size={17} />
          Add User
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 border-t-4 border-t-red-500 bg-white px-4 py-3 shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <X size={15} />
            </div>

            <p className="text-sm font-medium leading-6 text-red-700">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-4">

        {/* Total */}
        <div className="group rounded-2xl border border-indigo-100 border-t-4 border-t-indigo-500 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:border-t-indigo-600 hover:shadow-lg sm:p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total Users
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                {statistics.total}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                All registered users
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-indigo-100">
              <UsersIcon size={19} />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-indigo-600">
            <TrendingUp size={14} />
            User overview
          </div>
        </div>

        {/* Active */}
        <div className="group rounded-2xl border border-emerald-100 border-t-4 border-t-emerald-500 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:border-t-emerald-600 hover:shadow-lg sm:p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Active Users
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                {statistics.active}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Currently active
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-100">
              <UserRoundCheck size={19} />
            </div>
          </div>

          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-700"
              style={{
                width: `${
                  statistics.total > 0
                    ? (statistics.active /
                        statistics.total) *
                      100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        {/* Inactive */}
        <div className="group rounded-2xl border border-red-100 border-t-4 border-t-red-500 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-red-200 hover:border-t-red-600 hover:shadow-lg sm:p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Inactive Users
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                {statistics.inactive}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Disabled accounts
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-red-100">
              <UserRoundX size={19} />
            </div>
          </div>

          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-red-500 transition-all duration-700"
              style={{
                width: `${
                  statistics.total > 0
                    ? (statistics.inactive /
                        statistics.total) *
                      100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        {/* Support Agents */}
        <div className="group rounded-2xl border border-cyan-100 border-t-4 border-t-cyan-500 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:border-t-cyan-600 hover:shadow-lg sm:p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Support Agents
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                {statistics.supportAgents}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Service desk agents
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-cyan-100">
              <UserCheck size={19} />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-cyan-600">
            <span className="h-2 w-2 rounded-full bg-cyan-500" />

            {statistics.admins} admin
            {statistics.admins !== 1 ? "s" : ""}

            <span className="text-slate-300">•</span>

            {statistics.employees} employee
            {statistics.employees !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_1fr]">

        {/* Department Chart */}
        <div className="overflow-hidden rounded-2xl border border-indigo-100 border-t-4 border-t-indigo-500 bg-white shadow-sm transition-all duration-300 hover:border-indigo-200 hover:border-t-indigo-600 hover:shadow-md">

          <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                  Users by Department
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Distribution across departments.
                </p>
              </div>

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Building2 size={17} />
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            {departmentDistribution.length === 0 ? (
              <div className="flex min-h-52 items-center justify-center">
                <p className="text-sm text-slate-400">
                  No department data available.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {departmentDistribution.map(
                  (item, index) => {
                    const percentage =
                      (item.count /
                        maxDepartmentCount) *
                      100;

                    return (
                      <div
                        key={item.department}
                        className="group"
                      >
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[10px] font-bold text-slate-500 transition-all duration-300 group-hover:bg-indigo-50 group-hover:text-indigo-600">
                              {index + 1}
                            </span>

                            <span className="truncate text-xs font-semibold text-slate-700 sm:text-sm">
                              {item.department}
                            </span>
                          </div>

                          <span className="text-xs font-bold text-slate-900">
                            {item.count}
                          </span>
                        </div>

                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-indigo-500 transition-all duration-700 group-hover:bg-indigo-600"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </div>

        {/* Role Donut */}
        <div className="overflow-hidden rounded-2xl border border-violet-100 border-t-4 border-t-violet-500 bg-white shadow-sm transition-all duration-300 hover:border-violet-200 hover:border-t-violet-600 hover:shadow-md">

          <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                  Role Distribution
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Distribution by user role.
                </p>
              </div>

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                <ShieldCheck size={17} />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-6 p-5 sm:p-6 md:flex-row xl:flex-col 2xl:flex-row">

            {/* Donut */}
            <div className="relative h-40 w-40 shrink-0 sm:h-44 sm:w-44">
              <div
                className="h-full w-full rounded-full transition-transform duration-500 hover:scale-105"
                style={{
                  background:
                    users.length === 0
                      ? "conic-gradient(#e2e8f0 0deg 360deg)"
                      : `conic-gradient(
                          #7c3aed 0deg ${
                            roleDistribution.adminPercentage *
                            3.6
                          }deg,
                          #0891b2 ${
                            roleDistribution.adminPercentage *
                            3.6
                          }deg ${
                            (roleDistribution.adminPercentage +
                              roleDistribution.supportPercentage) *
                            3.6
                          }deg,
                          #4f46e5 ${
                            (roleDistribution.adminPercentage +
                              roleDistribution.supportPercentage) *
                            3.6
                          }deg 360deg
                        )`,
                }}
              />

              <div className="absolute inset-[22%] flex flex-col items-center justify-center rounded-full bg-white shadow-inner">
                <span className="text-2xl font-bold text-slate-900">
                  {statistics.total}
                </span>

                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Users
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="w-full max-w-xs space-y-3">

              <div className="flex items-center justify-between rounded-xl border border-violet-100 bg-violet-50/40 px-3 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50 hover:shadow-sm">
                <div className="flex items-center gap-2.5">
                  <span className="h-3 w-3 rounded-full bg-violet-600" />

                  <span className="text-xs font-semibold text-slate-700">
                    Admin
                  </span>
                </div>

                <span className="text-sm font-bold text-slate-900">
                  {roleDistribution.admin}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-cyan-100 bg-cyan-50/40 px-3 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-cyan-50 hover:shadow-sm">
                <div className="flex items-center gap-2.5">
                  <span className="h-3 w-3 rounded-full bg-cyan-600" />

                  <span className="text-xs font-semibold text-slate-700">
                    Support Agent
                  </span>
                </div>

                <span className="text-sm font-bold text-slate-900">
                  {roleDistribution.supportAgent}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50/40 px-3 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:shadow-sm">
                <div className="flex items-center gap-2.5">
                  <span className="h-3 w-3 rounded-full bg-indigo-600" />

                  <span className="text-xs font-semibold text-slate-700">
                    Employee
                  </span>
                </div>

                <span className="text-sm font-bold text-slate-900">
                  {roleDistribution.employee}
                </span>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl border border-indigo-100 border-t-4 border-t-indigo-500 bg-white shadow-sm transition-all duration-300 hover:border-indigo-200 hover:border-t-indigo-600 hover:shadow-md">

        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="text-sm font-bold text-slate-900 sm:text-base">
              All Users
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {users.length}{" "}
              {users.length === 1 ? "user" : "users"}{" "}
              registered in the service desk.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
            <UsersIcon size={14} />
            {users.length} Total
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[820px] w-full table-fixed">

            <colgroup>
              <col className="w-[23%]" />
              <col className="w-[15%]" />
              <col className="w-[15%]" />
              <col className="w-[12%]" />
              <col className="w-[13%]" />
              <col className="w-[22%]" />
            </colgroup>

            <thead className="border-b border-slate-200 bg-slate-50/80">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:px-5">
                  User
                </th>

                <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Department
                </th>

                <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Role
                </th>

                <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Status
                </th>

                <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Created
                </th>

                <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:px-5">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {users.map((item) => (
                <tr
                  key={item.id}
                  className="group transition-all duration-300 hover:bg-slate-50/80"
                >
                  {/* User */}
                  <td className="px-4 py-3.5 sm:px-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-600 transition-all duration-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:shadow-sm">
                        {item.fullName
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-slate-900 sm:text-sm">
                          {item.fullName}
                        </p>

                        <p className="mt-0.5 truncate text-[10px] text-slate-500 sm:text-xs">
                          {item.email}
                        </p>

                        <p className="mt-0.5 text-[9px] font-medium text-slate-400">
                          {item.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Department */}
                  <td className="px-3 py-3.5">
                    <span className="break-words text-xs font-medium text-slate-600">
                      {item.department || "—"}
                    </span>
                  </td>

                  {/* Role */}
                  <td className="px-3 py-3.5">
                    <span
                      className={`inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-[10px] font-bold transition-all duration-300 group-hover:shadow-sm ${
                        item.role === "admin"
                          ? "bg-violet-100 text-violet-700"
                          : item.role === "support_agent"
                            ? "bg-cyan-100 text-cyan-700"
                            : "bg-indigo-100 text-indigo-700"
                      }`}
                    >
                      <span className="truncate">
                        {getRoleLabel(item.role)}
                      </span>
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-3 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold transition-all duration-300 group-hover:shadow-sm ${
                        item.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          item.status === "active"
                            ? "bg-emerald-500"
                            : "bg-red-500"
                        }`}
                      />

                      {item.status === "active"
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </td>

                  {/* Created */}
                  <td className="px-3 py-3.5 text-xs font-medium text-slate-500">
                    {item.createdDate}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 sm:px-5">
                    <div className="flex justify-end gap-1.5">

                      {/* Edit */}
                      <button
                        type="button"
                        title="Edit user"
                        aria-label={`Edit ${item.fullName}`}
                        onClick={() => {
                          setError("");
                          setEditingUser(item);
                          setShowUserForm(true);
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-md active:translate-y-0 active:scale-95"
                      >
                        <Pencil size={14} />
                      </button>

                      {/* Activate / Deactivate */}
                      <button
                        type="button"
                        title={
                          item.status === "active"
                            ? "Deactivate user"
                            : "Activate user"
                        }
                        aria-label={
                          item.status === "active"
                            ? `Deactivate ${item.fullName}`
                            : `Activate ${item.fullName}`
                        }
                        onClick={() =>
                          handleToggleStatus(item)
                        }
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-95 ${
                          item.status === "active"
                            ? "border-amber-200 text-amber-600 hover:bg-amber-50"
                            : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                        }`}
                      >
                        {item.status === "active" ? (
                          <UserX size={14} />
                        ) : (
                          <UserCheck size={14} />
                        )}
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        title="Delete user"
                        aria-label={`Delete ${item.fullName}`}
                        onClick={() => {
                          setError("");
                          setUserToDelete(item);
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-white text-red-500 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-50 hover:text-red-600 hover:shadow-md active:translate-y-0 active:scale-95"
                      >
                        <Trash2 size={14} />
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="border-t border-slate-100 px-6 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
              <UsersIcon size={21} />
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-600">
              No users found.
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Add a user to start managing your service desk team.
            </p>
          </div>
        )}
      </div>

      {/* User Form Modal */}
      {showUserForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-[2px] sm:p-5">

          <div className="hide-scrollbar max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 border-t-4 border-t-indigo-500 bg-white shadow-2xl">

            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">

              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  {editingUser ? (
                    <Pencil size={18} />
                  ) : (
                    <UserPlus size={18} />
                  )}
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-base font-bold text-slate-900 sm:text-lg">
                    {editingUser
                      ? "Edit User"
                      : "Add New User"}
                  </h2>

                  <p className="mt-0.5 truncate text-xs text-slate-500 sm:text-sm">
                    {editingUser
                      ? "Update the user's information."
                      : "Create a new service desk user."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!savingUser) {
                    setEditingUser(null);
                    setShowUserForm(false);
                  }
                }}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all duration-300 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 hover:shadow-sm active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close"
                disabled={savingUser}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6">
              <UserForm
                initialUser={editingUser}
                onSubmit={
                  editingUser
                    ? handleEditUser
                    : handleCreateUser
                }
                onCancel={() => {
                  if (!savingUser) {
                    setEditingUser(null);
                    setShowUserForm(false);
                  }
                }}
              />

              {savingUser && (
                <div className="mt-4 flex items-center justify-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-3">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />

                  <p className="text-xs font-semibold text-indigo-700 sm:text-sm">
                    {editingUser
                      ? "Saving changes..."
                      : "Creating user..."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(userToDelete)}
        title="Delete User"
        message={
          userToDelete
            ? `Are you sure you want to delete ${userToDelete.fullName}?`
            : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => {
          if (!deletingUser) {
            setUserToDelete(null);
          }
        }}
        loading={deletingUser}
      />
    </div>
  );
};

export default Users;