
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

interface PrivyUser {
  id: string;
  email?: string;
  wallet?: {
    address: string;
    chainType: 'ethereum';
  };
}

interface Wallet {
  address: string;
  walletClientType: 'privy' | 'metamask' | 'phantom';
}

interface PrivyProviderConfig {
  loginMethods?: string[];
  appearance?: {
    theme?: 'light' | 'dark';
    accentColor?: string;
    showWalletLoginFirst?: boolean;
    logo?: string;
  };
  embeddedWallets?: {
    createOnLogin?: 'users-without-wallets' | 'all-users' | 'off';
    noPromptOnSignature?: boolean;
  };
}

interface PrivyContextType {
  ready: boolean;
  authenticated: boolean;
  user: PrivyUser | null;
  wallets: Wallet[];
  login: () => Promise<void>;
  logout: () => Promise<void>;
  createWallet: () => Promise<void>;
  isModalOpen: boolean;
}

const PrivyContext = createContext<PrivyContextType | undefined>(undefined);

export const PrivyProvider: React.FC<{ 
  children: ReactNode; 
  appId: string; 
  config?: PrivyProviderConfig 
}> = ({ children, config }) => {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<PrivyUser | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setReady(true);
      const savedUser = localStorage.getItem('privy_sim_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setAuthenticated(true);
        if (parsed.wallet) {
          setWallets([{ address: parsed.wallet.address, walletClientType: 'privy' }]);
        }
      }
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const login = useCallback(async () => {
    if (!ready) return;
    setIsModalOpen(true);
  }, [ready]);

  const handleFinishLogin = (method: string) => {
    const address = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newUser: PrivyUser = {
      id: 'did:privy:nero-' + Math.random().toString(36).substring(7),
      email: method === 'email' ? 'explorer@nero.ai' : undefined,
      wallet: { address, chainType: 'ethereum' }
    };
    
    setUser(newUser);
    setAuthenticated(true);
    setWallets([{ address, walletClientType: 'privy' }]);
    localStorage.setItem('privy_sim_user', JSON.stringify(newUser));
    setIsModalOpen(false);
  };

  const logout = useCallback(async () => {
    setAuthenticated(false);
    setUser(null);
    setWallets([]);
    localStorage.removeItem('privy_sim_user');
  }, []);

  const createWallet = useCallback(async () => {
    // Logic to simulate embedded wallet creation
  }, []);

  return (
    <PrivyContext.Provider value={{ ready, authenticated, user, wallets, login, logout, createWallet, isModalOpen }}>
      {children}
      {isModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-[420px] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="p-10 text-center space-y-8">
              <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] mx-auto flex items-center justify-center shadow-xl shadow-indigo-100 ring-8 ring-indigo-50">
                <img src={config?.appearance?.logo} className="w-12 h-12 invert" alt="Logo" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-indigo-950 tracking-tight">Log in to Nero</h3>
                <p className="text-[13px] text-slate-500 font-bold px-4">The real-time AI companion for the Movement Network ecosystem.</p>
              </div>
              
              <div className="space-y-3">
                <button onClick={() => handleFinishLogin('email')} className="w-full py-4 px-6 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-between transition-all group">
                  <div className="flex items-center space-x-4">
                    <span className="text-xl">📧</span>
                    <span className="text-[12px] font-black uppercase text-indigo-950 tracking-widest">Continue with Email</span>
                  </div>
                  <span className="text-slate-300 group-hover:translate-x-1 transition-transform opacity-0 group-hover:opacity-100">→</span>
                </button>
                
                <button onClick={() => handleFinishLogin('google')} className="w-full py-4 px-6 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-between transition-all group">
                  <div className="flex items-center space-x-4">
                    <span className="text-xl">🌐</span>
                    <span className="text-[12px] font-black uppercase text-indigo-950 tracking-widest">Continue with Google</span>
                  </div>
                  <span className="text-slate-300 group-hover:translate-x-1 transition-transform opacity-0 group-hover:opacity-100">→</span>
                </button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                  <div className="relative flex justify-center"><span className="bg-white px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">or connect a wallet</span></div>
                </div>

                <button onClick={() => handleFinishLogin('wallet')} className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 rounded-2xl flex items-center justify-between transition-all group shadow-2xl shadow-indigo-100 ring-4 ring-transparent hover:ring-indigo-50">
                  <div className="flex items-center space-x-4">
                    <span className="text-xl">🦊</span>
                    <span className="text-[12px] font-black uppercase text-white tracking-widest">External Wallets</span>
                  </div>
                  <span className="text-white/60 group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
              
              <p className="text-[10px] text-slate-400 font-bold px-4 leading-relaxed">
                By signing in, you agree to our Terms and Privacy Policy. Secured by <span className="text-indigo-600">Privy</span>.
              </p>
            </div>
          </div>
        </div>
      )}
    </PrivyContext.Provider>
  );
};

export const usePrivy = () => {
  const context = useContext(PrivyContext);
  if (!context) throw new Error('usePrivy must be used within a PrivyProvider');
  return context;
};

export const useWallets = () => {
  const { wallets } = usePrivy();
  return { wallets };
};
