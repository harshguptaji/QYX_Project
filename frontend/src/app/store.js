import {configureStore} from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import adminUsersReducer from "../features/admin/users/adminUsersSlice";


export const store = configureStore({
    reducer: {
        auth: authReducer,
        adminUsers: adminUsersReducer,
    },
});