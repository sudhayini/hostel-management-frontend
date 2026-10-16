import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import type { Resident } from "../features/residents/residentsSlice";

function ResidentProfile() {
  const { id } = useParams<{ id: string }>();

  const [resident, setResident] = useState<Resident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Resident ID is missing.");
      setLoading(false);
      return;
    }

    const loadResident = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/residents/${id}`);
        setResident(response.data);
      } catch (err: any) {
        setResident(null);

        if (err.response?.status === 403) {
          setError("You are not allowed to view this resident profile.");
        } else if (err.response?.status === 404) {
          setError("Resident not found.");
        } else {
          setError(
            err.response?.data?.message ||
              "Failed to load resident profile."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadResident();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Loading resident profile...</p>
      </div>
    );
  }

  if (error || !resident) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Resident Profile
        </h1>

        <p className="mt-4 text-red-600">
          {error || "Resident not found."}
        </p>

        <Link
          to="/residents"
          className="mt-4 inline-block text-blue-600 underline"
        >
          ← Back to Residents
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Link to="/residents" className="text-blue-600 underline">
        ← Back to Residents
      </Link>

      <div className="mt-5 rounded-xl border bg-white p-6 shadow">
        <h1 className="text-2xl font-bold text-gray-800">
          {resident.name}
        </h1>

        <p className="mt-1 text-gray-500">Resident Profile</p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <section>
            <h2 className="font-semibold">Contact Information</h2>

            <p className="mt-2">Phone: {resident.phone || "Not provided"}</p>
            <p>Email: {resident.email || "Not provided"}</p>
            <p>
              Emergency Contact:{" "}
              {resident.emergencyContactName || "Not provided"}
            </p>
            <p>
              Emergency Phone:{" "}
              {resident.emergencyContactPhone || "Not provided"}
            </p>
          </section>

          <section>
            <h2 className="font-semibold">Room Information</h2>

            <p className="mt-2">
              Current Room: {resident.roomNumber || "Not allocated"}
            </p>
            <p>
              Check-in:{" "}
              {resident.checkInDate
                ? resident.checkInDate.slice(0, 10)
                : "Not available"}
            </p>
            <p>
              Expected Check-out:{" "}
              {resident.expectedCheckOutDate
                ? resident.expectedCheckOutDate.slice(0, 10)
                : "Not set"}
            </p>
          </section>
        </div>

        <section className="mt-8">
          <h2 className="text-xl font-semibold">Room-Change History</h2>

          {!resident.roomHistory?.length ? (
            <p className="mt-3 text-gray-500">
              No room history available.
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {resident.roomHistory.map((history, index) => (
                <div
                  key={`${history.roomNumber}-${index}`}
                  className="rounded-lg border p-4"
                >
                  <p className="font-medium">
                    Room: {history.roomNumber}
                  </p>

                  <p className="text-gray-600">
                    Check-in: {history.checkInDate?.slice(0, 10) || "Not available"}
                  </p>

                  <p className="text-gray-600">
                    Check-out:{" "}
                    {history.checkOutDate
                      ? history.checkOutDate.slice(0, 10)
                      : "Currently assigned"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default ResidentProfile;
