// lib/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./authSlice";
import employeeReducer from "./employeeSlice";

const persistConfig = {
  key: "auth", // ← Key name in localStorage
  storage,
  whitelist: ["user", "authToken", "isAuthenticated"], // ← Only persist these
};

// Employees persist (add this)
const employeePersistConfig = {
  key: "employees",
  storage,
  whitelist: ["employees"] // optional - persist whole slice
};

const persistedReducer = persistReducer(persistConfig, authReducer);
const persistedEmployeeReducer = persistReducer(employeePersistConfig, employeeReducer);

export const store = configureStore({
  reducer: {
    auth: persistedReducer,
    employees: persistedEmployeeReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
