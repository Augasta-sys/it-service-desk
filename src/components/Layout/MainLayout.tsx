import { useState } from "react";
import { Outlet } from "react-router-dom";

import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      <div className="app-main-wrapper">
        <Navbar
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />

        <main className="app-main-content">
          <div className="app-page-container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;