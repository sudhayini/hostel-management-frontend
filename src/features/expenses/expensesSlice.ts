
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";

export interface Expense {
  _id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  description?: string;
}

interface ExpensesState {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
}

const initialState: ExpensesState = {
  expenses: [],
  loading: false,
  error: null,
};

export const fetchExpenses = createAsyncThunk(
  "expenses/fetchExpenses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/expenses");
      return response.data as Expense[];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch expenses"
      );
    }
  }
);

export const addExpense = createAsyncThunk(
  "expenses/addExpense",
  async (
    expense: Omit<Expense, "_id">,
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/expenses", expense);
      return response.data as Expense;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add expense"
      );
    }
  }
);

export const deleteExpense = createAsyncThunk(
  "expenses/deleteExpense",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/expenses/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete expense"
      );
    }
  }
);

const expensesSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.payload || "Failed to fetch expenses");
      })
      .addCase(addExpense.fulfilled, (state, action) => {
        state.expenses.unshift(action.payload);
      })
      .addCase(addExpense.rejected, (state, action) => {
        state.error = String(action.payload || "Failed to add expense");
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter(
          (expense) => expense._id !== action.payload
        );
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.error = String(action.payload || "Failed to delete expense");
      });
  },
});

export default expensesSlice.reducer;
