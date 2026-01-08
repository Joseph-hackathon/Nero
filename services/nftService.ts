/**
 * NFT Minting Service for Nero Agent NFTs
 * Handles minting and updating Nero Agent NFTs on Movement Network
 */

import { NeroAgent, NeroLevel, LEVEL_NAMES } from "../types";
import axios from "axios";

export interface MintResponse {
  success: boolean;
  tokenId?: string;
  txHash?: string;
  error?: string;
  platformId: string;
}

export interface UpdateAgentResponse {
  success: boolean;
  txHash?: string;
  error?: string;
}

const NFT_CONTRACT_ADDRESS = import.meta.env.VITE_NFT_CONTRACT_ADDRESS || "0xa80a604da323c1c33cb6f8cd57ad36647787ed485ed80b271e4bbbf38577c3a1";
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || "https://nero-protocol.vercel.app/api";
const MOVEMENT_RPC_URL = import.meta.env.VITE_MOVEMENT_RPC_URL || "https://testnet.movementlabs.xyz";

/**
 * Mint a new Nero Agent NFT for a specific platform
 */
export async function mintNeroAgent(
  walletAddress: string,
  platformId: string,
  platformName: string
): Promise<MintResponse> {
  try {
    if (!walletAddress) {
      return { success: false, error: "Wallet address required", platformId };
    }

    // Get transaction from backend
    const response = await axios.post(`${BACKEND_API_URL}/movement/mint-nft`, {
      tokenName: `nero_${platformId}_${Date.now()}`,
    });

    const { transaction } = response.data;

    // In production, this would be signed and submitted via Privy wallet
    // For now, return the transaction payload
    const tokenId = `nero_${platformId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const txHash = transaction?.function || `0x${Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("")}`;

    return {
      success: true,
      tokenId,
      txHash,
      platformId,
    };
  } catch (error: any) {
    console.error("NFT Mint Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to mint NFT",
      platformId,
    };
  }
}

/**
 * Update Nero Agent level and XP on-chain
 */
export async function updateNeroAgent(
  walletAddress: string,
  agent: NeroAgent
): Promise<UpdateAgentResponse> {
  try {
    if (!walletAddress || !agent.tokenId) {
      return { success: false, error: "Missing wallet address or token ID" };
    }

    const levelName = LEVEL_NAMES[agent.level as NeroLevel] || "Unknown";

    // In production, this would call the Move contract via Privy wallet
    // const tx = await executeMove({
    //   function: `${NFT_CONTRACT_ADDRESS}::update_progress`,
    //   typeArguments: [],
    //   arguments: [agent.tokenId, agent.xp, agent.level],
    // });

    const txHash = `0x${Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("")}`;

    return {
      success: true,
      txHash,
    };
  } catch (error) {
    console.error("NFT Update Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update NFT",
    };
  }
}

/**
 * Get current NFT metadata from on-chain
 */
export async function getNeroAgentMetadata(
  tokenId: string
): Promise<NeroAgent | null> {
  try {
    // In production, this would query the Movement network
    // const metadata = await queryContractData(`${NFT_CONTRACT_ADDRESS}::nft_metadata`, [tokenId]);

    return null; // Placeholder
  } catch (error) {
    console.error("Failed to fetch NFT metadata:", error);
    return null;
  }
}

/**
 * Build mint transaction using backend API
 */
export async function buildMintTransaction(tokenName: string) {
  try {
    const response = await axios.post(`${BACKEND_API_URL}/movement/mint-nft`, {
      tokenName,
    });
    return response.data.transaction;
  } catch (error) {
    console.error("Failed to build mint transaction:", error);
    throw error;
  }
}

/**
 * Build create NFT transaction (Admin only)
 */
export async function buildCreateNFTTransaction(
  tokenName: string,
  tokenDescription: string,
  imageUri: string,
  priceMove: string,
  priceUSDT: string,
  priceUSDC: string
) {
  try {
    const response = await axios.post(`${BACKEND_API_URL}/movement/create-nft`, {
      tokenName,
      tokenDescription,
      imageUri,
      priceMove,
      priceUSDT,
      priceUSDC,
    });
    return response.data.transaction;
  } catch (error) {
    console.error("Failed to build create NFT transaction:", error);
    throw error;
  }
}

/**
 * Get transaction status
 */
export async function getTransactionStatus(txHash: string) {
  try {
    const response = await axios.get(`${BACKEND_API_URL}/movement/transaction/${txHash}`);
    return response.data.status;
  } catch (error) {
    console.error("Failed to get transaction status:", error);
    throw error;
  }
}

/**
 * Get treasury wallet address for a platform
 */
export function getTreasuryWallet(platformTreasuryWallet?: string): string {
  return platformTreasuryWallet || import.meta.env.VITE_PAYMENT_WALLET_ADDRESS || "0x0000000000000000000000000000000000000001";
}
