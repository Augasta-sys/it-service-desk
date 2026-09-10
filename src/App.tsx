import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import ScrollToTop from "./components/common/ScrollToTop";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Unauthorized from "./pages/Unauthorized";

import ProtectedRoute from "./routes/ProtectedRoute";
import MainLayout from "./components/Layout/MainLayout";

import Tickets from "./pages/Tickets";
import MyTickets from "./pages/MyTickets";
import TicketDetails from "./pages/TicketDetails";
import EditTicket from "./pages/EditTicket";
import CreateTicket from "./components/Tickets/CreateTicket";

import Users from "./pages/Users";
import Categories from "./pages/Categories";
import Profile from "./pages/Profile";
import Reports from "./pages/Reports";

function App() {
  return (
    <BrowserRouter>

     <ScrollToTop />
      <Routes>

        {/* =========================
            PUBLIC ROUTES
        ========================== */}

        <Route path="/login" element={<Login />} />
<Route path="/signup" element={<SignUp />} />
<Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password" element={<ResetPassword />} />

        <Route
          path="/unauthorized"
          element={<Unauthorized />}
        />

        {/* =========================
            AUTHENTICATED ROUTES
        ========================== */}

        <Route element={<ProtectedRoute />}>

          <Route element={<MainLayout />}>

            {/* =========================
                DASHBOARD
                All authenticated users
            ========================== */}

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route path="/profile" element={<Profile />} />

            {/* =========================
                TICKET DETAILS / EDIT
            ========================== */}

            <Route
              path="/tickets/:id"
              element={<TicketDetails />}
            />

            <Route
              path="/tickets/:id/edit"
              element={<EditTicket />}
            />

            {/* =========================
                ADMIN + SUPPORT AGENT
                TICKETS
            ========================== */}

            <Route
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "admin",
                    "support_agent",
                  ]}
                />
              }
            >
              <Route
                path="/tickets"
                element={<Tickets />}
              />
            </Route>

            {/* =========================
                EMPLOYEE ROUTES
            ========================== */}

            <Route
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "employee",
                  ]}
                />
              }
            >
              <Route
                path="/my-tickets"
                element={<MyTickets />}
              />

              <Route
                path="/tickets/create"
                element={<CreateTicket />}
              />
            </Route>

            {/* =========================
                ADMIN ROUTES
            ========================== */}

        <Route
  element={
    <ProtectedRoute allowedRoles={["admin"]} />
  }
>
  <Route path="/users" element={<Users />} />
  <Route path="/categories" element={<Categories />} />
  <Route path="/reports" element={<Reports />} />
</Route>
          </Route>

        </Route>

        {/* =========================
            UNKNOWN ROUTE
        ========================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;