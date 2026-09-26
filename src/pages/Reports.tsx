import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

function Reports() {

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

const occupiedRooms = rooms.filter((room) => {
  const occupiedCount = residents.filter(
    (resident) => resident.roomNumber === room.roomNumber
  ).length;

  return occupiedCount > 0;
}).length;

const availableRooms = rooms.filter((room) => {
  const occupiedCount = residents.filter(
    (resident) => resident.roomNumber === room.roomNumber
  ).length;

  return occupiedCount === 0;
}).length;

const fullRooms = rooms.filter((room) => {
  const occupiedCount = residents.filter(
    (resident) => resident.roomNumber === room.roomNumber
  ).length;

  return occupiedCount >= room.capacity;
}).length;

  const occupancyRate =
    totalRooms > 0
      ? Math.round(
          (occupiedRooms / totalRooms) * 100
        )
      : 0;

  const totalResidents = residents.length;

  const allocatedResidents = residents.filter(
    (resident) => resident.roomNumber !== ""
  ).length;

  const unallocatedResidents = residents.filter(
    (resident) => resident.roomNumber === ""
  ).length;


  const totalRevenue = bills
    .filter(
      (bill) => bill.paymentStatus === "Paid"
    )
    .reduce(
      (total, bill) => total + bill.total,
      0
    );

  const pendingPayments = bills
    .filter(
      (bill) => bill.paymentStatus === "Pending"
    )
    .reduce(
      (total, bill) => total + bill.total,
      0
    );

  const partialPayments = bills
  .filter(
    (bill) => bill.paymentStatus === "Partially Paid"
  )
  .reduce(
    (total, bill) => total + bill.total,
    0
  );  

  const paidBills = bills.filter(
    (bill) => bill.paymentStatus === "Paid"
  ).length;

  const pendingBills = bills.filter(
    (bill) => bill.paymentStatus === "Pending"
  ).length;



  const pendingMaintenance = maintenance.filter(
    (item) => item.status === "Pending"
  ).length;

  const inProgressMaintenance = maintenance.filter(
    (item) => item.status === "In Progress"
  ).length;

  const completedMaintenance = maintenance.filter(
    (item) => item.status === "Completed"
  ).length;


  return (
    <div>

     

      <div className="mb-6">

        <h1 className="text-2xl font-bold text-gray-800">
          Reports
        </h1>

        <p className="text-gray-500">
          Hostel financial and operational reports
        </p>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">


        <div className="bg-white p-5 rounded-lg shadow">

          <p className="text-gray-500">
            Total Revenue
          </p>

          <h2 className="text-2xl font-bold mt-2">
            ₹{totalRevenue}
          </h2>

        </div>

        <div className="bg-white p-5 rounded-lg shadow">

          <p className="text-gray-500">
            Pending Payments
          </p>

          <h2 className="text-2xl font-bold mt-2">
            ₹{pendingPayments}
          </h2>

        </div>


        <div className="bg-white p-5 rounded-lg shadow">

          <p className="text-gray-500">
            Occupancy Rate
          </p>

          <h2 className="text-2xl font-bold mt-2">
            {occupancyRate}%
          </h2>

        </div>

        <div className="bg-white p-5 rounded-lg shadow">

          <p className="text-gray-500">
            Total Residents
          </p>

          <h2 className="text-2xl font-bold mt-2">
            {totalResidents}
          </h2>

        </div>

      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow">

        <h2 className="text-lg font-semibold mb-4">
          Room Report
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

          <div>
            <p className="text-gray-500">
              Total Rooms
            </p>

            <p className="text-xl font-bold">
              {totalRooms}
            </p>
          </div>

          <div>
            <p className="text-gray-500">
              Occupied Rooms
            </p>

            <p className="text-xl font-bold">
              {occupiedRooms}
            </p>
          </div>

          <div>
            <p className="text-gray-500">
              Available Rooms
            </p>

            <p className="text-xl font-bold">
              {availableRooms}
            </p>
          </div>

          <div>
            <p className="text-gray-500">
              Full Rooms
            </p>

            <p className="text-xl font-bold">
              {fullRooms}
            </p>
          </div>

        </div>

      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow">

        <h2 className="text-lg font-semibold mb-4">
          Resident Report
        </h2>

        <p>
          Total Residents: {totalResidents}
        </p>

        <p>
          Allocated Residents: {allocatedResidents}
        </p>

        <p>
          Unallocated Residents: {unallocatedResidents}
        </p>

      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow">

        <h2 className="text-lg font-semibold mb-4">
          Payment Report
        </h2>

        <p>
          Paid Bills: {paidBills}
        </p>

        <p>
          Pending Bills: {pendingBills}
        </p>

        <p className="font-semibold mt-2">
          Revenue: ₹{totalRevenue}
        </p>

        <p className="font-semibold">
          Pending Amount: ₹{pendingPayments}
        </p>
        
        <p className="font-semibold">
            Partially Paid Amount: ₹{partialPayments}
        </p>

      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow">

        <h2 className="text-lg font-semibold mb-4">
          Maintenance Report
        </h2>

        <p>
          Pending: {pendingMaintenance}
        </p>

        <p>
          In Progress: {inProgressMaintenance}
        </p>

        <p>
          Completed: {completedMaintenance}
        </p>

      </div>

    </div>
  );
}

export default Reports; 