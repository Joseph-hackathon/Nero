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
          // Privy automatically detects installed wallets
          // Nightly wallet will appear if installed in the browser
        },
        // Privy automatically detects installed browser extension wallets
        // When user clicks "Connect Wallet", all installed wallets including Nightly will be shown
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
