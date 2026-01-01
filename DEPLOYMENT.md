# Nero Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Configuration

- Copy `.env.example` to `.env.local`
- Set `API_KEY` with your Google Gemini API key
- Configure `NERO_TREASURY` with your treasury wallet on Movement M2
- Update `MOVEMENT_RPC` endpoint if using testnet

### 2. Build Verification

```bash
npm run build
```

Ensure the build completes without errors:

- All TypeScript types are correct
- All imports are resolved
- Bundle size is acceptable (check for large chunks)

### 3. Local Testing

```bash
npm run dev
```

Test the following features:

- User authentication with Privy
- NFT minting functionality
- Payment flow (x402 protocol)
- Chat widget with Gemini AI
- Balance top-up functionality

## Deployment Steps

### Vercel Deployment (Recommended)

#### 1. Prepare Repository

```bash
git init
git add .
git commit -m "Initial Nero deployment"
git remote add origin <your-repo-url>
git push -u origin main
```

#### 2. Configure Vercel

1. Go to https://vercel.com/new
2. Select your GitHub repository
3. Configure environment variables:
   - `API_KEY` (Google Gemini API key)
   - `NERO_TREASURY` (Movement M2 treasury wallet)
   - `MOVEMENT_RPC` (Movement RPC endpoint)
   - `X402_ENDPOINT` (x402 payment rail endpoint)

#### 3. Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Visit deployed URL to verify

### Environment Variables

**Required for Production:**

```
API_KEY=<your-gemini-key>
NERO_TREASURY=<movement-treasury-address>
MOVEMENT_RPC=https://mainnet.movement.network/v1
X402_ENDPOINT=https://x402.movement.network/api/pay
```

## Critical Features Implemented

### 1. NFT Minting Service (`services/nftService.ts`)

- Mints Nero Agent NFTs on Movement M2
- Tracks agent progression (level, XP)
- Stores on-chain metadata

### 2. x402 Payment Service (`services/paymentService.ts`)

- Handles MOVE token micro-payments
- Validates user balance
- Processes top-ups
- Executes treasury transfers

### 3. Error Handling

- Global Error Boundary component
- Transaction status tracking
- Payment validation and confirmation
- User-friendly error messages

### 4. Security

- API key validation
- Wallet signature verification (via Privy)
- Payment amount validation
- Balance checks before transactions

## Testing Payment Flow

### Simulate Payment:

1. User asks a query (costs 0.005 MOVE when free quota expires)
2. Check balance: User balance must be ≥ 0.005 MOVE
3. Payment confirmation modal appears
4. User confirms payment
5. Transaction processed and recorded
6. Agent XP updated accordingly

### Top-Up Flow:

1. User clicks "Top Up"
2. Select amount (0.1 - 1000 MOVE)
3. Confirm payment method
4. Transaction processed
5. Balance updated immediately

## Move Contract Deployment

For full functionality, deploy Nero Agent NFT contract on Movement M2:

```move
module nero_agent {
    struct NeroAgent has key {
        id: u64,
        owner: address,
        platform_id: string::String,
        level: u8,
        xp: u64,
        minted_at: u64
    }

    public fun mint(account: &signer, platform_id: string::String) { ... }
    public fun update_progress(token_id: u64, xp: u64, level: u8) { ... }
}
```

Update contract address in `services/nftService.ts` once deployed.

## Monitoring & Logging

The application includes environment-aware logging:

- Development: Verbose debug logs
- Production: Error and info logs only

Access logs via:

- Browser DevTools Console
- Server-side logs (Vercel dashboard)

## Troubleshooting

### Build Fails

- Clear `node_modules` and `dist` folders
- Run `npm install` again
- Check TypeScript errors: `npm run build`

### Payment Transactions Fail

- Verify treasury wallet address on Movement M2
- Check MOVE token balance in treasury
- Validate x402 endpoint configuration

### Gemini API Errors

- Verify API key is set correctly
- Check daily API quota usage
- Ensure API key has required permissions

### Privy Authentication Issues

- Verify PRIVY_APP_ID in `index.tsx`
- Check Privy dashboard for app configuration
- Ensure user's browser allows third-party cookies

## Performance Optimization

The build includes:

- Code splitting via Vite
- Minimal dependencies
- Optimized Tailwind CSS
- Lazy component loading

To further optimize:

1. Enable CDN caching in Vercel
2. Use Vercel Analytics to track performance
3. Monitor bundle size with Vercel Insights

## Rollback Plan

If deployment issues occur:

1. Revert to previous commit on GitHub
2. Redeploy from Vercel dashboard
3. Or manually rollback environment variables

## Post-Deployment Verification

1. Visit deployed URL
2. Test Privy authentication
3. Simulate payment flow
4. Verify chat widget works
5. Check agent NFT minting
6. Monitor error logs

## Support & Resources

- Movement Network Docs: https://docs.movement.network
- Gemini API Docs: https://ai.google.dev
- Privy Documentation: https://docs.privy.io
- Vercel Documentation: https://vercel.com/docs

---

**Last Updated:** January 2025
**Version:** 1.0.0
