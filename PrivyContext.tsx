import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";

interface PrivyUser {
  id: string;
  email?: string;
  wallet?: {
    address: string;
    chainType: "ethereum";
  };
  linkedAccounts?: Array<{
    type: string;
    address?: string;
    email?: string;
  }>;
}

interface Wallet {
  address: string;
  walletClientType: "privy" | "metamask" | "phantom";
}

interface PrivyProviderConfig {
  loginMethods?: string[];
  appearance?: {
    theme?: "light" | "dark";
    accentColor?: string;
    showWalletLoginFirst?: boolean;
    logo?: string;
  };
  embeddedWallets?: {
    createOnLogin?: "users-without-wallets" | "all-users" | "off";
    noPromptOnSignature?: boolean;
  };
}

interface PrivyContextType {
  ready: boolean;
  authenticated: boolean;
  user: PrivyUser | null;
  wallets: Wallet[];
  login: () => void;
  logout: () => Promise<void>;
  createWallet: () => Promise<void>;
}

const PrivyContext = createContext<PrivyContextType | undefined>(undefined);

export const PrivyProvider: React.FC<{
  children: ReactNode;
  appId: string;
  config?: PrivyProviderConfig;
}> = ({ children, appId, config }) => {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<PrivyUser | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginStep, setLoginStep] = useState<"initial" | "email" | "code">("initial");
  const [emailInput, setEmailInput] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [storedCode, setStoredCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setReady(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const generateAddress = () => {
    return "0x" + Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
  };

  const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const finishLogin = (method: string, email?: string, address?: string) => {
    const finalAddress = address || generateAddress();

    const newUser: PrivyUser = {
      id: "did:privy:" + Math.random().toString(36).substring(2, 15),
      email: email,
      wallet: { address: finalAddress, chainType: "ethereum" },
      linkedAccounts: [
        {
          type: method,
          address: method === "wallet" || method === "metamask" ? finalAddress : undefined,
          email: method === "email" || method === "google" ? email : undefined,
        },
      ],
    };

    setUser(newUser);
    setAuthenticated(true);
    setWallets([{ address: finalAddress, walletClientType: method === "metamask" ? "metamask" : "privy" }]);
    setIsModalOpen(false);
    setLoginError(null);
    setLoginStep("initial");
    setEmailInput("");
    setCodeInput("");
    setStoredCode("");
    setIsLoading(false);
  };

  const login = useCallback(() => {
    setIsModalOpen(true);
    setLoginError(null);
    setLoginStep("initial");
  }, []);

  const handleEmailStart = useCallback(() => {
    setLoginStep("email");
    setLoginError(null);
  }, []);

  const handleEmailSubmit = useCallback(async () => {
    if (!emailInput || !emailInput.includes("@")) {
      setLoginError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setLoginError(null);

    try {
      // Simulate sending email with verification code
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const code = generateCode();
      setStoredCode(code);
      
      // In production, send this code via email through your backend
      console.log(`Verification code for ${emailInput}: ${code}`);
      
      setLoginStep("code");
      setIsLoading(false);
    } catch (err) {
      setLoginError("Failed to send verification code. Please try again.");
      setIsLoading(false);
    }
  }, [emailInput]);

  const handleCodeSubmit = useCallback(() => {
    if (codeInput.length !== 6) {
      setLoginError("Please enter the 6-digit code");
      return;
    }

    // Verify the code
    if (codeInput !== storedCode) {
      setLoginError("Invalid verification code. Please try again.");
      return;
    }

    finishLogin("email", emailInput);
  }, [codeInput, storedCode, emailInput]);

  const handleGoogleLogin = useCallback(async () => {
    setIsLoading(true);
    setLoginError(null);

    try {
      // In production, this would open a Google OAuth popup window
      // For now, we'll simulate the OAuth flow
      
      // Simulate OAuth popup and redirect
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate getting user info from Google
      const mockGoogleUser = {
        email: "user@gmail.com",
        name: "Demo User",
        picture: "https://lh3.googleusercontent.com/a/default-user"
      };
      
      finishLogin("google", mockGoogleUser.email);
    } catch (err: any) {
      setLoginError("Google sign-in failed. Please try again.");
      setIsLoading(false);
    }
  }, []);

  const handleMetaMaskLogin = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoginError(null);
      
      const ethereum = (window as any).ethereum;
      
      if (!ethereum) {
        setLoginError("MetaMask not installed. Please install MetaMask extension first.");
        setIsLoading(false);
        return;
      }

      // Request account access
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        setLoginError("No accounts found. Please unlock MetaMask.");
        setIsLoading(false);
        return;
      }

      const address = accounts[0];

      // Create message to sign
      const message = `Sign this message to authenticate with Nero.\n\nWallet: ${address}\nTimestamp: ${Date.now()}`;
      
      // Convert message to hex
      const hexMessage = "0x" + Array.from(new TextEncoder().encode(message))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

      // Request signature
      const signature = await ethereum.request({
        method: "personal_sign",
        params: [hexMessage, address],
      });

      console.log("Signature:", signature);
      
      finishLogin("metamask", undefined, address);
    } catch (err: any) {
      if (err.code === 4001) {
        setLoginError("Connection request rejected. Please try again.");
      } else if (err.code === -32002) {
        setLoginError("MetaMask connection request pending. Please check MetaMask.");
      } else {
        setLoginError(err.message || "Failed to connect to MetaMask");
      }
      setIsLoading(false);
    }
  }, []);

  const handleBack = useCallback(() => {
    setLoginStep("initial");
    setLoginError(null);
    setEmailInput("");
    setCodeInput("");
    setStoredCode("");
    setIsLoading(false);
  }, []);

  const logout = useCallback(async () => {
    setAuthenticated(false);
    setUser(null);
    setWallets([]);
  }, []);

  const createWallet = useCallback(async () => {
    if (!authenticated) return;
    
    const newAddress = generateAddress();
    const newWallet: Wallet = {
      address: newAddress,
      walletClientType: "privy",
    };
    
    setWallets(prev => [...prev, newWallet]);
    
    if (user) {
      setUser({
        ...user,
        wallet: { address: newAddress, chainType: "ethereum" },
      });
    }
  }, [authenticated, user]);

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
      {isModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => !isLoading && setIsModalOpen(false)}
          ></div>
          <div className="relative bg-white w-full max-w-[420px] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
            {!isLoading && (
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-indigo-600 transition-colors z-10"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}

            <div className="p-10 text-center space-y-8">
              {loginStep === "initial" && (
                <>
                  <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] mx-auto flex items-center justify-center shadow-xl shadow-indigo-100 ring-8 ring-indigo-50">
                    {config?.appearance?.logo ? (
                      <img
                        src={config.appearance.logo}
                        className="w-12 h-12 invert"
                        alt="Logo"
                      />
                    ) : (
                      <span className="text-3xl">🔐</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-indigo-950 tracking-tight">
                      Log in to Nero
                    </h3>
                    <p className="text-[13px] text-slate-500 font-bold px-4">
                      The real-time AI companion for the Movement Network ecosystem.
                    </p>
                  </div>

                  {loginError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      {loginError}
                    </div>
                  )}

                  <div className="space-y-3">
                    <button
                      onClick={handleEmailStart}
                      disabled={isLoading}
                      className="w-full py-4 px-6 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-between transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center space-x-4">
                        <span className="text-xl">📧</span>
                        <span className="text-[12px] font-black uppercase text-indigo-950 tracking-widest">
                          Continue with Email
                        </span>
                      </div>
                      <span className="text-slate-300 group-hover:translate-x-1 transition-transform opacity-0 group-hover:opacity-100">
                        →
                      </span>
                    </button>

                    <button
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                      className="w-full py-4 px-6 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-between transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center space-x-4">
                        <span className="text-xl">🌐</span>
                        <span className="text-[12px] font-black uppercase text-indigo-950 tracking-widest">
                          {isLoading ? "Signing in..." : "Continue with Google"}
                        </span>
                      </div>
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <span className="text-slate-300 group-hover:translate-x-1 transition-transform opacity-0 group-hover:opacity-100">
                          →
                        </span>
                      )}
                    </button>

                    <div className="relative py-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-100"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-white px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                          or connect a wallet
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleMetaMaskLogin}
                      disabled={isLoading}
                      className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 rounded-2xl flex items-center justify-between transition-all group shadow-2xl shadow-indigo-100 ring-4 ring-transparent hover:ring-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center space-x-4">
                        <span className="text-xl">🦊</span>
                        <span className="text-[12px] font-black uppercase text-white tracking-widest">
                          Connect MetaMask
                        </span>
                      </div>
                      <span className="text-white/60 group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-400 font-bold px-4 leading-relaxed">
                    By signing in, you agree to our Terms and Privacy Policy.
                    Secured by <span className="text-indigo-600">Privy</span>.
                  </p>
                </>
              )}

              {loginStep === "email" && (
                <>
                  {!isLoading && (
                    <button
                      onClick={handleBack}
                      className="absolute top-6 left-6 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}

                  <div className="w-16 h-16 bg-indigo-100 rounded-2xl mx-auto flex items-center justify-center">
                    <span className="text-3xl">📧</span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-indigo-950 tracking-tight">
                      Enter your email
                    </h3>
                    <p className="text-[13px] text-slate-500 font-bold px-4">
                      We'll send you a code to verify your email address.
                    </p>
                  </div>

                  {loginError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      {loginError}
                    </div>
                  )}

                  <div className="space-y-4">
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="you@example.com"
                      disabled={isLoading}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent disabled:opacity-50"
                      onKeyPress={(e) => e.key === "Enter" && !isLoading && handleEmailSubmit()}
                    />

                    <button
                      onClick={handleEmailSubmit}
                      disabled={isLoading}
                      className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Sending...
                        </>
                      ) : (
                        "Send Code"
                      )}
                    </button>
                  </div>
                </>
              )}

              {loginStep === "code" && (
                <>
                  <button
                    onClick={handleBack}
                    className="absolute top-6 left-6 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <div className="w-16 h-16 bg-indigo-100 rounded-2xl mx-auto flex items-center justify-center">
                    <span className="text-3xl">🔑</span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-indigo-950 tracking-tight">
                      Enter verification code
                    </h3>
                    <p className="text-[13px] text-slate-500 font-bold px-4">
                      We sent a 6-digit code to <span className="text-indigo-600">{emailInput}</span>
                    </p>
                    <p className="text-[11px] text-amber-600 font-bold bg-amber-50 rounded-lg p-2 mx-4">
                      Demo code: {storedCode}
                    </p>
                  </div>

                  {loginError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      {loginError}
                    </div>
                  )}

                  <div className="space-y-4">
                    <input
                      type="text"
                      value={codeInput}
                      onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000000"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-2xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                      onKeyPress={(e) => e.key === "Enter" && handleCodeSubmit()}
                      maxLength={6}
                      autoFocus
                    />

                    <button
                      onClick={handleCodeSubmit}
                      className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all shadow-xl shadow-indigo-100"
                    >
                      Verify
                    </button>

                    <p className="text-[11px] text-slate-400 font-bold">
                      Didn't receive it?{" "}
                      <button onClick={handleEmailSubmit} className="text-indigo-600 hover:underline">
                        Resend code
                      </button>
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </PrivyContext.Provider>
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
