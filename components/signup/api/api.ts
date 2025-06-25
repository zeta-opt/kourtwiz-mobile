import axios from "axios";
import  Constants  from "expo-constants";


const BASE_URL = Constants.expoConfig?.extra?.apiUrl;

export const sendPhoneOtp = (phone: string) =>
  axios.post(`${BASE_URL}/otp/send-sms`, null, {
    params: { phone },
  });

export const validatePhoneOtp = (phone: string, otp: string) =>
  axios.post(`${BASE_URL}/otp/validate`, null, {
    params: { recipient: phone, otp },
  });

export const sendEmailOtp = (email: string) =>
  axios.post(`${BASE_URL}/otp/send-email`, null, {
    params: { email },
  });

export const validateEmailOtp = (email: string, otp: string) =>
  axios.post(`${BASE_URL}/otp/validate`, null, {
    params: { recipient: email, otp },
  });
