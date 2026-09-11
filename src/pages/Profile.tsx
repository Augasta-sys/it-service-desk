import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  Activity,
  BadgeCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Mail,
  Pencil,
  Phone,
  Search,
  ShieldCheck,
  User as UserIcon,
  UsersRound,
  X,
} from "lucide-react";

import { useAuth } from "../hooks/useAuth";
import { updateUser, getUsers } from "../services/userService";

import type { User } from "../types/user";

import ProfileForm from "../components/Profile/ProfileForm";

/* =========================================================
   PROFILE PAGE
========================================================= */

const Profile = () => {
  const { user, updateUser: updateAuthUser } = useAuth();

  const [showEditForm, setShowEditForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  /* =======================================================
     ADMIN TEAM DIRECTORY
  ======================================================= */

  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamSearch, setTeamSearch] = useState("");

  /* =======================================================
     SELECTED TEAM MEMBER
  ======================================================= */

  const [selectedMember, setSelectedMember] =
    useState<User | null>(null);

  /* =======================================================
     LOAD TEAM MEMBERS
  ======================================================= */

  useEffect(() => {
    if (!user || user.role !== "admin") {
      return;
    }

    const loadTeamMembers = async () => {
      try {
        setTeamLoading(true);

        const users = await getUsers();

        setTeamMembers(
          users.filter((item) => item.id !== user.id)
        );
      } catch (err) {
        console.error(
          "Failed to load team members:",
          err
        );
      } finally {
        setTeamLoading(false);
      }
    };

    loadTeamMembers();
  }, [user]);

  /* =======================================================
     LOCK BACKGROUND SCROLL WHEN VIEW PROFILE POPUP OPENS
  ======================================================= */

  useEffect(() => {
    if (!selectedMember) {
      return;
    }

    const previousBodyOverflow =
      document.body.style.overflow;

    const previousHtmlOverflow =
      document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousBodyOverflow;

      document.documentElement.style.overflow =
        previousHtmlOverflow;
    };
  }, [selectedMember]);

  /* =======================================================
     TEAM SEARCH
  ======================================================= */

  const filteredTeamMembers = useMemo(() => {
    const search = teamSearch.toLowerCase().trim();

    if (!search) {
      return teamMembers;
    }

    return teamMembers.filter((member) => {
      return (
        member.fullName
          .toLowerCase()
          .includes(search) ||
        member.email
          .toLowerCase()
          .includes(search) ||
        member.department
          .toLowerCase()
          .includes(search) ||
        member.role
          .toLowerCase()
          .includes(search)
      );
    });
  }, [teamMembers, teamSearch]);

  /* =======================================================
     USER CHECK
  ======================================================= */

  if (!user) {
    return null;
  }

  /* =======================================================
     ROLE LABEL
  ======================================================= */

  const roleLabel = {
    admin: "Administrator",
    support_agent: "Support Agent",
    employee: "Employee",
  }[user.role];

  /* =======================================================
     STATUS LABEL
  ======================================================= */

  const statusLabel =
    user.status === "active" ? "Active" : "Inactive";

  /* =======================================================
     CURRENT USER INITIALS
  ======================================================= */

  const initials = user.fullName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  /* =======================================================
     TEAM STATISTICS
  ======================================================= */

  const teamStats = {
    total: teamMembers.length,

    active: teamMembers.filter(
      (member) => member.status === "active"
    ).length,

    supportAgents: teamMembers.filter(
      (member) => member.role === "support_agent"
    ).length,

    employees: teamMembers.filter(
      (member) => member.role === "employee"
    ).length,
  };

  /* =======================================================
     UPDATE OWN PROFILE
  ======================================================= */

  const handleUpdateProfile = async (
    updatedUser: User
  ) => {
    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      const savedUser = await updateUser(user.id, {
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        password: updatedUser.password,
        phone: updatedUser.phone,
        department: updatedUser.department,
      });

      const completeUser: User = {
        ...user,
        ...savedUser,
      };

      updateAuthUser(completeUser);

      setShowEditForm(false);

      setSuccessMessage(
        "Profile updated successfully."
      );
    } catch (err) {
      console.error(
        "Failed to update profile:",
        err
      );

      setError(
        "Unable to update profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="space-y-6 pb-8">
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Account
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            My Profile
          </h1>

          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            View and manage your personal account
            information.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm sm:self-auto">
          <span
            className={`h-2 w-2 rounded-full ${
              user.status === "active"
                ? "bg-emerald-500"
                : "bg-slate-400"
            }`}
          />

          {statusLabel} account
        </div>
      </div>

      {/* =====================================================
          SUCCESS MESSAGE
      ====================================================== */}

      {successMessage && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 size={18} />

          <span className="flex-1">
            {successMessage}
          </span>

          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            className="rounded-md p-1 transition hover:bg-emerald-100"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* =====================================================
          ERROR MESSAGE
      ====================================================== */}

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <Activity size={18} />

          <span className="flex-1">
            {error}
          </span>

          <button
            type="button"
            onClick={() => setError("")}
            className="rounded-md p-1 transition hover:bg-red-100"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* =====================================================
          PROFILE HERO
      ====================================================== */}

      <section className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-md">
        <div className="border-t-4 border-t-slate-900 bg-slate-900 px-5 py-7 sm:px-8 sm:py-8 lg:px-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-col items-center gap-5 sm:flex-row">
              {/* Avatar */}

              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl font-bold text-slate-900 shadow-lg transition duration-300 group-hover:scale-105 sm:h-24 sm:w-24">
                {initials}

                <span
                  className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-4 border-slate-900 ${
                    user.status === "active"
                      ? "bg-emerald-500"
                      : "bg-slate-400"
                  }`}
                />
              </div>

              {/* User information */}

              <div className="min-w-0 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <h2 className="truncate text-xl font-bold text-white sm:text-2xl">
                    {user.fullName}
                  </h2>

                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-200">
                    <BadgeCheck size={13} />
                    {roleLabel}
                  </span>
                </div>

                <p className="mt-2 flex items-center justify-center gap-2 text-sm text-slate-300 sm:justify-start">
                  <Mail size={15} />

                  <span className="break-all">
                    {user.email}
                  </span>
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Member since {user.createdDate}
                </p>
              </div>
            </div>

            {/* Edit button */}

            <button
              type="button"
              onClick={() => {
                setError("");
                setSuccessMessage("");
                setShowEditForm(true);
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-md active:scale-95 sm:w-auto"
            >
              <Pencil size={16} />

              Edit Profile
            </button>
          </div>
        </div>

        {/* =====================================================
            PERSONAL INFORMATION
        ====================================================== */}

        <div className="p-5 sm:p-7 lg:p-8">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Account details
            </p>

            <h3 className="mt-1 text-lg font-bold text-slate-900">
              Personal Information
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Your account and contact information.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ProfileInfoCard
              icon={<UserIcon size={18} />}
              iconClass="bg-blue-50 text-blue-600"
              label="Full Name"
              value={user.fullName}
            />

            <ProfileInfoCard
              icon={<Mail size={18} />}
              iconClass="bg-cyan-50 text-cyan-600"
              label="Email Address"
              value={user.email}
            />

            <ProfileInfoCard
              icon={<Phone size={18} />}
              iconClass="bg-violet-50 text-violet-600"
              label="Phone"
              value={user.phone || "Not provided"}
            />

            <ProfileInfoCard
              icon={<Building2 size={18} />}
              iconClass="bg-amber-50 text-amber-600"
              label="Department"
              value={user.department}
            />

            <ProfileInfoCard
              icon={<ShieldCheck size={18} />}
              iconClass="bg-indigo-50 text-indigo-600"
              label="Role"
              value={roleLabel}
            />

            <ProfileInfoCard
              icon={<CheckCircle2 size={18} />}
              iconClass="bg-emerald-50 text-emerald-600"
              label="Account Status"
              value={statusLabel}
              badge={user.status === "active"}
            />

            <ProfileInfoCard
              icon={<UserIcon size={18} />}
              iconClass="bg-slate-100 text-slate-600"
              label="User ID"
              value={user.id}
            />

            <ProfileInfoCard
              icon={<CalendarDays size={18} />}
              iconClass="bg-orange-50 text-orange-600"
              label="Account Created"
              value={user.createdDate}
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          ACCOUNT OVERVIEW
      ====================================================== */}

      <section>
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-900">
            Account Overview
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            A quick summary of your account.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <OverviewCard
            icon={<ShieldCheck size={20} />}
            label="Access Level"
            value={roleLabel}
            description="Current system role"
            iconClass="bg-indigo-50 text-indigo-600"
          />

          <OverviewCard
            icon={<Building2 size={20} />}
            label="Department"
            value={user.department}
            description="Assigned department"
            iconClass="bg-blue-50 text-blue-600"
          />

          <OverviewCard
            icon={<CheckCircle2 size={20} />}
            label="Account Status"
            value={statusLabel}
            description="Current account state"
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <OverviewCard
            icon={<CalendarDays size={20} />}
            label="Member Since"
            value={user.createdDate}
            description="Account creation date"
            iconClass="bg-amber-50 text-amber-600"
          />
        </div>
      </section>

      {/* =====================================================
          SECURITY
      ====================================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 border-t-4 border-t-emerald-500 bg-white shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-md">
        <div className="p-5 sm:p-7">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
              Account protection
            </p>

            <h3 className="mt-1 text-lg font-bold text-slate-900">
              Security & Access
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Information about your account access and
              protection.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <SecurityCard
              icon={<ShieldCheck size={20} />}
              title="Password Protected"
              description="Your account requires a password to sign in."
              status="Enabled"
            />

            <SecurityCard
              icon={<Mail size={20} />}
              title="Email Account"
              description="Your registered email is used for account access."
              status="Configured"
            />

            <SecurityCard
              icon={<Clock3 size={20} />}
              title="Account Access"
              description="Your account status controls system access."
              status={statusLabel}
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          ADMIN TEAM DIRECTORY
      ====================================================== */}

      {user.role === "admin" && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 border-t-4 border-t-indigo-500 bg-white shadow-sm">
          {/* Header */}

          <div className="border-b border-slate-100 p-5 sm:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
                  Administration
                </p>

                <h3 className="mt-1 flex items-center gap-2 text-lg font-bold text-slate-900">
                  <UsersRound size={20} />

                  Team Directory
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Quickly view employees and support
                  agents in your organization.
                </p>
              </div>

              {/* Search */}

              <div className="relative w-full lg:max-w-sm">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={teamSearch}
                  onChange={(event) =>
                    setTeamSearch(event.target.value)
                  }
                  placeholder="Search team members..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            {/* Stats */}

            <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <MiniStat
                label="Team Members"
                value={teamStats.total}
              />

              <MiniStat
                label="Active"
                value={teamStats.active}
              />

              <MiniStat
                label="Support Agents"
                value={teamStats.supportAgents}
              />

              <MiniStat
                label="Employees"
                value={teamStats.employees}
              />
            </div>
          </div>

          {/* Team */}

          <div className="p-5 sm:p-7">
            {teamLoading ? (
              <div className="flex min-h-32 items-center justify-center text-sm text-slate-500">
                Loading team members...
              </div>
            ) : filteredTeamMembers.length === 0 ? (
              <div className="flex min-h-32 flex-col items-center justify-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <UsersRound size={21} />
                </div>

                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No team members found
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Try changing your search.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredTeamMembers.map((member) => {
                  const memberInitials =
                    member.fullName
                      .split(" ")
                      .map((name) => name[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();

                  const memberRole =
                    member.role === "support_agent"
                      ? "Support Agent"
                      : "Employee";

                  return (
                    <div
                      key={member.id}
                      className="group rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700 transition group-hover:bg-indigo-50 group-hover:text-indigo-700">
                            {memberInitials}
                          </div>

                          <div className="min-w-0">
                            <h4 className="truncate text-sm font-bold text-slate-900">
                              {member.fullName}
                            </h4>

                            <p className="mt-0.5 truncate text-xs text-slate-500">
                              {member.email}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                            member.status === "active"
                              ? "bg-emerald-500"
                              : "bg-slate-400"
                          }`}
                        />
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
                          {memberRole}
                        </span>

                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                          {member.department}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedMember(member)
                        }
                        className="mt-4 flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition-all duration-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-black active:scale-[0.98]"
                      >
                        View Profile

                        <ChevronRight
                          size={15}
                          className="transition-transform duration-200 group-hover:translate-x-1"
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* =====================================================
    ADMIN MEMBER DETAILS MODAL
====================================================== */}
{selectedMember && (
  <div
    className="
      fixed inset-0 z-[9999]
      flex items-center justify-center
      overflow-hidden
      bg-slate-950/60
      p-3
      backdrop-blur-sm
      sm:p-5
    "
  >
    {/* Modal */}
    <div
      className="
        profile-view-modal
        flex
        max-h-[calc(100vh-24px)]
        w-full
        max-w-2xl
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-2xl
        sm:max-h-[calc(100vh-40px)]
      "
    >
      {/* =================================================
          MODAL HEADER
      ================================================== */}
      <div
        className="
          shrink-0
          border-b
          border-slate-200
          bg-white
          px-5
          py-4
          sm:px-6
          sm:py-5
        "
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 sm:text-xs">
              Team Member
            </p>

            <h3 className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">
              Profile Details
            </h3>

            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              View team member information
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSelectedMember(null)}
            aria-label="Close profile details"
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-white
              text-slate-500
              transition-all
              duration-200
              hover:border-slate-300
              hover:bg-slate-50
              hover:text-slate-900
              active:scale-95
            "
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* =================================================
          SCROLLABLE CONTENT
      ================================================== */}
      <div
        className="
          profile-view-modal-body
          min-h-0
          flex-1
          overflow-y-auto
          overflow-x-hidden
          bg-white
          px-4
          py-5
          sm:px-6
          sm:py-6
        "
      >
        {/* Member Hero */}
        <div
          className="
            rounded-2xl
            border
            border-slate-200
            border-t-4
            border-t-slate-900
            bg-slate-50
            p-4
            transition-all
            duration-300
            hover:border-slate-300
            hover:shadow-sm
            sm:p-5
          "
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Avatar */}
            <div
              className="
                flex
                h-16
                w-16
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-slate-900
                text-xl
                font-bold
                text-white
                shadow-md
                sm:h-20
                sm:w-20
                sm:text-2xl
              "
            >
              {selectedMember.fullName
                .split(" ")
                .map((name) => name[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>

            {/* Member information */}
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-lg font-bold text-slate-900 sm:text-xl">
                {selectedMember.fullName}
              </h4>

              <p className="mt-1 break-all text-xs text-slate-500 sm:text-sm">
                {selectedMember.email}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-full
                    border
                    border-indigo-200
                    bg-indigo-50
                    px-2.5
                    py-1
                    text-[11px]
                    font-semibold
                    text-indigo-700
                  "
                >
                  <ShieldCheck size={13} />

                  {selectedMember.role === "support_agent"
                    ? "Support Agent"
                    : "Employee"}
                </span>

                <span
                  className={`
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-full
                    border
                    px-2.5
                    py-1
                    text-[11px]
                    font-semibold
                    ${
                      selectedMember.status === "active"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-slate-100 text-slate-600"
                    }
                  `}
                >
                  <span
                    className={`
                      h-1.5
                      w-1.5
                      rounded-full
                      ${
                        selectedMember.status === "active"
                          ? "bg-emerald-500"
                          : "bg-slate-400"
                      }
                    `}
                  />

                  {selectedMember.status === "active"
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            CONTACT & ORGANIZATION
        ================================================== */}
        <div className="mt-6">
          <div className="mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 sm:text-xs">
              Contact & Organization
            </p>

            <h4 className="mt-1 text-sm font-bold text-slate-900 sm:text-base">
              Personal Information
            </h4>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ModalInfo
              icon={<UserIcon size={16} />}
              label="Full Name"
              value={selectedMember.fullName}
            />

            <ModalInfo
              icon={<Mail size={16} />}
              label="Email"
              value={selectedMember.email}
            />

            <ModalInfo
              icon={<Phone size={16} />}
              label="Phone"
              value={selectedMember.phone || "Not provided"}
            />

            <ModalInfo
              icon={<Building2 size={16} />}
              label="Department"
              value={selectedMember.department || "Not provided"}
            />

            <ModalInfo
              icon={<ShieldCheck size={16} />}
              label="Role"
              value={
                selectedMember.role === "support_agent"
                  ? "Support Agent"
                  : "Employee"
              }
            />

            <ModalInfo
              icon={<Activity size={16} />}
              label="Status"
              value={
                selectedMember.status === "active"
                  ? "Active"
                  : "Inactive"
              }
            />

            <ModalInfo
              icon={<UserIcon size={16} />}
              label="User ID"
              value={selectedMember.id}
            />

            <ModalInfo
              icon={<CalendarDays size={16} />}
              label="Account Created"
              value={selectedMember.createdDate}
            />
          </div>
        </div>

        {/* =================================================
            ACCESS LEVEL
        ================================================== */}
        <div
          className="
            mt-5
            rounded-2xl
            border
            border-indigo-100
            border-t-4
            border-t-indigo-500
            bg-indigo-50/40
            p-4
            sm:p-5
          "
        >
          <div className="flex items-start gap-3">
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-white
                text-indigo-600
                shadow-sm
              "
            >
              <ShieldCheck size={19} />
            </div>

            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-900">
                Access Level
              </h4>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                This team member is registered as a{" "}
                <span className="font-semibold text-indigo-700">
                  {selectedMember.role === "support_agent"
                    ? "Support Agent"
                    : "Employee"}
                </span>{" "}
                in the service desk system.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          MODAL FOOTER
      ================================================== */}
      <div
        className="
          shrink-0
          border-t
          border-slate-200
          bg-white
          p-3
          sm:p-4
        "
      >   
      </div>
    </div>
  </div>
)}

      {/* =====================================================
          EDIT PROFILE
      ====================================================== */}

      {showEditForm && (
        <ProfileForm
          user={user}
          onSubmit={handleUpdateProfile}
          onCancel={() => {
            if (!saving) {
              setShowEditForm(false);
            }
          }}
          loading={saving}
        />
      )}
    </div>
  );
};

/* =========================================================
   PROFILE INFO CARD
========================================================= */

interface ProfileInfoCardProps {
  icon: ReactNode;
  iconClass: string;
  label: string;
  value: string;
  badge?: boolean;
}

const ProfileInfoCard = ({
  icon,
  iconClass,
  label,
  value,
  badge = false,
}: ProfileInfoCardProps) => {
  return (
    <div className="group rounded-xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 ${iconClass}`}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </p>

          {badge ? (
            <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

              {value}
            </span>
          ) : (
            <p className="mt-1 break-words text-sm font-semibold text-slate-900">
              {value}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   OVERVIEW CARD
========================================================= */

interface OverviewCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  description: string;
  iconClass: string;
}

const OverviewCard = ({
  icon,
  label,
  value,
  description,
  iconClass,
}: OverviewCardProps) => {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl transition duration-300 group-hover:scale-105 ${iconClass}`}
        >
          {icon}
        </div>

        <ChevronRight
          size={17}
          className="text-slate-300 transition duration-300 group-hover:translate-x-1 group-hover:text-slate-500"
        />
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-base font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
};

/* =========================================================
   SECURITY CARD
========================================================= */

interface SecurityCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  status: string;
}

const SecurityCard = ({
  icon,
  title,
  description,
  status,
}: SecurityCardProps) => {
  return (
    <div className="group rounded-xl border border-slate-200 p-4 transition-all duration-300 hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:scale-105">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-sm font-bold text-slate-900">
              {title}
            </h4>

            <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700">
              {status}
            </span>
          </div>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   MINI STAT
========================================================= */

interface MiniStatProps {
  label: string;
  value: number;
}

const MiniStat = ({
  label,
  value,
}: MiniStatProps) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 transition-all duration-200 hover:border-indigo-200 hover:bg-indigo-50/40">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
};

/* =========================================================
   MODAL INFO
========================================================= */

interface ModalInfoProps {
  icon: ReactNode;
  label: string;
  value: string;
}

const ModalInfo = ({
  icon,
  label,
  value,
}: ModalInfoProps) => {
  return (
    <div className="group rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all duration-200 hover:border-indigo-200 hover:bg-indigo-50/30 hover:shadow-sm">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}

        <span className="text-[10px] font-bold uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="mt-1 break-all text-sm font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
};

export default Profile;