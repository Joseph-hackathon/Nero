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
  const env = import.meta.env.MODE || "development";
  const isProd = env === "production";

  return {
    apiKey: import.meta.env.VITE_API_KEY || "",
    neroTreasury:
      import.meta.env.VITE_PAYMENT_WALLET_ADDRESS || "0xa80a604da323c1c33cb6f8cd57ad36647787ed485ed80b271e4bbbf38577c3a1",
    x402Endpoint:
      import.meta.env.VITE_X402_ENDPOINT || "https://x402.movement.network/api/pay",
    movementRpc:
      import.meta.env.VITE_MOVEMENT_RPC_URL || "https://testnet.movementnetwork.xyz/v1",
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
