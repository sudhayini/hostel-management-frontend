
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";

type Bill = {
  _id?: string;
  residentName: string;
  roomNumber: string;
  roomFee: number;
  utilityFee: number;
  additionalFee: number;
  discount: number;
  lateFee: number;
  total: number;
  paymentStatus: string;
  dueDate: string;
};

const initialState: Bill[] = [];

export const fetchBilling = createAsyncThunk(
  "billing/fetchBilling",
  async () => {
    const response = await api.get("/billing");
    return response.data;
  }
);

export const createBilling = createAsyncThunk(
  "billing/createBilling",
  async (billing: {
    residentName: string;
    roomNumber: string;
    roomFee: number;
    utilityFee: number;
    additionalFee: number;
    discount: number;
    lateFee: number;
    total: number;
    paymentStatus: "Pending" | "Paid" | "Partially Paid";
    dueDate: string;
  }) => {
    const response = await api.post("/billing", billing);
    return response.data;
  }
);

export const editBilling = createAsyncThunk(
  "billing/editBilling",
  async ({
    id,
    billing,
  }: {
    id: string;
    billing: {
      residentName: string;
      roomNumber: string;
      roomFee: number;
      utilityFee: number;
      additionalFee: number;
      discount: number;
      lateFee: number;
      total: number;
      paymentStatus: "Pending" | "Paid" | "Partially Paid";
      dueDate: string;
    };
  }) => {
    const response = await api.put(`/billing/${id}`, billing);
    return response.data;
  }
);

export const removeBilling = createAsyncThunk(
  "billing/removeBilling",
  async (id: string) => {
    await api.delete(`/billing/${id}`);
    return id;
  }
);

const billingSlice = createSlice({
  name: "billing",
  initialState,

  reducers: {
    addBill: (state, action) => {
      state.push(action.payload);
    },

    updateBill: (state, action) => {
      const index = state.findIndex(
        (bill) => bill._id === action.payload.id
      );

      if (index !== -1) {
        state[index] = action.payload;
      }
    },

    deleteBill: (state, action) => {
      return state.filter(
        (bill) => bill._id !== action.payload
      );
    },
  },

  extraReducers: (builder) => {
    builder.addCase(
      fetchBilling.fulfilled,
      (_state, action) => {
        return action.payload;
      }
    );

    builder.addCase(
      createBilling.fulfilled,
      (state, action) => {
        state.push(action.payload);
      }
    );

    builder.addCase(
      editBilling.fulfilled,
      (state, action) => {
        const index = state.findIndex(
          (billing) =>
            billing._id === action.payload._id
        );

        if (index !== -1) {
          state[index] = action.payload;
        }
      }
    );

    builder.addCase(
      removeBilling.fulfilled,
      (state, action) => {
        return state.filter(
          (billing) =>
            billing._id !== action.payload
        );
      }
    );
  },
});

export const {
  addBill,
  updateBill,
  deleteBill,
} = billingSlice.actions;

export default billingSlice.reducer;

