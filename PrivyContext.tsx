import React, {
  createContext,
  useContext,
  ReactNode,
} from "react";
import { PrivyProvider as PrivySDKProvider, usePrivy as usePrivySDK } from "@privy-io/react-auth";

interface PrivyContextType {
  ready: boolean;
  authenticated: boolean;
  user: any;
  wallets: any[];
  login: () => void;
  logout: () => Promise<void>;
  createWallet: () => Promise<void>;
  connectNightly: () => Promise<string | null>;
}

const PrivyContext = createContext<PrivyContextType | undefined>(undefined);

// Internal component that uses Privy SDK hooks
const PrivyContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const {
    ready,
    authenticated,
    user,
    login: privyLogin,
    logout: privyLogout,
    createWallet: privyCreateWallet,
  } = usePrivySDK();

  const wallets = user?.wallet ? [user.wallet] : [];

  const login = () => {
    privyLogin();
  };

  const logout = async () => {
    await privyLogout();
  };

  const createWallet = async () => {
    await privyCreateWallet();
  };

  const connectNightly = async (): Promise<string | null> => {
    try {
      // Check if Nightly wallet is installed
      if (typeof window !== 'undefined') {
        // Nightly wallet can be accessed via window.nightly or window.nightly?.aptos
        const nightly = (window as any).nightly;
        
        if (!nightly) {
          alert('Nightly 지갑이 설치되어 있지 않습니다. Nightly 지갑을 설치해주세요.');
          window.open('https://nightly.app/', '_blank');
          return null;
        }

        // Nightly wallet connection for Movement/Aptos network
        // Try different connection methods based on Nightly API
        let accounts: string[] = [];
        
        if (nightly.connect) {
          // Direct connect method
          accounts = await nightly.connect();
        } else if (nightly.aptos?.connect) {
          // Aptos-specific connection (Movement uses similar API)
          const result = await nightly.aptos.connect();
          accounts = result ? [result] : [];
        } else if (nightly.requestAccounts) {
          // Alternative connection method
          accounts = await nightly.requestAccounts();
        } else {
          // Try to get accounts directly
          accounts = await nightly.getAccounts?.() || [];
        }
        
        if (accounts && accounts.length > 0) {
          // Return the first account address
          const address = accounts[0];
          console.log('Nightly wallet connected:', address);
          return address;
        }
        
        alert('Nightly 지갑에서 계정을 가져올 수 없습니다.');
        return null;
      } else {
        alert('Nightly 지갑이 설치되어 있지 않습니다.');
        return null;
      }
    } catch (error: any) {
      console.error('Nightly wallet connection error:', error);
      alert(`Nightly 지갑 연결 실패: ${error.message || 'Unknown error'}`);
      return null;
    }
  };

  return (
    <PrivyContext.Provider
      value={{
        ready,
        authenticated,
        user,
        wallets,
        login,
        logout,
        createWallet,
        connectNightly,
      }}
    >
      {children}
    </PrivyContext.Provider>
  );
};

export const PrivyProvider: React.FC<{
  children: ReactNode;
  appId: string;
  config?: any;
}> = ({ children, appId, config }) => {
  return (
    <PrivySDKProvider
      appId={appId}
      config={{
        loginMethods: ["email", "google", "wallet"],
        appearance: {
          theme: config?.appearance?.theme || "light",
          accentColor: config?.appearance?.accentColor || "#4F46E5",
          showWalletLoginFirst: config?.appearance?.showWalletLoginFirst || false,
          logo: config?.appearance?.logo,
        },
        embeddedWallets: {
          createOnLogin: config?.embeddedWallets?.createOnLogin || "users-without-wallets",
          noPromptOnSignature: config?.embeddedWallets?.noPromptOnSignature || false,
        },
        externalWallets: {
          coinbaseWallet: {
            connectionOptions: 'smartWalletOnly',
          },
          // Add Nightly wallet for Movement network support
          // Nightly is a Move-compatible wallet
        },
        // Note: Privy primarily supports EVM chains
        // Movement network may require custom configuration
        // Nightly wallet can be connected via external wallet connection
      }}
    >
      <PrivyContextProvider>{children}</PrivyContextProvider>
    </PrivySDKProvider>
  );
};

export const usePrivy = () => {
  const context = useContext(PrivyContext);
  if (!context) throw new Error("usePrivy must be used within a PrivyProvider");
  return context;
};

export const useWallets = () => {
  const { wallets } = usePrivy();
  return { wallets };
};
