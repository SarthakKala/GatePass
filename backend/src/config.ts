import dotenv from 'dotenv';

// Initialize dotenv configuration
dotenv.config();

// Define the JWT_SECRET using environment variable with a fallback
export const JWT_SECRET = process.env.JWT_SECRET || "passkey";
export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
export const ADMIN_SIGNUP_SECRET = process.env.ADMIN_SIGNUP_SECRET;
export const MAIL_HOST = process.env.MAIL_HOST;
export const MAIL_PORT = Number(process.env.MAIL_PORT || 587);
export const MAIL_USER = process.env.MAIL_USER;
export const MAIL_PASS = process.env.MAIL_PASS;
export const EMAIL_FROM = process.env.EMAIL_FROM;