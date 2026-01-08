/**
 * x402 Payment Service
 * Handles micro-payments via x402 protocol on Movement M2
 */

export interface PaymentRequest {
  amount: number; // in MOVE tokens
  token: "MOVE" | "USDC" | "USDT";
  recipientWallet: string;
  senderWallet: string;
  queryId?: string;
  metadata?: {
    type: "query" | "topup" | "mint" | "evolution";
    platformId?: string;
    description?: string;
  };
}

export interface PaymentResult {
  success: boolean;
  transactionHash?: string;
  amount: number;
  token: string;
  timestamp: number;
  error?: string;
}

// x402 Payment Rail endpoint (placeholder - to be configured)
const X402_ENDPOINT =
  import.meta.env.VITE_X402_ENDPOINT || "https://x402.movement.network/api/pay";
const MOVEMENT_RPC =
  import.meta.env.VITE_MOVEMENT_RPC_URL || "https://testnet.movementlabs.xyz";

/**
 * Execute a micro-payment via x402 protocol
 */
export async function executePayment(
  request: PaymentRequest
): Promise<PaymentResult> {
  try {
    // Validate inputs
    if (!request.amount || request.amount <= 0) {
      return {
        success: false,
        amount: 0,
        token: request.token,
        timestamp: Date.now(),
        error: "Invalid payment amount",
      };
    }

    if (!request.recipientWallet || !request.senderWallet) {
      return {
        success: false,
        amount: 0,
        token: request.token,
        timestamp: Date.now(),
        error: "Missing wallet addresses",
      };
    }

    // In production, this would execute via x402 protocol
    // const response = await fetch(X402_ENDPOINT, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     from: request.senderWallet,
    //     to: request.recipientWallet,
    //     amount: request.amount,
    //     token: request.token,
    //     metadata: request.metadata,
    //   }),
    // });

    // For now, simulate successful payment
    const transactionHash = generatePaymentHash();

    return {
      success: true,
      transactionHash,
      amount: request.amount,
      token: request.token,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Payment execution error:", error);
    return {
      success: false,
      amount: request.amount,
      token: request.token,
      timestamp: Date.now(),
      error: error instanceof Error ? error.message : "Payment failed",
    };
  }
}

/**
 * Top up user balance by transferring MOVE tokens
 */
export async function topUpBalance(
  userWallet: string,
  amount: number,
  paymentMethod: "card" | "crypto" = "crypto"
): Promise<PaymentResult> {
  try {
    if (!userWallet || amount <= 0) {
      return {
        success: false,
        amount: 0,
        token: "MOVE",
        timestamp: Date.now(),
        error: "Invalid top-up parameters",
      };
    }

    // In production, this would handle actual on-ramp or transfer
    const transactionHash = generatePaymentHash();

    return {
      success: true,
      transactionHash,
      amount,
      token: "MOVE",
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Top-up error:", error);
    return {
      success: false,
      amount,
      token: "MOVE",
      timestamp: Date.now(),
      error: error instanceof Error ? error.message : "Top-up failed",
    };
  }
}

/**
 * Check wallet balance on Movement M2
 */
export async function checkBalance(walletAddress: string): Promise<number> {
  try {
    if (!walletAddress) return 0;

    // Query Movement RPC for account balance
    try {
      // Movement network uses Aptos-compatible API
      const response = await fetch(`${MOVEMENT_RPC}/v1/accounts/${walletAddress}/resources`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const resources = await response.json();
        // Find MOVE token balance (0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>)
        const coinStore = resources.find((r: any) => 
          r.type?.includes('CoinStore') || r.type?.includes('coin')
        );
        
        if (coinStore?.data?.coin?.value) {
          // Convert from smallest unit (octas) to MOVE
          const balance = parseInt(coinStore.data.coin.value) / 100000000;
          return balance;
        }
      }
    } catch (rpcError) {
      console.warn("RPC balance check failed, using fallback:", rpcError);
    }

    // Fallback: try to get balance via account info
    try {
      const accountResponse = await fetch(`${MOVEMENT_RPC}/v1/accounts/${walletAddress}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (accountResponse.ok) {
        const accountData = await accountResponse.json();
        // Some Movement RPC implementations return balance directly
        if (accountData.balance) {
          return parseFloat(accountData.balance) / 100000000;
        }
      }
    } catch (accountError) {
      console.warn("Account balance check failed:", accountError);
    }

    // If all else fails, return 0 (user can still use the app)
    return 0;
  } catch (error) {
    console.error("Balance check error:", error);
    return 0;
  }
}

/**
 * Get transaction details
 */
export async function getTransactionDetails(
  txHash: string
): Promise<PaymentResult | null> {
  try {
    if (!txHash) return null;

    // In production, this would query Movement RPC
    // const response = await fetch(`${MOVEMENT_RPC}/transaction/${txHash}`);
    // return await response.json();

    return null;
  } catch (error) {
    console.error("Transaction lookup error:", error);
    return null;
  }
}

/**
 * Validate if user has sufficient balance for payment
 */
export function validateSufficientBalance(
  balance: number,
  requiredAmount: number
): boolean {
  return balance >= requiredAmount;
}

/**
 * Generate payment transaction hash
 */
function generatePaymentHash(): string {
  return (
    "0x" +
    Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("")
  );
}

/**
 * Format MOVE amount with proper decimal places
 */
export function formatMoveAmount(amount: number): string {
  return parseFloat(amount.toFixed(6)).toString();
}

/**
 * Calculate total payment including platform fee
 */
export function calculatePaymentWithFee(
  amount: number,
  feePercentage: number = 1
): number {
  return parseFloat((amount * (1 + feePercentage / 100)).toFixed(6));
}
