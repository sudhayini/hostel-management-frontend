import { useEffect, useState } from "react";

import { type AppDispatch, type RootState } from "../store/store";
import { useSelector, useDispatch } from "react-redux";

import {
  fetchResidents,
  createResident,
  editResident,
  removeResident,
} from "../features/residents/residentsSlice";

import { fetchRooms } from "../features/rooms/roomsSlice";

type Resident = {
  _id?: string;
  name: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  email: string;
  roomNumber: string;
};

function Residents() {
  const dispatch = useDispatch<AppDispatch>();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role;

  const residents = useSelector(
    (state: RootState) => state.residents
  );
  
  const rooms = useSelector(
    (state: RootState) => state.rooms
  );

  useEffect(() => {
    dispatch(fetchResidents());
    dispatch(fetchRooms());
  }, [dispatch]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [email, setEmail] = useState("");
  const [roomNumber, setRoomNumber] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingResident, setEditingResident] =
    useState<Resident | null>(null);

  const saveResident = async () => {
  
    if (!name.trim()) {
      alert("Please enter name");
      return;
    }

    if (phone.length !== 10) {
      alert("Please enter a 10 digit phone number");
      return;
    }

    if (!email.trim()) {
      alert("Please enter email");
      return;
    }

    if (roomNumber) {
      const selectedRoom = rooms.find(
        (room) => room.roomNumber === roomNumber
      );

      if (!selectedRoom) {
        alert("Room not found");
        return;
      }

      const currentResidents = residents.filter(
        (resident) =>
          resident.roomNumber === roomNumber &&
          resident._id !== editingResident?._id
      ).length;


      if (currentResidents >= selectedRoom.capacity) {
        alert("This room is full");
        return;
      }
    }

    try {
      
      if (editingResident !== null) {
        await dispatch(
          editResident({
            id: editingResident._id!,
            resident: {
              name,
              phone,
              email,
              roomNumber,
              emergencyContactName,
              emergencyContactPhone,
            },
          })
        ).unwrap();

        alert("Resident updated successfully");
      }
      else {
        await dispatch(
          createResident({
            name,
            phone,
            email,
            roomNumber,
            emergencyContactName,
            emergencyContactPhone,
          })
        ).unwrap();

        alert("Resident added successfully");
      }

      clearForm();
    } catch (error: any) {
      alert(
        error?.message ||
          "Failed to save resident"
      );
    }
  };

  
  const handleEditResident = (resident: Resident) => {
    setName(resident.name);
    setPhone(resident.phone);

    setEmergencyContactName(
      resident.emergencyContactName || ""
    );

    setEmergencyContactPhone(
      resident.emergencyContactPhone || ""
    );

    setEmail(resident.email);
    setRoomNumber(resident.roomNumber);

    setEditingResident(resident);
    setShowForm(true);
  };

  const checkoutResident = async (resident: Resident) => {
    const confirmCheckout = window.confirm(
      "Are you sure you want to check out this resident?"
    );

    if (!confirmCheckout) {
      return;
    }

    if (!resident._id) {
      alert("Resident ID not found");
      return;
    }

    try {
      await dispatch(
        editResident({
          id: resident._id,
          resident: {
            name: resident.name,
            phone: resident.phone,
            email: resident.email,
            roomNumber: "",
            emergencyContactName:
              resident.emergencyContactName || "",
            emergencyContactPhone:
              resident.emergencyContactPhone || "",
          },
        })
      ).unwrap();

      alert("Resident checked out successfully");
    } catch (error: any) {
      alert(
        error?.message ||
          "Failed to check out resident"
      );
    }
  };


  const deleteResident = async (resident: Resident) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this resident?"
    );

    if (!confirmDelete) {
      return;
    }

    if (!resident._id) {
      alert("Resident ID not found");
      return;
    }

    try {
      await dispatch(
        removeResident(resident._id)
      ).unwrap();

      alert("Resident deleted successfully");
    } catch (error: any) {
      alert(
        error?.message ||
          "Failed to delete resident"
      );
    }
  };

 
  const clearForm = () => {
    setName("");
    setPhone("");
    setEmergencyContactName("");
    setEmergencyContactPhone("");
    setEmail("");
    setRoomNumber("");

    setEditingResident(null);
    setShowForm(false);
  };

  return (
    <div>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Residents
          </h1>

          <p className="text-gray-500">
            Manage hostel residents
          </p>
        </div>

        {(role === "admin" || role === "staff") && (
          <button
            onClick={() => {
              clearForm();
              setShowForm(true);
            }}
            className="bg-mauve-500 text-white px-4 py-2 rounded-lg mr-10"
          >
            + Add Resident
          </button>
        )}
      </div>

     
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {residents.map((resident) => (
          <div
            key={resident._id}
            className="border border-solid bg-mauve-200 p-5 rounded-lg shadow"
          >
  
            <h2 className="text-lg font-semibold">
              {resident.name}
            </h2>

            <p className="text-gray-500 mt-2">
              Phone: {resident.phone}
            </p>

            {resident.emergencyContactName && (
              <p className="text-gray-500">
                Emergency Contact:{" "}
                {resident.emergencyContactName}
              </p>
            )}

            {resident.emergencyContactPhone && (
              <p className="text-gray-500">
                Emergency Phone:{" "}
                {resident.emergencyContactPhone}
              </p>
            )}

            <p className="text-gray-500">
              Email: {resident.email}
            </p>

            <p className="mt-3 font-medium">
              {resident.roomNumber
                ? `Room: ${resident.roomNumber}`
                : "Not Allocated"}
            </p>

            {(role === "admin" || role === "staff") && (
              <button
                onClick={() =>
                  handleEditResident(resident)
                }
                className="bg-gray-700 text-white px-3 py-1 rounded mt-4"
              >
                Edit
              </button>
            )}

            {(role === "admin" || role === "staff") && (
              <button
                onClick={() =>
                  checkoutResident(resident)
                }
                disabled={!resident.roomNumber}
                className="bg-blue-500 text-white px-3 py-1 rounded mt-4 ml-2 disabled:bg-gray-300"
              >
                Check Out
              </button>
            )}

            {role === "admin"  && (
              <button
                onClick={() =>
                  deleteResident(resident)
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
        <div className="w-195 rounded-lg border hover:bg-mauve-400 mt-10 ml-5">
        
          <h2 className="text-xl font-semibold mb-4">
            {editingResident !== null
              ? "Edit Resident"
              : "Add Resident"}
          </h2>

          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            className="border border-solid rounded-lg px-2 py-1 mr-2 mb-3 ml-2"
          />

          <input
            type="text"
            placeholder="Phone number"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
            className="border border-solid rounded-lg px-2 py-1 mr-2 mb-3"
          />

          <input
            type="text"
            placeholder="Emergency Contact Name"
            value={emergencyContactName}
            onChange={(e) =>
              setEmergencyContactName(e.target.value)
            }
            className="border rounded-lg px-2 py-1 mr-2 mb-3"
          />
          <input
            type="text"
            placeholder="Emergency Contact Phone"
            value={emergencyContactPhone}
            onChange={(e) =>
              setEmergencyContactPhone(e.target.value)
            }
            className="border rounded-lg px-2 py-1 mr-2 mb-3"
          />


          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="border border-solid rounded-lg px-2 py-1 mr-2 mb-3"
          />

          <select
            value={roomNumber}
            onChange={(e) =>
              setRoomNumber(e.target.value)
            }
            className="border border-solid rounded-lg px-2 py-1 mr-2 mb-3"
          >
            <option value="">
              Not Allocated
            </option>

            {rooms.map((room) => {
     
              const currentResidents =
                residents.filter(
                  (resident) =>
                    resident.roomNumber ===
                    room.roomNumber
                ).length;
           
              const isFull =
                currentResidents >= room.capacity;

              const isCurrentRoom =
                room.roomNumber === roomNumber;

              return (
                <option
                  key={room.roomNumber}
                  value={room.roomNumber}
                  disabled={
                    isFull && !isCurrentRoom
                  }
                >
                  {room.roomNumber} (
                  {currentResidents}/
                  {room.capacity})
                  {isFull ? " - Full" : ""}
                </option>
              );
            })}
          </select>

          <div className="mt-2">

            <button
              onClick={saveResident}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg ml-2 mb-2"
            >
              {editingResident !== null
                ? "Update Resident"
                : "Add Resident"}
            </button>

            <button
              onClick={clearForm}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg ml-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Residents;
