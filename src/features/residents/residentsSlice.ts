import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";

type Resident = {
  _id?:string;
  name: string;
  phone: string;
  email: string;
  roomNumber: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
};

const initialState: Resident[] = [];

export const fetchResidents = createAsyncThunk(
  "residents/fetchResidents",
  async () => {
    const response = await api.get("/residents");
    return response.data;
  }
);

export const createResident = createAsyncThunk(
  "residents/createResident",
  async (resident: {
    name: string;
    phone: string;
    email: string;
    roomNumber: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
  }) => {
    const response = await api.post("/residents", resident);
    return response.data.resident;
  }
);

export const editResident = createAsyncThunk(
  "residents/editResident",
  async ({
    id,
    resident,
  }: {
    id: string;
    resident: {
      name: string;
      phone: string;
      email: string;
      roomNumber: string;
      emergencyContactName: string;
      emergencyContactPhone: string;
    };
  }) => {
    const response = await api.put(`/residents/${id}`, resident);
    return response.data;
  }
);

export const removeResident = createAsyncThunk(
  "residents/removeResident",
  async (id: string) => {
    await api.delete(`/residents/${id}`);
    return id;
  }
);

const residentsSlice = createSlice({
  name: "residents",
  initialState,

  reducers: {
    addResident: (state, action) => {
      state.push(action.payload);
    },

    updateResident: (state, action) => {
      const index = state.findIndex(
        (resident) => resident._id === action.payload.id
      );

      if (index !== -1) {
        state[index] = action.payload;
      }
    },

    deleteResident: (state, action) => {
      return state.filter(
        (resident) => resident._id !== action.payload
      );
    },
  },

 extraReducers: (builder)=>{

  builder.addCase(fetchResidents.fulfilled, (_state, action) => {
  return action.payload;
});
  
  builder.addCase(createResident.fulfilled, (state, action) => {
    state.push(action.payload);
  });

  builder.addCase(editResident.fulfilled, (state, action) => {
    const index = state.findIndex(
      (resident) => resident._id === action.payload._id
    );

    if (index !== -1) {
      state[index] = action.payload;
    }
  });

  builder.addCase(removeResident.fulfilled, (state, action) => {
    return state.filter(
      (resident) => resident._id !== action.payload
    );
  });

}

});



export const {
  addResident,
  updateResident,
  deleteResident,
} = residentsSlice.actions;

export default residentsSlice.reducer;
