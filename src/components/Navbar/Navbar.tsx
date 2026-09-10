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

  const handleProfileClick = () => {
    navigate("/profile");
  };

  if (!user) {
    return null;
  }

  return (
    <header className="app-navbar">
      {/* Left */}
      <div className="navbar-left">
        <button
          type="button"
          onClick={onMenuClick}
          className="navbar-menu-button"
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>

        <div className="navbar-title-wrapper">
          <p className="navbar-title">
            IT Service Desk
          </p>

          <p className="navbar-subtitle">
            Ticket Management System
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="navbar-right">
        {/* Notifications */}
        <div
          ref={notificationRef}
          className="navbar-notification-wrapper"
        >
          <button
            type="button"
            onClick={() =>
              setShowNotifications(
                (previous) => !previous
              )
            }
            className={`navbar-icon-button ${
              showNotifications
                ? "navbar-icon-button-active"
                : ""
            }`}
            aria-label="Notifications"
            aria-expanded={showNotifications}
          >
            <Bell
              size={20}
              strokeWidth={2}
            />

            {notificationCount > 0 && (
              <span className="notification-count">
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

        <div className="navbar-divider" />

        {/* Profile */}
        <button
          type="button"
          onClick={handleProfileClick}
          className="navbar-profile-button"
          aria-label="Open profile"
        >
          <div className="navbar-avatar">
            <UserCircle size={31} />
          </div>

          <div className="navbar-profile-info">
            <p className="navbar-profile-name">
              {user.fullName}
            </p>

            <p className="navbar-profile-role">
              {formatRole(user.role)}
            </p>
          </div>
        </button>
      </div>
    </header>
  );
};

export default Navbar;