import {useEffect,useState } from "react";
import type {RootState,AppDispatch} from "../store/store";
import { useSelector,useDispatch } from "react-redux";

import { 
  removeRoom,
  fetchRooms,
  createRoom,
  editRoom,
} from "../features/rooms/roomsSlice";

type Room = {
  _id?:string;
  roomNumber: string;
  capacity: number;
  occupied?: number;
  status?: string;
};
 
export function Rooms() {

    const rooms = useSelector((state: RootState) => state.rooms); 

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const role = user.role;

    const residents = useSelector((state: RootState) => state.residents);
    
    const dispatch = useDispatch<AppDispatch>();
    useEffect(() => {
    dispatch(fetchRooms());}, [dispatch]);

    const[roomNumber,setRoomNumber]=useState("");
    const[capacity,setCapacity]=useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);

    const saveRoom = () => {
      if(!roomNumber){
        alert("pls enter room number")
        return;}

      const roomExists = rooms.some(
      (room) => room.roomNumber.toLowerCase() === roomNumber.toLowerCase()&&
       room.roomNumber.toLowerCase()!==editingRoom?.roomNumber.toLocaleLowerCase());

      if(roomExists) {
        alert("Room number already exists");
        return; }

      if(Number(capacity) <= 0) {
        alert("Capacity must be greater than 0");
       return;
       }

       if (editingRoom) {
  const occupiedCount = residents.filter(
    (resident) => resident.roomNumber === editingRoom.roomNumber
  ).length;

  if (Number(capacity) < occupiedCount) {
    alert(
      `Capacity cannot be less than current residents (${occupiedCount})`
    );
    return;
  }
}

    const newRoom: Room = {
      roomNumber: roomNumber,
      capacity: Number(capacity),
    };

    
    if (editingRoom) {
  dispatch(
    editRoom({
      id: editingRoom._id!,
      room: newRoom,
    })
  );

  setEditingRoom(null);
} else {
  dispatch(createRoom(newRoom));
}
    setRoomNumber("");
    setCapacity("");
    setShowForm(false);
  };

  const editRoomHandler = (room: Room) => {
  setRoomNumber(room.roomNumber);
  setCapacity(String(room.capacity));
  setEditingRoom(room);
  setShowForm(true);
};

  const deleteRoom = (room: Room) => {

    const roomResidents = residents.filter(
  (resident) => resident.roomNumber === room.roomNumber
);

if (roomResidents.length > 0) {
  alert("Cannot delete a room with residents");
  return;
}

  const confirmDelete = window.confirm(
    "Are you sure you want to delete this room?"
  );

  if (!confirmDelete) {
    return;
  }

  if(!room._id){
    alert("Room ID not found")
    return
  }

 dispatch(removeRoom(room._id));
  };
   
   const cancelForm = () => {
    setRoomNumber("");
    setCapacity("");
    setEditingRoom(null);
    setShowForm(false);
  };

  return (
    <div>

      <div className="flex justify-between items-center mb-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Rooms
          </h1>

          <p className="text-gray-500">
            Manage hostel rooms and room allocation
          </p>
        </div>

         {(role === "admin" || role === "staff") && (
         <button
          onClick={() => {
          setEditingRoom(null);
          setRoomNumber("");
          setCapacity("");
          setShowForm(true);
           }}
         className="bg-gray-400 border border-solid text-black px-3 py-2 rounded-lg absolute right-10"
         >
       + Add Room
      </button>
       )}
      </div>


  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

     {rooms.map((room) => {
  const occupiedCount = residents.filter(
    (resident) => resident.roomNumber === room.roomNumber
  ).length;

  let roomStatus = "Available";

  if (occupiedCount >= room.capacity) {
    roomStatus = "Full";
  } else if (occupiedCount > 0) {
    roomStatus = "Partial";
  }

  return (
       
    <div
      key={room.roomNumber}
      className="w-74 bg-mauve-200 p-4 border border-solid rounded-lg shadow"
    >

      <h2 className="text-lg font-semibold">
        Room {room.roomNumber}
      </h2>

      <p className="text-gray-800 mt-2">
        Capacity: {room.capacity}
      </p>

      <p className="text-gray-800">
        Occupied: {occupiedCount} / {room.capacity}
      </p>

      <p className="mt-3 font-medium">
        {roomStatus}
      </p>

    {(role === "admin" || role === "staff") && (
    <button
    onClick={() => editRoomHandler(room)}
    className="bg-gray-700 text-white px-2 py-1 rounded"
     >
    Edit
    </button>
    )}

    {(role === "admin" || role === "staff") && (
    <button
    onClick={() => deleteRoom(room)}
    className="bg-red-500 text-white px-3 py-1 rounded ml-2"
      >
    Delete
    </button>
    )}

    </div>)

})}

</div>

{showForm &&(
  <div >

 <input
        type="text"
        placeholder="Room Number"
        value={roomNumber}
        onChange={(e) => setRoomNumber(e.target.value)}
        className="border border-solid px-1 py-1 bg-gray-300 rounded-lg mr-2"
      />

      <input
        type="number"
        placeholder="Capacity"
        value={capacity}
        onChange={(e) => setCapacity(e.target.value)}
         className="border border-solid px-1 py-1 bg-gray-300 rounded-lg mr-2"
      />
      <button
       onClick={saveRoom}
       className="bg-gray-800 text-white px-4 py-2 rounded-lg mr-2">
        {editingRoom ? "Update" : "Add"}
       </button>

         <button
          onClick={cancelForm}
          className="bg-red-500 text-white px-4 py-2 rounded-lg">
          cancel
          </button>
     </div>
)}
 </div>
 
  );
}

