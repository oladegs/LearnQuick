// Calls local email/password auth and the additional Google/session endpoints.
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const unwrap = (request, fallback) =>
  request
    .then((response) => response.data)
    .catch((error) => {
      throw error.response?.data || { message: fallback };
    });

const login = async (email, password) => {
  const response = await unwrap(
    axiosInstance.post(API_PATHS.AUTH.LOGIN, { email, password }),
    "Unable to sign in",
  );
  return response.data;
};

const register = async (username, email, password) => {
  const response = await unwrap(
    axiosInstance.post(API_PATHS.AUTH.REGISTER, { username, email, password }),
    "Unable to register",
  );
  return response.data;
};

const getProfile = () =>
  unwrap(axiosInstance.get(API_PATHS.AUTH.GET_PROFILE), "Unable to load profile");
const updateProfile = (userData) =>
  unwrap(axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, userData), "Unable to update profile");
const changePassword = (passwords) =>
  unwrap(axiosInstance.post(API_PATHS.AUTH.CHANGE_PASSWORD, passwords), "Unable to update password");

const getProviders = async () => {
  const response = await unwrap(
    axiosInstance.get(API_PATHS.AUTH.GET_PROVIDERS),
    "Google sign-in unavailable",
  );
  return response.data;
};

const getSession = async () => {
  const response = await unwrap(
    axiosInstance.get(API_PATHS.AUTH.GET_SESSION),
    "Session unavailable",
  );
  return response.data;
};

const logout = () =>
  unwrap(axiosInstance.post(API_PATHS.AUTH.LOGOUT), "Logout request failed");
const forgotPassword = (email) =>
  unwrap(
    axiosInstance.post(API_PATHS.AUTH.FORGOT_PASSWORD, { email }),
    "Password reset request failed",
  );
const resetPassword = async (token, password) => {
  const response = await unwrap(
    axiosInstance.post(API_PATHS.AUTH.RESET_PASSWORD(token), { password }),
    "Password reset failed",
  );
  return response.data;
};

export default {
  login,
  register,
  getProfile,
  updateProfile,
  changePassword,
  getProviders,
  getSession,
  logout,
  forgotPassword,
  resetPassword,
};
