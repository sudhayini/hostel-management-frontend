import { NavLink } from "react-router-dom";

function Sidebar() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="w-57 min-h-screen bg-mauve-400 text-black p-5">
      
      <h1 className="text-5xl font-bold mb-8">
        Hostel
      </h1>

      <nav className="space-y-3">

        <NavLink
          to="/dashboard"
          className="block px-3 py-2 hover:bg-mauve-700 text-2xl border-solid rounded-xl"
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/rooms"
          className="block px-3 py-2 hover:bg-mauve-700 text-2xl border-solid rounded-xl"
        >
          Rooms
        </NavLink>

        <NavLink
          to="/residents"
          className="block px-3 py-2 hover:bg-mauve-700 text-2xl border-solid rounded-xl"
        >
          Residents
        </NavLink>

        <NavLink
          to="/maintenance"
          className="block px-3 py-2 hover:bg-mauve-700 text-2xl border-solid rounded-xl"
        >
          Maintenance
        </NavLink>

        <NavLink
          to="/billing"
          className="block px-3 py-2 hover:bg-mauve-700 text-2xl border-solid rounded-xl"
        >
          Billing
        </NavLink>

        <NavLink
          to="/reports"
          className="block px-3 py-2 hover:bg-mauve-700 text-2xl border-solid rounded-xl"
        >
          Reports
        </NavLink>

    
        {user.role === "admin" && (
          <NavLink
            to="/staff"
            className="block px-3 py-2 hover:bg-mauve-700 text-2xl border-solid rounded-xl"
          >
            Staff
          </NavLink>
        )}

      </nav>

    </div>
  );
}

export default Sidebar;