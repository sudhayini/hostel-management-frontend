
import { configureStore } from "@reduxjs/toolkit";
import roomsReducer from "../features/rooms/roomsSlice";
import residentsReducer from "../features/residents/residentsSlice";
import maintenanceReducer from "../features/maintenance/maintenanceSlice";
import billingReducer from "../features/billing/billingSlice";
import notificationsReducer from "../features/notifications/notificationSlice";
import paymentsReducer from "../features/payments/paymentsSlice";

export const store = configureStore({
  reducer: {
    rooms: roomsReducer,
    residents: residentsReducer,
    maintenance: maintenanceReducer,
    billing: billingReducer,
    notifications: notificationsReducer,
    payments: paymentsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

