import dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables
function validateEnvVar(varName: string, errorMessage: string): void {
  if (!process.env[varName]) {
    throw new Error(errorMessage);
  }
}

// Validate critical environment variables
validateEnvVar('APP_URL', 'Error: APP_URL is not defined in .env file');
validateEnvVar('USER', 'Error: USER is not defined in .env file');
validateEnvVar('PASSWORD', 'Error: PASSWORD is not defined in .env file');

export const appConfig = {
  url: process.env.APP_URL as string,
  // Credentials are stored in .env and accessed via process.env at runtime, not exposed here
  getUsername: (): string => process.env.USER as string,
  getPassword: (): string => process.env.PASSWORD as string,
};
