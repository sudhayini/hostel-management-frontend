import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";

type Payment = {
  _id?: string;
  billId: string;
  residentName: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  transactionId: string;
  notes: string;
};

const initialState: Payment[] = [];


export const fetchPayments = createAsyncThunk(
  "payments/fetchPayments",
  async () => {
    const response = await api.get("/payments");
    return response.data;
  }
);

// Create payment
export const createPayment = createAsyncThunk(
  "payments/createPayment",
  async (payment: {
    billId: string;
    residentName: string;
    amount: number;
    paymentMethod: string;
    paymentDate: string;
    transactionId: string;
    notes: string;
  }) => {
    const response = await api.post("/payments", payment);
    return response.data;
  }
);

const paymentsSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchPayments.fulfilled, (_state, action) => {
      return action.payload;
    });

    builder.addCase(createPayment.fulfilled, (state, action) => {
      state.unshift(action.payload);
    });
  },
});

export default paymentsSlice.reducer;

