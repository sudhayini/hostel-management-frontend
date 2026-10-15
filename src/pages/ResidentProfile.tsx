import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { type AppDispatch, type RootState } from "../store/store";
import { fetchResidents } from "../features/residents/residentsSlice";

function ResidentProfile() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();

  const residents = useSelector(
    (state: RootState) => state.residents
  );

  useEffect(() => {
    if (!residents.length) {
      dispatch(fetchResidents());
    }
  }, [dispatch, residents.length]);

  const resident = residents.find(
    (item) => item._id === id
  );

  if (!resident) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Resident Profile
        </h1>

        <p className="mt-4 text-gray-600">
          Resident not found or still loading.
        </p>

        <Link
          to="/residents"
          className="inline-block mt-4 text-blue-600 underline"
        >
          Back to Residents
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Link
        to="/residents"
        className="text-blue-600 underline"
      >
        ← Back to Residents
      </Link>

      <div className="mt-5 rounded-xl border bg-white p-6 shadow">
        <h1 className="text-2xl font-bold text-gray-800">
          {resident.name}
        </h1>

        <p className="mt-1 text-gray-500">
          Resident Profile
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h2 className="font-semibold">Contact Information</h2>
            <p className="mt-2">Phone: {resident.phone}</p>
            <p>Email: {resident.email}</p>
            <p>
              Emergency Contact:{" "}
              {resident.emergencyContactName || "Not provided"}
            </p>
            <p>
              Emergency Phone:{" "}
              {resident.emergencyContactPhone || "Not provided"}
            </p>
          </div>

          <div>
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
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold">
            Room-Change History
          </h2>

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
                    Check-in: {history.checkInDate.slice(0, 10)}
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
        </div>
      </div>
    </div>
  );
}

export default ResidentProfile;