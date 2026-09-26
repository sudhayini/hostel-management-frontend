import { useNavigate } from "react-router-dom";

function Navbar() {

   const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  }
   return (
    <div className="h-16 border-b bg-mauve-300 flex items-center justify-between px-6">
      
      <h2 className="text-xl font-semibold">
        Hostel Management System
      </h2>

      <div className="flex items-center gap-4">

        <div className="text-2xl text-mauve-600">
          Admin
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Logout
        </button>

      </div>

    </div>
  );
}

export default Navbar;