
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";

type Notification = {
  _id?: string;
  userId: string;
  message: string;
  type: "Overdue" | "Due Soon" | "Maintenance" | "General";
  isRead: boolean;
  createdAt?: string;
};

const initialState: Notification[] = [];


export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async () => {
    const response = await api.get("/notifications");

    return response.data;
  }
);


export const markNotificationRead = createAsyncThunk(
  "notifications/markNotificationRead",
  async (id: string) => {
    const response = await api.put(
      `/notifications/${id}/read`
    );

    return response.data;
  }
);


export const removeNotification = createAsyncThunk(
  "notifications/removeNotification",
  async (id: string) => {
    await api.delete(`/notifications/${id}`);

    return id;
  }
);

const notificationSlice = createSlice({
  name: "notifications",

  initialState,

  reducers: {},

  extraReducers: (builder) => {

    builder.addCase(
      fetchNotifications.fulfilled,
      (_state, action) => {
        return action.payload;
      }
    );

   
    builder.addCase(
      markNotificationRead.fulfilled,
      (state, action) => {
        const index = state.findIndex(
          (notification) =>
            notification._id === action.payload._id
        );

        if (index !== -1) {
          state[index] = action.payload;
        }
      }
    );

   
    builder.addCase(
      removeNotification.fulfilled,
      (state, action) => {
        return state.filter(
          (notification) =>
            notification._id !== action.payload
        );
      }
    );
  },
});

export default notificationSlice.reducer;

