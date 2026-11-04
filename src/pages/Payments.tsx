import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
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
  billId: string;
  installmentNumber: number;
  amount: number;
  amountPaid: number;
  dueDate: string;
  status: "Pending" | "Partially Paid" | "Paid" | "Overdue";
}

interface Payment {
  _id: string;
  billId: string;
  installmentId?: string | null;
  residentName: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  transactionId?: string;
  notes?: string;
  status?: string;
}

const Payments = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);

  const [billId, setBillId] = useState("");
  const [installmentId, setInstallmentId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [transactionId, setTransactionId] = useState("");
  const [notes, setNotes] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | "info"
  >("info");

  const [loading, setLoading] = useState(false);
  const [loadingInstallments, setLoadingInstallments] = useState(false);
  const [hasInstallmentPlan, setHasInstallmentPlan] = useState(false);

  // Reuse the key when retrying the same request.
  const idempotencyKeyRef = useRef<string | null>(null);

  const selectedBill = bills.find((bill) => bill._id === billId);

  const selectedInstallment = installments.find(
    (item) => item._id === installmentId
  );

  const remainingInstallmentAmount = selectedInstallment
    ? Math.max(
        0,
        selectedInstallment.amount - selectedInstallment.amountPaid
      )
    : 0;

  const showMessage = (
    text: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    setMessage(text);
    setMessageType(type);
  };

  const loadData = async () => {
    try {
      const [billResponse, paymentResponse] = await Promise.all([
        api.get("/billing"),
        api.get("/payments"),
      ]);

      setBills(
        Array.isArray(billResponse.data) ? billResponse.data : []
      );

      setPayments(
        Array.isArray(paymentResponse.data) ? paymentResponse.data : []
      );
    } catch (error) {
      console.error("Failed to load payment data:", error);

      showMessage(
        "Unable to load bills or payments. Please try again.",
        "error"
      );
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleBillChange = async (selectedBillId: string) => {
    setBillId(selectedBillId);
    setInstallmentId("");
    setAmount("");
    setInstallments([]);
    setHasInstallmentPlan(false);
    setMessage("");

    // A different bill means a different payment request.
    idempotencyKeyRef.current = null;

    if (!selectedBillId) return;

    setLoadingInstallments(true);

    try {
      const response = await api.get(
        `/installments/${selectedBillId}`
      );

      const fetchedInstallments: Installment[] = Array.isArray(
        response.data
      )
        ? response.data
        : [];

      setInstallments(fetchedInstallments);
      setHasInstallmentPlan(fetchedInstallments.length > 0);

      if (fetchedInstallments.length > 0) {
        const nextInstallment = fetchedInstallments.find(
          (item) =>
            item.status !== "Paid" &&
            item.amount > item.amountPaid
        );

        if (nextInstallment) {
          setInstallmentId(nextInstallment._id);
          setAmount(
            String(
              nextInstallment.amount - nextInstallment.amountPaid
            )
          );
        } else {
          showMessage(
            "All installments for this bill are paid.",
            "info"
          );
        }
      } else {
        // No installment plan: allow a normal bill payment.
        showMessage(
          "This bill has no installment plan. You can record a payment against the bill balance.",
          "info"
        );
      }
    } catch (error: any) {
      console.error("Failed to load installments:", error);

      // Some APIs return 404 when a bill has no plan.
      // Treat that as no plan; display other errors.
      if (error.response?.status === 404) {
        setInstallments([]);
        setHasInstallmentPlan(false);

        showMessage(
          "This bill has no installment plan. You can record a payment against the bill balance.",
          "info"
        );
      } else {
        showMessage(
          error.response?.data?.message ||
            "Unable to load installment details.",
          "error"
        );
      }
    } finally {
      setLoadingInstallments(false);
    }
  };

  const handleInstallmentChange = (selectedId: string) => {
    setInstallmentId(selectedId);
    idempotencyKeyRef.current = null;

    const installment = installments.find(
      (item) => item._id === selectedId
    );

    if (installment) {
      setAmount(
        String(
          Math.max(0, installment.amount - installment.amountPaid)
        )
      );
    } else {
      setAmount("");
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (loading) return;

    setMessage("");

    const paymentAmount = Number(amount);

    if (!billId || !selectedBill) {
      showMessage("Please select a bill.", "error");
      return;
    }

    if (
      !Number.isFinite(paymentAmount) ||
      paymentAmount <= 0
    ) {
      showMessage(
        "Enter a valid payment amount greater than zero.",
        "error"
      );
      return;
    }

    // When a plan exists, an unpaid installment must be selected.
    if (hasInstallmentPlan && !installmentId) {
      showMessage(
        "Please select an unpaid installment.",
        "error"
      );
      return;
    }

    if (
      hasInstallmentPlan &&
      paymentAmount > remainingInstallmentAmount + 0.001
    ) {
      showMessage(
        `Payment cannot exceed the installment balance of ₹${remainingInstallmentAmount.toFixed(2)}.`,
        "error"
      );
      return;
    }

    // Reuse the same key when retrying the same payment.
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = crypto.randomUUID();
    }

    const idempotencyKey = idempotencyKeyRef.current;

    setLoading(true);

    try {
      const response = await api.post("/payments", {
        billId,
        // Send null when the bill has no installment plan.
        installmentId: installmentId || null,
        amount: paymentAmount,
        paymentMethod,
        paymentDate,
        transactionId: transactionId.trim(),
        notes: notes.trim(),
        idempotencyKey,
      });

      // A 200 response can mean this request was already processed.
      // Both 200 and 201 indicate that the payment exists.
      idempotencyKeyRef.current = null;

      showMessage(
        response.data?.message === "Payment was already recorded"
          ? "This payment was already recorded. No duplicate was created."
          : "Payment recorded successfully.",
        "success"
      );

      setTransactionId("");
      setNotes("");
      setPaymentMethod("Cash");
      setPaymentDate(new Date().toISOString().slice(0, 10));

      await loadData();

      // Refresh installment information after saving.
      if (hasInstallmentPlan) {
        try {
          const refreshResponse = await api.get(
            `/installments/${billId}`
          );

          const refreshedInstallments: Installment[] = Array.isArray(
            refreshResponse.data
          )
            ? refreshResponse.data
            : [];

          setInstallments(refreshedInstallments);

          const nextInstallment = refreshedInstallments.find(
            (item) =>
              item.status !== "Paid" &&
              item.amount > item.amountPaid
          );

          if (nextInstallment) {
            setInstallmentId(nextInstallment._id);
            setAmount(
              String(
                Math.max(
                  0,
                  nextInstallment.amount -
                    nextInstallment.amountPaid
                )
              )
            );
          } else {
            setInstallmentId("");
            setAmount("");
            showMessage(
              "Payment recorded successfully. All installments are paid.",
              "success"
            );
          }
        } catch (refreshError) {
          console.error(
            "Payment saved, but installment refresh failed:",
            refreshError
          );

          showMessage(
            "Payment recorded, but installment details could not refresh. Reload the page to check the latest status.",
            "success"
          );
        }
      } else {
        // No plan: clear the amount and let the user choose another bill.
        setInstallmentId("");
        setAmount("");
      }
    } catch (error: any) {
      console.error("Failed to record payment:", error);

      showMessage(
        error.response?.data?.message ||
          "Payment status could not be confirmed. Retry with the same details.",
        "error"
      );

      // Keep the idempotency key for a retry.
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="mb-2 text-3xl font-bold">Payments</h1>

      <p className="mb-6 text-gray-600">
        Record bill or installment payments and view payment history.
      </p>

      {message && (
        <p
          className={`mb-4 rounded border p-3 ${
            messageType === "success"
              ? "border-green-300 bg-green-50 text-green-800"
              : messageType === "error"
                ? "border-red-300 bg-red-50 text-red-800"
                : "border-blue-300 bg-blue-50 text-blue-800"
          }`}
          role="status"
        >
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
          <label htmlFor="bill" className="mb-1 block font-medium">
            Select Bill
          </label>

          <select
            id="bill"
            value={billId}
            onChange={(event) =>
              void handleBillChange(event.target.value)
            }
            className="w-full rounded border p-2"
            required
          >
            <option value="">Choose a bill</option>

            {bills
              .filter((bill) => bill.paymentStatus !== "Paid")
              .map((bill) => (
                <option key={bill._id} value={bill._id}>
                  {bill.residentName} — Room {bill.roomNumber} — ₹
                  {Number(bill.total).toFixed(2)} (
                  {bill.paymentStatus})
                </option>
              ))}
          </select>
        </div>

        {hasInstallmentPlan && (
          <div>
            <label
              htmlFor="installment"
              className="mb-1 block font-medium"
            >
              Select Installment
            </label>

            <select
              id="installment"
              value={installmentId}
              onChange={(event) =>
                handleInstallmentChange(event.target.value)
              }
              className="w-full rounded border p-2"
              disabled={loadingInstallments || installments.length === 0}
              required
            >
              <option value="">Choose an installment</option>

              {installments.map((item) => (
                <option
                  key={item._id}
                  value={item._id}
                  disabled={
                    item.status === "Paid" ||
                    item.amount <= item.amountPaid
                  }
                >
                  Installment {item.installmentNumber} — Amount: ₹
                  {item.amount.toFixed(2)} — Remaining: ₹
                  {Math.max(
                    0,
                    item.amount - item.amountPaid
                  ).toFixed(2)}{" "}
                  — {item.status}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedInstallment && (
          <div className="rounded-lg bg-gray-50 p-4 text-sm">
            <p>
              <strong>Installment amount:</strong> ₹
              {selectedInstallment.amount.toFixed(2)}
            </p>
            <p>
              <strong>Already paid:</strong> ₹
              {selectedInstallment.amountPaid.toFixed(2)}
            </p>
            <p>
              <strong>Remaining:</strong> ₹
              {remainingInstallmentAmount.toFixed(2)}
            </p>
            <p>
              <strong>Due date:</strong>{" "}
              {new Date(
                selectedInstallment.dueDate
              ).toLocaleDateString()}
            </p>
          </div>
        )}

        {billId && !hasInstallmentPlan && (
          <p className="rounded bg-gray-50 p-3 text-sm text-gray-700">
            No installment plan exists. You can record a payment
            directly against this bill.
          </p>
        )}

        <div>
          <label htmlFor="amount" className="mb-1 block font-medium">
            Amount Received (₹)
          </label>

          <input
            id="amount"
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="w-full rounded border p-2"
            required
            disabled={
              !billId ||
              loadingInstallments ||
              (hasInstallmentPlan &&
                (!installmentId || remainingInstallmentAmount <= 0))
            }
          />
        </div>

        <div>
          <label htmlFor="method" className="mb-1 block font-medium">
            Payment Method
          </label>

          <select
            id="method"
            value={paymentMethod}
            onChange={(event) => setPaymentMethod(event.target.value)}
            className="w-full rounded border p-2"
          >
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Card">Card</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="paymentDate"
            className="mb-1 block font-medium"
          >
            Payment Date
          </label>

          <input
            id="paymentDate"
            type="date"
            value={paymentDate}
            onChange={(event) => setPaymentDate(event.target.value)}
            className="w-full rounded border p-2"
            required
          />
        </div>

        <div>
          <label
            htmlFor="transactionId"
            className="mb-1 block font-medium"
          >
            Transaction ID (optional)
          </label>

          <input
            id="transactionId"
            value={transactionId}
            onChange={(event) => setTransactionId(event.target.value)}
            className="w-full rounded border p-2"
          />
        </div>

        <div>
          <label htmlFor="notes" className="mb-1 block font-medium">
            Notes (optional)
          </label>

          <textarea
            id="notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="w-full rounded border p-2"
            rows={3}
          />
        </div>

        <button
          type="submit"
          disabled={loading || loadingInstallments || !billId}
          className="rounded bg-blue-600 px-5 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
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
              <th className="border p-3 text-left">Transaction ID</th>
              <th className="border p-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {payments.map((payment) => (
              <tr key={payment._id}>
                <td className="border p-3">
                  {payment.residentName}
                </td>
                <td className="border p-3">
                  ₹{Number(payment.amount).toFixed(2)}
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
                <td className="border p-3">
                  {payment.status || "Success"}
                </td>
              </tr>
            ))}

            {payments.length === 0 && (
              <tr>
                <td
                  colSpan={6}
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
