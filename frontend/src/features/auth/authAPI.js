// import axios from "axios";

// const API_URL = "https://qyx-project.onrender.com/api/user";

// const api = axios.create({
//   baseURL: API_URL,
//   withCredentials: true,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// const getErrorMessage = (error) => {
//   return (
//     error.response?.data?.message ||
//     error.message ||
//     "Something went wrong"
//   );
// };

// export const registerUserAPI = async (userData) => {
//   try {
//     const response = await api.post("/register", userData);

//     return response.data;

//   } catch (error) {
//     throw new Error(getErrorMessage(error));
//   }
// };

// export const loginUserAPI = async ( userData ) => {
//   try {
//     const response = await api.post("/login",userData);

//     return response.data;

//   } catch (error) {
//     throw new Error(getErrorMessage(error));
//   }
// };

// export const getCurrentUserAPI = async () => {
//   try {
//     const response = await api.get("/me");

//     return response.data;
//   } catch (error) {
//     throw new Error(getErrorMessage(error));
//   }
// };

// // export const logoutUserAPI = async () => {
// //   try {
// //     const response = await api.post("/logout");

// //     return response.data;
// //   } catch (error) {
// //     throw new Error(getErrorMessage(error));
// //   }
// // };

// export default api;

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.PROD
    ? "/api/user"
    : "http://localhost:5000/api/user",

  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
  },
});

export const registerUserAPI = async (userData) => {
  const response = await api.post("/register", userData);
  return response.data;
};

export const loginUserAPI = async (userData) => {
  const response = await api.post("/login", userData);
  return response.data;
};

export const getCurrentUserAPI = async () => {
  const response = await api.get("/me");
  return response.data;
};

export const updateUserProfileAPI = async (userData) => {
  const response = await api.patch("/edit", userData);
  return response.data;
};

// Enable when your backend logout route is ready.
// export const logoutUserAPI = async () => {
//   const response = await api.post("/logout");
//   return response.data;
// };

export default api;