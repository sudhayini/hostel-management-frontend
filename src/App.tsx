import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./layouts/Layout";

import Login from "./pages/Login";

import Dashboard from "./pages/Dashboard";
import { Rooms } from "./pages/Rooms";
import Residents from "./pages/Residents";
import Maintenance from "./pages/Maintenance";
import Billing from "./pages/Billing";
import Reports from "./pages/Reports";
import Staff from "./pages/Staff";

import ProtectedRoute from "./components/ProtecteRoute";
import RoleRoute from "./components/RoleRute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>

            <Route path="dashboard" element={<Dashboard />} />
            <Route path="rooms" element={<Rooms />} />
            <Route path="residents" element={<Residents />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="billing" element={<Billing />} />

            {/* Admin Only */}
            <Route element={<RoleRoute allowedRoles={["admin"]} />}>
              <Route path="reports" element={<Reports />} />
              <Route path="staff" element={<Staff />} />
            </Route>

          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;