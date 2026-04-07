import dotenv from 'dotenv';

// Initialize dotenv configuration
dotenv.config();

// Define the JWT_SECRET using environment variable with a fallback
export const JWT_SECRET = process.env.JWT_SECRET || "passkey";