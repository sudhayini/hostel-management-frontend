import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";

export type Payment = {
  _id?: string;
  billId: string;
  installmentId?: string | null;
  residentName: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  transactionId?: string;
  notes?: string;
  idempotencyKey?: string;
  status?: string;
};

type CreatePaymentInput = {
  billId: string;
  installmentId?: string | null;
  residentName?: string;
  amount: number;
  paymentMethod: string;
  paymentDate?: string;
  transactionId?: string;
  notes?: string;
  idempotencyKey?: string;
};

type CreatePaymentResponse = {
  message: string;
  payment: Payment;
  installment: {
    _id: string;
    billId: string;
    installmentNumber: number;
    amount: number;
    amountPaid: number;
    dueDate: string;
    status: string;
  } | null;
};

const initialState: Payment[] = [];

const createIdempotencyKey = () => {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }

  return `payment-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
};

export const fetchPayments = createAsyncThunk<Payment[]>(
  "payments/fetchPayments",
  async () => {
    const response = await api.get<Payment[]>("/payments");
    return response.data;
  }
);

export const createPayment = createAsyncThunk<
  CreatePaymentResponse,
  CreatePaymentInput
>(
  "payments/createPayment",
  async (payment) => {
    const payload = {
      ...payment,
      paymentDate: payment.paymentDate || new Date().toISOString(),
      idempotencyKey:
        payment.idempotencyKey || createIdempotencyKey(),
    };

    const response = await api.post<CreatePaymentResponse>(
      "/payments",
      payload
    );

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
      const createdPayment = action.payload.payment;

      if (!createdPayment?._id) {
        return;
      }

      const existingIndex = state.findIndex(
        (payment) => payment._id === createdPayment._id
      );

      if (existingIndex >= 0) {
        state[existingIndex] = createdPayment;
      } else {
        state.unshift(createdPayment);
      }
    });
  },
});

export default paymentsSlice.reducer;
