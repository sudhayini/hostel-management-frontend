import { useEffect, useState } from "react";
import api from "../services/api";

type StaffMember = {
  _id: string;
  name: string;
  email: string;
};

function Staff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  const fetchStaff = async () => {
    try {
      const response = await api.get("/auth/staff");
      setStaff(response.data);
    } catch (error) {
      console.error("Failed to fetch staff:", error);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post("/auth/staff", {
        name,
        email,
        password,
      });

      setName("");
      setEmail("");
      setPassword("");

      fetchStaff();
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          "Failed to create staff"
      );
    }
  };

  const handleEditClick = (member: StaffMember) => {
    setEditingId(member._id);
    setEditName(member.name);
    setEditEmail(member.email);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditEmail("");
  };

  const handleUpdateStaff = async (id: string) => {
    try {
      await api.put(`/auth/staff/${id}`, {
        name: editName,
        email: editEmail,
      });

      setEditingId(null);
      setEditName("");
      setEditEmail("");

      fetchStaff();
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          "Failed to update staff"
      );
    }
  };

  const handleDeleteStaff = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this staff member?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await api.delete(`/auth/staff/${id}`);

      fetchStaff();
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          "Failed to delete staff"
      );
    }
  };

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">
        Staff Management
      </h1>

      <div className="bg-white p-6 rounded-xl shadow mb-8">

        <h2 className="text-2xl font-semibold mb-4">
          Add Staff
        </h2>

        <form
          onSubmit={handleAddStaff}
          className="space-y-4"
        >

          <input
            type="text"
            placeholder="Staff Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg p-3"
            required
          />

          <input
            type="email"
            placeholder="Staff Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg p-3"
            required
          />

          <input
            type="password"
            placeholder="Staff Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg p-3"
            required
          />

          <button
            type="submit"
            className="bg-mauve-600 text-white px-6 py-3 rounded-lg hover:bg-mauve-700"
          >
            Add Staff
          </button>

        </form>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">

        <h2 className="text-2xl font-semibold mb-4">
          Staff List
        </h2>

        <div className="space-y-4">

          {staff.length === 0 ? (
            <p>No staff members found.</p>
          ) : (
            staff.map((member) => (

              <div
                key={member._id}
                className="border rounded-lg p-4"
              >

                {editingId === member._id ? (

                  <div className="space-y-4">

                    <input
                      type="text"
                      value={editName}
                      onChange={(e) =>
                        setEditName(e.target.value)
                      }
                      className="w-full border rounded-lg p-3"
                      placeholder="Staff Name"
                    />

                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) =>
                        setEditEmail(e.target.value)
                      }
                      className="w-full border rounded-lg p-3"
                      placeholder="Staff Email"
                    />

                    <div className="flex gap-3">

                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateStaff(member._id)
                        }
                        className="bg-green-600 text-white px-5 py-2 rounded-lg"
                      >
                        Save
                      </button>

                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="bg-gray-500 text-white px-5 py-2 rounded-lg"
                      >
                        Cancel
                      </button>

                    </div>

                  </div>

                ) : (
                  <div className="flex justify-between items-center">

                    <div>
                      <h3 className="text-xl font-semibold">
                        {member.name}
                      </h3>

                      <p className="text-gray-600">
                        {member.email}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">

                      <span className="bg-mauve-200 px-3 py-1 rounded-full">
                        Staff
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          handleEditClick(member)
                        }
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteStaff(member._id)
                        }
                        className="bg-red-600 text-white px-4 py-2 rounded-lg"
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                )}

              </div>

            ))
          )}

        </div>
      </div>

    </div>
  );
}

export default Staff;