import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <div className="flex min-h-screen bg-mauve-200">

      <Sidebar />

      <div className="flex-1">

        <Navbar />

        <main className="p-6">
          <h1 className="text-2xl font-bold">
            Welcome to Hostel Management System
          </h1>
        </main>
            <Outlet/>
      </div>

    </div>
  );
}

export default Layout;