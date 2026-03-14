import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Employee {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: "admin" | "hr" | "manager" | "employee";
    department: string;
    employeeId?: string;
    post?: string;
    address?: string;
    aadhaarNumber?: number | null;
    managedBy?: string | null;
    isActive: boolean;
    joiningDate?: string;
    profilePicture?: string;
}

interface EmployeeState {
    employees: Employee[];
    loading: boolean;
    error: string | null;
}

const initialState: EmployeeState = {
    employees: [],
    loading: false,
    error: null,
};

const employeeSlice = createSlice({
    name: "employees",
    initialState,
    reducers: {
        setEmployees: (state, action: PayloadAction<Employee[]>) => {
            state.employees = action.payload;
        },
        addEmployee: (state, action: PayloadAction<Employee>) => {
            state.employees.unshift(action.payload);
        },
        updateEmployee: (state, action: PayloadAction<Employee>) => {
            const idx = state.employees.findIndex((e) => e.id === action.payload.id);
            if (idx !== -1) state.employees[idx] = action.payload;
        },
        removeEmployee: (state, action: PayloadAction<string>) => {
            state.employees = state.employees.filter((e) => e.id !== action.payload);
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

export const {
    setEmployees,
    addEmployee,
    updateEmployee,
    removeEmployee,
    setLoading,
    setError,
} = employeeSlice.actions;

export default employeeSlice.reducer;
