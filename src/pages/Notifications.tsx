
import { useEffect, useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store";
import { fetchResidents } from "../features/residents/residentsSlice";
import {
  fetchNotifications,
  markNotificationRead,
  removeNotification,
} from "../features/notifications/notificationSlice";
import api from "../services/api";

function Notifications() {
  const dispatch = useDispatch<AppDispatch>();
  const residents = useSelector((state: RootState) => state.residents);
  const notifications = useSelector(
    (state: RootState) => state.notifications
  );

  const [residentId, setResidentId] = useState("");
  const [sendToAll, setSendToAll] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<
    "Overdue" | "Due Soon" | "Maintenance" | "General"
  >("General");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    dispatch(fetchResidents());
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback("");

   if ((!residentId && !sendToAll) || !message.trim()) {
  setFeedback("Please select a resident or All Residents and enter a message.");
  return;
  }

    setSending(true);

    try {
      const response = await api.post("/notifications/send-sms", {
        residentId,
        sendToAll,
        message: message.trim(),
        type,
      });

      const summary = response.data?.summary;

      setFeedback(
       summary
         ? `In-app notifications saved: ${summary.inAppSaved}/${summary.totalResidents}. SMS submitted: ${summary.smsSubmitted}. SMS failed: ${summary.smsFailed}.`
         : response.data?.message || "Notification request completed."
      );

      setMessage("");
      await dispatch(fetchNotifications());
    } catch (error: any) {
      setFeedback(
        error.response?.data?.message ||
          "Unable to send the notification. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <section className="bg-white rounded-2xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-5">Send SMS Notification</h1>

        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block font-semibold mb-2">
              Select Resident
            </label>

          <select
            value={sendToAll ? "all" : residentId}
            onChange={(event) => {
            const value = event.target.value;
            setSendToAll(value === "all");
            setResidentId(value === "all" ? "" : value);}}
            className="w-full border rounded-lg p-3"
            required>
          <option value="">Choose a resident</option>
          <option value="all">All Residents</option>
            {residents.map((resident) => (
          <option key={resident._id} value={resident._id || ""}>
           {resident.name} — {resident.phone}
          </option> ))}
        </select>

          </div>

          <div>
            <label className="block font-semibold mb-2">
              Notification Type
            </label>

            <select
              value={type}
              onChange={(event) =>
                setType(
                  event.target.value as
                    | "Overdue"
                    | "Due Soon"
                    | "Maintenance"
                    | "General"
                )
              }
              className="w-full border rounded-lg p-3"
            >
              <option value="General">General</option>
              <option value="Due Soon">Due Soon</option>
              <option value="Overdue">Overdue</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-2">
              SMS Message
            </label>

            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="w-full border rounded-lg p-3"
              rows={4}
              maxLength={1000}
              placeholder="Enter your message for the resident"
              required
            />

            <p className="text-sm text-gray-500 mt-1">
              {message.length}/1000 characters
            </p>
          </div>

          <button
            type="submit"
            disabled={sending}
            className="bg-mauve-500 hover:bg-mauve-600 disabled:opacity-50 text-white px-5 py-3 rounded-lg"
          >
            {sending ? "Sending..." : "Send SMS"}
          </button>

          {feedback && (
            <p role="status" className="mt-3 text-sm">
              {feedback}
            </p>
          )}
        </form>
      </section>

      <section className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">My Notifications</h2>

        {notifications.length === 0 ? (
          <p className="text-gray-500">No notifications</p>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`border rounded-xl p-4 ${
                  notification.isRead ? "bg-white" : "bg-blue-50"
                }`}
              >
                <p className="font-semibold">{notification.message}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Type: {notification.type}
                </p>

                <div className="flex gap-2 mt-3">
                  {!notification.isRead && notification._id && (
                    <button
                      type="button"
                      onClick={() =>
                        dispatch(markNotificationRead(notification._id!))
                      }
                      className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm"
                    >
                      Mark Read
                    </button>
                  )}

                  {notification._id && (
                    <button
                      type="button"
                      onClick={() =>
                        dispatch(removeNotification(notification._id!))
                      }
                      className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Notifications;
