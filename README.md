# Nero Protocol - AI Chatbot NFT Platform

AI-powered Chatbot NFT Platform built on Movement Network with Privy wallet integration.

## Features

- **Privy Wallet Integration**: Social login, email login, and MetaMask wallet support
- **NFT Smart Contract**: Move language smart contract for AI chatbot NFTs
- **AI Chatbot**: AI-powered responses via Gemini API
- **x402 Payment Integration**: Automatic payment with MOVE, USDT, USDC
- **Movement Network**: Built on Movement Network testnet

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Blockchain**: Movement Network (Testnet)
- **Smart Contract**: Move Language
- **Authentication**: Privy
- **AI**: Google Gemini
- **Payment**: x402 Protocol

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Privy Configuration
VITE_PRIVY_APP_ID=cmjwevmi40382ih0bcxl3nqoz

# Movement Network Configuration
VITE_MOVEMENT_RPC_URL=https://testnet.movementlabs.xyz
VITE_NFT_CONTRACT_ADDRESS=0xa80a604da323c1c33cb6f8cd57ad36647787ed485ed80b271e4bbbf38577c3a1

# Backend API
VITE_BACKEND_API_URL=https://nero-protocol.vercel.app/api

# Payment Configuration
VITE_PAYMENT_WALLET_ADDRESS=0xa80a604da323c1c33cb6f8cd57ad36647787ed485ed80b271e4bbbf38577c3a1
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Smart Contract

The NFT smart contract is located in `contracts/sources/nft.move`.

### Contract Address
- **Contract Address**: `0xa80a604da323c1c33cb6f8cd57ad36647787ed485ed80b271e4bbbf38577c3a1`
- **Module**: `nero_protocol::nft`
- **Network**: Movement Testnet

### Contract Functions

- `initialize(admin: &signer)` - Initialize NFT collection
- `create_nft(...)` - Create NFT (Admin only)
- `mint_nft(minter: &signer, token_name: String)` - Mint NFT
- `process_payment(...)` - Process payment

### Compile Contract

```bash
cd contracts
aptos move compile
```

### Deploy Contract

```bash
cd contracts
aptos move publish --assume-yes
```

## Privy Integration

The app uses Privy SDK for authentication and wallet management:

- **Email Login**: Users can sign in with email
- **Google Login**: Social login with Google
- **MetaMask**: Connect existing MetaMask wallet
- **Embedded Wallets**: Privy creates embedded wallets for users without wallets

## Backend API Integration

The frontend integrates with the backend API for:
- Building NFT mint transactions
- Creating NFT transactions (Admin)
- Processing payments
- Checking transaction status

Backend API endpoints:
- `POST /api/movement/mint-nft` - Build mint NFT transaction
- `POST /api/movement/create-nft` - Build create NFT transaction (Admin)
- `POST /api/movement/payment` - Build payment transaction
- `GET /api/movement/transaction/:txHash` - Get transaction status

## Project Structure

```
Nero_original/
├── contracts/              # Move Smart Contracts
│   ├── sources/
│   │   └── nft.move       # NFT Contract
│   └── Move.toml          # Move Project Config
├── components/            # React Components
├── services/              # Services (NFT, Payment)
├── PrivyContext.tsx       # Privy SDK Integration
├── App.tsx               # Main App Component
└── package.json
```

## Deployment

The app can be deployed to Vercel:

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

## License

MIT
