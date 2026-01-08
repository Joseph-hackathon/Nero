import React, { useState, useEffect, useCallback } from "react";
import Hero from "./components/Hero";
import ChatWidget from "./components/ChatWidget";
import Pricing from "./components/Pricing";
import DemoView from "./components/DemoView";
import WidgetIntegration from "./components/WidgetIntegration";
import {
  UserState,
  NeroLevel,
  SKILLS,
  PaymentHistory,
  NeroAgent,
  PLATFORMS,
  PlatformConfig,
} from "./types";
import { usePrivy } from "./PrivyContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { PaymentModal } from "./components/PaymentModal";
import {
  TransactionStatus,
  TransactionStatus as TransactionStatusComponent,
} from "./components/TransactionStatus";
import { mintNeroAgent } from "./services/nftService";
import {
  executePayment,
  validateSufficientBalance,
} from "./services/paymentService";
import { logger } from "./config";

const STORAGE_KEY_PREFIX = "nero_web_state_v6";

const App: React.FC = () => {
  const { authenticated, user, login, logout, ready, connectNightly } = usePrivy();
  const [activeTab, setActiveTab] = useState<
    "home" | "demo" | "widget" | "pricing"
  >("home");
  const [activeDapp, setActiveDapp] = useState<string | null>(null);
  const [dynamicPlatforms, setDynamicPlatforms] =
    useState<Record<string, PlatformConfig>>(PLATFORMS);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<{
    amount: number;
    description: string;
  } | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<{
    status: "pending" | "success" | "failed";
    txHash?: string;
    amount?: number;
  } | null>(null);

  const getStorageKey = (walletAddress: string | null) => {
    if (!walletAddress) return `${STORAGE_KEY_PREFIX}_guest`;
    return `${STORAGE_KEY_PREFIX}_${walletAddress.toLowerCase()}`;
  };

  const [userState, setUserState] = useState<UserState>(() => {
    // Always start fresh for new login
    return {
      walletAddress: null,
      freeQuestionsRemaining: 10,
      xp: 0,
      level: NeroLevel.NEWBIE,
      balance: 0.15,
      network: "Movement M2",
      transactionsCount: 0,
      unlockedSkills: [],
      paymentHistory: [],
      agents: {},
    };
  });

  useEffect(() => {
    if (ready && user?.wallet?.address) {
      const walletAddress = user.wallet.address;
      const storageKey = getStorageKey(walletAddress);
      const saved = localStorage.getItem(storageKey);
      
      if (saved) {
        try {
          const savedState = JSON.parse(saved);
          setUserState({
            ...savedState,
            walletAddress,
          });
        } catch (error) {
          logger.error("Storage", "Failed to parse saved state, using defaults");
          setUserState((prev) => ({
            ...prev,
            walletAddress,
          }));
        }
      } else {
        // New user - start fresh
        setUserState({
          walletAddress,
          freeQuestionsRemaining: 10,
          xp: 0,
          level: NeroLevel.NEWBIE,
          balance: 0.15,
          network: "Movement M2",
          transactionsCount: 0,
          unlockedSkills: [],
          paymentHistory: [],
          agents: {},
        });
      }
    } else if (ready && !authenticated) {
      // Clear state on logout
      setUserState({
        walletAddress: null,
        freeQuestionsRemaining: 10,
        xp: 0,
        level: NeroLevel.NEWBIE,
        balance: 0.15,
        network: "Movement M2",
        transactionsCount: 0,
        unlockedSkills: [],
        paymentHistory: [],
        agents: {},
      });
    }
  }, [user, authenticated, ready]);

  useEffect(() => {
    if (userState.walletAddress) {
      const storageKey = getStorageKey(userState.walletAddress);
      localStorage.setItem(storageKey, JSON.stringify(userState));
    }
  }, [userState]);

  const handleUpdatePlatform = (id: string, newConfig: PlatformConfig) => {
    setDynamicPlatforms((prev) => ({ ...prev, [id]: newConfig }));
  };

  const handleMintAgent = async (platformId: string) => {
    if (!userState.walletAddress) {
      login();
      return;
    }

    // Check if already minted for this account
    if (userState.agents[platformId]) {
      logger.debug("Mint Agent", `Agent already exists for ${platformId}`);
      alert(`You already have a Nero Agent NFT for ${platformId}`);
      return;
    }

    try {
      // Call actual NFT minting service
      const platform = dynamicPlatforms[platformId];
      const result = await mintNeroAgent(
        userState.walletAddress,
        platformId,
        platform?.name || platformId
      );

      if (result.success && result.tokenId) {
        const newAgent: NeroAgent = {
          platformId,
          tokenId: result.tokenId,
          level: NeroLevel.NEWBIE,
          xp: 0,
          mintedAt: Date.now(),
        };

        const mintTx: PaymentHistory = {
          id: result.txHash || "TX-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
          type: "mint",
          token: "MOVE",
          amount: 0, // Minting is free in this version
          timestamp: Date.now(),
        };

        setUserState((prev) => ({
          ...prev,
          agents: { ...prev.agents, [platformId]: newAgent },
          paymentHistory: [mintTx, ...prev.paymentHistory].slice(0, 30),
        }));

        logger.info("Mint Agent", `Successfully minted agent for ${platformId}: ${result.tokenId}`);
        setTransactionStatus({
          status: "success",
          txHash: result.txHash,
          amount: 0,
        });
        setTimeout(() => setTransactionStatus(null), 5000);
      } else {
        throw new Error(result.error || "Failed to mint NFT");
      }
    } catch (error: any) {
      logger.error("Mint Agent", error);
      setTransactionStatus({
        status: "failed",
      });
      alert(`Failed to mint NFT: ${error.message || "Unknown error"}`);
      setTimeout(() => setTransactionStatus(null), 5000);
    }
  };

  const processActivity = useCallback(
    (type: "query" | "transaction", isPaid: boolean = false) => {
      const platformFee = activeDapp
        ? dynamicPlatforms[activeDapp].feePerQuery
        : 0.005;
      setUserState((prev) => {
        const actualIsPaid =
          type === "query" ? prev.freeQuestionsRemaining <= 0 : isPaid;
        const cost = actualIsPaid ? platformFee : 0;

        // Check balance before processing payment
        if (actualIsPaid && prev.balance < cost) {
          logger.warn(
            "Payment",
            `Insufficient balance: ${prev.balance} < ${cost}`
          );
          setPendingPayment({ amount: cost, description: "Query Payment" });
          setShowPaymentModal(true);
          return prev;
        }

        try {
          const xpGain = type === "transaction" ? 150 : actualIsPaid ? 80 : 30;
          let updatedAgents = { ...prev.agents };

          if (activeDapp && updatedAgents[activeDapp]) {
            const agent = updatedAgents[activeDapp];
            const newXp = agent.xp + xpGain;
            let newLevel = agent.level;

            if (newXp >= 10000) newLevel = NeroLevel.MASTER;
            else if (newXp >= 4000) newLevel = NeroLevel.EXPERT;
            else if (newXp >= 1500) newLevel = NeroLevel.STRATEGIST;
            else if (newXp >= 500) newLevel = NeroLevel.EXPLORER;

            updatedAgents[activeDapp] = {
              ...agent,
              xp: newXp,
              level: newLevel,
            };
          }

          const newBalance = parseFloat((prev.balance - cost).toFixed(6));
          const paymentRecord: PaymentHistory = {
            id: "TX-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
            type: type === "query" ? "query" : "evolution",
            token: "MOVE",
            amount: cost,
            timestamp: Date.now(),
          };

          logger.debug(
            "Activity",
            `Processed ${type}: gained ${xpGain} XP, cost: ${cost} MOVE`
          );

          return {
            ...prev,
            agents: updatedAgents,
            xp: prev.xp + xpGain,
            freeQuestionsRemaining:
              type === "query" && !actualIsPaid
                ? Math.max(0, prev.freeQuestionsRemaining - 1)
                : prev.freeQuestionsRemaining,
            balance: newBalance,
            paymentHistory: [paymentRecord, ...prev.paymentHistory].slice(
              0,
              30
            ),
          } as UserState;
        } catch (error) {
          logger.error("Activity Processing", error);
          return prev;
        }
      });
    },
    [activeDapp, dynamicPlatforms]
  );

  const topUpBalance = (
    amount: number,
    token: "MOVE" | "USDC" | "USDT" = "MOVE"
  ) => {
    try {
      if (amount <= 0) {
        logger.warn("Top Up", "Invalid amount");
        return;
      }

      setUserState((prev) => {
        const topupTx: PaymentHistory = {
          id: "TOP-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
          type: "topup" as const,
          token: token as "MOVE" | "USDC" | "USDT",
          amount,
          timestamp: Date.now(),
        };

        return {
          ...prev,
          balance: parseFloat((prev.balance + amount).toFixed(6)),
          paymentHistory: [topupTx, ...prev.paymentHistory].slice(0, 30),
        } as UserState;
      });

      logger.info("Top Up", `Added ${amount} ${token} to balance`);
      setTransactionStatus({
        status: "success",
        amount,
        txHash: generateTxHash(),
      });

      setTimeout(() => setTransactionStatus(null), 5000);
    } catch (error) {
      logger.error("Top Up", error);
      setTransactionStatus({ status: "failed" });
    }
  };

  const handlePaymentConfirm = async () => {
    if (!pendingPayment || !userState.walletAddress) {
      logger.warn("Payment", "Missing payment details or wallet");
      return;
    }

    setTransactionStatus({ status: "pending" });

    try {
      // Simulate x402 payment
      const result = await executePayment({
        amount: pendingPayment.amount,
        token: "MOVE",
        senderWallet: userState.walletAddress,
        recipientWallet: activeDapp
          ? dynamicPlatforms[activeDapp].treasuryWallet
          : "0x0000000000000000000000000000000000000001",
        metadata: {
          type: "query",
          platformId: activeDapp || undefined,
          description: pendingPayment.description,
        },
      });

      if (result.success) {
        logger.info("Payment", `Payment successful: ${result.transactionHash}`);
        setTransactionStatus({
          status: "success",
          txHash: result.transactionHash,
          amount: pendingPayment.amount,
        });

        // Update balance in state
        setUserState((prev) => {
          const paymentTx: PaymentHistory = {
            id:
              result.transactionHash ||
              "TX-" + Math.random().toString(36).substr(2, 6),
            type: "query" as const,
            token: "MOVE" as const,
            amount: pendingPayment.amount,
            timestamp: Date.now(),
          };

          return {
            ...prev,
            balance: parseFloat(
              (prev.balance - pendingPayment.amount).toFixed(6)
            ),
            paymentHistory: [paymentTx, ...prev.paymentHistory].slice(0, 30),
          };
        });
      } else {
        logger.error("Payment", `Payment failed: ${result.error}`);
        setTransactionStatus({ status: "failed" });
      }
    } catch (error) {
      logger.error("Payment Execution", error);
      setTransactionStatus({ status: "failed" });
    } finally {
      setShowPaymentModal(false);
      setPendingPayment(null);
    }
  };

  function generateTxHash(): string {
    return (
      "0x" +
      Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("")
    );
  }

  if (!ready) return null;

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-white">
        <header className="fixed top-0 w-full z-[100] bg-white border-b border-slate-100 h-16 flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">
            <div
              className="flex items-center space-x-2.5 cursor-pointer"
              onClick={() => setActiveTab("home")}
            >
              <div className="w-7 h-7 bg-indigo-600 rounded flex items-center justify-center">
                <img
                  src="https://raw.githubusercontent.com/ant-design/ant-design-icons/master/packages/icons-svg/svg/filled/robot.svg"
                  className="w-4.5 h-4.5 invert"
                  alt="Nero"
                />
              </div>
              <span className="text-base font-bold tracking-tight text-slate-900">
                Nero Protocol
              </span>
            </div>

            <nav className="hidden md:flex items-center space-x-1">
              {[
                { id: "home", label: "Overview" },
                { id: "demo", label: "Live SDK" },
                { id: "widget", label: "Developers" },
                { id: "pricing", label: "Pricing" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 text-[13px] font-semibold transition-all rounded-full ${
                    activeTab === tab.id
                      ? "text-indigo-600 bg-indigo-50/60"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              <div className="w-px h-4 bg-slate-200 mx-4" />
              {authenticated ? (
                <div className="flex items-center space-x-4">
                  <div className="text-[13px] font-bold text-slate-900 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full">
                    {userState.balance.toFixed(3)} MOVE
                  </div>
                  <button
                    onClick={logout}
                    className="text-[13px] font-semibold text-slate-400 hover:text-slate-900"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={login}
                    className="bg-indigo-600 text-white px-5 py-2 rounded-full font-bold text-[13px] hover:bg-indigo-700 transition-shadow shadow-lg shadow-indigo-100"
                  >
                    Get Started
                  </button>
                  <button
                    onClick={async () => {
                      const address = await connectNightly();
                      if (address) {
                        setUserState((prev) => ({
                          ...prev,
                          walletAddress: address,
                        }));
                      }
                    }}
                    className="bg-purple-600 text-white px-4 py-2 rounded-full font-bold text-[13px] hover:bg-purple-700 transition-shadow shadow-lg shadow-purple-100 flex items-center space-x-1.5"
                    title="Connect Nightly Wallet"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Nightly</span>
                  </button>
                </div>
              )}
            </nav>
          </div>
        </header>

        <main className="flex-1 pt-16">
          <div className="animate-in fade-in duration-700">
            {activeTab === "home" && (
              <Hero onStart={() => setActiveTab("demo")} />
            )}
            {activeTab === "demo" && (
              <div className="bg-white border-b border-slate-100 py-4 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      Select Platform
                    </span>
                    <div className="flex space-x-3">
                      {Object.keys(dynamicPlatforms).map((id) => (
                        <button
                          key={id}
                          onClick={() => setActiveDapp(id)}
                          className={`flex items-center space-x-2.5 px-4 py-2 rounded-xl border transition-all ${
                            activeDapp === id
                              ? "bg-slate-900 border-slate-900 text-white shadow-md"
                              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <img
                            src={dynamicPlatforms[id].logo}
                            className="w-5 h-5 object-contain"
                            alt={id}
                          />
                          <span className="text-[12px] font-bold tracking-tight">
                            {id}
                          </span>
                        </button>
                      ))}
                      <button
                        onClick={() => setActiveDapp(null)}
                        className={`px-4 py-2 rounded-xl border transition-all ${
                          activeDapp === null
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-md"
                            : "bg-white border-slate-200 text-slate-400"
                        }`}
                      >
                        <span className="text-[12px] font-bold tracking-tight">
                          Ecosystem
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "demo" && (
              <DemoView
                user={userState}
                onQuery={processActivity}
                onConnect={login}
                onMint={handleMintAgent}
                onTopUp={topUpBalance}
                onPricing={() => setActiveTab("pricing")}
                activeDapp={activeDapp}
                setActiveDapp={setActiveDapp}
                platforms={dynamicPlatforms}
                onUpdatePlatform={handleUpdatePlatform}
              />
            )}
            {activeTab === "widget" && <WidgetIntegration />}
            {activeTab === "pricing" && <Pricing />}
          </div>
        </main>

        <footer className="py-20 border-t border-slate-100 bg-white">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-slate-400 text-[12px] font-semibold">
            <div className="flex items-center space-x-6">
              <span>© 2025 Nero Protocol</span>
              <a href="#" className="hover:text-indigo-600 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-indigo-600 transition-colors">
                Developer Terms
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="uppercase tracking-widest text-[10px]">
                Movement M2 Active
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        amount={pendingPayment?.amount || 0}
        token="MOVE"
        description={pendingPayment?.description || "Payment Required"}
        balance={userState.balance}
        onConfirm={handlePaymentConfirm}
        onCancel={() => {
          setShowPaymentModal(false);
          setPendingPayment(null);
        }}
        onTopUp={() => {
          setShowPaymentModal(false);
          setPendingPayment(null);
          topUpBalance(0.5);
        }}
        isProcessing={transactionStatus?.status === "pending"}
      />

      {/* Transaction Status Toast */}
      {transactionStatus && (
        <TransactionStatusComponent
          status={transactionStatus.status}
          txHash={transactionStatus.txHash}
          amount={transactionStatus.amount}
          token="MOVE"
          onClose={() => setTransactionStatus(null)}
          autoCloseDuration={5000}
        />
      )}
    </ErrorBoundary>
  );
};

export default App;
