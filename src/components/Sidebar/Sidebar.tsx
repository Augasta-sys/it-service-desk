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

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

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

  const getNavigationItems =
    (): NavigationItem[] => {
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

  const navigationItems =
    getNavigationItems();

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

    navigate("/login", {
      replace: true,
    });

    onClose?.();
  };

  const handleNavigation = () => {
    onClose?.();
  };

  return (
    <>
      {/* Mobile overlay */}

      {isOpen && (
        <div
          className="
            sidebar-overlay

            dark:bg-black/70
          "
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* =====================================================
          SIDEBAR
      ====================================================== */}
<aside
  className={`
    app-sidebar

    ${isOpen ? "app-sidebar-open" : ""}

    dark:!bg-[#262626]
    dark:!border-[#404040]
  `}
>
        {/* ===================================================
            HEADER
        ==================================================== */}

        <div
          className="
            sidebar-header

            !border-white/20

            dark:!border-white/15
          "
        >
          <div className="sidebar-brand">
            <div
              className="
                sidebar-brand-icon

                !bg-white/15
                !text-white

                dark:!bg-white/10
                dark:!text-white
              "
            >
              <Ticket
                size={19}
                strokeWidth={2.2}
              />
            </div>

            <div className="sidebar-brand-text">
              <h1
                className="
                  !text-white
                "
              >
                Service Desk
              </h1>

              <p
                className="
                  !text-white/75
                "
              >
                IT Ticket Management
              </p>
            </div>
          </div>

          {/* Mobile close */}

          <button
            type="button"
            onClick={onClose}
            className="
              sidebar-close-button

              !text-white
              hover:!bg-white
              hover:!text-black

              dark:!text-white
              dark:hover:!bg-white
              dark:hover:!text-black
            "
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* ===================================================
            USER
        ==================================================== */}

        <div
          className="
            sidebar-user

            !border-white/20
            !bg-white/10

            dark:!border-white/15
            dark:!bg-white/10
          "
        >
          <div
            className="
              sidebar-user-avatar
              !text-white
            "
          >
            <UserCircle size={24} />
          </div>

          <div className="sidebar-user-info">
            <span
              className="
                sidebar-user-label
                !text-white/60
              "
            >
              Signed in as
            </span>

            <strong
              className="
                !text-white
              "
            >
              {user.fullName}
            </strong>

            <span
              className="
                !text-white/75
              "
            >
              {getRoleLabel()}
            </span>
          </div>
        </div>

        {/* ===================================================
            NAVIGATION
        ==================================================== */}

        <nav className="sidebar-navigation">
          <p
            className="
              sidebar-section-title

              !text-white/60
            "
          >
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
                    `
                    sidebar-nav-link

                    !text-white

                    hover:!bg-white
                    hover:!text-black

                    dark:!text-white
                    dark:hover:!bg-white
                    dark:hover:!text-black

                    ${
                      isActive
                        ? `
                          sidebar-nav-link-active
                          !bg-blue-800
                          !text-white

                          dark:!bg-[#404040]
                          dark:!text-white
                        `
                        : ""
                    }
                    `
                  }
                >
                  <span
                    className="
                      sidebar-nav-icon
                      !text-current
                    "
                  >
                    <Icon
                      size={19}
                      strokeWidth={2}
                    />
                  </span>

                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* ===================================================
            LOGOUT
        ==================================================== */}

        <div
          className="
            sidebar-footer

            !border-white/20

            dark:!border-white/15
          "
        >
          <button
            type="button"
            onClick={handleLogout}
            className="
              sidebar-logout-button

              !border-white/15
              !bg-white/10
              !text-white

              hover:!bg-white
              hover:!text-black

              dark:!border-white/10
              dark:!bg-white/10
              dark:!text-white

              dark:hover:!bg-white
              dark:hover:!text-black
            "
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