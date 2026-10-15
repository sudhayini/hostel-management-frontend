import { useEffect, useState } from "react";
import api from "../services/api";

interface Bill {
  _id: string;
  residentName: string;
  roomNumber: string;
  total: number;
  paymentStatus: string;
}

interface Payment {
  _id: string;
  billId: string;
  residentName: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  transactionId?: string;
  notes?: string;
}

const Payments = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [billId, setBillId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [transactionId, setTransactionId] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [billResponse, paymentResponse] = await Promise.all([
        api.get("/billing"),
        api.get("/payments"),
      ]);

      setBills(billResponse.data);
      setPayments(paymentResponse.data);
    } catch (error) {
      console.error("Failed to load payment data:", error);
      setMessage("Unable to load bills or payments.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBillChange = (selectedBillId: string) => {
    setBillId(selectedBillId);

    const selectedBill = bills.find(
      (bill) => bill._id === selectedBillId
    );

    setAmount(
      selectedBill ? String(selectedBill.total) : ""
    );
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setMessage("");

    if (!billId || !amount || Number(amount) <= 0) {
      setMessage("Please select a bill and enter a valid amount.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/payments", {
        billId,
        amount: Number(amount),
        paymentMethod,
        paymentDate,
        transactionId,
        notes,
      });

      setMessage(
        "Payment recorded successfully. Email notification was attempted."
      );

      setBillId("");
      setAmount("");
      setPaymentMethod("Cash");
      setPaymentDate(new Date().toISOString().slice(0, 10));
      setTransactionId("");
      setNotes("");

      await loadData();
    } catch (error: any) {
      console.error("Failed to record payment:", error);
      setMessage(
        error.response?.data?.message ||
          "Failed to record payment."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="mb-2 text-3xl font-bold">Payments</h1>
      <p className="mb-6 text-gray-600">
        Record hostel bill payments and view payment history.
      </p>

      {message && (
        <p className="mb-4 rounded border p-3" role="status">
          {message}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="mb-8 max-w-2xl space-y-4 rounded-lg border p-5"
      >
        <h2 className="text-xl font-semibold">
          Record a Payment
        </h2>

        <div>
          <label className="mb-1 block font-medium">
            Select Bill
          </label>
          <select
            value={billId}
            onChange={(event) =>
              handleBillChange(event.target.value)
            }
            className="w-full rounded border p-2"
            required
          >
            <option value="">Choose a bill</option>
            {bills.map((bill) => (
              <option key={bill._id} value={bill._id}>
                {bill.residentName} — Room {bill.roomNumber} —
                ₹{bill.total} ({bill.paymentStatus})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block font-medium">
            Amount Received (₹)
          </label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="w-full rounded border p-2"
            required
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">
            Payment Method
          </label>
          <select
            value={paymentMethod}
            onChange={(event) =>
              setPaymentMethod(event.target.value)
            }
            className="w-full rounded border p-2"
          >
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Card">Card</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block font-medium">
            Payment Date
          </label>
          <input
            type="date"
            value={paymentDate}
            onChange={(event) =>
              setPaymentDate(event.target.value)
            }
            className="w-full rounded border p-2"
            required
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">
            Transaction ID (optional)
          </label>
          <input
            value={transactionId}
            onChange={(event) =>
              setTransactionId(event.target.value)
            }
            className="w-full rounded border p-2"
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="w-full rounded border p-2"
            rows={3}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-blue-600 px-5 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Saving..." : "Record Payment"}
        </button>
      </form>

      <h2 className="mb-4 text-xl font-semibold">
        Payment History
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-3 text-left">Resident</th>
              <th className="border p-3 text-left">Amount</th>
              <th className="border p-3 text-left">Method</th>
              <th className="border p-3 text-left">Date</th>
              <th className="border p-3 text-left">
                Transaction ID
              </th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment._id}>
                <td className="border p-3">
                  {payment.residentName}
                </td>
                <td className="border p-3">
                  ₹{payment.amount}
                </td>
                <td className="border p-3">
                  {payment.paymentMethod}
                </td>
                <td className="border p-3">
                  {payment.paymentDate
                    ? new Date(
                        payment.paymentDate
                      ).toLocaleDateString()
                    : "—"}
                </td>
                <td className="border p-3">
                  {payment.transactionId || "—"}
                </td>
              </tr>
            ))}

            {payments.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="p-4 text-center text-gray-500"
                >
                  No payment records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payments;
