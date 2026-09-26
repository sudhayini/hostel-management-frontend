import { useState,useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState} from "../store/store";

import {
fetchMaintenance,
 fetchStaff,
createMaintenance,
editMaintenance,
removeMaintenance,
} from "../features/maintenance/maintenanceSlice";


type MaintenanceType = {
  _id?: string;
  residentName: string;
  roomNumber: string;
  issue: string;
  priority: "Low"|"Medium"|"High";
  status: "Pending"|"In Progress"|"Completed";
  assignedStaff: string;
};

function Maintenance() {
  const dispatch = useDispatch<AppDispatch>();

const user = JSON.parse(localStorage.getItem("user") || "{}");
const role = user.role;

  const maintenance = useSelector(
    (state: RootState) => state.maintenance.maintenance
  );

  const staff = useSelector(
  (state: RootState) => state.maintenance.staff
);

useEffect(() => {
  dispatch(fetchMaintenance());

  if (role === "admin" || role === "staff") {
    dispatch(fetchStaff());
  }
}, [dispatch, role]);

  const residents = useSelector(
    (state: RootState) => state.residents
  );

  const [residentName, setResidentName] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [issue, setIssue] = useState("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [status, setStatus] =  useState<"Pending" | "In Progress" | "Completed">("Pending");
  const [assignedStaff, setAssignedStaff] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);


 const saveMaintenance = async () => {
  if (!residentName.trim()) {
    alert("Please enter resident name");
    return;
  }

  if (!roomNumber.trim()) {
    alert("Selected resident has no room");
    return;
  }

  if (!issue.trim()) {
    alert("Please enter issue");
    return;
  }

  const maintenanceData = {
    residentName,
    roomNumber,
    issue,
    priority,
    status,
    assignedStaff,
  };


  try {
  if (editingId) {
    await dispatch(
      editMaintenance({
        id: editingId,
        maintenance: maintenanceData,
      })
    ).unwrap();

    alert("Maintenance request updated successfully");
  } else {
    await dispatch(
      createMaintenance(maintenanceData)
    ).unwrap();

    alert("Maintenance request added successfully");
  }

  clearForm();
} catch (error: any) {
  alert(
    error?.message ||
    "Failed to save maintenance request"
  );
}
};


  const handleeditMaintenance = (item: MaintenanceType) => {
    setResidentName(item.residentName);
    setRoomNumber(item.roomNumber);
    setIssue(item.issue);
    setPriority(item.priority);
    setStatus(item.status);
    setAssignedStaff(item.assignedStaff || "");

    setEditingId(item._id?? null);
    setShowForm(true);
  };


  const deleteMaintenance = async (id: string) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this request?"
  );

  if (!confirmDelete) {
    return;
  }

  try {
    await dispatch(
      removeMaintenance(id)
    ).unwrap();

    alert("Maintenance request deleted successfully");
  } catch (error: any) {
    alert(
      error?.message ||
      "Failed to delete maintenance request"
    );
  }
};


  const clearForm = () => {
    setResidentName("");
    setRoomNumber("");
    setIssue("");
    setPriority("Medium");
    setStatus("Pending");
    setAssignedStaff("");
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div>

      {/* HEADER */}

      <div className="flex justify-between items-center mb-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Maintenance
          </h1>

          <p className="text-gray-500">
            Manage hostel maintenance requests
          </p>
        </div>

        <button
          onClick={() => {
            clearForm();
            setShowForm(true);
          }}
          className="bg-mauve-500 text-white px-4 py-2 rounded-lg mr-10"
        >
          + Add Request
        </button>

      </div>

      <div className="ml-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-165">

        {maintenance.map((item) => (

          <div
            key={item._id}
            className="border bg-mauve-200 p-5 rounded-lg shadow "
          >

            <h2 className="text-lg font-semibold">
              {item.issue}
            </h2>

            <p className="text-gray-600 mt-2">
              Resident: {item.residentName}
            </p>

            <p className="text-gray-600">
              Room: {item.roomNumber}
            </p>

            <p className="mt-3">
              Priority:{" "}
              <span className="font-semibold">
                {item.priority}
              </span>
            </p>

            <p>
              Status:{" "}
              <span className="font-semibold">
                {item.status}
              </span>
            </p>

            {item.assignedStaff && (
          <p>
            Assigned Staff:{" "}
           <span className="font-semibold">
              {item.assignedStaff}
           </span>
          </p>
         )}


      

            {(role === "admin" || role === "staff") && (
            <button
              onClick={() => handleeditMaintenance(item)}
              className="bg-gray-700 text-white px-3 py-1 rounded mt-4"
            >
              Edit
             </button>
            )}


          
            {role === "admin" && (
             <button
            onClick={() =>
             item._id && deleteMaintenance(item._id)
            }
            className="bg-red-500 text-white px-3 py-1 rounded mt-4 ml-2"
            >
            Delete
            </button>
            )}

          </div>

        ))}

      </div>


    

      {showForm && (

        <div className="ml-5 w-223 rounded-lg border mt-10 p-5">

          <h2 className="text-xl font-semibold mb-4">
            {editingId !== null
              ? "Edit Maintenance Request"
              : "Add Maintenance Request"}
          </h2>

          <select
  value={residentName}
  onChange={(e) => {
    const selectedResident = residents.find(
      (resident) => resident.name === e.target.value
    );

    setResidentName(e.target.value);

    if (selectedResident) {
      setRoomNumber(selectedResident.roomNumber);
    }
  }}
  className="border rounded-lg px-2 py-1 mr-2 mb-3"
>
  <option value="">Select Resident</option>

 {residents
  .filter((resident) => resident.roomNumber)
  .map((resident) => (
    <option key={resident._id} value={resident.name}>
      {resident.name} - {resident.roomNumber}
    </option>
  ))}
</select>



          <input
            type="text"
            placeholder="Room Number"
            value={roomNumber}
            // onChange={(e) =>
            //   setRoomNumber(e.target.value)
            // }
            readOnly
            className="border rounded-lg px-2 py-1 mr-2 mb-3"
          />

          <input
            type="text"
            placeholder="Issue"
            value={issue}
            onChange={(e) =>
              setIssue(e.target.value)
            }
            className="border rounded-lg px-2 py-1 mr-2 mb-3"
          />

          <select
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value as "Low"|"Medium"|"High")
            }
            className="border rounded-lg px-2 py-1 mr-2 mb-3"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "Pending"|"In Progress"|"Completed")
            }
            className="border rounded-lg px-2 py-1 mr-2 mb-3"
          >
            <option value="Pending">
              Pending
            </option>

            <option value="In Progress">
              In Progress
            </option>

            <option value="Completed">
              Completed
            </option>
          </select>

          {(role === "admin" || role === "staff") && (
  
          <select
            value={assignedStaff}
            onChange={(e) => setAssignedStaff(e.target.value)}
            className="border rounded-lg px-2 py-1 mr-2 mb-3"
          >
          <option value="">Assign Staff</option>

          {staff.map((member) => (
          <option key={member._id} value={member.name}>
          {member.name} - {member.email}
          </option>

         ))}
         </select>
         )}
          <div>

            <button
              onClick={saveMaintenance}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg mr-2"
            >
              {editingId !== null
                ? "Update Request"
                : "Add Request"}
            </button>

            <button
              onClick={clearForm}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
            >
              Cancel
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default Maintenance;