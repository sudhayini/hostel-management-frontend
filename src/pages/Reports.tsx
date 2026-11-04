
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import type { RootState, AppDispatch } from "../store/store";
import { fetchBilling } from "../features/billing/billingSlice";
import {
  fetchExpenses,
  addExpense,
  deleteExpense,
} from "../features/expenses/expensesSlice";

const expenseCategories = [
  "Electricity",
  "Water",
  "Maintenance",
  "Cleaning",
  "Food",
  "Salary",
  "Other",
];

function Reports() {
  const dispatch = useDispatch<AppDispatch>();

  const rooms = useSelector((state: RootState) => state.rooms);
  const residents = useSelector((state: RootState) => state.residents);
  const maintenance = useSelector(
    (state: RootState) => state.maintenance.maintenance
  );
  const bills = useSelector((state: RootState) => state.billing);
  const expenses = useSelector(
    (state: RootState) => state.expenses.expenses
  );
  const expenseLoading = useSelector(
    (state: RootState) => state.expenses.loading
  );
  const expenseError = useSelector(
    (state: RootState) => state.expenses.error
  );

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Electricity");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchBilling());
    dispatch(fetchExpenses());
  }, [dispatch]);

  const occupiedCount = (roomNumber: string) =>
    residents.filter(
      (resident) => resident.roomNumber === roomNumber
    ).length;

  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(
    (room) => occupiedCount(room.roomNumber) > 0
  ).length;
  const availableRooms = rooms.filter(
    (room) => occupiedCount(room.roomNumber) === 0
  ).length;
  const fullRooms = rooms.filter(
    (room) => occupiedCount(room.roomNumber) >= room.capacity
  ).length;

  const occupancyRate =
    totalRooms > 0
      ? Math.round((occupiedRooms / totalRooms) * 100)
      : 0;

  const totalResidents = residents.length;
  const allocatedResidents = residents.filter(
    (resident) => resident.roomNumber !== ""
  ).length;
  const unallocatedResidents = residents.filter(
    (resident) => resident.roomNumber === ""
  ).length;

  const totalRevenue = bills
    .filter((bill) => bill.paymentStatus === "Paid")
    .reduce((total, bill) => total + Number(bill.total || 0), 0);

  const pendingPayments = bills
    .filter((bill) => bill.paymentStatus === "Pending")
    .reduce((total, bill) => total + Number(bill.total || 0), 0);

  const partialPayments = bills
    .filter((bill) => bill.paymentStatus === "Partially Paid")
    .reduce((total, bill) => total + Number(bill.total || 0), 0);

  const paidBills = bills.filter(
    (bill) => bill.paymentStatus === "Paid"
  ).length;
  const pendingBills = bills.filter(
    (bill) => bill.paymentStatus === "Pending"
  ).length;

  const pendingMaintenance = maintenance.filter(
    (item) => item.status === "Pending"
  ).length;
  const inProgressMaintenance = maintenance.filter(
    (item) => item.status === "In Progress"
  ).length;
  const completedMaintenance = maintenance.filter(
    (item) => item.status === "Completed"
  ).length;

  const totalExpenses = expenses.reduce(
    (total, expense) => total + Number(expense.amount || 0),
    0
  );

  const netBalance = totalRevenue - totalExpenses;

  const financialChartData = [
    { name: "Paid revenue", amount: totalRevenue },
    { name: "Pending bills", amount: pendingPayments },
    { name: "Expenses", amount: totalExpenses },
  ];

  const roomChartData = [
    { name: "Occupied", value: occupiedRooms },
    { name: "Available", value: availableRooms },
    { name: "Full", value: fullRooms },
  ];

  const maintenanceChartData = [
    { name: "Pending", count: pendingMaintenance },
    { name: "In Progress", count: inProgressMaintenance },
    { name: "Completed", count: completedMaintenance },
  ];

  const formatCurrency = (value: number) =>
    `₹${value.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;

  const handleAddExpense = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setFormError("");

    const numericAmount = Number(amount);

    if (!title.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setFormError("Enter an expense title and a valid amount greater than zero.");
      return;
    }

    setSaving(true);

    try {
      await dispatch(
        addExpense({
          title: title.trim(),
          category,
          amount: numericAmount,
          date: new Date(`${date}T12:00:00`).toISOString(),
          description: description.trim(),
        })
      ).unwrap();

      setTitle("");
      setAmount("");
      setDescription("");
      setDate(new Date().toISOString().slice(0, 10));
    } catch (error) {
      setFormError(
        typeof error === "string"
          ? error
          : "Could not save the expense. Please check your login and backend."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    try {
      await dispatch(deleteExpense(id)).unwrap();
    } catch {
      setFormError("Could not delete the expense.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Reports & Financial Analytics
        </h1>
        <p className="text-gray-500">
          Hostel financial and operational reports
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg bg-white p-5 shadow">
          <p className="text-gray-500">Paid Revenue</p>
          <h2 className="mt-2 text-2xl font-bold">
            {formatCurrency(totalRevenue)}
          </h2>
        </div>
        <div className="rounded-lg bg-white p-5 shadow">
          <p className="text-gray-500">Pending Payments</p>
          <h2 className="mt-2 text-2xl font-bold">
            {formatCurrency(pendingPayments)}
          </h2>
        </div>
        <div className="rounded-lg bg-white p-5 shadow">
          <p className="text-gray-500">Total Expenses</p>
          <h2 className="mt-2 text-2xl font-bold">
            {formatCurrency(totalExpenses)}
          </h2>
        </div>
        <div className="rounded-lg bg-white p-5 shadow">
          <p className="text-gray-500">Net Balance</p>
          <h2 className="mt-2 text-2xl font-bold">
            {formatCurrency(netBalance)}
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Paid revenue minus recorded expenses
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold">
            Financial Overview
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="amount" name="Amount (₹)" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold">
            Room Occupancy
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roomChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {roomChartData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={
                        entry.name === "Occupied"
                          ? "#2563eb"
                          : entry.name === "Available"
                            ? "#16a34a"
                            : "#ea580c"
                      }
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-sm text-gray-500">
            Occupancy rate: {occupancyRate}%
          </p>
        </section>

        <section className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold">
            Maintenance Status
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={maintenanceChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Requests" fill="#7c3aed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">Room Report</h2>
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          <div>
            <p className="text-gray-500">Total Rooms</p>
            <p className="text-xl font-bold">{totalRooms}</p>
          </div>
          <div>
            <p className="text-gray-500">Occupied Rooms</p>
            <p className="text-xl font-bold">{occupiedRooms}</p>
          </div>
          <div>
            <p className="text-gray-500">Available Rooms</p>
            <p className="text-xl font-bold">{availableRooms}</p>
          </div>
          <div>
            <p className="text-gray-500">Full Rooms</p>
            <p className="text-xl font-bold">{fullRooms}</p>
          </div>
        </div>
      </section>

      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">Resident Report</h2>
        <p>Total Residents: {totalResidents}</p>
        <p>Allocated Residents: {allocatedResidents}</p>
        <p>Unallocated Residents: {unallocatedResidents}</p>
      </section>

      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">Payment Report</h2>
        <p>Paid Bills: {paidBills}</p>
        <p>Pending Bills: {pendingBills}</p>
        <p>Revenue: {formatCurrency(totalRevenue)}</p>
        <p>Pending Amount: {formatCurrency(pendingPayments)}</p>
        <p>Partially Paid Amount: {formatCurrency(partialPayments)}</p>
      </section>

      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">Maintenance Report</h2>
        <p>Pending: {pendingMaintenance}</p>
        <p>In Progress: {inProgressMaintenance}</p>
        <p>Completed: {completedMaintenance}</p>
      </section>

      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">Add Hostel Expense</h2>

        <form onSubmit={handleAddExpense} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Expense Title</label>
            <input
              className="w-full rounded border p-2"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. October electricity bill"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Category</label>
            <select
              className="w-full rounded border p-2"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {expenseCategories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Amount (₹)</label>
            <input
              className="w-full rounded border p-2"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Expense Date</label>
            <input
              className="w-full rounded border p-2"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">
              Description (optional)
            </label>
            <textarea
              className="w-full rounded border p-2"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={2}
              placeholder="Additional details"
            />
          </div>

          {formError && (
            <p className="text-sm text-red-600 md:col-span-2">{formError}</p>
          )}
          {expenseError && (
            <p className="text-sm text-red-600 md:col-span-2">{expenseError}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Add Expense"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">Expense History</h2>

        {expenseLoading ? (
          <p>Loading expenses...</p>
        ) : expenses.length === 0 ? (
          <p className="text-gray-500">No expenses recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-3">Date</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense._id} className="border-b">
                    <td className="p-3">
                      {new Date(expense.date).toLocaleDateString("en-IN")}
                    </td>
                    <td className="p-3">{expense.title}</td>
                    <td className="p-3">{expense.category}</td>
                    <td className="p-3">{formatCurrency(expense.amount)}</td>
                    <td className="p-3">{expense.description || "—"}</td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => handleDeleteExpense(expense._id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Reports;
