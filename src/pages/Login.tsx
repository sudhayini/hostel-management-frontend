import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      navigate("/dashboard");
    } catch (error: any) {
      setError(
        error.response?.data?.message || "Login failed"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-mauve-200">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">

        <h1 className="text-3xl font-bold text-center mb-6">
          Hostel Management System
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">

          <div>
            <label className="block mb-1 font-semibold">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg p-3"
              placeholder="Enter email"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg p-3"
              placeholder="Enter password"
              required
            />
          </div>

          {error && (
            <p className="text-red-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-mauve-600 text-white py-3 rounded-lg hover:bg-mauve-700"
          >
            Login
          </button>

        </form>
      </div>
    </div>
  );
}

export default Login;