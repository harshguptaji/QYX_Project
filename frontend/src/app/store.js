import {configureStore} from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import adminUsersReducer from "../features/admin/users/adminUsersSlice";
import adminUserDetailsReducer from "../features/admin/userDetails/adminUserDetailsSlice";
import passwordResetReducer from "../features/auth/passwordResetSlice";
import adminAuthReducer from "../features/admin/auth/adminAuthSlice";
import contactReducer from "../features/contact/contactSlice";


export const store = configureStore({
    reducer: {
        auth: authReducer,
        adminUsers: adminUsersReducer,
        adminUserDetails: adminUserDetailsReducer,
        passwordReset: passwordResetReducer,
        adminAuth: adminAuthReducer,
        contact: contactReducer,
    },
});