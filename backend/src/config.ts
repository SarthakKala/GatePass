import dotenv from 'dotenv';

// Initialize dotenv configuration
dotenv.config();

// Define the JWT_SECRET using environment variable with a fallback
export const JWT_SECRET = process.env.JWT_SECRET || "passkey";
export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
export const ADMIN_SIGNUP_SECRET = process.env.ADMIN_SIGNUP_SECRET;
export const RESEND_API_KEY = process.env.RESEND_API_KEY;
export const EMAIL_FROM = process.env.EMAIL_FROM || "GatePass <onboarding@resend.dev>";