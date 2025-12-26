
export interface PaymentHistory {
  id: string;
  type: 'query' | 'topup' | 'evolution' | 'mint';
  token: 'MOVE' | 'USDC' | 'USDT';
  amount: number;
  timestamp: number;
}

// Added Message interface to resolve missing export errors
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isPaid?: boolean;
}

export interface PlatformConfig {
  name: string;
  logo: string;
  primaryColor: string;
  nftImage: string;
  treasuryWallet: string;
  feePerQuery: number;
  systemPrompt: string;
}

export interface NeroAgent {
  platformId: string;
  tokenId: string;
  level: number;
  xp: number;
  mintedAt: number;
}

export interface UserState {
  walletAddress: string | null;
  freeQuestionsRemaining: number;
  xp: number;
  level: number;
  balance: number;
  network: 'Movement Devnet' | 'Movement M1' | 'Movement M2';
  transactionsCount: number;
  unlockedSkills: string[];
  paymentHistory: PaymentHistory[];
  agents: Record<string, NeroAgent>; // PlatformID -> Agent
}

export enum NeroLevel {
  NEWBIE = 1,
  EXPLORER = 2,
  STRATEGIST = 3,
  EXPERT = 4,
  MASTER = 5
}

export const LEVEL_NAMES = {
  [NeroLevel.NEWBIE]: 'Newbie',
  [NeroLevel.EXPLORER]: 'Explorer',
  [NeroLevel.STRATEGIST]: 'Strategist',
  [NeroLevel.EXPERT]: 'Expert',
  [NeroLevel.MASTER]: 'Master'
};

export const LEVEL_REQUIREMENTS = {
  [NeroLevel.NEWBIE]: 0,
  [NeroLevel.EXPLORER]: 500,
  [NeroLevel.STRATEGIST]: 1500,
  [NeroLevel.EXPERT]: 4000,
  [NeroLevel.MASTER]: 10000
};

export const SKILLS = [
  { id: 'analytics', name: 'Move Analytics', level: 2 },
  { id: 'defi', name: 'DeFi Strategy', level: 3 },
  { id: 'mev', name: 'MEV Protection', level: 4 },
  { id: 'signals', name: 'Alpha Signals', level: 5 },
];

export const PLATFORMS: Record<string, PlatformConfig> = {
  Uniswap: {
    name: 'Uniswap x Nero',
    logo: 'https://cryptologos.cc/logos/uniswap-uni-logo.png',
    primaryColor: '#FF007A',
    nftImage: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=400&h=400&auto=format&fit=crop',
    treasuryWallet: '0x123...abc',
    feePerQuery: 0.005,
    systemPrompt: 'You are a Uniswap liquidity expert. Focus on slippage, pools, and V3 strategies.'
  },
  Aave: {
    name: 'Aave x Nero',
    logo: 'https://cryptologos.cc/logos/aave-aave-logo.png',
    primaryColor: '#B6509E',
    nftImage: 'https://images.unsplash.com/photo-1642104704074-907c0698bcd9?q=80&w=400&h=400&auto=format&fit=crop',
    treasuryWallet: '0x456...def',
    feePerQuery: 0.005,
    systemPrompt: 'You are an Aave risk manager. Focus on health factors, supply/borrow rates, and collateral.'
  },
  Movement: {
    name: 'Movement Native',
    logo: 'https://raw.githubusercontent.com/movementlabsxyz/brand-assets/main/logos/M_Logo_Black.png',
    primaryColor: '#4F46E5',
    nftImage: 'https://images.unsplash.com/photo-1614728263952-84ea206f99b6?q=80&w=400&h=400&auto=format&fit=crop',
    treasuryWallet: '0x000...000',
    feePerQuery: 0.001,
    systemPrompt: 'You are a Move language expert. Explain MoveVM and Movement Network performance.'
  }
};
