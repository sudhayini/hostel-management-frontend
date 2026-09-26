import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";

type Staff = {
  _id: string;
  name: string;
  email: string;
};
type Maintenance = {
  _id?:string;
  residentName: string;
  roomNumber: string;
  issue: string;
  priority:"Low"|"Medium"|"High";
  status: "Pending"|"In Progress"|"Completed";
  assignedStaff: string;
};

type MaintenanceState = {
  maintenance: Maintenance[];
  staff: Staff[];
};

const initialState: MaintenanceState = {
  maintenance: [],
  staff: [],
};

export const fetchMaintenance = createAsyncThunk(
  "maintenance/fetchMaintenance",
  async () => {
    const response = await api.get("/maintenance");
    return response.data;
  }
);

export const fetchStaff = createAsyncThunk(
  "maintenance/fetchStaff",
  async () => {
    const response = await api.get("/auth/staff");
    return response.data;
  }
);
//put
export const createMaintenance = createAsyncThunk(
  "maintenance/createMaintenance",
  async (maintenance: {
    residentName: string;
    roomNumber: string;
    issue: string;
    priority: "Low" | "Medium" | "High";
    status: "Pending" | "In Progress" | "Completed";
    assignedStaff: string;
  }) => {
    const response = await api.post("/maintenance", maintenance);
    return response.data;
  }
);

export const editMaintenance = createAsyncThunk(
  "maintenance/editMaintenance",
  async ({
    id,
    maintenance,
  }: {
    id: string;
    maintenance: {
      residentName: string;
      roomNumber: string;
      issue: string;
      priority: "Low" | "Medium" | "High";
      status: "Pending" | "In Progress" | "Completed";
       assignedStaff: string;
    };
  }) => {
    const response = await api.put(`/maintenance/${id}`, maintenance);
    return response.data;
  }
);

export const removeMaintenance = createAsyncThunk(
  "maintenance/removeMaintenance",
  async (id: string) => {
    await api.delete(`/maintenance/${id}`);
    return id;
  }
);

const maintenanceSlice = createSlice({
  name: "maintenance",
  initialState,

 reducers: {
  addMaintenance: (state, action) => {
    state.maintenance.push(action.payload);
  },

  updateMaintenance: (
    state,
    action: { payload: Maintenance & { id: string } }
  ) => {
    const index = state.maintenance.findIndex(
      (item) => item._id === action.payload.id
    );

    if (index !== -1) {
      state.maintenance[index] = {
        _id: action.payload.id,
        residentName: action.payload.residentName,
        roomNumber: action.payload.roomNumber,
        issue: action.payload.issue,
        priority: action.payload.priority,
        status: action.payload.status,
        assignedStaff: action.payload.assignedStaff,
      };
    }
  },

  deleteMaintenance: (state, action) => {
    state.maintenance = state.maintenance.filter(
      (item) => item._id !== action.payload
    );
  },
},

 extraReducers: (builder) => {
  builder.addCase(fetchMaintenance.fulfilled, (state, action) => {
    state.maintenance = action.payload;
  });

  builder.addCase(fetchStaff.fulfilled, (state, action) => {
    state.staff = action.payload;
  });

  builder.addCase(createMaintenance.fulfilled, (state, action) => {
    state.maintenance.push(action.payload);
  });

  builder.addCase(editMaintenance.fulfilled, (state, action) => {
    const index = state.maintenance.findIndex(
      (maintenance) => maintenance._id === action.payload._id
    );

    if (index !== -1) {
      state.maintenance[index] = action.payload;
    }
  });

  builder.addCase(removeMaintenance.fulfilled, (state, action) => {
    state.maintenance = state.maintenance.filter(
      (maintenance) => maintenance._id !== action.payload
    );
  });
},

});

export const {
  addMaintenance,
  updateMaintenance,
  deleteMaintenance,
} = maintenanceSlice.actions;

export default maintenanceSlice.reducer;