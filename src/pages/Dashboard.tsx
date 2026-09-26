
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store";
import { useEffect } from "react";

import { fetchRooms } from "../features/rooms/roomsSlice";
import { fetchResidents } from "../features/residents/residentsSlice";
import { fetchMaintenance } from "../features/maintenance/maintenanceSlice";
import { fetchBilling } from "../features/billing/billingSlice";

import NotificationList from "../features/notifications/NotificationList";

function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchRooms());
    dispatch(fetchResidents());
    dispatch(fetchMaintenance());
    dispatch(fetchBilling());
  }, [dispatch]);

  const rooms = useSelector(
    (state: RootState) => state.rooms
  );

  const residents = useSelector(
    (state: RootState) => state.residents
  );

  const maintenance = useSelector(
    (state: RootState) => state.maintenance.maintenance
  );

  const bills = useSelector(
    (state: RootState) => state.billing
  );

  const totalRooms = rooms.length;

  const totalResidents = residents.length;

  const availableRooms = rooms.filter((room) => {
    const occupiedCount = residents.filter(
      (resident) =>
        resident.roomNumber === room.roomNumber
    ).length;

    return occupiedCount === 0;
  }).length;

  const occupiedRooms = rooms.filter((room) => {
    const occupiedCount = residents.filter(
      (resident) =>
        resident.roomNumber === room.roomNumber
    ).length;

    return occupiedCount > 0;
  }).length;

  const occupancyPercentage =
    totalRooms > 0
      ? Math.round(
          (occupiedRooms / totalRooms) * 100
        )
      : 0;

  const pendingPayments = bills
    .filter(
      (bill) => bill.paymentStatus === "Pending"
    )
    .reduce(
      (total, bill) => total + bill.total,
      0
    );

  return (
    <div>
    
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Dashboard
        </h1>

        <p className="text-gray-500">
          Overview of hostel operations
        </p>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

        <div className="bg-white p-5 rounded-lg shadow">
          <p className="text-gray-500">
            Total Rooms
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {totalRooms}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-lg shadow">
          <p className="text-gray-500">
            Total Residents
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {totalResidents}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-lg shadow">
          <p className="text-gray-500">
            Available Rooms
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {availableRooms}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-lg shadow">
          <p className="text-gray-500">
            Pending Payments
          </p>

          <h2 className="text-3xl font-bold mt-2">
            ₹{pendingPayments}
          </h2>
        </div>

      </div>

    
      <div className="mt-6 bg-white p-6 rounded-lg shadow">

        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Room Occupancy
        </h2>

        <div className="flex justify-between mb-2">
          <span>Occupied Rooms</span>

          <span>
            {occupiedRooms}/{totalRooms}
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3">

          <div
            className="bg-gray-800 h-3 rounded-full"
            style={{
              width: `${occupancyPercentage}%`,
            }}
          ></div>

        </div>

        <p className="text-sm text-gray-500 mt-2">
          {occupancyPercentage}% of rooms are
          currently occupied.
        </p>

      </div>

      
      <div className="mt-6 bg-white p-6 rounded-lg shadow">

        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Maintenance Requests
        </h2>

        <div className="space-y-4">

          {maintenance.slice(0, 3).map((item) => (
            <div
              key={item._id}
              className="flex justify-between border-b pb-3"
            >

              <div>
                <p className="font-medium">
                  {item.issue}
                </p>

                <p className="text-sm text-gray-500">
                  Room {item.roomNumber}
                </p>
              </div>

              <span className="text-sm">
                {item.status}
              </span>

            </div>
          ))}

        </div>

      </div>

     
      <div className="mt-6">
        <NotificationList />
      </div>

    </div>
  );
}

export default Dashboard;

