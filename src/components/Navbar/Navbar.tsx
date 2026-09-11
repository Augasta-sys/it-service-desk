import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  Bell,
  Menu,
  UserCircle,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";

import { getTickets } from "../../services/ticketService";

import type { Ticket } from "../../types/ticket";

import NotificationDropdown from "../Layout/NotificationDropdown";

import ThemeToggle from "../common/ThemeToggle";

interface NavbarProps {
  onMenuClick: () => void;
}

const formatRole = (
  role: string | undefined
) => {
  if (!role) {
    return "";
  }

  return role
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
};

const Navbar = ({
  onMenuClick,
}: NavbarProps) => {
  const { user } = useAuth();

  const navigate = useNavigate();

  const [
    showNotifications,
    setShowNotifications,
  ] = useState(false);

  const [
    readNotifications,
    setReadNotifications,
  ] = useState<string[]>([]);

  const [tickets, setTickets] =
    useState<Ticket[]>([]);

  const notificationRef =
    useRef<HTMLDivElement>(null);

  /*
   * ============================================================
   * LOAD TICKETS
   * ============================================================
   */

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const data = await getTickets();

        setTickets(data);
      } catch (error) {
        console.error(
          "Failed to load notifications:",
          error
        );
      }
    };

    loadTickets();
  }, []);

  /*
   * ============================================================
   * CLOSE NOTIFICATION DROPDOWN WHEN CLICKING OUTSIDE
   * ============================================================
   */

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target as Node
        )
      ) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener(
        "mousedown",
        handleClickOutside
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, [showNotifications]);

  /*
   * ============================================================
   * FILTER TICKETS BASED ON USER ROLE
   * ============================================================
   */

  const accessibleTickets =
    tickets.filter((ticket) => {
      if (!user) {
        return false;
      }

      if (user.role === "admin") {
        return true;
      }

      if (user.role === "support_agent") {
        return (
          ticket.assignedAgent === user.id
        );
      }

      if (user.role === "employee") {
        return ticket.createdBy === user.id;
      }

      return false;
    });

  /*
   * ============================================================
   * NOTIFICATION COUNT
   * ============================================================
   */

  const notificationCount =
    accessibleTickets.filter(
      (ticket) =>
        [
          "open",
          "assigned",
          "in_progress",
          "pending",
          "resolved",
          "reopened",
        ].includes(ticket.status) &&
        !readNotifications.includes(ticket.id)
    ).length;

  /*
   * ============================================================
   * NOTIFICATION CLICK
   * ============================================================
   */

  const handleNotificationClick = (
    ticketId: string
  ) => {
    setReadNotifications((previous) =>
      previous.includes(ticketId)
        ? previous
        : [...previous, ticketId]
    );

    setShowNotifications(false);

    navigate(`/tickets/${ticketId}`);
  };

  /*
   * ============================================================
   * PROFILE CLICK
   * ============================================================
   */

  const handleProfileClick = () => {
    navigate("/profile");
  };

  if (!user) {
    return null;
  }

  return (
    <header
      className="
        app-navbar

        !bg-[#0F172A]
        !border-[#0F173A]

        dark:!bg-[#262626]
        dark:!border-[#404040]
      "
    >
      {/* =====================================================
          LEFT SECTION
      ====================================================== */}

      <div className="navbar-left">

        {/* Mobile Menu */}

        <button
          type="button"
          onClick={onMenuClick}
          className="
            navbar-menu-button

            !text-white
            !bg-transparent

            hover:!bg-white/15
            hover:!text-white

            focus:!outline-none
            focus:!ring-2
            focus:!ring-white/30

            dark:!text-white
            dark:!bg-transparent

            dark:hover:!bg-white/10
            dark:hover:!text-white

            dark:focus:!ring-white/30
          "
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>

        {/* Title */}

        <div className="navbar-title-wrapper">
          <p
            className="
              navbar-title

              !text-white
            "
          >
            IT Service Desk
          </p>

          <p
            className="
              navbar-subtitle

              !text-white/80
            "
          >
            Ticket Management System
          </p>
        </div>
      </div>

      {/* =====================================================
          RIGHT SECTION
      ====================================================== */}

      <div className="navbar-right">

        {/* =================================================
            THEME TOGGLE
        ================================================== */}

        <div
          className="
            flex
            items-center
            justify-center


            p-1

            transition-all
            duration-200

            hover:bg-white/15

            dark:border-white/20
            dark:bg-white/10
            dark:hover:bg-white/15
          "
        >
          <ThemeToggle />
        </div>

        {/* =================================================
            NOTIFICATIONS
        ================================================== */}

        <div
          ref={notificationRef}
          className="
            navbar-notification-wrapper
            relative
          "
        >
         <button
  type="button"
  onClick={() =>
    setShowNotifications(
      (previous) => !previous
    )
  }
  className={`
    navbar-icon-button

    !text-white
    !bg-transparent

    border
    border-transparent

    rounded-lg

    transition-all
    duration-200
    ease-in-out

    hover:!bg-white/10
    hover:!text-white

    active:!bg-white/15
    active:!text-white

    focus:!outline-none
    focus:!ring-2
    focus:!ring-white/30
    focus:!ring-offset-0

    dark:!text-white
    dark:!bg-transparent

    dark:hover:!bg-white/10
    dark:hover:!text-white

    dark:active:!bg-white/15
    dark:active:!text-white

    dark:focus:!ring-white/30

    ${
      showNotifications
        ? "!bg-white/15 !text-white dark:!bg-white/15 dark:!text-white"
        : ""
    }
  `}
  aria-label="Notifications"
  aria-expanded={showNotifications}
>
  <Bell
    size={20}
    strokeWidth={2}
  />

  {notificationCount > 0 && (
    <span
      className="
        notification-count

        !bg-white
        !text-[#0F172A]

        dark:!bg-white
        dark:!text-[#262626]
      "
    >
      {notificationCount > 99
        ? "99+"
        : notificationCount}
    </span>
  )}
</button>
          {showNotifications && (
            <NotificationDropdown
              user={user}
              tickets={tickets}
              onClose={() =>
                setShowNotifications(false)
              }
              onNotificationClick={
                handleNotificationClick
              }
            />
          )}
        </div>

        {/* =================================================
            DIVIDER
        ================================================== */}

        <div
          className="
            navbar-divider

            !bg-white/25

            dark:!bg-white/20
          "
        />

        {/* =================================================
            PROFILE
        ================================================== */}

        <button
          type="button"
          onClick={handleProfileClick}
          className="
            navbar-profile-button

            !text-white
            !bg-transparent

            rounded-lg

            transition-all
            duration-200

            hover:!bg-white/10

            focus:!outline-none
            focus:!ring-2
            focus:!ring-white/30

            dark:!text-white
            dark:!bg-transparent

            dark:hover:!bg-white/10
            dark:hover:!text-white

            dark:focus:!ring-white/30
          "
          aria-label="Open profile"
        >
          {/* Avatar */}

          <div
            className="
              navbar-avatar

              !text-white
            "
          >
            <UserCircle
              size={31}
              strokeWidth={1.8}
            />
          </div>

          {/* Profile Information */}

          <div className="navbar-profile-info">
            <p
              className="
                navbar-profile-name

                !text-white
              "
            >
              {user.fullName}
            </p>

            <p
              className="
                navbar-profile-role

                !text-white/75
              "
            >
              {formatRole(user.role)}
            </p>
          </div>
        </button>
      </div>
    </header>
  );
};

export default Navbar;