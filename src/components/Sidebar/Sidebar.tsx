import {
  BarChart3,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Ticket,
  UserCircle,
  Users,
  X,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavigationItem {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
}

const Sidebar = ({
  isOpen = false,
  onClose,
}: SidebarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const adminNavigation: NavigationItem[] = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Tickets",
      path: "/tickets",
      icon: Ticket,
    },
    {
      label: "Users",
      path: "/users",
      icon: Users,
    },
    {
      label: "Categories",
      path: "/categories",
      icon: FolderKanban,
    },
    {
      label: "Reports",
      path: "/reports",
      icon: BarChart3,
    },
    {
      label: "Profile",
      path: "/profile",
      icon: UserCircle,
    },
  ];

  const supportAgentNavigation: NavigationItem[] = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "My Tickets",
      path: "/tickets",
      icon: Ticket,
    },
    {
      label: "Profile",
      path: "/profile",
      icon: UserCircle,
    },
  ];

  const employeeNavigation: NavigationItem[] = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Create Ticket",
      path: "/tickets/create",
      icon: PlusCircle,
    },
    {
      label: "My Tickets",
      path: "/my-tickets",
      icon: Ticket,
    },
    {
      label: "Profile",
      path: "/profile",
      icon: UserCircle,
    },
  ];

  const getNavigationItems = (): NavigationItem[] => {
    switch (user.role) {
      case "admin":
        return adminNavigation;

      case "support_agent":
        return supportAgentNavigation;

      case "employee":
        return employeeNavigation;

      default:
        return [];
    }
  };

  const navigationItems = getNavigationItems();

  const getRoleLabel = () => {
    switch (user.role) {
      case "admin":
        return "Administrator";

      case "support_agent":
        return "Support Agent";

      case "employee":
        return "Employee";

      default:
        return "";
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
    onClose?.();
  };

  const handleNavigation = () => {
    onClose?.();
  };

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`app-sidebar ${
          isOpen ? "app-sidebar-open" : ""
        }`}
      >
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">
              <Ticket size={19} strokeWidth={2.2} />
            </div>

            <div className="sidebar-brand-text">
              <h1>Service Desk</h1>

              <p>IT Ticket Management</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="sidebar-close-button"
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* User */}
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            <UserCircle size={24} />
          </div>

          <div className="sidebar-user-info">
            <span className="sidebar-user-label">
              Signed in as
            </span>

            <strong>{user.fullName}</strong>

            <span>{getRoleLabel()}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-navigation">
          <p className="sidebar-section-title">
            Navigation
          </p>

          <div className="sidebar-navigation-list">
            {navigationItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={`${item.label}-${item.path}`}
                  to={item.path}
                  onClick={handleNavigation}
                  className={({ isActive }) =>
                    `sidebar-nav-link ${
                      isActive
                        ? "sidebar-nav-link-active"
                        : ""
                    }`
                  }
                >
                  <span className="sidebar-nav-icon">
                    <Icon size={19} strokeWidth={2} />
                  </span>

                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="sidebar-footer">
          <button
            type="button"
            onClick={handleLogout}
            className="sidebar-logout-button"
          >
            <LogOut size={19} />

            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;