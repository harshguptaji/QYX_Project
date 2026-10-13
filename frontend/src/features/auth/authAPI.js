import axios from "axios";

const API_URL = "http://localhost:5000/api/user";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const getErrorMessage = (error) => {
  return (
    error.response?.data?.message ||
    error.message ||
    "Something went wrong"
  );
};

export const registerUserAPI = async (userData) => {
  try {
    const response = await api.post("/register", userData);

    return response.data;

  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const loginUserAPI = async ( userData ) => {
  try {
    const response = await api.post("/login",userData);

    return response.data;

  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getCurrentUserAPI = async () => {
  try {
    const response = await api.get("/me");

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// export const logoutUserAPI = async () => {
//   try {
//     const response = await api.post("/logout");

//     return response.data;
//   } catch (error) {
//     throw new Error(getErrorMessage(error));
//   }
// };

export default api;