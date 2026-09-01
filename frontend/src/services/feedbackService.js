import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const submitFeedback = async (payload) => {
  try {
    const response = await axiosInstance.post(API_PATHS.FEEDBACK.SUBMIT, payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Feedback could not be submitted" };
  }
};

const getMyFeedback = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.FEEDBACK.GET_MINE);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Feedback history could not be loaded" };
  }
};

export default { submitFeedback, getMyFeedback };
