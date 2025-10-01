export interface AppEnv {
  mongodbUri: string;
  mongodbDb: string;
}

function getEnv(key: string, fallback?: string): string {
  const value = process.env[key];
  if (value && value.trim().length > 0) {
    return value;
  }
  if (fallback !== undefined) {
    return fallback;
  }
  throw new Error(`Missing required environment variable ${key}`);
}

export const env: AppEnv = {
  mongodbUri: getEnv("MONGODB_URI"),
  mongodbDb: getEnv("MONGODB_DB", "la_clinique"),
};

export const NODE_ENV = process.env.NODE_ENV ?? "development";
export const isDevelopment = NODE_ENV === "development";
