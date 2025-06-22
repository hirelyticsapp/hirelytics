import { createTOTPKeyURI, generateTOTP, verifyTOTP } from '@oslojs/otp';

import { env } from '@/env';

const issuer = env.OTP_ISSUER;
const accountName = env.OTP_ACCOUNT_NAME;
const intervalInSeconds = 30;
const digits = 6;
const secretKeyBytes = new TextEncoder().encode(env.ADMIN_SECRET_KEY);

export const getUrl = () => {
  return createTOTPKeyURI(issuer, accountName, secretKeyBytes, intervalInSeconds, digits);
};

export const generateOtp = () => {
  const otp = generateTOTP(secretKeyBytes, intervalInSeconds, digits);
  return otp;
};

export const verifyHOTP = (otp: string) => {
  const isValid = verifyTOTP(secretKeyBytes, intervalInSeconds, digits, otp);
  return isValid;
};
