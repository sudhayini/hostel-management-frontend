
import { useEffect, useState } from "react";
import api from "../services/api";

interface Bill {
  _id: string;
  residentName: string;
  roomNumber: string;
  total: number;
  paymentStatus: string;
}

interface Installment {
  _id: string;
  installmentNumber: number;
  amount: number;
  amountPaid: number;
  dueDate: string;
  status: string;
}

interface Payment {
  _id: string;
  billId: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  transactionId?: string;
  status?: string;
  notes?: string;
}

function ResidentMockPayments() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [billId, setBillId] = useState("");
  const [installmentId, setInstallmentId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const selectedBill = bills.find((bill) => bill._id === billId);
  const selectedInstallment = installments.find(
    (item) => item._id === installmentId
  );

  const remainingInstallment = selectedInstallment
    ? Math.max(0, selectedInstallment.amount - selectedInstallment.amountPaid)
    : 0;

  const loadData = async () => {
    try {
      const [billResponse, paymentResponse] = await Promise.all([
        api.get("/billing"),
        api.get("/payments"),
      ]);

      setBills(Array.isArray(billResponse.data) ? billResponse.data : []);
      setPayments(Array.isArray(paymentResponse.data) ? paymentResponse.data : []);
    } catch (error) {
      console.error("Failed to load resident payments:", error);
      setMessage("Unable to load your bills. Please refresh the page.");
      setMessageType("error");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleBillChange = async (id: string) => {
    setBillId(id);
    setInstallmentId("");
    setAmount("");
    setInstallments([]);
    setMessage("");

    if (!id) return;
    const chosenBill = bills.find((bill) => bill._id === id);

    try {
      const response = await api.get(`/installments/${id}`);
      const records: Installment[] = Array.isArray(response.data)
        ? response.data
        : [];

      setInstallments(records);

      if (records.length > 0) {
        const next = records.find(
          (item) =>
            item.status !== "Paid" &&
            item.amount > item.amountPaid
        );

        if (next) {
          setInstallmentId(next._id);
          setAmount(
            String(Math.max(0, next.amount - next.amountPaid))
          );
        }
      } else {
        setAmount(String(chosenBill?.total || ""));
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        setInstallments([]);
        setAmount(String(chosenBill?.total || ""));
      } else {
        setMessage(
          error.response?.data?.message ||
            "Unable to load installment details."
        );
        setMessageType("error");
      }
    }
  };

  const handleInstallmentChange = (id: string) => {
    setInstallmentId(id);
    const item = installments.find((entry) => entry._id === id);

    setAmount(
      item
        ? String(Math.max(0, item.amount - item.amountPaid))
        : ""
    );
  };

  const simulatePayment = async (outcome: "success" | "failure") => {
    if (loading) return;

    const paymentAmount = Number(amount);

    if (!billId || !selectedBill) {
      setMessage("Please select a bill.");
      setMessageType("error");
      return;
    }

    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      setMessage("Enter a valid payment amount.");
      setMessageType("error");
      return;
    }

    if (installments.length > 0 && !installmentId) {
      setMessage("Please select an unpaid installment.");
      setMessageType("error");
      return;
    }

    if (
      selectedInstallment &&
      paymentAmount > remainingInstallment + 0.001
    ) {
      setMessage("Amount cannot exceed the installment balance.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await api.post("/payments/mock-checkout", {
        billId,
        installmentId: installmentId || null,
        amount: paymentAmount,
        outcome,
        idempotencyKey: crypto.randomUUID(),
      });

      setMessage(response.data?.message || "Simulation completed.");
      setMessageType(outcome === "success" ? "success" : "error");

      await loadData();

      if (outcome === "success" && installments.length > 0) {
        const refreshed = await api.get(`/installments/${billId}`);
        const records: Installment[] = Array.isArray(refreshed.data)
          ? refreshed.data
          : [];

        setInstallments(records);

        const next = records.find(
          (item) => item.status !== "Paid" && item.amount > item.amountPaid
        );

        if (next) {
          setInstallmentId(next._id);
          setAmount(String(Math.max(0, next.amount - next.amountPaid)));
        } else {
          setInstallmentId("");
          setAmount("");
        }
      } else if (outcome === "success") {
        setAmount("");
      }
    } catch (error: any) {
      console.error("Mock checkout error:", error);
      setMessage(
        error.response?.data?.message ||
          "Mock payment could not be processed."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return <div className="p-6">Loading your payments...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="mb-2 text-3xl font-bold">My Payments</h1>

      <p className="mb-6 text-gray-600">
        Demo checkout only. No real money or card details are used.
      </p>

      {message && (
        <p
          role="status"
          className={`mb-4 rounded border p-3 ${
            messageType === "success"
              ? "border-green-300 bg-green-50 text-green-800"
              : "border-red-300 bg-red-50 text-red-800"
          }`}
        >
          {message}
        </p>
      )}

      <section className="mb-8 max-w-2xl rounded-xl border bg-white p-5">
        <h2 className="mb-4 text-xl font-semibold">
          Mock Payment Checkout
        </h2>

        <div className="mb-4">
          <label htmlFor="residentBill" className="mb-1 block font-medium">
            Select Your Bill
          </label>
          <select
            id="residentBill"
            value={billId}
            onChange={(event) => void handleBillChange(event.target.value)}
            className="w-full rounded border p-2"
          >
            <option value="">Choose a bill</option>
            {bills
              .filter((bill) => bill.paymentStatus !== "Paid")
              .map((bill) => (
                <option key={bill._id} value={bill._id}>
                  Room {bill.roomNumber} — ₹{Number(bill.total).toFixed(2)}
                  {" "}({bill.paymentStatus})
                </option>
              ))}
          </select>
        </div>

        {installments.length > 0 && (
          <div className="mb-4">
            <label htmlFor="residentInstallment" className="mb-1 block font-medium">
              Select Installment
            </label>
            <select
              id="residentInstallment"
              value={installmentId}
              onChange={(event) => handleInstallmentChange(event.target.value)}
              className="w-full rounded border p-2"
            >
              <option value="">Choose an installment</option>
              {installments.map((item) => (
                <option
                  key={item._id}
                  value={item._id}
                  disabled={item.status === "Paid" || item.amount <= item.amountPaid}
                >
                  Installment {item.installmentNumber} — Remaining ₹
                  {(item.amount - item.amountPaid).toFixed(2)}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedInstallment && (
          <div className="mb-4 rounded bg-gray-50 p-3 text-sm">
            <p>Installment amount: ₹{selectedInstallment.amount.toFixed(2)}</p>
            <p>Already paid: ₹{selectedInstallment.amountPaid.toFixed(2)}</p>
            <p>Remaining: ₹{remainingInstallment.toFixed(2)}</p>
            <p>
              Due date: {new Date(selectedInstallment.dueDate).toLocaleDateString()}
            </p>
          </div>
        )}

        <div className="mb-5">
          <label htmlFor="mockAmount" className="mb-1 block font-medium">
            Payment Amount (₹)
          </label>
          <input
            id="mockAmount"
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="w-full rounded border p-2"
            disabled={!billId || loading}
          />
        </div>

        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          <strong>Demo mode:</strong> This is a simulated payment gateway.
          Do not enter card numbers, PAN, UPI PINs, or banking details.
          No actual payment will be made.
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void simulatePayment("success")}
            disabled={loading || !billId || !amount || (installments.length > 0 && !installmentId)}
            className="rounded bg-green-600 px-5 py-2 text-white disabled:opacity-50"
          >
            {loading ? "Processing..." : "Simulate Success"}
          </button>

          <button
            type="button"
            onClick={() => void simulatePayment("failure")}
            disabled={loading || !billId || !amount || (installments.length > 0 && !installmentId)}
            className="rounded bg-red-600 px-5 py-2 text-white disabled:opacity-50"
          >
            Simulate Failure
          </button>
        </div>
      </section>

      <h2 className="mb-4 text-xl font-semibold">My Payment History</h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-3 text-left">Amount</th>
              <th className="border p-3 text-left">Method</th>
              <th className="border p-3 text-left">Date</th>
              <th className="border p-3 text-left">Transaction ID</th>
              <th className="border p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment._id}>
                <td className="border p-3">
                  ₹{Number(payment.amount).toFixed(2)}
                </td>
                <td className="border p-3">{payment.paymentMethod}</td>
                <td className="border p-3">
                  {payment.paymentDate
                    ? new Date(payment.paymentDate).toLocaleDateString()
                    : "—"}
                </td>
                <td className="border p-3">{payment.transactionId || "—"}</td>
                <td className="border p-3">
                  <span
                    className={
                      payment.status === "Failed"
                        ? "font-semibold text-red-600"
                        : "font-semibold text-green-700"
                    }
                  >
                    {payment.status || "Success"}
                  </span>
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No payment records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ResidentMockPayments;
