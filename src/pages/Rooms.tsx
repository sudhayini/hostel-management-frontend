import { useEffect, useState } from "react";
import type { RootState, AppDispatch } from "../store/store";
import { useSelector, useDispatch } from "react-redux";

import {
  removeRoom,
  fetchRooms,
  createRoom,
  editRoom,
} from "../features/rooms/roomsSlice";

type Room = {
  _id?: string;
  roomNumber: string;
  roomType: "Single" | "Double" | "Triple" | "Shared";
  rent: number;
  capacity: number;
  occupied?: number;
  status: "Available" | "Occupied" | "Full" | "Maintenance";
};

const roomTypes = ["Single", "Double", "Triple", "Shared"] as const;

export function Rooms() {
  const rooms = useSelector((state: RootState) => state.rooms);
  const residents = useSelector((state: RootState) => state.residents);
  const dispatch = useDispatch<AppDispatch>();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role;

  const [roomNumber, setRoomNumber] = useState("");
  const [roomType, setRoomType] =
    useState<Room["roomType"]>("Shared");
  const [rent, setRent] = useState("");
  const [capacity, setCapacity] = useState("");
  const [status, setStatus] =
    useState<Room["status"]>("Available");
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  useEffect(() => {
    dispatch(fetchRooms());
  }, [dispatch]);

  const getOccupiedCount = (room: Room) =>
    residents.filter(
      (resident) => resident.roomNumber === room.roomNumber
    ).length;

  const getRoomStatus = (room: Room): NonNullable<Room["status"]> => {
    if (room.status === "Maintenance"){
      return "Maintenance";
    }
    const occupiedCount = getOccupiedCount(room);

    if (occupiedCount >= room.capacity){
      return "Full";
    }
    if (occupiedCount > 0){
       return "Occupied";
      }

    return "Available";
  };

  const resetForm = () => {
    setRoomNumber("");
    setRoomType("Shared");
    setRent("");
    setCapacity("");
    setStatus("Available");
    setEditingRoom(null);
    setShowForm(false);
  };

  const saveRoom = async () => {
    const normalizedRoomNumber = roomNumber.trim();

    if (!normalizedRoomNumber) {
      alert("Please enter a room number");
      return;
    }

    if (!capacity || !Number.isInteger(Number(capacity)) ||
        Number(capacity) < 1) {
      alert("Capacity must be a positive whole number");
      return;
    }

    if (rent.trim() === "" || !Number.isFinite(Number(rent)) ||
        Number(rent) < 0) {
      alert("Please enter a valid monthly rent");
      return;
    }

    const roomExists = rooms.some(
      (room) =>
        room.roomNumber.toLowerCase() ===
          normalizedRoomNumber.toLowerCase() &&
        room.roomNumber.toLowerCase() !==
          editingRoom?.roomNumber.toLowerCase()
    );

    if (roomExists) {
      alert("Room number already exists");
      return;
    }

    if (editingRoom && Number(capacity) < getOccupiedCount(editingRoom)) {
      alert("Capacity cannot be less than the current number of residents");
      return;
    }

    const newRoom: Room = {
      roomNumber: roomNumber.trim(),
      roomType,
      rent: Number(rent),
      capacity: Number(capacity),
      status,
    };

    try {
      if (editingRoom) {
        if (!editingRoom._id) {
          alert("Room ID not found");
          return;
        }

        await dispatch(
          editRoom({
            id: editingRoom._id,
            room: newRoom,
          })
        ).unwrap();
      } else {
        await dispatch(createRoom(newRoom)).unwrap();
      }

      await dispatch(fetchRooms()).unwrap();
      resetForm();
    } catch (error) {
      alert(
        typeof error === "string"
          ? error
          : "Failed to save room. Please check the room details and try again."
      );
    }
  };

  const editRoomHandler = (room: Room) => {
    setRoomNumber(room.roomNumber);
    setRoomType(room.roomType || "Shared");
    setRent(String(room.rent ?? 0));
    setCapacity(String(room.capacity));
    setStatus(room.status || "Available");
    setEditingRoom(room);
    setShowForm(true);
  };

  const deleteRoom = async (room: Room) => {
    if (getOccupiedCount(room) > 0) {
      alert("Cannot delete a room with residents");
      return;
    }

    if (!room._id) {
      alert("Room ID not found");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this room?")) {
      return;
    }

    try {
      await dispatch(removeRoom(room._id)).unwrap();
      await dispatch(fetchRooms()).unwrap();
    } catch {
      alert("Failed to delete room");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Rooms</h1>
          <p className="text-gray-500">
            Manage hostel rooms and room allocation
          </p>
        </div>

        {(role === "admin" || role === "staff") && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-gray-400 border text-black px-3 py-2 rounded-lg"
          >
            + Add Room
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white border rounded-lg p-5 mb-6 space-y-4">
          <h2 className="text-lg font-semibold">
            {editingRoom ? "Edit Room" : "Add New Room"}
          </h2>

          <input
            type="text"
            placeholder="Room Number"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            className="border px-3 py-2 rounded-lg mr-2"
          />

          <select
            value={roomType}
            onChange={(e) =>
              setRoomType(e.target.value as Room["roomType"])
            }
            className="border px-3 py-2 rounded-lg mr-2"
          >
            {roomTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="0"
            placeholder="Monthly Rent (₹)"
            value={rent}
            onChange={(e) => setRent(e.target.value)}
            className="border px-3 py-2 rounded-lg mr-2"
          />

          <input
            type="number"
            min="1"
            step="1"
            placeholder="Capacity"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="border px-3 py-2 rounded-lg mr-2"
          />

          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as Room["status"])
            }
            className="border px-3 py-2 rounded-lg mr-2"
          >
            <option value="Available">Available</option>
            <option value="Maintenance">Maintenance</option>
          </select>

          <div className="flex gap-2">
            <button
              onClick={saveRoom}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg"
            >
              {editingRoom ? "Update" : "Add"}
            </button>

            <button
              onClick={resetForm}
              className="bg-red-500 text-white px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {rooms.map((room) => {
          const occupiedCount = getOccupiedCount(room);
          const roomStatus = getRoomStatus(room);

          return (
            <div
              key={room._id || room.roomNumber}
              className="bg-mauve-200 p-4 border rounded-lg shadow"
            >
              <h2 className="text-lg font-semibold">
                Room {room.roomNumber}
              </h2>

              <p className="mt-2">Type: {room.roomType || "Shared"}</p>
              <p>Monthly Rent: ₹{room.rent ?? 0}</p>
              <p>Capacity: {room.capacity}</p>
              <p>
                Occupied: {occupiedCount} / {room.capacity}
              </p>
              <p>Available beds: {Math.max(0, room.capacity - occupiedCount)}</p>

              <p className="mt-3 font-medium">
                Status: {roomStatus}
              </p>

              {(role === "admin" || role === "staff") && (
                <button
                  onClick={() => editRoomHandler(room)}
                  className="bg-gray-700 text-white px-2 py-1 rounded"
                >
                  Edit
                </button>
              )}

              {role === "admin" && (
                <button
                  onClick={() => deleteRoom(room)}
                  className="bg-red-500 text-white px-3 py-1 rounded ml-2"
                >
                  Delete
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
