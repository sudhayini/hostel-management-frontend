import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "../store/store";
import api from "../services/api";

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

type Installment = {
  _id: string;
  billId: string;
  installmentNumber: number;
  amount: number;
  amountPaid: number;
  dueDate: string;
  status: string;
};

type PaymentRecord = {
  _id?: string;
  billId: string;
  installmentId?: string | null;
  residentName: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  transactionId?: string;
  notes?: string;
  status?: string;
};

const INSTALLMENT_THRESHOLD = 10000;

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

const createIdempotencyKey = () => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `payment-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
};

function Billing() {
  const dispatch = useDispatch<AppDispatch>();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role;

  const bills = useSelector((state: RootState) => state.billing);
  const residents = useSelector((state: RootState) => state.residents);
  const payments = useSelector(
    (state: RootState) => state.payments
  ) as PaymentRecord[];

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
  const [savingBill, setSavingBill] = useState(false);

  const [paymentBill, setPaymentBill] = useState<Bill | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [transactionId, setTransactionId] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [selectedInstallmentId, setSelectedInstallmentId] =
    useState("");
  const [savingPayment, setSavingPayment] = useState(false);
  const [paymentAttemptKey, setPaymentAttemptKey] = useState("");

  const [invoiceBill, setInvoiceBill] = useState<Bill | null>(null);

  const [installmentsByBill, setInstallmentsByBill] = useState<
    Record<string, Installment[]>
  >({});
  const [creatingPlanFor, setCreatingPlanFor] = useState<
    string | null
  >(null);
  const [planErrors, setPlanErrors] = useState<
    Record<string, string>
  >({});
  const [loadingPlans, setLoadingPlans] = useState<
    Record<string, boolean>
  >({});

  const isStaff = role === "admin" || role === "staff";

  useEffect(() => {
    dispatch(fetchBilling());
    dispatch(fetchPayments());
  }, [dispatch]);

  // Only successful payments (or legacy records without a status)
  // count toward the bill balance.
  const isSuccessfulPayment = (payment: PaymentRecord) => {
    const status = String(payment.status || "").toLowerCase();

    return (
      !status ||
      status === "success" ||
      status === "successful" ||
      status === "paid"
    );
  };

  const getBillPayments = (bill: Bill) =>
    payments.filter(
      (payment) =>
        String(payment.billId) === String(bill._id) &&
        isSuccessfulPayment(payment)
    );

  const getTotalPaid = (bill: Bill) =>
    getBillPayments(bill).reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0
    );

  const getRemaining = (bill: Bill) =>
    Math.max(
      0,
      Number(bill.total || 0) - getTotalPaid(bill)
    );

  const getInstallmentRemaining = (item: Installment) =>
    Math.max(
      0,
      Number(item.amount || 0) - Number(item.amountPaid || 0)
    );

  const paymentPlan =
    paymentBill?._id
      ? installmentsByBill[paymentBill._id] || []
      : [];

  const hasInstallmentPlan = paymentPlan.length > 0;

  const selectedInstallment = paymentPlan.find(
    (item) => item._id === selectedInstallmentId
  );

  const paymentRemaining = paymentBill
    ? getRemaining(paymentBill)
    : 0;

  const selectedInstallmentRemaining = selectedInstallment
    ? getInstallmentRemaining(selectedInstallment)
    : 0;

  const paymentMaximum = hasInstallmentPlan
    ? Math.min(paymentRemaining, selectedInstallmentRemaining)
    : paymentRemaining;

  // Load existing plans. A missing plan is treated as an empty list.
  useEffect(() => {
    let cancelled = false;

    const loadPlans = async () => {
      const billList = bills.filter((bill) => Boolean(bill._id));

      if (!billList.length) return;

      setLoadingPlans((previous) => {
        const next = { ...previous };

        billList.forEach((bill) => {
          next[bill._id!] = true;
        });

        return next;
      });

      const results = await Promise.all(
        billList.map(async (bill) => {
          const billId = bill._id!;

          try {
            const response = await api.get(
              `/installments/${billId}`
            );

            const data = response.data;
            const list = Array.isArray(data)
              ? data
              : Array.isArray(data?.installments)
                ? data.installments
                : [];

            return {
              billId,
              installments: list as Installment[],
              error: "",
            };
          } catch (error: any) {
            // A 404 commonly means no plan has been created yet.
            if (error?.response?.status === 404) {
              return {
                billId,
                installments: [] as Installment[],
                error: "",
              };
            }

            return {
              billId,
              installments: [] as Installment[],
              error:
                "Could not load this installment plan. Please refresh and try again.",
            };
          }
        })
      );

      if (cancelled) return;

      setInstallmentsByBill((previous) => {
        const next = { ...previous };

        results.forEach((result) => {
          if (!result.error) {
            next[result.billId] = result.installments;
          }
        });

        return next;
      });

      setPlanErrors((previous) => {
        const next = { ...previous };

        results.forEach((result) => {
          if (result.error) {
            next[result.billId] = result.error;
          } else {
            delete next[result.billId];
          }
        });

        return next;
      });

      setLoadingPlans((previous) => {
        const next = { ...previous };

        results.forEach((result) => {
          delete next[result.billId];
        });

        return next;
      });
    };

    void loadPlans();

    return () => {
      cancelled = true;
    };
  }, [bills]);

  const refreshPlansForBill = async (billId: string) => {
    try {
      const response = await api.get(`/installments/${billId}`);
      const data = response.data;
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.installments)
          ? data.installments
          : [];

      setInstallmentsByBill((previous) => ({
        ...previous,
        [billId]: list as Installment[],
      }));

      setPlanErrors((previous) => {
        const next = { ...previous };
        delete next[billId];
        return next;
      });
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setInstallmentsByBill((previous) => ({
          ...previous,
          [billId]: [],
        }));
        return;
      }

      setPlanErrors((previous) => ({
        ...previous,
        [billId]:
          "Could not refresh this installment plan. Please refresh the page.",
      }));
    }
  };

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

  const saveBill = async () => {
    if (savingBill) return;

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

    if (
      Object.values(amounts).some(
        (amount) => !Number.isFinite(amount) || amount < 0
      )
    ) {
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

    setSavingBill(true);

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
      await dispatch(fetchBilling());
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save bill"
      );
    } finally {
      setSavingBill(false);
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

      setInstallmentsByBill((previous) => {
        const next = { ...previous };
        delete next[id];
        return next;
      });

      await dispatch(fetchBilling());
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete bill"
      );
    }
  };

  const openPaymentForm = async (bill: Bill) => {
    if (!bill._id) {
      alert("Bill ID not found");
      return;
    }

    setPaymentBill(bill);
    setPaymentAmount("");
    setPaymentMethod("UPI");
    setTransactionId("");
    setPaymentNotes("");
    setSelectedInstallmentId("");
    setPaymentAttemptKey(createIdempotencyKey());

    // Ensure the form uses the latest plan rather than stale card data.
    await refreshPlansForBill(bill._id);
  };

  const savePayment = async () => {
    if (savingPayment) return;

    if (!paymentBill?._id) {
      alert("Bill ID not found");
      return;
    }

    const amount = Number(paymentAmount);
    const remaining = getRemaining(paymentBill);
    const plan = installmentsByBill[paymentBill._id] || [];
    const requiresInstallments =
      Number(paymentBill.total) > INSTALLMENT_THRESHOLD;

    if (!paymentAmount || !Number.isFinite(amount) || amount <= 0) {
      alert("Enter a valid payment amount greater than zero");
      return;
    }

    if (remaining <= 0) {
      alert("This bill has no remaining balance");
      return;
    }

    if (amount > remaining) {
      alert(
        `Payment cannot exceed the remaining bill balance of ${money(remaining)}`
      );
      return;
    }

    if (requiresInstallments && plan.length === 0) {
      alert(
        "This bill requires a two-installment plan. Create the plan before recording payment."
      );
      return;
    }

    let installmentId: string | undefined;

    if (plan.length > 0) {
      if (!selectedInstallmentId) {
        alert("Please select an installment for this payment");
        return;
      }

      const installment = plan.find(
        (item) => item._id === selectedInstallmentId
      );

      if (!installment) {
        alert("The selected installment could not be found");
        return;
      }

      const installmentRemaining =
        getInstallmentRemaining(installment);

      if (installmentRemaining <= 0) {
        alert("This installment has already been fully paid");
        return;
      }

      if (amount > installmentRemaining) {
        alert(
          `Payment cannot exceed this installment's remaining balance of ${money(installmentRemaining)}`
        );
        return;
      }

      installmentId = installment._id;
    }

    setSavingPayment(true);

    try {
      await dispatch(
        createPayment({
          billId: paymentBill._id,
          residentName: paymentBill.residentName,
          amount,
          paymentMethod,
          paymentDate: new Date().toISOString(),
          transactionId: transactionId.trim(),
          notes: paymentNotes.trim(),
          ...(installmentId ? { installmentId } : {}),
          idempotencyKey:
            paymentAttemptKey || createIdempotencyKey(),
        })
      ).unwrap();

      alert(
        installmentId
          ? "Installment payment recorded successfully"
          : "Payment recorded successfully"
      );

      const billId = paymentBill._id;

      setPaymentBill(null);
      setPaymentAmount("");
      setPaymentMethod("UPI");
      setTransactionId("");
      setPaymentNotes("");
      setSelectedInstallmentId("");
      setPaymentAttemptKey("");

      await Promise.all([
        dispatch(fetchPayments()),
        dispatch(fetchBilling()),
        refreshPlansForBill(billId),
      ]);
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to record payment. You can retry the same payment attempt."
      );

      // Keep the idempotency key so retrying the same attempt does not
      // accidentally create a second payment.
    } finally {
      setSavingPayment(false);
    }
  };

  const createInstallmentPlan = async (bill: Bill) => {
    if (!bill._id) {
      alert("Bill ID not found");
      return;
    }

    if (Number(bill.total) <= INSTALLMENT_THRESHOLD) {
      alert(
        "Installment plans are available only for bills above ₹10,000"
      );
      return;
    }

    if (getRemaining(bill) <= 0) {
      alert("This bill has no remaining balance");
      return;
    }

    if (loadingPlans[bill._id]) {
      alert("Please wait while the installment information loads");
      return;
    }

    if (planErrors[bill._id]) {
      alert(
        "Please resolve the installment loading error before creating a plan"
      );
      return;
    }

    if (installmentsByBill[bill._id]?.length) {
      alert("An installment plan already exists for this bill");
      return;
    }

    const firstDueDate = new Date(bill.dueDate);

    if (Number.isNaN(firstDueDate.getTime())) {
      alert("Please set a valid bill due date first");
      return;
    }

    const secondDueDate = new Date(firstDueDate);
    secondDueDate.setDate(secondDueDate.getDate() + 15);

    setCreatingPlanFor(bill._id);

    try {
      const response = await api.post(
        `/installments/${bill._id}`,
        {
          dueDates: [
            firstDueDate.toISOString(),
            secondDueDate.toISOString(),
          ],
        }
      );

      const data = response.data;
      const created = Array.isArray(data)
        ? data
        : Array.isArray(data?.installments)
          ? data.installments
          : [];

      if (created.length !== 2) {
        // Read the plan again in case the API created it but returned
        // a different response shape.
        await refreshPlansForBill(bill._id);

        throw new Error(
          "The server did not return exactly two installments. Refresh the bill and verify the plan before trying again."
        );
      }

      setInstallmentsByBill((previous) => ({
        ...previous,
        [bill._id!]: created,
      }));

      alert("Two-installment plan created successfully");
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create installment plan"
      );
    } finally {
      setCreatingPlanFor(null);
    }
  };

  const printInvoice = () => {
    window.print();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Billing
          </h1>
          <p className="text-gray-500">
            Manage resident bills, payments and invoices
          </p>
        </div>

        {isStaff && (
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
          const billId = bill._id || "";
          const plan = billId
            ? installmentsByBill[billId] || []
            : [];

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

                {isStaff && remainingAmount > 0 && (
                  <button
                    onClick={() => void openPaymentForm(bill)}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Record Payment
                  </button>
                )}

                {isStaff && (
                  <button
                    onClick={() => handleEdit(bill)}
                    className="bg-gray-700 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                )}

                {role === "admin" && bill._id && (
                  <button
                    onClick={() => void deleteBill(bill._id!)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                )}
              </div>

              {isStaff &&
                Number(bill.total) > INSTALLMENT_THRESHOLD &&
                remainingAmount > 0 &&
                bill._id &&
                !plan.length &&
                !planErrors[bill._id] && (
                  <div className="mt-4">
                    <button
                      onClick={() => void createInstallmentPlan(bill)}
                      disabled={
                        creatingPlanFor === bill._id ||
                        loadingPlans[bill._id]
                      }
                      className="bg-purple-700 text-white px-3 py-2 rounded disabled:opacity-50"
                    >
                      {creatingPlanFor === bill._id
                        ? "Creating Plan..."
                        : loadingPlans[bill._id]
                          ? "Loading Plan..."
                          : "Create 2-Installment Plan"}
                    </button>
                  </div>
                )}

              {bill._id && planErrors[bill._id] && (
                <p className="mt-3 text-sm text-red-700">
                  {planErrors[bill._id]}
                </p>
              )}

              {plan.length > 0 && (
                <div className="mt-5 border-t border-gray-400 pt-3">
                  <h3 className="font-semibold">
                    Installment Plan
                  </h3>

                  {plan.map((item) => (
                    <div
                      key={item._id}
                      className="mt-2 bg-white p-3 rounded"
                    >
                      <p className="font-medium">
                        Installment {item.installmentNumber}
                      </p>
                      <p>Amount: {money(item.amount)}</p>
                      <p>Paid: {money(item.amountPaid)}</p>
                      <p>
                        Remaining:{" "}
                        {money(getInstallmentRemaining(item))}
                      </p>
                      <p>Due: {formatDate(item.dueDate)}</p>
                      <p>Status: {item.status}</p>
                    </div>
                  ))}
                </div>
              )}

              {billPayments.length > 0 && (
                <div className="mt-5 border-t pt-3">
                  <h3 className="font-semibold">Payment History</h3>

                  {billPayments.map((payment) => {
                    const linkedInstallment = plan.find(
                      (item) =>
                        item._id === payment.installmentId
                    );

                    return (
                      <div
                        key={payment._id}
                        className="mt-2 bg-white p-2 rounded"
                      >
                        <p>
                          {money(Number(payment.amount))} -{" "}
                          {payment.paymentMethod}
                        </p>

                        {linkedInstallment && (
                          <p className="text-sm text-purple-800">
                            Installment{" "}
                            {linkedInstallment.installmentNumber}
                          </p>
                        )}

                        {payment.transactionId && (
                          <p className="text-sm text-gray-500">
                            Transaction: {payment.transactionId}
                          </p>
                        )}

                        <p className="text-sm text-gray-500">
                          {formatDate(payment.paymentDate)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

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
                  (resident) =>
                    String(resident._id) === e.target.value
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
              onClick={() => void saveBill()}
              disabled={savingBill}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {savingBill
                ? "Saving..."
                : editingId
                  ? "Update Bill"
                  : "Add Bill"}
            </button>

            <button
              onClick={clearForm}
              disabled={savingBill}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

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
            Remaining Bill Balance: {money(paymentRemaining)}
          </p>

          {Number(paymentBill.total) > INSTALLMENT_THRESHOLD &&
            !hasInstallmentPlan && (
              <p className="mb-4 rounded bg-yellow-100 p-3 text-yellow-900">
                This bill requires a two-installment plan. Create the
                plan before recording a payment.
              </p>
            )}

          {paymentBill._id && planErrors[paymentBill._id] && (
            <p className="mb-4 rounded bg-red-100 p-3 text-red-800">
              {planErrors[paymentBill._id]}
            </p>
          )}

          {hasInstallmentPlan && (
            <div className="mb-4">
              <label
                htmlFor="payment-installment"
                className="block font-medium mb-2"
              >
                Select installment
              </label>

              <select
                id="payment-installment"
                value={selectedInstallmentId}
                onChange={(e) => {
                  setSelectedInstallmentId(e.target.value);
                  setPaymentAmount("");
                }}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Choose an installment</option>

                {paymentPlan.map((item) => {
                  const remaining = getInstallmentRemaining(item);

                  return (
                    <option
                      key={item._id}
                      value={item._id}
                      disabled={remaining <= 0}
                    >
                      Installment {item.installmentNumber} —{" "}
                      {money(remaining)} remaining — Due{" "}
                      {formatDate(item.dueDate)}
                    </option>
                  );
                })}
              </select>

              {selectedInstallment && (
                <div className="mt-3 rounded bg-purple-50 p-3">
                  <p>
                    Selected installment:{" "}
                    <strong>
                      {selectedInstallment.installmentNumber}
                    </strong>
                  </p>
                  <p>
                    Original amount:{" "}
                    {money(selectedInstallment.amount)}
                  </p>
                  <p>
                    Already paid:{" "}
                    {money(selectedInstallment.amountPaid)}
                  </p>
                  <p>
                    Remaining installment balance:{" "}
                    <strong>
                      {money(selectedInstallmentRemaining)}
                    </strong>
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="payment-amount"
                className="block text-sm font-medium mb-1"
              >
                Payment Amount
              </label>

              <input
                id="payment-amount"
                type="number"
                min="0.01"
                max={paymentMaximum}
                step="0.01"
                placeholder="Payment Amount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />

              {hasInstallmentPlan && selectedInstallment && (
                <p className="mt-1 text-sm text-gray-600">
                  Maximum for this payment: {money(paymentMaximum)}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="payment-method"
                className="block text-sm font-medium mb-1"
              >
                Payment Method
              </label>

              <select
                id="payment-method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Razorpay">Razorpay</option>
              </select>
            </div>

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
              onClick={() => void savePayment()}
              disabled={
                savingPayment ||
                paymentRemaining <= 0 ||
                (Number(paymentBill.total) > INSTALLMENT_THRESHOLD &&
                  !hasInstallmentPlan) ||
                (hasInstallmentPlan &&
                  (!selectedInstallment ||
                    selectedInstallmentRemaining <= 0)) ||
                Boolean(
                  paymentBill._id &&
                    planErrors[paymentBill._id]
                )
              }
              className="bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {savingPayment ? "Saving Payment..." : "Save Payment"}
            </button>

            <button
              onClick={() => {
                if (savingPayment) return;

                setPaymentBill(null);
                setPaymentAmount("");
                setSelectedInstallmentId("");
                setPaymentAttemptKey("");
              }}
              disabled={savingPayment}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

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
                  Thank you. Please retain this invoice for your
                  records.
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
