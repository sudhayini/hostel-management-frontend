import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  type AppDispatch,
  type RootState,
} from "../store/store";

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

function Billing() {
  const dispatch = useDispatch<AppDispatch>();

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const role = user.role;

  const bills = useSelector(
    (state: RootState) => state.billing
  );

  const residents = useSelector(
    (state: RootState) => state.residents
  );

  const payments = useSelector(
    (state: RootState) => state.payments
  );

  useEffect(() => {
    dispatch(fetchBilling());
    dispatch(fetchPayments());
  }, [dispatch]);


//bill state
  const [residentName, setResidentName] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [roomFee, setRoomFee] = useState("");
  const [utilityFee, setUtilityFee] = useState("");
  const [additionalFee, setAdditionalFee] = useState("");
  const [discount, setDiscount] = useState("");
  const [lateFee, setLateFee] = useState("");
  const [paymentStatus, setPaymentStatus] =
    useState("Pending");

  const [dueDate, setDueDate] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  // payment state
  const [paymentBill, setPaymentBill] =
    useState<Bill | null>(null);

  const [paymentAmount, setPaymentAmount] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("UPI");

  const [transactionId, setTransactionId] =
    useState("");

  const [paymentNotes, setPaymentNotes] =
    useState("");

  // save bill

  const saveBill = async () => {
    if (!residentName.trim()) {
      alert("Please enter resident name");
      return;
    }

    if (!roomNumber.trim()) {
      alert("Please enter room number");
      return;
    }

    if (!dueDate) {
      alert("Please select a due date");
      return;
    }

    if (Number(roomFee) < 0) {
      alert("Room fee cannot be negative");
      return;
    }

    if (Number(utilityFee) < 0) {
      alert("Utility fee cannot be negative");
      return;
    }

    if (Number(additionalFee) < 0) {
      alert("Additional fee cannot be negative");
      return;
    }

    if (Number(discount) < 0) {
      alert("Discount cannot be negative");
      return;
    }

    if (Number(lateFee) < 0) {
      alert("Late fee cannot be negative");
      return;
    }

    const subtotal =
      Number(roomFee || 0) +
      Number(utilityFee || 0) +
      Number(additionalFee || 0) +
      Number(lateFee || 0);

    if (Number(discount || 0) > subtotal) {
      alert(
        "Discount cannot be greater than the total fees"
      );
      return;
    }

    const total =
      Number(roomFee || 0) +
      Number(utilityFee || 0) +
      Number(additionalFee || 0) +
      Number(lateFee || 0) -
      Number(discount || 0);

    if (total < 0) {
      alert("Total amount cannot be negative");
      return;
    }

    try {
                                     //update
      if (editingId !== null) {
        await dispatch(
          editBilling({
            id: editingId,
            billing: {
              residentName,
              roomNumber,
              roomFee: Number(roomFee || 0),
              utilityFee: Number(utilityFee || 0),
              additionalFee: Number(
                additionalFee || 0
              ),
              discount: Number(discount || 0),
              lateFee: Number(lateFee || 0),
              total,
              paymentStatus: paymentStatus as
                | "Pending"
                | "Paid"
                | "Partially Paid",
              dueDate,
            },
          })
        ).unwrap();

        alert("Bill updated successfully");
      }

      // add bill
      else {
        await dispatch(
          createBilling({
            residentName,
            roomNumber,
            roomFee: Number(roomFee || 0),
            utilityFee: Number(utilityFee || 0),
            additionalFee: Number(
              additionalFee || 0
            ),
            discount: Number(discount || 0),
            lateFee: Number(lateFee || 0),
            total,
            paymentStatus: paymentStatus as
              | "Pending"
              | "Paid"
              | "Partially Paid",
            dueDate,
          })
        ).unwrap();

        alert("Bill added successfully");
      }

      clearForm();
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save bill"
      );
    }
  };

  //edit bill

  const handleEdit = (bill: Bill) => {
    setResidentName(bill.residentName);
    setRoomNumber(bill.roomNumber);
    setRoomFee(String(bill.roomFee));
    setUtilityFee(String(bill.utilityFee));
    setAdditionalFee(String(bill.additionalFee));
    setDiscount(String(bill.discount));
    setLateFee(String(bill.lateFee));
    setPaymentStatus(bill.paymentStatus);

    setDueDate(
      bill.dueDate
        ? new Date(bill.dueDate)
            .toISOString()
            .split("T")[0]
        : ""
    );

    setEditingId(bill._id ?? null);
    setShowForm(true);
  };

//delete bill

  const deleteBill = async (id: string) => {
    if (!id) {
      alert("Bill ID not found");
      return;
    }

    try {
      await dispatch(
        removeBilling(id)
      ).unwrap();

      alert("Bill deleted successfully");
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
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

    if (!paymentAmount) {
      alert("Please enter payment amount");
      return;
    }

    if (Number(paymentAmount) <= 0) {
      alert("Payment amount must be greater than 0");
      return;
    }

    if (Number(paymentAmount) > paymentBill.total) {
      alert("Payment cannot be greater than bill total");
      return;
    }

    try {
      await dispatch(
        createPayment({
          billId: paymentBill._id,
          residentName: paymentBill.residentName,
          amount: Number(paymentAmount),
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
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to record payment"
      );
    }
  };


  const clearForm = () => {
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

  return (
    <div>
     
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Billing
          </h1>

          <p className="text-gray-500">
            Manage resident bills and payments
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

     
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {bills.map((bill) => {
          const isOverdue =
            bill.paymentStatus !== "Paid" &&
            bill.dueDate &&
            new Date(bill.dueDate) < new Date();

          const billPayments = payments.filter(
            (payment) =>
              payment.billId === bill._id
          );

          const totalPaid = billPayments.reduce(
            (sum, payment) =>
              sum + Number(payment.amount),
            0
          );

          const remainingAmount =
            bill.total - totalPaid;

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

              <p>Room Fee: ₹{bill.roomFee}</p>

              <p>Utility Fee: ₹{bill.utilityFee}</p>

              <p>
                Additional Fee: ₹
                {bill.additionalFee}
              </p>

              <p>
                Discount: ₹{bill.discount}
              </p>

              <p>
                Late Fee: ₹{bill.lateFee}
              </p>

              <p className="font-bold text-lg mt-3">
                Total: ₹{bill.total}
              </p>

              <p className="mt-2">
                Payment:{" "}
                <span className="font-semibold">
                  {bill.paymentStatus}
                </span>
              </p>

              <p className="mt-2">
                Paid:{" "}
                <span className="font-semibold text-green-600">
                  ₹{totalPaid}
                </span>
              </p>

              <p className="mt-1">
                Remaining:{" "}
                <span className="font-semibold">
                  ₹{remainingAmount}
                </span>
              </p>

             
              <p className="mt-2">
                Due Date:{" "}
                <span className="font-semibold">
                  {bill.dueDate
                    ? new Date(
                        bill.dueDate
                      ).toLocaleDateString()
                    : "Not set"}
                </span>
              </p>

            
              {isOverdue && (
                <p className="mt-2 text-red-600 font-bold">
                  Overdue
                </p>
              )}

             
              {(role === "admin" ||
                role === "staff") &&
                remainingAmount > 0 && (
                  <button
                    onClick={() =>
                      openPaymentForm(bill)
                    }
                    className="bg-green-600 text-white px-3 py-1 rounded mt-4"
                  >
                    Record Payment
                  </button>
                )}

              
              {(role === "admin" ||
                role === "staff") && (
                <button
                  onClick={() =>
                    bill._id &&
                    handleEdit(bill)
                  }
                  className="bg-gray-700 text-white px-3 py-1 rounded mt-4 ml-2"
                >
                  Edit
                </button>
              )}

             
              {role === "admin" && (
                <button
                  onClick={() => {
                    if (bill._id) {
                      deleteBill(bill._id);
                    }
                  }}
                  className="bg-red-500 text-white px-3 py-1 rounded mt-4 ml-2"
                >
                  Delete
                </button>
              )}

           
              {billPayments.length > 0 && (
                <div className="mt-5 border-t pt-3">
                  <h3 className="font-semibold">
                    Payment History
                  </h3>

                  {billPayments.map((payment) => (
                    <div
                      key={payment._id}
                      className="mt-2 bg-white p-2 rounded"
                    >
                      <p>
                        ₹{payment.amount} -{" "}
                        {payment.paymentMethod}
                      </p>

                      {payment.transactionId && (
                        <p className="text-sm text-gray-500">
                          Transaction:{" "}
                          {payment.transactionId}
                        </p>
                      )}

                      <p className="text-sm text-gray-500">
                        {new Date(
                          payment.paymentDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

   
      {showForm && (
        <div className="w-195 rounded-lg border mt-10 p-5">
          <h2 className="text-xl font-semibold mb-4">
            {editingId !== null
              ? "Edit Bill"
              : "Add Bill"}
          </h2>

          
          <select
            value={residentName}
            onChange={(e) => {
              const selectedResident =
                residents.find(
                  (resident) =>
                    resident.name ===
                    e.target.value
                );

              setResidentName(e.target.value);

              if (selectedResident) {
                setRoomNumber(
                  selectedResident.roomNumber
                );
              }
            }}
            className="border rounded-lg px-2 py-1 mr-2 mb-3"
          >
            <option value="">
              Select Resident
            </option>

            {residents
              .filter(
                (resident) =>
                  resident.roomNumber
              )
              .map((resident) => (
                <option
                  key={resident._id}
                  value={resident.name}
                >
                  {resident.name} -{" "}
                  {resident.roomNumber}
                </option>
              ))}
          </select>

          
          <input
            type="text"
            placeholder="Room Number"
            value={roomNumber}
            readOnly
            className="border rounded-lg px-2 py-1 mr-2 mb-3"
          />

         
          <input
            type="number"
            placeholder="Room Fee"
            value={roomFee}
            onChange={(e) =>
              setRoomFee(e.target.value)
            }
            className="border rounded-lg px-2 py-1 mr-2 mb-3"
          />

          
          <input
            type="number"
            placeholder="Utility Fee"
            value={utilityFee}
            onChange={(e) =>
              setUtilityFee(e.target.value)
            }
            className="border rounded-lg px-2 py-1 mr-2 mb-3"
          />

          <input
            type="number"
            placeholder="Additional Fee"
            value={additionalFee}
            onChange={(e) =>
              setAdditionalFee(e.target.value)
            }
            className="border rounded-lg px-2 py-1 mr-2 mb-3"
          />

          
          <input
            type="number"
            placeholder="Discount"
            value={discount}
            onChange={(e) =>
              setDiscount(e.target.value)
            }
            className="border rounded-lg px-2 py-1 mr-2 mb-3"
          />

         
          <input
            type="number"
            placeholder="Late Fee"
            value={lateFee}
            onChange={(e) =>
              setLateFee(e.target.value)
            }
            className="border rounded-lg px-2 py-1 mr-2 mb-3"
          />

          
          <input
            type="date"
            value={dueDate}
            onChange={(e) =>
              setDueDate(e.target.value)
            }
            className="border rounded-lg px-2 py-1 mr-2 mb-3"
          />

          
          <select
            value={paymentStatus}
            onChange={(e) =>
              setPaymentStatus(e.target.value)
            }
            className="border rounded-lg px-2 py-1 mr-2 mb-3"
          >
            <option value="Pending">
              Pending
            </option>

            <option value="Paid">
              Paid
            </option>

            <option value="Partially Paid">
              Partially Paid
            </option>
          </select>

          
          <div>
            <button
              onClick={saveBill}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg mr-2"
            >
              {editingId !== null
                ? "Update Bill"
                : "Add Bill"}
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

     
      {paymentBill && (
        <div className="w-195 rounded-lg border mt-10 p-5 bg-white shadow">
          <h2 className="text-xl font-semibold mb-4">
            Record Payment
          </h2>

          <p className="mb-2">
            Resident:{" "}
            <span className="font-semibold">
              {paymentBill.residentName}
            </span>
          </p>

          <p className="mb-4">
            Bill Total:{" "}
            <span className="font-semibold">
              ₹{paymentBill.total}
            </span>
          </p>

          
          <input
            type="number"
            placeholder="Payment Amount"
            value={paymentAmount}
            onChange={(e) =>
              setPaymentAmount(e.target.value)
            }
            className="border rounded-lg px-2 py-1 mr-2 mb-3"
          />

          
          <select
            value={paymentMethod}
            onChange={(e) =>
              setPaymentMethod(e.target.value)
            }
            className="border rounded-lg px-2 py-1 mr-2 mb-3"
          >
            <option value="UPI">UPI</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="Bank Transfer">
              Bank Transfer
            </option>
          </select>

          
          <input
            type="text"
            placeholder="Transaction ID (optional)"
            value={transactionId}
            onChange={(e) =>
              setTransactionId(e.target.value)
            }
            className="border rounded-lg px-2 py-1 mr-2 mb-3"
          />

         
          <input
            type="text"
            placeholder="Notes (optional)"
            value={paymentNotes}
            onChange={(e) =>
              setPaymentNotes(e.target.value)
            }
            className="border rounded-lg px-2 py-1 mr-2 mb-3"
          />

 
          <div>
            <button
              onClick={savePayment}
              className="bg-green-600 text-white px-4 py-2 rounded-lg mr-2"
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
    </div>
  );
}

export default Billing;

