
import { NavLink } from "react-router-dom";

function Sidebar() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-2 hover:bg-mauve-700 text-2xl rounded-xl ${
      isActive ? "bg-mauve-500 font-bold" : ""
    }`;

  return (
    <div className="w-57 min-h-screen bg-mauve-400 text-black p-5">
      <h1 className="text-5xl font-bold mb-8">Hostel</h1>

      <nav className="space-y-3">
        <NavLink to="/dashboard" className={linkClass}>
          Dashboard
        </NavLink>

        <NavLink to="/rooms" className={linkClass}>
          Rooms
        </NavLink>

        <NavLink to="/residents" className={linkClass}>
          Residents
        </NavLink>

        <NavLink to="/maintenance" className={linkClass}>
          Maintenance
        </NavLink>

        <NavLink to="/billing" className={linkClass}>
          Billing
        </NavLink>

        {(user.role === "admin" ||
          user.role === "staff" ||
          user.role === "resident") && (
          <NavLink to="/payments" className={linkClass}>
            Payments
          </NavLink>
        )}

        {(user.role === "admin" || user.role === "staff") && (
         <NavLink to="/notifications" className={linkClass}>
           Notifications / SMS
         </NavLink>
        )}

        {user.role === "admin" && (
          <>
            <NavLink to="/reports" className={linkClass}>
              Reports
            </NavLink>

            <NavLink to="/staff" className={linkClass}>
              Staff
            </NavLink>
          </>
        )}
      </nav>
    </div>
  );
}

export default Sidebar;
