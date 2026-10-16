import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "../store/store";

import {
  createBilling,
  editBilling,
  fetchBilling,
  removeBilling,
} from "../features/billing/billingSlice";

import {
  createPayment,
  fetchPayments,
} from "../features/payments/paymentsSlice";

type Bill = {
  _id?: string;
  residentId?: string;
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

const money = (amount: number) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (date?: string) => {
  if (!date) return "Not set";

  const parsed = new Date(date);

  return Number.isNaN(parsed.getTime())
    ? "Not set"
    : parsed.toLocaleDateString("en-IN");
};

function Billing() {
  const dispatch = useDispatch<AppDispatch>();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role;

  const bills = useSelector((state: RootState) => state.billing);
  const residents = useSelector((state: RootState) => state.residents);
  const payments = useSelector((state: RootState) => state.payments);

  useEffect(() => {
    dispatch(fetchBilling());
    dispatch(fetchPayments());
  }, [dispatch]);

  // Bill form state
  const [residentId, setResidentId] = useState("");
  const [residentName, setResidentName] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [roomFee, setRoomFee] = useState("");
  const [utilityFee, setUtilityFee] = useState("");
  const [additionalFee, setAdditionalFee] = useState("");
  const [discount, setDiscount] = useState("");
  const [lateFee, setLateFee] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Pending");
  const [dueDate, setDueDate] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Payment form state
  const [paymentBill, setPaymentBill] = useState<Bill | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [transactionId, setTransactionId] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  // Invoice state
  const [invoiceBill, setInvoiceBill] = useState<Bill | null>(null);

  const getBillPayments = (bill: Bill) =>
    payments.filter((payment) => payment.billId === bill._id);

  const getTotalPaid = (bill: Bill) =>
    getBillPayments(bill).reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0
    );

  const getRemaining = (bill: Bill) =>
    Math.max(0, Number(bill.total || 0) - getTotalPaid(bill));

  const clearForm = () => {
    setResidentId("");
    setResidentName("");
    setRoomNumber("");
    setRoomFee("");
    setUtilityFee("");
    setAdditionalFee("");
    setDiscount("");
    setLateFee("");
    setPaymentStatus("Pending");
    setDueDate("");
    setEditingId(null);
    setShowForm(false);
  };

  // Create or update a bill
  const saveBill = async () => {
    if (!residentId && !residentName.trim()) {
      alert("Please select a resident");
      return;
    }

    if (!roomNumber.trim()) {
      alert("Please select a resident with an allocated room");
      return;
    }

    if (!dueDate) {
      alert("Please select a due date");
      return;
    }

    const amounts = {
      roomFee: Number(roomFee || 0),
      utilityFee: Number(utilityFee || 0),
      additionalFee: Number(additionalFee || 0),
      discount: Number(discount || 0),
      lateFee: Number(lateFee || 0),
    };

    if (Object.values(amounts).some((amount) => !Number.isFinite(amount) || amount < 0)) {
      alert("Amounts must be valid non-negative numbers");
      return;
    }

    const subtotal =
      amounts.roomFee +
      amounts.utilityFee +
      amounts.additionalFee +
      amounts.lateFee;

    if (amounts.discount > subtotal) {
      alert("Discount cannot be greater than the total fees");
      return;
    }

    const total = subtotal - amounts.discount;

    const billingData = {
      residentId,
      residentName: residentName.trim(),
      roomNumber: roomNumber.trim(),
      ...amounts,
      total,
      paymentStatus: paymentStatus as
        | "Pending"
        | "Paid"
        | "Partially Paid",
      dueDate,
    };

    try {
      if (editingId) {
        await dispatch(
          editBilling({
            id: editingId,
            billing: billingData,
          })
        ).unwrap();

        alert("Bill updated successfully");
      } else {
        await dispatch(createBilling(billingData)).unwrap();
        alert("Bill added successfully");
      }

      clearForm();
      dispatch(fetchBilling());
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save bill"
      );
    }
  };

  const handleEdit = (bill: Bill) => {
    setResidentId(bill.residentId || "");
    setResidentName(bill.residentName);
    setRoomNumber(bill.roomNumber);
    setRoomFee(String(bill.roomFee ?? 0));
    setUtilityFee(String(bill.utilityFee ?? 0));
    setAdditionalFee(String(bill.additionalFee ?? 0));
    setDiscount(String(bill.discount ?? 0));
    setLateFee(String(bill.lateFee ?? 0));
    setPaymentStatus(bill.paymentStatus);

    setDueDate(
      bill.dueDate
        ? new Date(bill.dueDate).toISOString().split("T")[0]
        : ""
    );

    setEditingId(bill._id ?? null);
    setShowForm(true);
  };

  const deleteBill = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this bill?")) {
      return;
    }

    try {
      await dispatch(removeBilling(id)).unwrap();
      alert("Bill deleted successfully");
      dispatch(fetchBilling());
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete bill"
      );
    }
  };

  const openPaymentForm = (bill: Bill) => {
    setPaymentBill(bill);
    setPaymentAmount("");
    setPaymentMethod("UPI");
    setTransactionId("");
    setPaymentNotes("");
  };

  const savePayment = async () => {
    if (!paymentBill?._id) {
      alert("Bill ID not found");
      return;
    }

    const amount = Number(paymentAmount);
    const remaining = getRemaining(paymentBill);

    if (!paymentAmount || !Number.isFinite(amount) || amount <= 0) {
      alert("Enter a valid payment amount greater than zero");
      return;
    }

    if (amount > remaining) {
      alert(`Payment cannot exceed the remaining balance of ${money(remaining)}`);
      return;
    }

    try {
      await dispatch(
        createPayment({
          billId: paymentBill._id,
          residentName: paymentBill.residentName,
          amount,
          paymentMethod,
          paymentDate: new Date().toISOString(),
          transactionId,
          notes: paymentNotes,
        })
      ).unwrap();

      alert("Payment recorded successfully");

      setPaymentBill(null);
      setPaymentAmount("");
      setPaymentMethod("UPI");
      setTransactionId("");
      setPaymentNotes("");

      dispatch(fetchPayments());
      dispatch(fetchBilling());
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to record payment"
      );
    }
  };

  const printInvoice = () => {
    window.print();
  };

  return (
    <div>
      {/* Page heading */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Billing</h1>
          <p className="text-gray-500">
            Manage resident bills, payments and invoices
          </p>
        </div>

        {(role === "admin" || role === "staff") && (
          <button
            onClick={() => {
              clearForm();
              setShowForm(true);
            }}
            className="bg-mauve-500 text-white px-4 py-2 rounded-lg mr-10"
          >
            + Add Bill
          </button>
        )}
      </div>

      {/* Bill cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {bills.map((bill) => {
          const isOverdue =
            bill.paymentStatus !== "Paid" &&
            Boolean(bill.dueDate) &&
            new Date(bill.dueDate).getTime() <
              new Date().setHours(0, 0, 0, 0);

          const billPayments = getBillPayments(bill);
          const totalPaid = getTotalPaid(bill);
          const remainingAmount = getRemaining(bill);

          return (
            <div
              key={bill._id}
              className="border bg-mauve-200 p-5 rounded-lg shadow"
            >
              <h2 className="text-lg font-semibold">
                {bill.residentName}
              </h2>

              <p className="text-gray-600 mt-2">
                Room: {bill.roomNumber}
              </p>

              <p>Room Fee: {money(bill.roomFee)}</p>
              <p>Utility Fee: {money(bill.utilityFee)}</p>
              <p>Additional Fee: {money(bill.additionalFee)}</p>
              <p>Discount: {money(bill.discount)}</p>
              <p>Late Fee: {money(bill.lateFee)}</p>

              <p className="font-bold text-lg mt-3">
                Total: {money(bill.total)}
              </p>

              <p className="mt-2">
                Payment:{" "}
                <span className="font-semibold">
                  {bill.paymentStatus}
                </span>
              </p>

              <p className="mt-2">
                Paid:{" "}
                <span className="font-semibold text-green-700">
                  {money(totalPaid)}
                </span>
              </p>

              <p className="mt-1">
                Remaining:{" "}
                <span className="font-semibold">
                  {money(remainingAmount)}
                </span>
              </p>

              <p className="mt-2">
                Due Date:{" "}
                <span className="font-semibold">
                  {formatDate(bill.dueDate)}
                </span>
              </p>

              {isOverdue && (
                <p className="mt-2 text-red-600 font-bold">
                  Overdue
                </p>
              )}

              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => setInvoiceBill(bill)}
                  className="bg-blue-700 text-white px-3 py-1 rounded"
                >
                  View Invoice
                </button>

                {(role === "admin" || role === "staff") &&
                  remainingAmount > 0 && (
                    <button
                      onClick={() => openPaymentForm(bill)}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Record Payment
                    </button>
                  )}

                {(role === "admin" || role === "staff") && (
                  <button
                    onClick={() => handleEdit(bill)}
                    className="bg-gray-700 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                )}

                {role === "admin" && bill._id && (
                  <button
                    onClick={() => deleteBill(bill._id!)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                )}
              </div>

              {billPayments.length > 0 && (
                <div className="mt-5 border-t pt-3">
                  <h3 className="font-semibold">Payment History</h3>

                  {billPayments.map((payment) => (
                    <div
                      key={payment._id}
                      className="mt-2 bg-white p-2 rounded"
                    >
                      <p>
                        {money(Number(payment.amount))} -{" "}
                        {payment.paymentMethod}
                      </p>

                      {payment.transactionId && (
                        <p className="text-sm text-gray-500">
                          Transaction: {payment.transactionId}
                        </p>
                      )}

                      <p className="text-sm text-gray-500">
                        {formatDate(payment.paymentDate)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add / Edit Bill form */}
      {showForm && (
        <div className="w-full max-w-3xl rounded-lg border mt-10 p-5 bg-white shadow">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Edit Bill" : "Add Bill"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              value={residentId}
              onChange={(e) => {
                const selectedResident = residents.find(
                  (resident) => String(resident._id) === e.target.value
                );

                setResidentId(e.target.value);
                setResidentName(selectedResident?.name || "");
                setRoomNumber(selectedResident?.roomNumber || "");
              }}
              className="border rounded-lg px-3 py-2"
            >
              <option value="">Select Resident</option>

              {residents
                .filter((resident) => resident.roomNumber)
                .map((resident) => (
                  <option
                    key={resident._id}
                    value={String(resident._id)}
                  >
                    {resident.name} - {resident.roomNumber}
                  </option>
                ))}
            </select>

            <input
              type="text"
              placeholder="Room Number"
              value={roomNumber}
              readOnly
              className="border rounded-lg px-3 py-2 bg-gray-100"
            />

            <input
              type="number"
              min="0"
              placeholder="Room Fee"
              value={roomFee}
              onChange={(e) => setRoomFee(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />

            <input
              type="number"
              min="0"
              placeholder="Utility Fee"
              value={utilityFee}
              onChange={(e) => setUtilityFee(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />

            <input
              type="number"
              min="0"
              placeholder="Additional Fee"
              value={additionalFee}
              onChange={(e) => setAdditionalFee(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />

            <input
              type="number"
              min="0"
              placeholder="Discount"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />

            <input
              type="number"
              min="0"
              placeholder="Late Fee"
              value={lateFee}
              onChange={(e) => setLateFee(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />

            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Partially Paid">Partially Paid</option>
            </select>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={saveBill}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg"
            >
              {editingId ? "Update Bill" : "Add Bill"}
            </button>

            <button
              onClick={clearForm}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Record Payment form */}
      {paymentBill && (
        <div className="w-full max-w-3xl rounded-lg border mt-10 p-5 bg-white shadow">
          <h2 className="text-xl font-semibold mb-4">
            Record Payment
          </h2>

          <p className="mb-2">
            Resident:{" "}
            <span className="font-semibold">
              {paymentBill.residentName}
            </span>
          </p>

          <p className="mb-2">
            Bill Total: {money(paymentBill.total)}
          </p>

          <p className="mb-4">
            Remaining Balance: {money(getRemaining(paymentBill))}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="number"
              min="0.01"
              max={getRemaining(paymentBill)}
              step="0.01"
              placeholder="Payment Amount"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />

            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>

            <input
              type="text"
              placeholder="Transaction ID (optional)"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />

            <input
              type="text"
              placeholder="Notes (optional)"
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={savePayment}
              className="bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              Save Payment
            </button>

            <button
              onClick={() => setPaymentBill(null)}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Invoice modal */}
      {invoiceBill && (
        <div className="invoice-overlay fixed inset-0 z-50 bg-black/50 overflow-y-auto p-4 flex items-start justify-center">
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl my-6">
            <div
              id="invoice-print-area"
              className="p-8 text-gray-800"
            >
              <div className="flex justify-between items-start border-b pb-5 mb-5">
                <div>
                  <h2 className="text-3xl font-bold">
                    HOSTEL INVOICE
                  </h2>
                  <p className="text-sm text-gray-500 mt-2">
                    Hostel Management System
                  </p>
                </div>

                <div className="text-right text-sm">
                  <p>
                    <strong>Invoice No:</strong>{" "}
                    {invoiceBill._id
                      ? invoiceBill._id.slice(-8).toUpperCase()
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Invoice Date:</strong>{" "}
                    {new Date().toLocaleDateString("en-IN")}
                  </p>
                  <p>
                    <strong>Due Date:</strong>{" "}
                    {formatDate(invoiceBill.dueDate)}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-bold text-lg mb-2">
                  Resident Details
                </h3>
                <p>{invoiceBill.residentName}</p>
                <p>Room Number: {invoiceBill.roomNumber}</p>
              </div>

              <table className="w-full border-collapse mb-6">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-3 text-left">
                      Description
                    </th>
                    <th className="border p-3 text-right">
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td className="border p-3">Room Fee</td>
                    <td className="border p-3 text-right">
                      {money(invoiceBill.roomFee)}
                    </td>
                  </tr>

                  <tr>
                    <td className="border p-3">Utility Fee</td>
                    <td className="border p-3 text-right">
                      {money(invoiceBill.utilityFee)}
                    </td>
                  </tr>

                  <tr>
                    <td className="border p-3">Additional Fee</td>
                    <td className="border p-3 text-right">
                      {money(invoiceBill.additionalFee)}
                    </td>
                  </tr>

                  <tr>
                    <td className="border p-3">Late Fee</td>
                    <td className="border p-3 text-right">
                      {money(invoiceBill.lateFee)}
                    </td>
                  </tr>

                  <tr>
                    <td className="border p-3">Discount</td>
                    <td className="border p-3 text-right">
                      -{money(invoiceBill.discount)}
                    </td>
                  </tr>
                </tbody>

                <tfoot>
                  <tr>
                    <th className="border p-3 text-left">
                      Total Amount
                    </th>
                    <th className="border p-3 text-right">
                      {money(invoiceBill.total)}
                    </th>
                  </tr>

                  <tr>
                    <td className="border p-3">Amount Paid</td>
                    <td className="border p-3 text-right">
                      {money(getTotalPaid(invoiceBill))}
                    </td>
                  </tr>

                  <tr>
                    <th className="border p-3 text-left">
                      Balance Due
                    </th>
                    <th className="border p-3 text-right">
                      {money(getRemaining(invoiceBill))}
                    </th>
                  </tr>
                </tfoot>
              </table>

              <div className="border-t pt-4">
                <p>
                  <strong>Payment Status:</strong>{" "}
                  {invoiceBill.paymentStatus}
                </p>
                <p className="mt-3 text-sm text-gray-500">
                  Thank you. Please retain this invoice for your records.
                </p>
              </div>
            </div>

            <div className="invoice-actions p-4 border-t flex flex-wrap justify-end gap-2">
              <button
                onClick={printInvoice}
                className="bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Print / Save as PDF
              </button>

              <button
                onClick={() => setInvoiceBill(null)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Billing;
