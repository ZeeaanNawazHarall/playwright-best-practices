import dotenv from "dotenv";

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not defined in .env`);
  return value;
}

export const appConfig = {
  url: requireEnv("APP_URL"),
  getUsername: () => requireEnv("USER"),
  getPassword: () => requireEnv("PASSWORD"),
};
