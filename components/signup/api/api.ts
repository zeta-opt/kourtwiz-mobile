// src/api.ts
import axios from "axios";

const BASE_URL = "http://44.216.113.234:8080";

export const sendPhoneOtp = (phone: string) =>
  axios.post(`${BASE_URL}/otp/send-sms`, null, {
    params: { phone },
  });

export const validatePhoneOtp = (phone: string, otp: string) =>
  axios.post(`${BASE_URL}/otp/validate`, null, {
    params: { recipient: phone, otp },
  });

export const sendEmailOtp = (email: string) =>
  axios.post(`${BASE_URL}/temp-otp/send-email`, null, {
    params: { email },
  });

export const validateEmailOtp = (email: string, otp: string) =>
  axios.post(`${BASE_URL}/temp-otp/validate`, null, {
    params: { recipient: email, otp },
  });
