/**
 * Transaction Status Component
 * Displays transaction status with confirmation details
 */

import React, { useState, useEffect } from "react";

export type TransactionStatus = "pending" | "success" | "failed";

interface TransactionStatusProps {
  status: TransactionStatus;
  txHash?: string;
  amount?: number;
  token?: string;
  onClose: () => void;
  autoCloseDuration?: number;
}

export const TransactionStatus: React.FC<TransactionStatusProps> = ({
  status,
  txHash,
  amount,
  token = "MOVE",
  onClose,
  autoCloseDuration = 5000,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (status === "success" && autoCloseDuration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, autoCloseDuration);
      return () => clearTimeout(timer);
    }
  }, [status, autoCloseDuration, onClose]);

  if (!isVisible) return null;

  const statusConfig = {
    pending: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: "🔄",
      title: "Processing Payment",
      description: "Your transaction is being processed on Movement M2...",
      textColor: "text-blue-900",
    },
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      icon: "✓",
      title: "Payment Successful",
      description: "Your payment has been confirmed on-chain.",
      textColor: "text-green-900",
    },
    failed: {
      bg: "bg-red-50",
      border: "border-red-200",
      icon: "✕",
      title: "Payment Failed",
      description: "Your payment could not be processed. Please try again.",
      textColor: "text-red-900",
    },
  };

  const config = statusConfig[status];

  return (
    <div className="fixed bottom-4 right-4 max-w-sm w-full z-40 animate-slideIn">
      <div
        className={`${config.bg} ${config.border} border rounded-2xl p-6 shadow-xl space-y-4`}
      >
        {/* Status Icon */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div
              className={`text-3xl ${
                status === "pending" ? "animate-spin" : ""
              }`}
            >
              {config.icon}
            </div>
            <div className="space-y-1">
              <h4 className={`font-bold ${config.textColor}`}>
                {config.title}
              </h4>
              <p className={`text-sm ${config.textColor} opacity-80`}>
                {config.description}
              </p>
            </div>
          </div>
          {status !== "pending" && (
            <button
              onClick={() => {
                setIsVisible(false);
                onClose();
              }}
              className={`flex-shrink-0 ${config.textColor} hover:opacity-70 transition-opacity`}
            >
              ✕
            </button>
          )}
        </div>

        {/* Transaction Details */}
        {(txHash || amount) && (
          <div
            className={`bg-white bg-opacity-40 rounded-lg p-3 space-y-2 text-sm ${config.textColor}`}
          >
            {amount && (
              <div className="flex justify-between">
                <span className="opacity-80">Amount</span>
                <span className="font-semibold">
                  {amount.toFixed(6)} {token}
                </span>
              </div>
            )}
            {txHash && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="opacity-80">Transaction Hash</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(txHash)}
                    className="font-mono text-xs hover:opacity-70 transition-opacity"
                    title="Copy to clipboard"
                  >
                    {txHash.slice(0, 10)}...{txHash.slice(-8)}
                  </button>
                </div>
                <a
                  href={`https://movementexplorer.xyz/txn/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline hover:opacity-70 transition-opacity inline-block"
                >
                  View on Explorer →
                </a>
              </div>
            )}
          </div>
        )}

        {/* Action for Failure */}
        {status === "failed" && (
          <button
            onClick={() => {
              setIsVisible(false);
              onClose();
            }}
            className={`w-full py-2 px-4 bg-white bg-opacity-60 rounded-lg font-semibold text-sm hover:bg-opacity-100 transition-all ${config.textColor}`}
          >
            Dismiss
          </button>
        )}

        {/* Loading indicator for pending */}
        {status === "pending" && (
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200" />
            </div>
            <span className="text-xs text-blue-700">Processing...</span>
          </div>
        )}
      </div>
    </div>
  );
};
