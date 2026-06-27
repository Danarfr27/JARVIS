import path from "path";
import dotenv from "dotenv";

const envDir = process.cwd();

dotenv.config({ path: path.resolve(envDir, ".env.local"), override: true });
dotenv.config({ path: path.resolve(envDir, ".env"), override: false });

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

export const env = {
  appId: required("APP_ID"),
  appSecret: required("APP_SECRET"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL"),
};
