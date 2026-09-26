
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store/store";
import {
  fetchNotifications,
  markNotificationRead,
  removeNotification,
} from "./notificationSlice";

function NotificationList() {
  const dispatch = useDispatch<AppDispatch>();

  const notifications = useSelector(
    (state: RootState) => state.notifications
  );

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleMarkAsRead = (id: string) => {
    dispatch(markNotificationRead(id));
  };

  const handleDelete = (id: string) => {
    dispatch(removeNotification(id));
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">
        Notifications
      </h2>

      {notifications.length === 0 ? (
        <p className="text-gray-500">
          No notifications
        </p>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`border rounded-xl p-4 ${
                notification.isRead
                  ? "bg-white"
                  : "bg-blue-50 border-blue-200"
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p
                    className={`font-semibold ${
                      notification.isRead
                        ? "text-gray-700"
                        : "text-blue-700"
                    }`}
                  >
                    {notification.message}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Type: {notification.type}
                  </p>

                  {!notification.isRead && (
                    <span className="inline-block mt-2 text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                      Unread
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  {!notification.isRead && notification._id && (
                    <button
                      onClick={() =>
                        handleMarkAsRead(notification._id!)
                      }
                      className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm"
                    >
                      Read
                    </button>
                  )}

                  {notification._id && (
                    <button
                      onClick={() =>
                        handleDelete(notification._id!)
                      }
                      className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationList;

