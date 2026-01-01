/**
 * Environment Configuration
 * Centralized configuration for deployment environments
 */

export interface AppConfig {
  apiKey: string;
  neroTreasury: string;
  x402Endpoint: string;
  movementRpc: string;
  environment: "development" | "staging" | "production";
  enableDebugLogging: boolean;
  paymentDefaults: {
    minTopUpAmount: number;
    maxTopUpAmount: number;
    defaultFeePercentage: number;
  };
}

const getEnvironmentConfig = (): AppConfig => {
  const env = process.env.NODE_ENV || "development";
  const isProd = env === "production";

  return {
    apiKey: process.env.API_KEY || "",
    neroTreasury:
      process.env.NERO_TREASURY || "0x0000000000000000000000000000000000000001",
    x402Endpoint:
      process.env.X402_ENDPOINT || "https://x402.movement.network/api/pay",
    movementRpc:
      process.env.MOVEMENT_RPC || "https://mainnet.movement.network/v1",
    environment: isProd
      ? "production"
      : env === "staging"
      ? "staging"
      : "development",
    enableDebugLogging: !isProd,
    paymentDefaults: {
      minTopUpAmount: 0.1,
      maxTopUpAmount: 1000,
      defaultFeePercentage: 1,
    },
  };
};

export const appConfig = getEnvironmentConfig();

/**
 * Logger utility with environment-aware filtering
 */
export const logger = {
  debug: (label: string, data: any) => {
    if (appConfig.enableDebugLogging) {
      console.debug(`[${label}]`, data);
    }
  },
  info: (label: string, message: string) => {
    console.info(`[${label}]`, message);
  },
  warn: (label: string, message: string) => {
    console.warn(`[${label}]`, message);
  },
  error: (label: string, error: any) => {
    console.error(`[${label}]`, error);
  },
};

/**
 * Validate critical configuration on startup
 */
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!appConfig.apiKey && appConfig.environment === "production") {
    errors.push("API_KEY environment variable is not set");
  }

  if (!appConfig.neroTreasury) {
    errors.push("NERO_TREASURY environment variable is not set");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
