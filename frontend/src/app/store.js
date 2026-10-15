import {configureStore} from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import adminUsersReducer from "../features/admin/users/adminUsersSlice";
import adminUserDetailsReducer from "../features/admin/userDetails/adminUserDetailsSlice";
import passwordResetReducer from "../features/auth/passwordResetSlice";


export const store = configureStore({
    reducer: {
        auth: authReducer,
        adminUsers: adminUsersReducer,
        adminUserDetails: adminUserDetailsReducer,
        passwordReset: passwordResetReducer,
    },
});