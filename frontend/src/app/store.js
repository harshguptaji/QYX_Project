import {configureStore} from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import adminUsersReducer from "../features/admin/users/adminUsersSlice";
import adminUserDetailsReducer from "../features/admin/userDetails/adminUserDetailsSlice";
import passwordResetReducer from "../features/auth/passwordResetSlice";
import adminAuthReducer from "../features/admin/auth/adminAuthSlice";
import adminAccountsReducer from "../features/admin/accounts/adminAccountsSlice";
import contactReducer from "../features/contact/contactSlice";
import adminQuizReducer from "../features/admin/quiz/adminQuizSlice";
import quizReducer from "../features/quiz/quizSlice";
import adminQuizResponseReducer from "../features/admin/response/adminQuizResponseSlice";


export const store = configureStore({
    reducer: {
        auth: authReducer,
        adminUsers: adminUsersReducer,
        adminUserDetails: adminUserDetailsReducer,
        passwordReset: passwordResetReducer,
        adminAuth: adminAuthReducer,
        adminAccounts: adminAccountsReducer,
        contact: contactReducer,
        adminQuiz: adminQuizReducer,
        quiz: quizReducer,
        adminQuizResponses: adminQuizResponseReducer,
    },
});