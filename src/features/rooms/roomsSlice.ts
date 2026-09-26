import { createAsyncThunk } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import api from "../../services/api"

type Room = {
  _id?:string
  roomNumber: string;
  capacity: number;
};

const initialState: Room[] = [
  {
    roomNumber: "A101",
    capacity: 4,
  },
  {
    roomNumber: "A102",
    capacity: 4,
  },
  {
    roomNumber: "A103",
    capacity: 2,
  },
];

export const fetchRooms = createAsyncThunk(
  "rooms/fetchRooms",
  async () => {
    const response = await api.get("/rooms");
    return response.data;
  }
);

export const createRoom = createAsyncThunk(
  "rooms/createRoom",
  async (room: { roomNumber: string; capacity: number }) => {
    const response = await api.post("/rooms", room);

    return response.data;
  }
);

export const editRoom = createAsyncThunk(
  "rooms/editRoom",
  async ({
    id,
    room,
  }: {
    id: string;
    room: {
      roomNumber: string;
      capacity: number;
    };
  }) => {
    const response = await api.put(`/rooms/${id}`, room);

    return response.data;
  }
);

export const removeRoom = createAsyncThunk(
  "rooms/removeRoom",
  async (id: string) => {
    await api.delete(`/rooms/${id}`);
    return id;
  }
);

const roomsSlice = createSlice({
  name: "rooms",
  initialState,
  reducers: {
  addRoom: (state, action) => {
    state.push(action.payload);
  },

  updateRoom: (state, action) => {
    const index = state.findIndex(
      (room) => room.roomNumber === action.payload.oldRoomNumber
    );

    if (index !== -1) {
      state[index] = action.payload.room;
    }
  },

  deleteRoom: (state, action) => {
    return state.filter(
      (room) => room.roomNumber !== action.payload
    );
  },
},
  extraReducers: (builder) => {
  builder.addCase(fetchRooms.fulfilled, (_state, action) => {
    return action.payload;
  });

  builder.addCase(createRoom.fulfilled, (state, action) => {
    state.push(action.payload);
  });

  builder.addCase(editRoom.fulfilled, (state, action) => {
    const index = state.findIndex(
      (room) => room._id === action.payload._id
    );

    if (index !== -1) {
      state[index] = action.payload;
    }
  });

  builder.addCase(removeRoom.fulfilled, (state, action) => {
  return state.filter((room) => room._id !== action.payload);
  });
}
});

export const{
  addRoom,
  updateRoom,
  deleteRoom,
}=roomsSlice.actions;

export default roomsSlice.reducer;