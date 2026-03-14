import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "admin" | "hr" | "manager";
  department?: string;
  profilePicture?: string;
}

interface AuthState {
  user: User | null;
  authToken: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  authToken: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    setAuthToken: (state, action: PayloadAction<string | null>) => {
      state.authToken = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.authToken = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, setAuthToken, logout } = authSlice.actions;
export default authSlice.reducer;
