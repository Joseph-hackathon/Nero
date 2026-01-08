/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
  readonly VITE_PRIVY_APP_ID: string;
  readonly VITE_PAYMENT_WALLET_ADDRESS: string;
  readonly VITE_X402_ENDPOINT: string;
  readonly VITE_MOVEMENT_RPC_URL: string;
  readonly VITE_NFT_CONTRACT_ADDRESS: string;
  readonly VITE_BACKEND_API_URL: string;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
